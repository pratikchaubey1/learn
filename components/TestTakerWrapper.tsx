import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import TestTaker from './TestTaker';
import LoadingView from './LoadingView';
import { testService } from '../services/testService';
import { TestType, UserAnswer, TestResult } from '../types';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';


const TestTakerWrapper: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { _updateUserFromResponse } = useAuth();

    const { testType, isDiagnostic, isAdaptive, topic, ...planDetails } = (location.state || {}) as {
        testType: TestType,
        isDiagnostic: boolean,
        isAdaptive: boolean,
        topic?: string,
        weekIndex?: number,
        stepId?: string,
    };
    
    const { data: testSession, isLoading, isError, error } = useQuery({
        queryKey: ['startTest', testType, topic],
        queryFn: () => {
             if (!testType) throw new Error("Test parameters not provided.");
            return testService.startTest(testType, isDiagnostic, isAdaptive, topic);
        },
        enabled: !!testType,
        staleTime: Infinity, 
        retry: false, 
    });

    const submissionMutation = useMutation({
        mutationFn: ({ sessionId, answers }: { sessionId: string; answers: UserAnswer[] }) => 
            testService.submitAndFinalizeTest(sessionId, answers),
        onSuccess: (data) => {
            _updateUserFromResponse(data.updatedUser);
            navigate('/results', { state: { result: data.newResult, planDetails } });
        },
        onError: (err: any) => {
             navigate('/dashboard', { state: { error: err.message || "Failed to submit your test." } });
        }
    });


    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-2xl font-bold text-red-600">Error Starting Test</h2>
                <p className="text-slate-600 mt-2">{error.message}</p>
                <button onClick={() => navigate('/dashboard')} className="mt-6 bg-brand-blue text-white font-bold py-2 px-5 rounded-lg">
                    Back to Dashboard
                </button>
            </div>
        );
    }
    
    if (isLoading || !testSession) {
        return <LoadingView type="generation" />;
    }

    if (submissionMutation.isPending) {
        return <LoadingView type="analysis" />;
    }

    const handleComplete = (sessionId: string, answers: UserAnswer[]) => {
        submissionMutation.mutate({ sessionId, answers });
    };
    
    return (
        <TestTaker 
            sessionId={testSession.sessionId}
            questions={testSession.questions}
            totalQuestions={testSession.totalQuestions}
            testType={testType}
            onComplete={handleComplete}
        />
    );
};

export default TestTakerWrapper;