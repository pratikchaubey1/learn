import React from 'react';
import Logo from './Logo';

const FullScreenLoader: React.FC = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex flex-col items-center">
            <Logo isLightMode={true} />
            <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-brand-blue rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-brand-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-brand-blue rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500">Loading your session...</p>
        </div>
    </div>
);

export default FullScreenLoader;
