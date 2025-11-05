import React from 'react';

const Logo: React.FC<{ isLightMode?: boolean }> = ({ isLightMode = false }) => (
    <div className="flex items-center space-x-3">
        <img 
            src="/logo.png" 
            alt="Refresh Kid Learning Logo" 
            className="h-20 w-20"
        />
        <span className={`font-bold text-xl ${isLightMode ? 'text-slate-800' : 'text-white'}`}>Refresh Kid Learning</span>
    </div>
);

export default Logo;