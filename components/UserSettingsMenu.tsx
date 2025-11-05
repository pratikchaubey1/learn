import React, { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface UserSettingsMenuProps {
    onClose: () => void;
    onSettingsClick: () => void;
}

const UserSettingsMenu: React.FC<UserSettingsMenuProps> = ({ onClose, onSettingsClick }) => {
    const { logout, user } = useAuth();
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

    if (!user) return null;

    return (
        <div ref={menuRef} className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in-down" style={{animationDuration: '0.2s'}}>
            <div className="p-2 border-b border-slate-200">
                <p className="font-bold text-slate-800 truncate">{user.fullName}</p>
                <p className="text-sm text-slate-500 truncate">@{user.username}</p>
            </div>
            <div className="py-2">
                <button onClick={onSettingsClick} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-brand-blue transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                    <span>Profile Settings</span>
                </button>
            </div>
            <div className="pt-2 border-t border-slate-200">
                <button
                    onClick={async () => {
                        try {
                            await logout();
                            onClose();
                            window.location.href = '/';
                        } catch (err) {
                            console.error('Logout failed', err);
                        }
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-red-500 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default UserSettingsMenu;
