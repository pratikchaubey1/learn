// routes/tests.ts
import express from 'express';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import { protect, AuthRequest } from '../middleware/auth';
import TestDefinition from '../models/TestDefinition';
import TestSession from '../models/TestSession';
import TestResult from '../models/TestResult';
import User from '../models/User';
import { geminiService } from '../services/geminiService';
import { Question, UserAnswer, TestType, QuestionAnalysis, TopicPerformance } from '../types';

const router = express.Router();

// Local fallback questions used when Gemini quota is exhausted or unavailable.
const generateFallbackQuestions = (
  testType: TestType,
  numQuestions: number,
  topic?: string
): Question[] => {
  const questions: Question[] = [];
  const baseTopic = topic || 'Basic Skills';

  for (let i = 0; i < numQuestions; i++) {
    const a = 2 + i;
    const b = 3 + i;
    const correct = a + b;
    const options = [correct, correct + 1, correct - 1, correct + 2].map(String);

    questions.push({
      _id: uuidv4(),
      questionText: `What is ${a} + ${b}?`,
      options,
      correctAnswerIndex: 0,
      explanation: `${a} + ${b} = ${correct}.`,
      topic: baseTopic,
      difficulty: 'easy',
    });
  }

  return questions;
};

// Local non-AI analysis used when Gemini analysis is unavailable.
const analyzeLocally = (
  session: any,
  answers: UserAnswer[]
): { summary: string; questionAnalysis: QuestionAnalysis[]; topicPerformance: TopicPerformance[] } => {
  const questionAnalysis: QuestionAnalysis[] = (session.questions as Question[]).map(
    (q: Question): QuestionAnalysis => {
      const userAnswer = answers.find((a) => a.questionId === q._id);
      const userAnswerText =
        userAnswer !== undefined && q.options[userAnswer.answerIndex] !== undefined
          ? q.options[userAnswer.answerIndex]
          : 'Not answered';
      const isCorrect =
        userAnswer !== undefined && userAnswer.answerIndex === q.correctAnswerIndex;
      const topic = q.topic || 'General';

      return {
        questionText: q.questionText,
        userAnswer: userAnswerText,
        correctAnswer: q.options[q.correctAnswerIndex],
        isCorrect,
        explanation: q.explanation || 'Review this concept.',
        topic,
        questionType: 'Concept Check',
      };
    }
  );

  const topicMap: Record<string, { correct: number; total: number }> = {};
  for (const qa of questionAnalysis) {
    const t = qa.topic || 'General';
    if (!topicMap[t]) {
      topicMap[t] = { correct: 0, total: 0 };
    }
    topicMap[t].total += 1;
    if (qa.isCorrect) {
      topicMap[t].correct += 1;
    }
  }

  const topicPerformance: TopicPerformance[] = Object.entries(topicMap).map(
    ([topic, stats]) => ({ topic, correct: stats.correct, total: stats.total })
  );

  const correctCount = questionAnalysis.filter((qa) => qa.isCorrect).length;
  const totalQuestions = questionAnalysis.length || 1;
  const scorePct = Math.round((correctCount / totalQuestions) * 100);

  const summary = `We auto-graded your test without AI. You answered ${correctCount} of ${totalQuestions} questions correctly (${scorePct}%).`;

  return { summary, questionAnalysis, topicPerformance };
};

// GET /api/tests - Get all test definitions
router.get('/', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const tests = await TestDefinition.find({}).sort({ name: 1 });
    res.json({ success: true, data: tests });
}));

// POST /api/tests/start - Start a new test session
router.post('/start', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const { testType, isDiagnostic, isAdaptive, topic } = req.body;
    const userId = req.user!._id;

    const numQuestions = isDiagnostic ? 25 : 10;
    
    let questions: Question[];
    try {
        questions = await geminiService.generateTestQuestions(testType, numQuestions, topic);
    } catch (error: any) {
        const statusCode = error?.statusCode;
        const message = String(error?.message || '').toLowerCase();
        const isQuotaIssue =
            statusCode === 429 ||
            message.includes('daily limit') ||
            message.includes('quota');

        if (isQuotaIssue) {
            console.warn('Gemini quota reached; falling back to local questions for test:', testType);
            questions = generateFallbackQuestions(testType as TestType, numQuestions, topic);
        } else {
            throw error;
        }
    }

    if (!questions || questions.length === 0) {
        res.status(500);
        throw new Error("Failed to generate test questions.");
    }
    
    const session = await TestSession.create({
        userId,
        testType,
        questions,
        answers: [],
        isDiagnostic,
        isAdaptive,
        isCompleted: false,
        currentQuestionIndex: 0,
    });
    
    res.json({
        success: true,
        data: {
            sessionId: session._id,
            questions: questions,
            totalQuestions: questions.length,
        }
    });
}));

// POST /api/tests/session/:id/submit-and-finalize - New single endpoint
router.post('/session/:id/submit-and-finalize', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const sessionId = req.params.id;
    const userId = req.user!._id;
    const { answers } = req.body as { answers: UserAnswer[] };
    
    // 1. Find Session and User
    const session = await TestSession.findById(sessionId);
    if (!session || session.userId.toString() !== userId) {
        res.status(404);
        throw new Error("Test session not found or not authorized.");
    }
    if (session.isCompleted) {
        res.status(400);
        throw new Error("This test has already been completed.");
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found.");
    }

    // 2. Update session with answers
    session.answers = answers;
    session.isCompleted = true;

    // 3. Analyze results
    let analysisData: { summary: string; questionAnalysis: QuestionAnalysis[]; topicPerformance: TopicPerformance[] };
    try {
        analysisData = await geminiService.analyzeTestResults(session.toObject() as any);
    } catch (error: any) {
        const statusCode = error?.statusCode;
        const message = String(error?.message || '').toLowerCase();
        const isQuotaIssue =
            statusCode === 429 ||
            message.includes('daily limit') ||
            message.includes('quota');

        if (isQuotaIssue) {
            console.warn('Gemini quota reached; falling back to local analysis for test session:', sessionId);
            analysisData = analyzeLocally(session.toObject(), answers);
        } else {
            throw error;
        }
    }
    
    // 4. Calculate score and XP
    const correctCount = analysisData.questionAnalysis.filter((q: any) => q.isCorrect).length;
    const totalQuestions = session.questions.length;
    const calculatedScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const xpGained = calculatedScore >= 80 ? 100 : calculatedScore >= 60 ? 75 : 50;
    
    // 5. Create new TestResult document
    const newResult = new TestResult({
        ...analysisData,
        overallScore: calculatedScore,
        userId: user._id,
        dateTaken: new Date().toISOString(),
        testType: session.testType,
        isDiagnostic: session.isDiagnostic,
        answers: session.answers,
        questions: session.questions,
        xpGained,
    });
    await newResult.save();

    // 6. Update User document
    user.testHistory.push(newResult._id as any);
    user.xp += xpGained;
    user.level = Math.floor(user.xp / 500) + 1;

    const oldTotalScore = (user.averageScore || 0) * (user.testsTaken || 0);
    const newTotalScore = oldTotalScore + newResult.overallScore;
    user.testsTaken = (user.testsTaken || 0) + 1;
    user.averageScore = Math.round(newTotalScore / user.testsTaken);
    user.lastTestTaken = new Date().toISOString();

    await user.save();
    
    // 7. Clean up: Delete the test session
    await TestSession.findByIdAndDelete(sessionId);

    // 8. Populate user's test history and send response
    await user.populate('testHistory');

    res.status(200).json({
        success: true,
        data: {
            newResult: newResult.toObject(),
            updatedUser: user.toObject()
        }
    });
}));

export default router;