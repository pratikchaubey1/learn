import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Exam } from '../types';
import AdminHeader from './admin/AdminHeader';
import StatsCards from './admin/StatsCards';
import UserTable from './admin/UserTable';
import AIInsightsModal from './admin/AIInsightsModal';
import UserDistributionChart from './admin/UserDistributionChart';
import { userService } from '../services/userService';
import { getAdminInsights } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';


const CredentialsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [copySuccess, setCopySuccess] = useState('');
    const password = "Refreshkid@2025";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password).then(() => {
            setCopySuccess('Password copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy.');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in-down border-t-4 border-slate-500" style={{animationDuration: '0.4s'}} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400">
                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1Zm3 8V5.5a3 3 0 10-6 0V9h6Z" clipRule="evenodd" />
                        </svg>
                        Preloaded Admin Credentials
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl transition-colors">&times;</button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg space-y-3 border border-slate-200 dark:border-slate-600">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Username</p>
                        <p className="font-mono text-slate-800 dark:text-slate-100">admin</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email</p>
                        <p className="font-mono text-slate-800 dark:text-slate-100">admin@refreshkid.com</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</p>
                        <div className="flex items-center justify-between">
                            <p className="font-mono text-slate-800 dark:text-slate-100">{password}</p>
                            <button onClick={copyToClipboard} className="text-xs bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 px-2 py-1 rounded font-semibold transition-colors">
                                {copySuccess ? copySuccess : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                    These credentials are pre-seeded for easy access to the admin panel.
                </p>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [showChart, setShowChart] = useState(false);
    
    // State for modals and filters
    const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
    const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
    const [examFilter, setExamFilter] = useState<Exam | 'all'>('all');

    const USERS_PER_PAGE = 10;
    
    const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery<User[]>({
        queryKey: ['allUsersForAdmin'],
        queryFn: userService.getAllUsersForExport,
    });

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['adminStats'],
        queryFn: userService.getAdminStats,
        initialData: { totalUsers: 0, totalTestsTaken: 0, averageScore: 0 }
    });

    const insightsMutation = useMutation({
        mutationFn: () => getAdminInsights([]),
    });

    // Reset page to 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [examFilter]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    const handleGenerateInsights = useCallback(() => {
        insightsMutation.mutate();
    }, [insightsMutation]);
    
    const downloadUserDataCSV = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/users/download-csv', {
                headers: {
                    'Authorization': `Bearer ${token || ''}`
                }
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'all_user_data.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to download user data CSV:", error);
            alert("Could not download user data. Please try again.");
        }
    }, []);

    const filteredUsers = useMemo(() => {
        if (examFilter === 'all') return allUsers;
        return allUsers.filter(user => user.goal?.exam === examFilter);
    }, [allUsers, examFilter]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * USERS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    }, [filteredUsers]);
    
    if (!user) {
        return <div>Authenticating...</div>
    }

    const isLoading = isLoadingUsers || isLoadingStats;

    return (
        <div className="bg-slate-50 dark:bg-brand-dark min-h-screen">
            <AdminHeader 
                onLogout={logout} 
                adminName={user.fullName}
                theme={theme}
                toggleTheme={toggleTheme}
                onShowInsights={() => setIsInsightsModalOpen(true)}
                onShowCredentials={() => setIsCredentialsModalOpen(true)}
            />
            <main className="p-4 sm:p-6 lg:p-8 space-y-6">
                <StatsCards stats={stats} />
                
                <div className="text-right">
                    <button onClick={() => setShowChart(!showChart)} className="bg-white dark:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        {showChart ? 'Hide' : 'Show'} User Distribution
                    </button>
                </div>

                {showChart && <UserDistributionChart users={filteredUsers} />}

                <div>
                     {isLoading && allUsers.length === 0 ? <p className="text-center dark:text-white">Loading users...</p> : (
                        <div>
                            <UserTable 
                                users={paginatedUsers} 
                                onDownloadCSV={downloadUserDataCSV} 
                                examFilter={examFilter}
                                setExamFilter={setExamFilter}
                            />
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white dark:bg-slate-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white dark:bg-slate-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                                </div>
                            )}
                        </div>
                     )}
                </div>
            </main>
            
            <AIInsightsModal
                isOpen={isInsightsModalOpen}
                onClose={() => setIsInsightsModalOpen(false)}
                insights={insightsMutation.data || ''}
                loading={insightsMutation.isPending}
                error={insightsMutation.error?.message || ''}
                onGenerate={handleGenerateInsights}
            />
            {isCredentialsModalOpen && <CredentialsModal onClose={() => setIsCredentialsModalOpen(false)} />}
        </div>
    );
};

export default AdminDashboard;