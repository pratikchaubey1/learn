import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge, BadgeId } from '../types';

const allBadges: Badge[] = [
    { _id: 'first_test', name: 'First Step', description: 'Complete your first test or quiz.', icon: '🎉' },
    { _id: 'daily_login', name: 'Daily Dedication', description: 'Log in for the first time on a new day.', icon: '☀️' },
    { _id: 'streak_3', name: 'On a Roll', description: 'Achieve a 3-day login streak.', icon: '🔥' },
    { _id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day login streak.', icon: '🏆' },
    { _id: 'perfect_score', name: 'Perfectionist', description: 'Get a 100% score on any test.', icon: '🎯' },
    { _id: 'level_5', name: 'Level 5', description: 'Reach experience level 5.', icon: '🚀' },
    { _id: 'topic_master_algebra', name: 'Algebra Ace', description: 'Score above 85% on three Algebra tests.', icon: '🧮' },
];


const BadgeCard: React.FC<{ badge: Badge; isUnlocked: boolean }> = ({ badge, isUnlocked }) => {
    return (
        <div className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${isUnlocked ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50'}`}>
            <div className={`text-6xl mb-4 transition-transform duration-300 ${isUnlocked ? '' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`}>{badge.icon}</div>
            <h3 className={`font-bold text-lg ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>{badge.name}</h3>
            <p className={`text-sm mt-1 ${isUnlocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>{badge.description}</p>
            {isUnlocked && badge.unlockedOn && (
                <p className="text-xs text-brand-orange font-semibold mt-4">Unlocked on {new Date(badge.unlockedOn).toLocaleDateString()}</p>
            )}
        </div>
    );
};

const AchievementsView: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const unlockedBadgeIds = new Set(user.badges.map(b => b._id));
    const unlockedBadges = allBadges.filter(b => unlockedBadgeIds.has(b._id)).map(b => {
        const userBadge = user.badges.find(ub => ub._id === b._id);
        return { ...b, unlockedOn: userBadge?.unlockedOn };
    });
    const lockedBadges = allBadges.filter(b => !unlockedBadgeIds.has(b._id));
    
    const unlockedCount = unlockedBadges.length;
    const totalCount = allBadges.length;
    const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-brand-dark dark:text-slate-100">Your Achievements</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Celebrate your progress and milestones on your learning journey.</p>
                </div>
                
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-1 text-sm font-semibold">
                        <span className="text-slate-600 dark:text-slate-300">Overall Progress</span>
                        <span className="text-brand-orange">{unlockedCount} / {totalCount} Badges</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-brand-orange h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {unlockedBadges.length === 0 && lockedBadges.length > 0 && (
                    <div className="text-center bg-slate-100 dark:bg-slate-800 p-8 rounded-2xl mb-12">
                        <div className="text-5xl mb-4">📖</div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Your Trophy Case is Waiting</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Complete your first quiz or log in tomorrow to start earning badges!</p>
                    </div>
                )}

                {unlockedBadges.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Unlocked</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {unlockedBadges.map((badge, index) => (
                                <div key={badge._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                    <BadgeCard badge={badge} isUnlocked={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {lockedBadges.length > 0 && (
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Locked</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {lockedBadges.map(badge => (
                                <div key={badge._id} className="group">
                                    <BadgeCard badge={badge} isUnlocked={false} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AchievementsView;
