import React, { useState, useCallback } from 'react';
import type { User } from '../../types';
import Spinner from '../Spinner';

interface AIInsightsProps {
    allUsers: User[];
    getInsights: (allUsers: User[]) => Promise<string>;
}

const AIInsights: React.FC<AIInsightsProps> = ({ allUsers, getInsights }) => {
    const [insights, setInsights] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateInsights = useCallback(async () => {
        setLoading(true);
        setError('');
        setInsights('');
        try {
            const result = await getInsights(allUsers);
            setInsights(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    }, [allUsers, getInsights]);
    
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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                 <svg className="w-6 h-6 mr-2 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                AI Analyst
            </h3>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg min-h-[150px] border border-slate-200 dark:border-slate-600">
                {loading && <div className="flex justify-center items-center h-full"><Spinner message="Analyzing data..." /></div>}
                {error && <p className="text-sm text-red-500">{error}</p>}
                {insights && <MarkdownRenderer content={insights} />}
                {!loading && !error && !insights && (
                     <p className="text-sm text-slate-500 dark:text-slate-400 text-center pt-8">
                        Click the button below to generate insights on user performance.
                    </p>
                )}
            </div>
            <button 
                onClick={handleGenerateInsights}
                disabled={loading}
                className="w-full mt-4 bg-brand-orange text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-slate-400"
            >
                {loading ? 'Analyzing...' : 'Generate Insights'}
            </button>
        </div>
    );
};

export default AIInsights;