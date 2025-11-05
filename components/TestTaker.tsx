import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question, UserAnswer, TestType } from '../types';
import { getMotivationalQuote } from '../services/geminiService';
import Logo from './Logo';
import LatexRenderer from './common/LatexRenderer';
import Spinner from './Spinner';

interface TestTakerProps {
    sessionId: string;
    questions: Question[];
    totalQuestions: number;
    testType: TestType;
    onComplete: (sessionId: string, answers: UserAnswer[]) => void;
}

const Sidebar: React.FC<{
    testType: TestType;
    progress: number;
    answeredCount: number;
    totalQuestions: number;
    questions: Question[];
    currentIndex: number;
    answers: Record<string, number>;
    onNavigate: (index: number) => void;
}> = ({ testType, progress, answeredCount, totalQuestions, questions, currentIndex, answers, onNavigate }) => {
    const [quote] = useState(getMotivationalQuote());

    const getButtonClass = (index: number) => {
        const base = "w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-colors";
        if (index === currentIndex) {
            return `${base} bg-blue-600 text-white ring-2 ring-offset-2 ring-offset-blue-800 ring-blue-500`;
        }
        if (answers[questions[index]._id] !== undefined) {
            return `${base} bg-green-600 text-white hover:bg-green-500`;
        }
        return `${base} bg-blue-900/50 text-blue-200 hover:bg-blue-800`;
    };

    return (
        <aside className="w-80 bg-blue-900 text-white p-6 flex-shrink-0 flex-col hidden lg:flex">
            <div className="mb-8">
                <Logo />
                <p className="text-sm text-blue-300 -mt-2 truncate" title={testType}>{testType}</p>
            </div>

            <div className="mb-8">
                <h3 className="font-bold text-lg mb-2">Progress</h3>
                <div className="w-full bg-blue-900/50 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm text-blue-300 mt-1">{answeredCount} of {totalQuestions} answered</p>
            </div>

            <div className="mb-8 p-4 rounded-lg bg-blue-800/50">
                <p className="text-sm text-blue-200 italic">"{quote}"</p>
            </div>

            <div className="flex-grow overflow-y-auto">
                 <h3 className="font-bold text-lg mb-3">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, index) => (
                        <button key={q._id} onClick={() => onNavigate(index)} className={getButtonClass(index)}>
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="mt-6 text-sm">
                <h4 className="font-bold mb-2">Legend:</h4>
                <div className="flex items-center gap-2 mb-1"><div className="w-4 h-4 rounded-sm bg-blue-600 border border-blue-400"></div><span>Current</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-green-600 border border-green-400"></div><span>Answered</span></div>
            </div>
        </aside>
    );
};

const PauseModal: React.FC<{ onResume: () => void; onQuit: () => void; }> = ({ onResume, onQuit }) => {
    return (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
                <h2 className="text-3xl font-bold text-slate-800">Test Paused</h2>
                <p className="text-slate-500 mt-2 mb-8">Take a moment. Your progress is saved.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={onResume} className="w-full bg-brand-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                        Resume
                    </button>
                    <button onClick={onQuit} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-8 rounded-lg transition-colors">
                        Quit Test
                    </button>
                </div>
            </div>
        </div>
    );
};


const TestTaker: React.FC<TestTakerProps> = ({ sessionId, questions, totalQuestions, testType, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const autoAdvanceTimerRef = useRef<number | null>(null);
    const navigate = useNavigate();

    const handleSubmitQuiz = useCallback(() => {
        const formattedAnswers: UserAnswer[] = Object.entries(answers).map(([questionId, answerIndex]) => ({
            questionId,
            answerIndex,
        }));
        onComplete(sessionId, formattedAnswers);
    }, [onComplete, sessionId, answers]);

    useEffect(() => {
        if (isPaused || isSubmitting) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsSubmitting(true);
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isPaused, isSubmitting, handleSubmitQuiz]);
    
    // Cleanup auto-advance timer on unmount
    useEffect(() => {
        return () => {
            if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
            }
        };
    }, []);

    const handleAnswerSelect = (questionId: string, answerIndex: number) => {
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
        }

        setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));

        if (currentIndex < questions.length - 1) {
             autoAdvanceTimerRef.current = window.setTimeout(() => {
                setCurrentIndex(i => i + 1);
            }, 2000);
        }
    };

    const handleQuit = () => {
        if (window.confirm("Are you sure you want to quit? Your progress will not be saved.")) {
            navigate('/dashboard');
        }
    };

    const handlePause = () => {
        setIsPaused(true);
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
        }
    };
    
    const handleResume = () => {
        setIsPaused(false);
    };

    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / totalQuestions) * 100;
    const currentQuestion = questions[currentIndex];

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen flex bg-slate-100 font-sans">
            <Sidebar
                testType={testType}
                progress={progressPercent}
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                onNavigate={(index) => {
                     if (autoAdvanceTimerRef.current) {
                        clearTimeout(autoAdvanceTimerRef.current);
                        autoAdvanceTimerRef.current = null;
                    }
                    setCurrentIndex(index);
                }}
            />
            <div className="flex-1 flex flex-col relative">
                {isPaused && <PauseModal onResume={handleResume} onQuit={handleQuit} />}

                <header className="bg-white p-4 flex justify-between items-center border-b border-slate-200">
                    <div className="font-bold text-xl">{formatTime(timeLeft)}</div>
                    <div>
                         <button onClick={handlePause} className="bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-lg mr-4 hover:bg-slate-300 transition-colors">
                            Pause
                        </button>
                        <button onClick={handleSubmitQuiz} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                            Submit Quiz
                        </button>
                    </div>
                </header>
                <main className="flex-grow p-4 sm:p-8 flex items-center justify-center overflow-y-auto">
                    <div className="w-full max-w-4xl animate-fade-in">
                        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                            <div className="p-6 bg-brand-blue text-white flex justify-between items-center">
                                <h2 className="text-lg font-bold">Question {currentIndex + 1} of {totalQuestions}</h2>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${answers[currentQuestion._id] !== undefined ? 'bg-green-500/80' : 'bg-blue-500/80'}`}>
                                    {answers[currentQuestion._id] !== undefined ? 'Answered' : 'Not Answered'}
                                </span>
                            </div>
                             <div className="p-6 md:p-8">
                                {currentQuestion.passage && (
                                    <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg max-h-48 overflow-y-auto text-sm text-slate-600 leading-relaxed">
                                        <LatexRenderer content={currentQuestion.passage} />
                                    </div>
                                )}
                                <div className="text-xl font-semibold text-slate-800 mb-8 leading-relaxed">
                                    <LatexRenderer content={currentQuestion.questionText} />
                                </div>
                                <div className="space-y-4">
                                     {currentQuestion.options.map((option, index) => {
                                        const isSelected = answers[currentQuestion._id] === index;
                                        return (
                                            <label key={index} className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center text-base sm:text-lg cursor-pointer ${isSelected ? 'bg-blue-50 border-brand-blue ring-2 ring-blue-200' : 'bg-white border-slate-300 hover:border-slate-400'}`}>
                                                <div className="w-8 h-8 mr-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center font-bold text-sm transition-colors border-slate-400 text-slate-500">
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <div className="flex-1 break-words"><LatexRenderer content={option} /></div>
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion._id}`}
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerSelect(currentQuestion._id, index)}
                                                    className="sr-only"
                                                />
                                            </label>
                                        );
                                     })}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                            <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0} className="bg-white border border-slate-300 font-bold py-2 px-6 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                Previous
                            </button>
                             <div className="flex items-center gap-1.5">
                                {questions.slice(0, 15).map((_, index) => (
                                    <div key={index} className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentIndex ? 'bg-brand-blue' : 'bg-slate-300'}`}></div>
                                ))}
                                {questions.length > 15 && <div className="text-slate-400 font-bold">...</div>}
                            </div>
                            <button onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))} disabled={currentIndex === questions.length - 1} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                Next
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TestTaker;