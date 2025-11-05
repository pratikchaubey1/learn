import React, { useRef, useEffect } from 'react';
import { User } from '../types';

interface NotificationsMenuProps {
    user: User;
    onClose: () => void;
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({ user, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Show up to 5 most recent badges
    const recentBadges = user.badges.slice(-5).reverse();

    return (
        <div ref={menuRef} className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in-down" style={{animationDuration: '0.2s'}}>
            <div className="p-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Notifications</h3>
            </div>
            <div className="py-2 max-h-80 overflow-y-auto">
                {recentBadges.length > 0 ? (
                    <ul className="space-y-1">
                        {recentBadges.map(badge => (
                            <li key={badge._id} className="p-2 flex items-start gap-3 rounded-md hover:bg-slate-50">
                                <span className="text-xl mt-0.5">{badge.icon}</span>
                                <div>
                                    <p className="font-semibold text-sm text-slate-700">New Badge: {badge.name}</p>
                                    <p className="text-xs text-slate-500">{badge.description}</p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(badge.unlockedOn).toLocaleDateString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center p-6">
                        <p className="text-sm text-slate-500">No new notifications.</p>
                        <p className="text-xs text-slate-400 mt-1">Keep practicing to earn badges!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsMenu;
