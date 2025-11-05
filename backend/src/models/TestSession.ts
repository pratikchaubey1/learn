// models/TestSession.ts
import { Schema, model } from 'mongoose';
import { ITestSession, Question, UserAnswer, TestType } from '../types';
import { v4 as uuidv4 } from 'uuid';

const QuestionSchema = new Schema<Question>({
    _id: { type: String, default: uuidv4 },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
    explanation: String,
    topic: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    passage: String,
}, { _id: false });


const UserAnswerSchema = new Schema<UserAnswer>({
    questionId: { type: String, required: true },
    answerIndex: { type: Number, required: true }
}, { _id: false });

const TestSessionSchema = new Schema<ITestSession>({
    // FIX: Changed userId type from ObjectId to String to match the ITestSession interface and resolve type error.
    userId: { type: String, required: true },
    testType: { type: String, required: true, enum: Object.values(TestType) },
    questions: { type: [QuestionSchema], required: true },
    answers: { type: [UserAnswerSchema], default: [] },
    isDiagnostic: { type: Boolean, default: false },
    isAdaptive: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    currentQuestionIndex: { type: Number, default: 0 },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

export default model<ITestSession>('TestSession', TestSessionSchema);