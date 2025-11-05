import React, { useEffect, useMemo } from 'react';

const Confetti: React.FC = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes confetti-fall {
              0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
            .confetti-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; overflow: hidden;}
            .confetti-piece { position: absolute; width: 10px; height: 20px; opacity: 0; animation: confetti-fall linear; }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    const confetti = useMemo(() => Array.from({ length: 150 }).map((_, i) => {
        const style = {
            left: `${Math.random() * 100}vw`,
            animationDuration: `${Math.random() * 3 + 4}s`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: ['#f97316', '#2563eb', '#fb923c', '#3b82f6', '#ffffff'][Math.floor(Math.random() * 5)],
            transform: `rotate(${Math.random() * 360}deg)`,
        };
        return <div key={i} className="confetti-piece" style={style}></div>;
    }), []);

    return <div className="confetti-container">{confetti}</div>;
};

export default Confetti;