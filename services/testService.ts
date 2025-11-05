// services/testService.ts
import { TestType, TestSession, Question, UserAnswer, TestResult, User } from '../types';
import apiService from './apiService';

export interface TestDefinition {
    id: TestType;
    name: string;
    description: string;
    category: string;
    isAdaptive?: boolean;
    isMock?: boolean;
}

export interface StartTestResponse {
    sessionId: string;
    questions: Question[]; // Changed from firstQuestion
    totalQuestions: number;
}

export interface FinalizeTestResponse {
    newResult: TestResult,
    updatedUser: User
}

export const testService = {
  async getAllTests(): Promise<TestDefinition[]> {
    return apiService.get<TestDefinition[]>('/tests');
  },

  async startTest(testType: TestType, isDiagnostic: boolean, isAdaptive: boolean, topic?: string): Promise<StartTestResponse> {
    return apiService.post<StartTestResponse>('/tests/start', { testType, isDiagnostic, isAdaptive, topic });
  },

  async submitAndFinalizeTest(sessionId: string, answers: UserAnswer[]): Promise<FinalizeTestResponse> {
    return apiService.post<FinalizeTestResponse>(`/tests/session/${sessionId}/submit-and-finalize`, { answers });
  }
};