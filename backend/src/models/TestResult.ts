// models/TestResult.ts
import { Schema, model } from 'mongoose';
import { ITestResult } from '../types';

const QuestionSchema = new Schema({
    _id: { type: String, required: true },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
    topic: String,
    passage: String,
    explanation: String,
}, { _id: false });

const UserAnswerSchema = new Schema({
    questionId: { type: String, required: true },
    answerIndex: { type: Number, required: true }
}, { _id: false });

const QuestionAnalysisSchema = new Schema({
    questionText: { type: String, required: true },
    userAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    explanation: { type: String, required: true },
    topic: { type: String, required: true },
    questionType: { type: String, required: true },
}, { _id: false });

const TopicPerformanceSchema = new Schema({
    topic: { type: String, required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true }
}, { _id: false });

export const TestResultSchema = new Schema<ITestResult>({
    userId: { type: String, required: true },
    dateTaken: { type: String, required: true },
    testType: { type: String, required: true },
    isDiagnostic: { type: Boolean, default: false },
    overallScore: { type: Number, required: true },
    summary: { type: String, required: true },
    answers: [UserAnswerSchema],
    questions: [QuestionSchema],
    questionAnalysis: [QuestionAnalysisSchema],
    topicPerformance: [TopicPerformanceSchema],
    xpGained: { type: Number, default: 0 }
});

export default model<ITestResult>('TestResult', TestResultSchema);