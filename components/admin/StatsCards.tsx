import React from 'react';

interface StatsCardsProps {
    stats: {
        totalUsers: number;
        totalTestsTaken: number;
        averageScore: number;
    };
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; detail: string; color: string }> = ({ title, value, icon, detail, color }) => (
    <div className={`relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-transform transform hover:-translate-y-1`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{detail}</p>
            </div>
            <div className={`p-3 rounded-full text-white ${color}`}>
                {icon}
            </div>
        </div>
        <div className={`absolute bottom-0 left-0 h-1.5 w-full ${color}`}></div>
    </div>
);

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <StatCard 
                title="Total Users" 
                value={stats.totalUsers} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                detail="Active students on the platform"
                color="bg-brand-blue"
            />
            <StatCard 
                title="Tests Taken" 
                value={stats.totalTestsTaken}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                detail="Across all users and subjects"
                color="bg-brand-orange"
            />
             <StatCard 
                title="Average Score" 
                value={`${stats.averageScore}%`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                detail="Platform-wide performance"
                color="bg-brand-blue-light"
            />
        </div>
    );
};

export default StatsCards;