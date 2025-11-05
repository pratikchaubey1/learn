import React, { useEffect, useState } from 'react';

interface AchievementToastProps {
  message: string;
  onClose: () => void;
  type?: 'default' | 'badge' | 'level-up';
  xp?: number;
}
const AchievementToast: React.FC<AchievementToastProps> = ({ message, xp, type = 'default', onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icon = {
        badge: '🏆',
        'level-up': '🚀',
        default: '⭐'
    }[type];

    return (
        <div className={`fixed bottom-5 right-5 bg-slate-800/80 backdrop-blur-md border border-slate-600 text-white p-4 rounded-xl shadow-2xl flex items-center space-x-4 max-w-sm transition-all duration-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`} style={{ zIndex: 1000 }}>
            <div className="text-3xl">{icon}</div>
            <div>
                <p className="font-bold">{message}</p>
                {xp && <p className="text-sm text-yellow-400">+{xp} XP Gained</p>}
            </div>
        </div>
    );
};
export default AchievementToast;