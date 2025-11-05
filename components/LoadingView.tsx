import React, { useState, useEffect } from 'react';
import { ANALYSIS_LOADING_MESSAGES, PLAN_LOADING_MESSAGES, GENERATION_LOADING_MESSAGES } from '../constants';
import Logo from './Logo';

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

interface LoadingViewProps {
    type: 'analysis' | 'plan' | 'generation';
}

const LoadingView: React.FC<LoadingViewProps> = ({ type }) => {
    
    const getConfig = () => {
        switch (type) {
            case 'analysis':
                return { 
                    messages: ANALYSIS_LOADING_MESSAGES, 
                    title: "Analyzing Your Results...",
                    estimation: "This usually takes 20-40 seconds.",
                    icon: (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-orange-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    )
                };
            case 'plan':
                 return { 
                    messages: PLAN_LOADING_MESSAGES, 
                    title: "Generating Your Plan...",
                    estimation: "This usually takes 15-30 seconds.",
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-orange-light" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10v-5.5a2.5 2.5 0 015 0V17" />
                        </svg>
                    )
                };
            case 'generation':
                return { 
                    messages: GENERATION_LOADING_MESSAGES, 
                    title: "Crafting Your Test...",
                    estimation: "This usually takes 20-40 seconds.",
                     icon: (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-orange-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                    )
                };
        }
    };

    const { messages, title, estimation, icon } = getConfig();
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
                <div className="absolute -top-24">
                  <Logo />
                </div>
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full border-4 border-blue-400/30"></div>
                    <div className="absolute w-full h-full rounded-full border-t-4 border-brand-orange animate-spin"></div>
                    {icon}
                </div>

                <div>
                    <h1 className="text-4xl font-bold mb-3">{title}</h1>
                    <p className="text-lg text-blue-200 max-w-lg mx-auto transition-opacity duration-500" key={message}>
                       {message}
                    </p>
                     <p className="text-brand-orange-light font-semibold mt-4">{estimation}</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingView;
