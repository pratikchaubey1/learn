import React, { useState, useEffect } from 'react';
import { ANALYSIS_LOADING_MESSAGES, PLAN_LOADING_MESSAGES, GENERATION_LOADING_MESSAGES } from '../../constants';
import Logo from '../Logo';

// This is the Bubbles component from the original GeneratingTestView
const Bubbles: React.FC = () => {
    const bubbles = Array.from({ length: 15 });
    return (
        <div className="absolute inset-0 z-0">
            {bubbles.map((_, i) => {
                const size = `${Math.random() * 4 + 2}rem`;
                const style = {
                    width: size,
                    height: size,
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 15 + 10}s`,
                    animationDelay: `${Math.random() * 5}s`,
                };
                return <div key={i} className="absolute bottom-[-10rem] bg-white/10 rounded-full animate-bubble-up" style={style}></div>
            })}
        </div>
    );
}


interface ResultsViewSkeletonProps {
    type: 'analysis' | 'plan' | 'generation';
}

const ResultsViewSkeleton: React.FC<ResultsViewSkeletonProps> = ({ type }) => {
    
    const getConfig = () => {
        switch (type) {
            case 'analysis':
                return { messages: ANALYSIS_LOADING_MESSAGES, title: "Analyzing Your Results..." };
            case 'plan':
                 return { messages: PLAN_LOADING_MESSAGES, title: "Generating Your Plan..." };
            case 'generation':
                return { messages: GENERATION_LOADING_MESSAGES, title: "Crafting Your Test..." };
        }
    };

    const { messages, title } = getConfig();
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 4000);
        return () => clearInterval(interval);
    }, [messages]);

    return (
         <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-blue-700 to-indigo-900 text-white relative overflow-hidden">
            <Bubbles />
            <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
                <Logo />
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full border-4 border-blue-400/30"></div>
                    <div className="absolute w-full h-full rounded-full border-t-4 border-brand-orange animate-spin"></div>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-orange-light" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10v-5.5a2.5 2.5 0 015 0V17" /></svg>
                </div>

                <div>
                    <h1 className="text-4xl font-bold mb-3">{title}</h1>
                    <p className="text-lg text-blue-200 max-w-lg mx-auto transition-opacity duration-500" key={message}>
                       {message}
                    </p>
                </div>
                
                <div className="max-w-md min-h-[80px] pt-6 border-t border-blue-400/20 w-full">
                   {/* This space can be used for other info if needed */}
                </div>
            </div>
        </div>
    );
};
export default ResultsViewSkeleton;