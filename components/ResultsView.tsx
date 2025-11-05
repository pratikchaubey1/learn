import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TestResult, QuestionAnalysis } from '../types';
import jsPDF from 'jspdf';
import LatexRenderer from './common/LatexRenderer';
import Confetti from './common/Confetti';
import LoadingView from './LoadingView';
import Spinner from './Spinner';

interface ResultsViewProps {
    result: TestResult | null;
    isGeneratingPlan: boolean;
    onGoToPlan: () => void;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const size = 144; // w-36
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const [offset, setOffset] = useState(circumference);
    const scoreColor = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';

    useEffect(() => {
        const progress = circumference - (score / 100) * circumference;
        setOffset(progress);
    }, [score, circumference]);


    return (
        <div className="relative" style={{width: size, height: size}}>
            <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                <circle className="text-gray-200" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} />
                <circle
                    className={scoreColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size/2}
                    cy={size/2}
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.8s ease-out' }}
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center text-3xl font-bold ${scoreColor}`}>
                {Math.round(score)}%
            </div>
        </div>
    );
};

const TopicBreakdownBar: React.FC<{ topic: string; correct: number; total: number }> = ({ topic, correct, total }) => {
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    const roundedPercentage = Math.round(percentage);
    const barColor = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-700">{topic}</p>
                <p className="text-sm font-bold text-gray-600">{correct}/{total} ({roundedPercentage}%)</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${barColor} h-2 rounded-full`} style={{ width: `0%`, transition: 'width 0.8s ease-out' }} ref={(el) => { if (el) { setTimeout(() => { if (el) { el.style.width = `${percentage}%`; } }, 100); } }}></div>
            </div>
        </div>
    );
};

const QuestionAnalysisCard: React.FC<{ analysis: QuestionAnalysis, index: number }> = ({ analysis, index }) => {
    return (
         <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-white/50 transition-all duration-300">
            <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-sm ${analysis.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                    {analysis.isCorrect ? '✔' : '✘'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800"><LatexRenderer content={analysis.questionText}/></p>
                    <p className={`text-xs font-medium mt-1 ${analysis.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                       Your answer: <LatexRenderer content={analysis.userAnswer}/>
                    </p>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/50">
                {!analysis.isCorrect && (
                     <p className="text-xs text-gray-700 mb-2">
                        <strong>Correct Answer: </strong>
                        <LatexRenderer content={analysis.correctAnswer}/>
                    </p>
                )}
                <p className="text-xs text-gray-700">
                    <strong>Explanation: </strong>
                    <LatexRenderer content={analysis.explanation}/>
                </p>
                 <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{analysis.topic}</span>
                    <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{analysis.questionType}</span>
                </div>
            </div>
        </div>
    );
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, onGoToPlan, isGeneratingPlan }) => {
    
    const [showConfetti, setShowConfetti] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        if(result) { // Show confetti for any completed test
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [result]);

    if (!result) {
        // This case is primarily handled by the wrapper, but as a fallback:
        return <LoadingView type="analysis" />;
    }

    const onRetake = () => {
        const { testType, questions, isDiagnostic } = result;
        navigate('/test', { state: { testType, numQuestions: questions.length, isDiagnostic }});
    };
    
    const onBackToDashboard = () => navigate('/dashboard');

    const getScoreFeedback = (score: number) => {
        if (score >= 90) return { title: "Excellent!", message: "Outstanding performance! You've mastered this topic.", icon: '🏆' };
        if (score >= 70) return { title: "Great Job!", message: "You have a strong understanding of the material. Keep it up!", icon: '👍' };
        if (score >= 50) return { title: "Good Effort!", message: "A solid foundation to build upon. Let's focus on the challenging areas.", icon: '💪' };
        return { title: "Needs Improvement", message: "A great starting point! We'll build up from here.", icon: '🌱' };
    };

    const downloadReport = () => {
        const doc = new jsPDF();
        let y = 15;

        doc.setFontSize(22);
        doc.text(`Test Report: ${result.testType}`, 105, y, { align: 'center' });
        y += 15;
        
        doc.setFontSize(16);
        doc.text(`Overall Score: ${Math.round(result.overallScore)}%`, 105, y, { align: 'center' });
        y += 10;
        
        doc.setFontSize(12);
        const summaryLines = doc.splitTextToSize(result.summary, 190);
        doc.text(summaryLines, 10, y);
        y += summaryLines.length * 5 + 10;


        doc.setFontSize(16);
        doc.text("Topic Breakdown:", 10, y);
        y += 10;
        
        result.topicPerformance.forEach(topic => {
            doc.setFontSize(12);
            doc.text(`${topic.topic}: ${topic.correct}/${topic.total} (${Math.round(topic.total > 0 ? (topic.correct / topic.total) * 100 : 0)}%)`, 15, y);
            y+= 7;
        });
        
        y+= 5;
        doc.setFontSize(16);
        doc.text("Question Analysis:", 10, y);
        y += 10;
        
        result.questionAnalysis.forEach((q, i) => {
             if (y > 270) {
                doc.addPage();
                y = 15;
            }
            doc.setFontSize(10);
            const questionLines = doc.splitTextToSize(`${i + 1}. ${q.questionText}`, 180);
            doc.text(questionLines, 15, y);
            y += questionLines.length * 4;

            doc.setTextColor(q.isCorrect ? 0 : 255, 0, 0);
            doc.text(`Your answer: ${q.userAnswer}`, 20, y);
            y += 5;

            if(!q.isCorrect) {
                doc.setTextColor(0, 128, 0);
                doc.text(`Correct answer: ${q.correctAnswer}`, 20, y);
                y += 5;
            }
            doc.setTextColor(0,0,0);
            const explanationLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, 170);
            doc.text(explanationLines, 20, y);
            y += explanationLines.length * 4 + 10;
        });

        doc.save(`RefreshKid_${result.testType.replace(/\s/g, '_')}_Report.pdf`);
    };

    const feedback = getScoreFeedback(result.overallScore);
    const correctCount = result.questionAnalysis.filter(q => q.isCorrect).length;
    const incorrectCount = result.questionAnalysis.length - correctCount;

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-orange-50 flex items-center justify-center py-8 px-4">
            {showConfetti && <Confetti />}
            <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">Test Results: {result.testType}</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="md:col-span-1 bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/50 flex flex-col items-center justify-between text-center">
                        <div className="w-full">
                            <div className="text-3xl mb-2">{feedback.icon}</div>
                            <h2 className="text-xl font-bold text-gray-800">{feedback.title}</h2>
                            <p className="text-xs text-gray-500 mt-1">{feedback.message}</p>
                        </div>
                        <div className="my-4">
                            <ScoreCircle score={result.overallScore} />
                        </div>
                        <div className="w-full">
                            <div className="flex justify-around">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-green-500">{correctCount}</p>
                                    <p className="text-xs text-gray-500">Correct</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-red-500">{incorrectCount}</p>
                                    <p className="text-xs text-gray-500">Incorrect</p>
                                </div>
                            </div>
                            {result.xpGained > 0 && 
                                <div className="mt-4 bg-yellow-100 text-yellow-800 font-bold px-3 py-1.5 rounded-full text-xs">
                                    +{result.xpGained} XP Gained! 🌟
                                </div>
                            }
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">AI Summary</h3>
                        <p className="text-sm text-gray-600 mb-6">{result.summary}</p>
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Topic Breakdown</h3>
                        <div className="flex-grow max-h-40 overflow-y-auto pr-2">
                            <div className="space-y-3">
                                {result.topicPerformance.map((topic, index) => (
                                    <TopicBreakdownBar key={index} topic={topic.topic} correct={topic.correct} total={topic.total} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {result.isDiagnostic ? (
                        <button 
                            onClick={onGoToPlan} 
                            disabled={isGeneratingPlan}
                            className="bg-brand-orange text-white font-bold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors transform hover:scale-105 shadow-md text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isGeneratingPlan ? <><Spinner /> Generating Plan...</> : <>View My New Plan &rarr;</>}
                        </button>
                    ) : (
                        <button onClick={onRetake} className="bg-brand-orange text-white font-bold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors transform hover:scale-105 shadow-md text-sm">
                            Retake Test
                        </button>
                    )}
                    <button onClick={downloadReport} className="bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        Download Report
                    </button>
                    <button onClick={onBackToDashboard} className="bg-transparent text-brand-blue font-bold py-2 px-5 rounded-lg hover:underline text-sm">
                        Back to Dashboard
                    </button>
                </div>


                <h2 className="text-xl font-bold text-gray-800 mb-4">Question-by-Question Analysis</h2>
                <div className="space-y-3">
                    {result.questionAnalysis.map((analysis, index) => (
                        <QuestionAnalysisCard key={index} analysis={analysis} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResultsView;