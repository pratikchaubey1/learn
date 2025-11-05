import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Plan, TestType, Exam, PlanStep, TestResult } from '../types';
import { getMotivationalQuote } from '../services/geminiService';
import { userService, LeaderboardUser } from '../services/userService';
import AiceyChat from './AiceyChat';
import AllTestsView from './AllTestsView';
import Logo from './Logo';
import Avatar from './Avatar';
import { avatars } from './avatars';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';
import UserSettingsMenu from './UserSettingsMenu';
import NotificationsMenu from './NotificationsMenu';
import ProfileSettingsModal from './ProfileSettingsModal';
import OnboardingTour from './OnboardingTour';
import AchievementsView from './AchievementsView';


type View = 'dashboard' | 'my-plan' | 'all-tests' | 'leaderboard' | 'achievements';

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, subtext: string }> = ({ icon, label, value, subtext }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center space-x-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:-translate-y-1 transition-transform">
        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">{icon}</div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{subtext}</p>
        </div>
    </div>
);

const NavItem: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, id?: string }> = ({ icon, label, isActive, onClick, id }) => (
    <button id={id} onClick={onClick} className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${isActive ? 'bg-brand-blue text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
        {icon}
        <span>{label}</span>
    </button>
);

const Sidebar: React.FC<{ currentView: View, setView: (view: View) => void }> = ({ currentView, setView }) => {
    const { theme } = useAuth();
    return (
    <aside className="w-64 bg-white dark:bg-slate-900 p-4 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800">
        <div className="px-2 mb-8">
            <Logo isLightMode={theme === 'light'}/>
        </div>
        <nav className="space-y-2">
            <NavItem icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><line x1="12" y1="3" x2="12" y2="21"></line></svg>} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
            <NavItem id="my-plan-nav" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>} label="My Plan" isActive={currentView === 'my-plan'} onClick={() => setView('my-plan')} />
            <NavItem icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>} label="All Tests" isActive={currentView === 'all-tests'} onClick={() => setView('all-tests')} />
            <NavItem icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>} label="Leaderboard" isActive={currentView === 'leaderboard'} onClick={() => setView('leaderboard')} />
            <NavItem icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>} label="Achievements" isActive={currentView === 'achievements'} onClick={() => setView('achievements')} />
        </nav>
    </aside>
)};

const Header: React.FC<{ user: User }> = ({ user }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const { theme, toggleTheme } = useAuth();

    return (
        <header className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
             <div className="flex-1">
                 {/* This space can be used for breadcrumbs or page titles if needed */}
             </div>
            <div className="flex items-center gap-4">
                 {user.loginStreak && user.loginStreak > 0 && (
                    <div className="flex items-center gap-1.5 text-sm font-bold text-brand-orange animate-fade-in-down" title={`${user.loginStreak}-day login streak!`}>
                        <span>{user.loginStreak}</span>
                        <span className="text-xl">🔥</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">Lvl {user.level}</span>
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${(user.xp % 500 / 500) * 100}%` }}></div>
                    </div>
                </div>
                 <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    {theme === 'light' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    }
                </button>
                <div className="relative">
                    <button onClick={() => { setIsNotificationsOpen(o => !o); setIsSettingsOpen(false); }} aria-label="Open notifications" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-300"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                    </button>
                    {isNotificationsOpen && <NotificationsMenu user={user} onClose={() => setIsNotificationsOpen(false)} />}
                </div>

                <div className="relative">
                    <button onClick={() => { setIsSettingsOpen(o => !o); setIsNotificationsOpen(false); }} className="flex items-center space-x-2">
                        <Avatar svg={avatars[user.avatarId]} className="w-9 h-9 rounded-full" />
                    </button>
                    {isSettingsOpen && <UserSettingsMenu onSettingsClick={() => { setIsProfileModalOpen(true); setIsSettingsOpen(false); }} onClose={() => setIsSettingsOpen(false)} />}
                </div>
            </div>
             {isProfileModalOpen && <ProfileSettingsModal onClose={() => setIsProfileModalOpen(false)} />}
        </header>
    );
};

const getStepIcon = (type: PlanStep['type']) => {
    switch (type) {
        case 'test': return '📝';
        case 'review': return '📚';
        case 'concept': return '💡';
        default: return '➡️';
    }
};

const DailyFocus: React.FC<{ user: User; onSelectMockTest: (testType: TestType) => void; onSelectTestFromPlan: (testType: TestType, isDiagnostic: boolean, planDetails: { weekIndex: number, stepId: string, topic?: string }) => void }> = ({ user, onSelectMockTest, onSelectTestFromPlan }) => {
    const { updateUser } = useAuth();

    const currentWeekPlan = useMemo(() => {
        if (!user.plan) return null;
        const today = new Date();
        const foundWeek = user.plan.weeks.find(week => {
            const start = new Date(week.startDate + 'T00:00:00');
            const end = new Date(week.endDate + 'T23:59:59');
            return today >= start && today <= end;
        });
        return foundWeek || user.plan.weeks[0]; // Fallback to the first week
    }, [user.plan]);

    const todaysQuizTopics = currentWeekPlan?.steps.map(s => s.topic || s.relatedTestType).filter(Boolean).join(', ') || 'General Review';

    const getQuizTypeForGoal = (): TestType => {
        if (!user.goal) {
            return TestType.SAT_MATH_MOCK;
        }
        switch (user.goal.exam) {
            case Exam.SAT: return TestType.SAT_RW_MOCK;
            case Exam.ACT: return TestType.ACT_READING_MOCK;
            case Exam.AP: return TestType.AP_USH_MOCK;
            default: return TestType.SAT_RW_MOCK;
        }
    };
    
    const handleToggleStep = async (stepId: string) => {
        if (!user || !user.plan || !currentWeekPlan) return;
        const newPlan = JSON.parse(JSON.stringify(user.plan)); // Deep copy
        const week = newPlan.weeks.find((w: any) => w.week === currentWeekPlan.week);
        if(week) {
             const step = week.steps.find((s: PlanStep) => s._id === stepId);
             if (step) {
                step.completed = !step.completed;
                await updateUser({ plan: newPlan });
            }
        }
    };

    const quickPracticeTests = {
        [Exam.SAT]: [
            { label: 'Practice Math', type: TestType.SAT_MATH_MOCK },
            { label: 'Practice R&W', type: TestType.SAT_RW_MOCK },
        ],
        [Exam.ACT]: [
            { label: 'Practice Math', type: TestType.ACT_MATH_MOCK },
            { label: 'Practice Science', type: TestType.ACT_SCIENCE_MOCK },
        ],
        [Exam.AP]: []
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-2xl font-bold text-brand-dark dark:text-slate-100 mb-4">Today's Focus</h2>
            
            <div className="bg-brand-blue/10 dark:bg-brand-blue/20 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 mb-6">
                <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">Your Next Recommended Quiz</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Topics: {todaysQuizTopics}</p>
                </div>
                <button onClick={() => onSelectMockTest(getQuizTypeForGoal())} className="bg-brand-blue hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition-colors w-full sm:w-auto">Start Quiz</button>
            </div>

            {user.goal && quickPracticeTests[user.goal.exam].length > 0 && (
                <div className="mb-6">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Quick Practice</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {quickPracticeTests[user.goal.exam].map(test => (
                            <button key={test.type} onClick={() => onSelectMockTest(test.type)} className="text-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{test.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">This Week's Plan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{currentWeekPlan?.summary}</p>
                {currentWeekPlan && (
                    <ul className="space-y-3">
                        {currentWeekPlan.steps.map(step => (
                           <li key={step._id} className="flex items-start justify-between group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                               <label className="flex items-start cursor-pointer group flex-1">
                                    <div className="mr-3 pt-1">
                                       <input
                                           type="checkbox"
                                           checked={step.completed}
                                           onChange={() => handleToggleStep(step._id)}
                                           className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-brand-orange focus:ring-brand-orange-light"
                                       />
                                   </div>
                                   <div className={`transition-opacity ${step.completed ? 'opacity-50' : 'opacity-100'}`}>
                                       <p className={`font-semibold text-sm transition-all ${step.completed ? 'line-through' : ''}`}>
                                           <span className="mr-2">{getStepIcon(step.type)}</span>
                                           {step.title}
                                           {step.estimatedTime && <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-2">({step.estimatedTime})</span>}
                                       </p>
                                       <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">{step.description}</p>
                                   </div>
                               </label>
                               {step.type !== 'review' && !step.completed && (
                                   <button
                                       onClick={() => {
                                           const testType = step.relatedTestType || TestType.CONCEPT_CHECK_QUIZ;
                                           const topic = step.relatedTestType ? undefined : (step.topic || step.title);
                                           onSelectTestFromPlan(testType, false, { weekIndex: currentWeekPlan.week - 1, stepId: step._id, topic });
                                       }}
                                       className="text-xs bg-brand-blue-light text-white font-bold py-1 px-3 rounded-md hover:bg-brand-blue transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 flex-shrink-0"
                                   >
                                       Start &rarr;
                                   </button>
                               )}
                           </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const DashboardContent: React.FC<{ user: User; onSelectMockTest: (testType: TestType) => void; onSelectTestFromPlan: (testType: TestType, isDiagnostic: boolean, planDetails: { weekIndex: number, stepId: string, topic?: string }) => void }> = ({ user, onSelectMockTest, onSelectTestFromPlan }) => {
    const [quote, setQuote] = useState<string>('');
     useEffect(() => {
        setQuote(getMotivationalQuote());
    }, []);

    const planProgress = useMemo(() => {
        if (!user.plan) return 0;
        const allTasks = user.plan.weeks.flatMap(w => w.steps);
        if (allTasks.length === 0) return 0;
        const completedTasks = allTasks.filter(t => t.completed).length;
        return Math.round((completedTasks / allTasks.length) * 100);
    }, [user.plan]);

    const lastActiveSubtext = user.lastTestTaken 
        ? `Last active: ${new Date(user.lastTestTaken).toLocaleDateString()}` 
        : 'Practice makes perfect';

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-dark dark:text-slate-100">Welcome back, {user.fullName.split(' ')[0]}!</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 italic">"{quote || 'Strive for progress, not perfection.'}"</p>
            </div>
            <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-orange"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>} label="Plan Progress" value={`${planProgress}%`} subtext="Overall completion" />
                 <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-orange"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>} label="Average Score" value={`${user.averageScore ?? 0}%`} subtext="Across all tests" />
                 <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-orange"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>} label="Tests Completed" value={user.testsTaken ?? 0} subtext={lastActiveSubtext} />
            </div>
            <DailyFocus 
                user={user} 
                onSelectMockTest={onSelectMockTest}
                onSelectTestFromPlan={onSelectTestFromPlan}
            />
        </div>
    );
}

const MyPlanView: React.FC<{onSelectTest: (testType: TestType, isDiagnostic: boolean, planDetails: { weekIndex: number, stepId: string, topic?: string }) => void}> = ({ onSelectTest }) => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeWeekIndex, setActiveWeekIndex] = useState(0);

    const currentWeekIndex = useMemo(() => {
        if (!user?.plan) return 0;
        const today = new Date();
        const foundIndex = user.plan.weeks.findIndex(week => {
            const start = new Date(week.startDate + 'T00:00:00');
            const end = new Date(week.endDate + 'T23:59:59');
            return today >= start && today <= end;
        });
        return foundIndex !== -1 ? foundIndex : 0;
    }, [user?.plan]);

    useEffect(() => {
        setActiveWeekIndex(currentWeekIndex);
    }, [currentWeekIndex]);

    if (!user) return null;

    if (!user.plan) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold dark:text-slate-100">No Study Plan Found</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Complete a diagnostic test to generate your personalized plan!</p>
                <button onClick={() => navigate('/onboarding')} className="mt-4 bg-brand-orange text-white font-bold py-2 px-5 rounded-lg">
                    Start Diagnostic Test
                </button>
            </div>
        );
    }

    const handleToggleStep = async (weekIndex: number, stepId: string) => {
        if (!user || !user.plan) return;
        const newPlan = JSON.parse(JSON.stringify(user.plan)); // Deep copy
        const step = newPlan.weeks[weekIndex].steps.find((s: PlanStep) => s._id === stepId);
        if (step) {
            step.completed = !step.completed;
            await updateUser({ plan: newPlan });
        }
    };
    
    const activeWeek = user.plan.weeks[activeWeekIndex];
    const userFirstName = user.fullName.split(' ')[0];

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-dark dark:text-slate-100">{userFirstName}'s Path to a {user.goal?.targetScore} on the {user.goal?.exam}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your week-by-week guide to success. Stay focused and check off tasks as you go!</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex space-x-2">
                    {user.plan.weeks.map((week, index) => {
                         const completedSteps = week.steps.filter(s => s.completed).length;
                         const totalSteps = week.steps.length;
                         const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
                         const isCurrentWeek = index === currentWeekIndex;
                         const isFutureWeek = index > currentWeekIndex;
                         
                        return (
                            <button
                                key={week.week}
                                onClick={() => !isFutureWeek && setActiveWeekIndex(index)}
                                disabled={isFutureWeek}
                                className={`flex-1 p-3 rounded-lg text-left transition-colors ${activeWeekIndex === index ? 'bg-brand-blue-light/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700'} ${isFutureWeek ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <p className={`font-bold text-sm ${activeWeekIndex === index ? 'text-brand-blue' : 'text-slate-700 dark:text-slate-200'}`}>Week {week.week}</p>
                                    {isCurrentWeek && <span className="text-xs font-semibold bg-brand-orange text-white px-2 py-0.5 rounded-full">Current</span>}
                                    {isFutureWeek && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Locked</span>}
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                    <div className="bg-brand-orange h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {activeWeek && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                        <h2 className="text-xl font-bold text-brand-blue">Week {activeWeek.week} Focus</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(activeWeek.startDate + 'T00:00:00').toLocaleDateString()} - {new Date(activeWeek.endDate + 'T00:00:00').toLocaleDateString()}</p>
                         <p className="text-sm italic text-slate-600 dark:text-slate-300 mt-2">{activeWeek.summary}</p>
                    </div>
                    <ul className="space-y-3">
                        {activeWeek.steps.map((step, stepIndex) => (
                            <li key={step._id} className="flex items-start justify-between group animate-fade-in-up" style={{ animationDelay: `${stepIndex * 50}ms` }}>
                                <label className="flex items-start cursor-pointer group">
                                     <div className="mr-3 pt-1">
                                        <input
                                            type="checkbox"
                                            checked={step.completed}
                                            onChange={() => handleToggleStep(activeWeekIndex, step._id)}
                                            className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-brand-orange focus:ring-brand-orange-light"
                                        />
                                    </div>
                                    <div className={`transition-opacity ${step.completed ? 'opacity-50' : 'opacity-100'}`}>
                                        <p className={`font-semibold transition-all ${step.completed ? 'line-through' : ''}`}>
                                            <span className="mr-2">{getStepIcon(step.type)}</span>
                                            {step.title}
                                            {step.estimatedTime && <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-2">({step.estimatedTime})</span>}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 pl-7">{step.description}</p>
                                    </div>
                                </label>
                                {!step.completed && step.type !== 'review' && (
                                    <button 
                                        onClick={() => {
                                            const testType = step.relatedTestType || TestType.CONCEPT_CHECK_QUIZ;
                                            const topic = step.relatedTestType ? undefined : (step.topic || step.title);
                                            onSelectTest(testType, false, { weekIndex: activeWeekIndex, stepId: step._id, topic });
                                        }}
                                        className="text-sm bg-brand-blue-light text-white font-bold py-1.5 px-4 rounded-lg hover:bg-brand-blue transition-colors opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 flex-shrink-0"
                                    >
                                        Start &rarr;
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const LeaderboardView: React.FC = () => {
    const { user: currentUser } = useAuth();
    
    const { data: users = [], isLoading, isError, error } = useQuery<LeaderboardUser[]>({
        queryKey: ['leaderboard'],
        queryFn: userService.getLeaderboardUsers,
    });

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'bg-yellow-400 text-yellow-900';
        if (rank === 2) return 'bg-slate-300 text-slate-800';
        if (rank === 3) return 'bg-yellow-600/70 text-yellow-900';
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center items-center"><Spinner message="Loading Leaderboard..." /></div>;
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500 font-semibold">{error.message}</div>
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-brand-dark dark:text-slate-100 mb-2 text-center">Leaderboard</h1>
                <p className="text-slate-500 dark:text-slate-400 text-center mb-8">See how you stack up against other students. Keep practicing to climb the ranks!</p>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <ul>
                        {users.map((user, index) => (
                            <li key={user._id} className={`flex items-center p-4 transition-colors animate-fade-in-up ${currentUser?._id === user._id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-brand-blue' : 'border-b border-slate-100 dark:border-slate-700'} ${index < 3 ? 'font-bold' : ''}`} style={{ animationDelay: `${index * 50}ms`}}>
                                <div className="flex items-center gap-4 w-1/2">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${getRankColor(index + 1)}`}>{index + 1}</span>
                                    <Avatar svg={avatars[user.avatarId]} className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{user.fullName}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
                                    </div>
                                </div>
                                <div className="w-1/4 text-center">
                                    <p className="font-semibold text-cyan-600 dark:text-cyan-400">Level {user.level}</p>
                                </div>
                                <div className="w-1/4 text-right">
                                    <p className="font-semibold text-brand-orange">{user.xp.toLocaleString()} XP</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [view, setView] = useState<View>('dashboard');
    const [isAiceyOpen, setIsAiceyOpen] = useState(false);
    const [aiceyContext, setAiceyContext] = useState<string | undefined>(undefined);
    const [showTour, setShowTour] = useState(false);
    
    useEffect(() => {
        // Check for onboarding tour flag
        const shouldShowTour = localStorage.getItem('showOnboardingTour');
        if (shouldShowTour === 'true') {
            setShowTour(true);
            localStorage.removeItem('showOnboardingTour');
        }
    }, []);

    useEffect(() => {
        if (location.state?.view) {
            setView(location.state.view);
            // Clear the state so it doesn't persist on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner message="Loading user data..." /></div>;
    }
    
    // Check if user has a goal, if not, redirect to onboarding
    useEffect(() => {
        if (!user.goal) {
            navigate('/onboarding');
        }
    }, [user, navigate]);


    const handleSelectTest = (testType: TestType, isDiagnostic: boolean, isAdaptive: boolean) => {
        navigate('/test', { state: { testType, isDiagnostic, isAdaptive } });
    };

    const handleSelectTestFromPlan = (testType: TestType, isDiagnostic: boolean, planDetails: { weekIndex: number, stepId: string, topic?: string }) => {
        navigate('/test', { state: { testType, isDiagnostic, isAdaptive: false, ...planDetails } });
    };

    const handleSelectMockTest = (testType: TestType) => {
        navigate('/test', { state: { testType, isDiagnostic: false, isAdaptive: false } });
    };
    
    const handleAiceyOpen = () => {
        if (user && user.testHistory.length > 0) {
            const lastTest = user.testHistory[user.testHistory.length - 1] as TestResult;
            const weakTopics = lastTest.topicPerformance
                .filter(t => t.total > 0 && (t.correct / t.total) < 0.7)
                .map(t => t.topic)
                .join(', ');

            let context = `The user's last test was a "${lastTest.testType}" where they scored ${lastTest.overallScore}%.`;
            if (weakTopics) {
                context += ` They seem to be struggling with: ${weakTopics}. Proactively offer to help with one of these topics.`;
            } else {
                context += ` They did very well! Congratulate them and ask what they'd like to review.`
            }
            setAiceyContext(context);
        } else {
            setAiceyContext(undefined);
        }
        setIsAiceyOpen(true);
    };


    const renderContent = () => {
        switch(view) {
            case 'dashboard':
                return <DashboardContent user={user} onSelectMockTest={handleSelectMockTest} onSelectTestFromPlan={handleSelectTestFromPlan} />;
            case 'all-tests':
                return <AllTestsView onSelectTest={handleSelectTest} onSelectMockTest={handleSelectMockTest} />;
            case 'my-plan':
                return <MyPlanView onSelectTest={handleSelectTestFromPlan} />;
            case 'leaderboard':
                return <LeaderboardView />;
            case 'achievements':
                return <AchievementsView />;
            default:
                return <DashboardContent user={user} onSelectMockTest={handleSelectMockTest} onSelectTestFromPlan={handleSelectTestFromPlan} />;
        }
    }

    return (
        <div className="relative min-h-screen flex bg-slate-50 dark:bg-slate-900">
            <Sidebar currentView={view} setView={setView} />
            <main className="flex-1 flex flex-col">
                <Header user={user} />
                <div className="flex-grow overflow-y-auto">
                    {renderContent()}
                </div>
            </main>
            
            <button id="aicey-button" onClick={handleAiceyOpen} className="fixed bottom-6 right-6 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.4 1.4L3 12l5.8 1.9a2 2 0 0 1 1.4 1.4L12 21l1.9-5.8a2 2 0 0 1 1.4-1.4L21 12l-5.8-1.9a2 2 0 0 1-1.4-1.4Z"/></svg>
            </button>
            {isAiceyOpen && <AiceyChat onClose={() => setIsAiceyOpen(false)} initialContext={aiceyContext} />}
            {showTour && <OnboardingTour onClose={() => setShowTour(false)} />}
        </div>
    );
};

export default Dashboard;
