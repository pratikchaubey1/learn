import React, { useEffect } from 'react';
import Spinner from '../Spinner';

interface AIInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    insights: string;
    loading: boolean;
    error: string;
    onGenerate: () => void;
}

const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ isOpen, onClose, insights, loading, error, onGenerate }) => {

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;
    
    const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
        const paragraphs = content.split('\n').filter(p => p.trim() !== '');
        return (
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                {paragraphs.map((para, i) => (
                     <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
            </div>
        );
    };

    return (
         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in-down border-t-4 border-brand-orange" style={{animationDuration: '0.4s'}} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                         <svg className="w-6 h-6 mr-2 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        AI Analyst
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl transition-colors">&times;</button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg min-h-[200px] border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                    {loading && <div className="flex justify-center items-center h-full"><Spinner message="Analyzing data..." /></div>}
                    {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
                    {insights && <MarkdownRenderer content={insights} />}
                    {!loading && !error && !insights && (
                         <div className="text-center">
                             <p className="text-sm text-slate-500 dark:text-slate-400">
                                Get high-level insights on student performance trends, common struggles, and actionable recommendations.
                            </p>
                        </div>
                    )}
                </div>
                <button 
                    onClick={onGenerate}
                    disabled={loading}
                    className="w-full mt-4 bg-brand-orange text-white py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-slate-400"
                >
                    {loading ? 'Analyzing...' : insights ? 'Re-generate Insights' : 'Generate Insights'}
                </button>
            </div>
        </div>
    );
};

export default AIInsightsModal;