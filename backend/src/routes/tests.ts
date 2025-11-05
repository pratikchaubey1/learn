// routes/tests.ts
import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, AuthRequest } from '../middleware/auth';
import TestDefinition from '../models/TestDefinition';
import TestSession from '../models/TestSession';
import TestResult from '../models/TestResult';
import User from '../models/User';
import { geminiService } from '../services/geminiService';
import { Question, UserAnswer } from '../types';

const router = express.Router();

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
    
    const questions = await geminiService.generateTestQuestions(testType, numQuestions, topic);

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
    const analysisData = await geminiService.analyzeTestResults(session.toObject() as any);
    
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