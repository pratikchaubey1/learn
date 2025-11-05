// backend/src/types.ts
import { Document, Schema } from 'mongoose';

// ===================================================================
// START: Content previously in root `types.ts`
// ===================================================================

export enum Exam {
  SAT = 'SAT',
  ACT = 'ACT',
  AP = 'AP'
}

export enum TestType {
  SAT_DIAGNOSTIC = "SAT Diagnostic",
  ACT_DIAGNOSTIC = "ACT Diagnostic",
  AP_DIAGNOSTIC = "AP Diagnostic",
  SAT_MATH = "SAT Math",
  SAT_RW = "SAT Reading & Writing",
  SAT_ALGEBRA = "SAT Algebra",
  SAT_GEOMETRY = "SAT Geometry",
  ACT_MATH = "ACT Math",
  ACT_SCIENCE = "ACT Science",
  ACT_READING = "ACT Reading",
  ACT_ENGLISH = "ACT English",
  ACT_WRITING = "ACT Writing",
  AP_CALC_AB = "AP Calculus AB",
  AP_USH = "AP US History",
  AP_BIOLOGY = "AP Biology",
  AP_LIT = "AP English Literature",
  AP_PHYSICS_1 = "AP Physics 1",
  AP_WORLD_HISTORY = "AP World History",
  AP_CHEMISTRY = "AP Chemistry",
  AP_PSYCHOLOGY = "AP Psychology",
  ADAPTIVE_SAT_MATH = "Adaptive SAT Math",
  ADAPTIVE_ACT_MATH = "Adaptive ACT Math",
  DAILY_QUIZ = "Daily Quiz",
  CONCEPT_CHECK_QUIZ = "Concept Check Quiz",

  // Mocks
  SAT_MATH_MOCK = "SAT Math Mock",
  SAT_RW_MOCK = "SAT Reading & Writing Mock",
  SAT_ALGEBRA_MOCK = "SAT Algebra Mock",
  SAT_GEOMETRY_MOCK = "SAT Geometry Mock",
  ACT_MATH_MOCK = "ACT Math Mock",
  ACT_SCIENCE_MOCK = "ACT Science Mock",
  ACT_READING_MOCK = "ACT Reading Mock",
  ACT_ENGLISH_MOCK = "ACT English Mock",
  AP_CALC_AB_MOCK = "AP Calculus AB Mock",
  AP_USH_MOCK = "AP US History Mock",
  AP_BIOLOGY_MOCK = "AP Biology Mock",
}

export interface Question {
  _id: string; // Unique ID for each question within a test
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  passage?: string;
}

export interface UserAnswer {
  questionId: string;
  answerIndex: number;
}

export interface QuestionAnalysis {
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    topic: string;
    questionType: string;
}

export interface TopicPerformance {
    topic: string;
    correct: number;
    total: number;
}

export interface TestResult {
  _id: string;
  userId: string;
  dateTaken: string;
  testType: TestType;
  isDiagnostic: boolean;
  overallScore: number;
  summary: string;
  answers: UserAnswer[];
  questions: Question[];
  questionAnalysis: QuestionAnalysis[];
  topicPerformance: TopicPerformance[];
  xpGained: number;
}

export interface ExamGoal {
  exam: Exam;
  targetScore: number;
  examDate: string; // YYYY-MM-DD
}

export interface PlanStep {
  _id: string; 
  title: string;
  description: string;
  type: 'test' | 'review' | 'concept';
  relatedTestType?: TestType;
  topic?: string;
  completed: boolean;
  estimatedTime?: string;
}

export interface PlanWeek {
  week: number;
  startDate: string;
  endDate: string;
  summary: string;
  steps: PlanStep[];
}

export interface Plan {
  _id:string;
  generatedOn: string;
  goal: ExamGoal;
  weeks: PlanWeek[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type BadgeId = 'first_test' | 'streak_3' | 'streak_7' | 'perfect_score' | 'topic_master_algebra' | 'level_5' | 'daily_login';

export interface Badge {
  _id: BadgeId;
  name: string;
  description: string;
  icon: string; // emoji or svg path
  unlockedOn?: string | Date;
}

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  avatarId: number;
  goal?: ExamGoal;
  plan?: Plan;
  testHistory: TestResult[];
  xp: number;
  level: number;
  badges: Badge[];
  isAdmin?: boolean;
  token?: string;
  testsTaken?: number;
  averageScore?: number;
  lastTestTaken?: string;
  planProgress?: number;
  loginStreak?: number;
  lastLogin?: string;
}

export interface TestSession {
  _id: string;
  userId: string;
  testType: TestType;
  questions: Question[];
  answers: UserAnswer[];
  isDiagnostic: boolean;
  isAdaptive: boolean;
  isCompleted: boolean;
  currentQuestionIndex: number;
  createdAt: string;
}

// ===================================================================
// END: Content previously in root `types.ts`
// ===================================================================


// ===================================================================
// START: Mongoose-specific Document Interfaces
// ===================================================================

export interface ITestResult extends TestResult, Document {
  _id: string;
}

export interface IPlan extends Plan, Document {
  _id: string;
}

export interface IUser extends Omit<User, 'testHistory'>, Document {
  _id: string;
  password?: string;
  testHistory: (ITestResult | Schema.Types.ObjectId)[];
  matchPassword(password: string): Promise<boolean>;
  getResetPasswordToken(): string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface ITestSession extends TestSession, Document {
  _id: string;
}

// ===================================================================
// END: Mongoose-specific Document Interfaces
// ===================================================================