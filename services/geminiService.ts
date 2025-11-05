// services/geminiService.ts
import { MOTIVATIONAL_QUOTES } from '../constants';
import type { Question, TestResult, ChatMessage, ExamGoal, Plan, User, TestType } from '../types';
import apiService from './apiService';

// This function can remain on the client-side as it doesn't require API calls.
export const getMotivationalQuote = (): string => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
};

// All functions that call the Gemini API are now proxied through the backend.

interface AnalysisResponse {
    overallScore: number;
    summary: string;
    questionAnalysis: TestResult['questionAnalysis'];
    topicPerformance: TestResult['topicPerformance'];
}

export const generateTestQuestions = async (testType: TestType, numQuestions: number): Promise<Question[]> => {
    return apiService.post<Question[]>('/ai/generate-test', { testType, numQuestions });
};

export const analyzeTestResults = async (testResult: Partial<TestResult>): Promise<AnalysisResponse> => {
    return apiService.post<AnalysisResponse>('/ai/analyze-results', { testResult });
};

export const generateLearningPlan = async (goal: ExamGoal, result: TestResult): Promise<Plan> => {
    return apiService.post<Plan>('/ai/generate-plan', { goal, result });
};

export const getAdminInsights = async (allUsers: User[]): Promise<string> => {
    return apiService.post<string>('/admin/insights', { allUsers });
};

// This service is now just a placeholder, as the chat logic is handled directly in AiceyChat.tsx
export const getAiceyResponse = async (history: ChatMessage[], context?: string): Promise<ReadableStream<Uint8Array>> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({ history, context }), // Pass context to backend
    });

    if (!response.ok || !response.body) {
        throw new Error('Network response was not ok');
    }
    
    return response.body;
}