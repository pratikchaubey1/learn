// services/userService.ts
import type { User, TestResult, UserAnswer, Question, TestType } from '../types';
import apiService from './apiService';

export interface PaginatedUsers {
    users: User[];
    page: number;
    totalPages: number;
    totalUsers: number;
}

export interface AdminStats {
    totalUsers: number;
    totalTestsTaken: number;
    averageScore: number;
}

export interface TestSubmissionData {
    answers: UserAnswer[];
    questions: Question[];
    testType: TestType;
    isDiagnostic: boolean;
}

export interface TestSubmissionResponse {
    newResult: TestResult;
    updatedUser: User;
}

export interface LeaderboardUser {
    _id: string;
    fullName: string;
    username: string;
    avatarId: number;
    level: number;
    xp: number;
}

export const userService = {
  async login(identifier: string, password: string): Promise<User> {
    return apiService.post<User>('/auth/login', { identifier, password });
  },

  async signUp(fullName: string, username: string, email: string, password: string): Promise<User> {
    return apiService.post<User>('/auth/signup', { fullName, username, email, password });
  },

  async getMe(): Promise<User> {
    return apiService.get<User>('/auth/me');
  },

  async updateUser(updatedUser: Partial<User> & { _id: string }): Promise<User> {
    return apiService.put<User>(`/users/${updatedUser._id}`, updatedUser);
  },

  async saveTestResult(userId: string, resultData: TestSubmissionData): Promise<TestSubmissionResponse> {
    return apiService.post<TestSubmissionResponse>(`/users/${userId}/test-results`, resultData);
  },

  async generatePlan(userId: string, testResultId: string): Promise<User> {
    return apiService.post<User>(`/users/${userId}/generate-plan`, { testResultId });
  },
  
  async getLeaderboardUsers(): Promise<LeaderboardUser[]> {
    return apiService.get<LeaderboardUser[]>('/users/leaderboard');
  },

  // For Admin
  async getAllUsers(page: number = 1, limit: number = 10): Promise<PaginatedUsers> {
    return apiService.get<PaginatedUsers>(`/admin/users?page=${page}&limit=${limit}`);
  },

  async getAllUsersForExport(): Promise<User[]> {
    return apiService.get<User[]>('/admin/users/all');
  },

  async getAdminStats(): Promise<AdminStats> {
    return apiService.get<AdminStats>('/admin/stats');
  },

  async requestPasswordReset(identifier: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/auth/request-reset', { identifier });
  },
  
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`/auth/reset-password/${token}`, { password });
  }
};