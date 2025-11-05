import React from 'react';

interface AdminHeaderProps {
    onLogout: () => void;
    adminName: string;
    theme: string;
    toggleTheme: () => void;
    onShowInsights: () => void;
    onShowCredentials: () => void;
}

const Header: React.FC<AdminHeaderProps> = ({ onLogout, adminName, theme, toggleTheme, onShowInsights, onShowCredentials }) => {
    return (
        <header className="bg-white dark:bg-slate-800 shadow-sm p-4 flex justify-between items-center sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Refresh Kid Learning <span className="font-normal text-slate-500 dark:text-slate-400">| Admin Panel</span>
            </h1>
            <div className="flex items-center space-x-4">
                <button
                    onClick={onShowInsights}
                    className="hidden sm:flex items-center gap-2 bg-brand-orange/10 text-brand-orange font-semibold px-4 py-2 rounded-lg hover:bg-brand-orange/20 transition-colors text-sm"
                >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    AI Analyst
                </button>
                 <button
                    onClick={onShowCredentials}
                    className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600 text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1Zm3 8V5.5a3 3 0 10-6 0V9h6Z" clipRule="evenodd" />
                    </svg>
                    Admin Credentials
                </button>
                 <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? (
                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    ) : (
                        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
                </button>
                 <span className="hidden md:inline font-semibold text-slate-700 dark:text-slate-300">
                    Welcome, {adminName}
                </span>
                <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
