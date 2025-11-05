import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import ResultsView from './ResultsView';
import LoadingView from './LoadingView';
import AchievementToast from './AchievementToast';
import { TestResult } from '../types';

const ResultsWrapper: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, _updateUserFromResponse } = useAuth();
    
    const [showPlanReadyToast, setShowPlanReadyToast] = useState(false);
    
    const { result, planDetails } = (location.state || {}) as { result: TestResult, planDetails?: any };

    useEffect(() => {
        if (!result) {
            console.error("Navigated to results page without result data.");
            navigate('/dashboard');
        }
    }, [result, navigate]);

    const generatePlanMutation = useMutation({
        mutationFn: (data: { userId: string, testResultId: string }) => 
            userService.generatePlan(data.userId, data.testResultId),
        onSuccess: (updatedUserWithPlan) => {
            _updateUserFromResponse(updatedUserWithPlan);
            setShowPlanReadyToast(true);
            if (planDetails) { // Trigger tour only for initial diagnostic
                localStorage.setItem('showOnboardingTour', 'true');
            }
        },
    });

    useEffect(() => {
        if (result?.isDiagnostic && user) {
            generatePlanMutation.mutate({ userId: user._id, testResultId: result._id });
        }
    }, [result, user]);

    const error = generatePlanMutation.error?.message;

    if (error) {
         return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-2xl font-bold text-red-600">Error Generating Plan</h2>
                <p className="text-slate-600 mt-2">{error}</p>
                <button onClick={() => navigate('/dashboard')} className="mt-6 bg-brand-blue text-white font-bold py-2 px-5 rounded-lg">
                    Back to Dashboard
                </button>
            </div>
        );
    }
    
    if (result?.isDiagnostic && generatePlanMutation.isPending) {
        return <LoadingView type="plan" />;
    }

    if (result) {
       return (
        <>
            <ResultsView 
                result={result}
                isGeneratingPlan={generatePlanMutation.isPending}
                onGoToPlan={() => navigate('/dashboard', { state: { view: 'my-plan' }})}
            />
            {showPlanReadyToast && (
                <AchievementToast
                    message="Your personalized plan is ready!"
                    type="default"
                    onClose={() => setShowPlanReadyToast(false)}
                />
            )}
        </>
       );
    }

    // Fallback loading state
    return <LoadingView type="analysis" />;
};

export default ResultsWrapper;