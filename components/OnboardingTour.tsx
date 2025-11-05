import React, { useState, useEffect } from 'react';

interface OnboardingTourProps {
    onClose: () => void;
}

const tourSteps = [
    {
        elementId: null, // General welcome
        title: "Welcome to Your Dashboard!",
        content: "You've completed your diagnostic test. Let's take a quick look around.",
        position: 'center'
    },
    {
        elementId: 'my-plan-nav',
        title: "Your Personalized Plan",
        content: "Based on your results, we've created a custom study plan just for you. Find it here anytime.",
        position: 'left'
    },
    {
        elementId: 'aicey-button',
        title: "Meet Aicey",
        content: "Have a question? Aicey is here to help you 24/7 with any topic.",
        position: 'bottom-right'
    },
    {
        elementId: 'dashboard-stats',
        title: "Track Your Progress",
        content: "Keep an eye on your progress, scores, and achievements right here on your dashboard.",
        position: 'top'
    },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onClose }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [elementRect, setElementRect] = useState<DOMRect | null>(null);

    const currentStep = tourSteps[stepIndex];

    useEffect(() => {
        if (currentStep.elementId) {
            let element = document.getElementById(currentStep.elementId);
            
            // Special handling for dynamic IDs
            if (!element) {
                if (currentStep.elementId === 'my-plan-nav') {
                   const navButtons = document.querySelectorAll('aside nav button');
                   if(navButtons.length > 1) {
                        navButtons[1].id = 'my-plan-nav';
                        element = navButtons[1] as HTMLElement;
                   }
                }
                if(currentStep.elementId === 'dashboard-stats') {
                    const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
                    if(grid) {
                        grid.id = 'dashboard-stats';
                        element = grid as HTMLElement;
                    }
                }
            }

            if (element) {
                setElementRect(element.getBoundingClientRect());
            } else {
                 setElementRect(null); // Fallback to center
            }
        } else {
            setElementRect(null);
        }
    }, [stepIndex, currentStep]);

    const handleNext = () => {
        if (stepIndex < tourSteps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onClose();
        }
    };
    
    const getModalPosition = () => {
        if (!elementRect) {
             return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
        
        switch (currentStep.position) {
            case 'left':
                return { top: `${elementRect.top}px`, left: `${elementRect.right + 20}px` };
            case 'bottom-right':
                return { top: `${elementRect.top - 180}px`, left: `${elementRect.left - 320}px` };
            case 'top':
                return { top: `${elementRect.bottom + 20}px`, left: '50%', transform: 'translateX(-50%)' };
            default:
                 return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in">
             {elementRect && <div className="absolute rounded-lg border-4 border-white border-dashed transition-all duration-300" style={{ top: elementRect.top - 8, left: elementRect.left - 8, width: elementRect.width + 16, height: elementRect.height + 16 }}></div>}
            
            <div className="absolute bg-white text-slate-800 rounded-lg shadow-2xl p-6 w-80 animate-fade-in-up" style={getModalPosition()}>
                <h3 className="text-lg font-bold mb-2">{currentStep.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{currentStep.content}</p>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">{stepIndex + 1} / {tourSteps.length}</span>
                    <button onClick={handleNext} className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg text-sm">
                        {stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
                 <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600">&times;</button>
            </div>
        </div>
    );
};

export default OnboardingTour;