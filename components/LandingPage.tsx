import React, { useState } from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import RequestResetModal from './RequestResetModal';
import Logo from './Logo';
import Footer from './Footer';

const Header: React.FC<{ onLoginClick: () => void; onGetStartedClick: () => void }> = ({ onLoginClick, onGetStartedClick }) => (
    <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-30">
        <Logo isLightMode={false} />
        <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white font-semibold hover:text-white/80 transition-colors">Home</a>
            <a href="#" className="text-white font-semibold hover:text-white/80 transition-colors">About Us</a>
            <a href="#" className="text-white font-semibold hover:text-white/80 transition-colors">Contact</a>
        </nav>
        <div className="flex items-center space-x-2">
             <button
                onClick={onLoginClick}
                className="text-white font-bold py-2 px-5 rounded-lg hover:bg-white/10 transition-colors"
            >
                Login
            </button>
            <button
                onClick={onGetStartedClick}
                className="bg-brand-orange text-white font-bold py-2 px-5 rounded-lg shadow-sm hover:bg-orange-600 transition-colors"
            >
                Get Started
            </button>
        </div>
    </header>
);

const HeroSection: React.FC<{ onGetStartedClick: () => void }> = ({ onGetStartedClick }) => {
    // Decorative SVG icons for the background
    const BookIcon = () => <svg className="w-24 h-24 text-blue-200/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
    const CapIcon = () => <svg className="w-20 h-20 text-blue-200/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /><path strokeWidth={1} d="M4.5 19.5h15" /></svg>;
    const BulbIcon = () => <svg className="w-16 h-16 text-blue-200/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
    const PlaneIcon = () => <svg className="w-20 h-20 text-blue-200/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

    return (
        <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-24">
             {/* Background decorations */}
            <div className="absolute top-24 left-10 opacity-50 animate-float-1"><BookIcon /></div>
            <div className="absolute top-20 right-12 opacity-50 animate-float-2"><CapIcon /></div>
            <div className="absolute bottom-16 left-24 opacity-50 animate-float-2"><BulbIcon /></div>
            <div className="absolute bottom-20 right-28 opacity-50 animate-float-1"><PlaneIcon /></div>

            <div className="relative z-10 px-4">
                <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight animate-fade-in-down">
                    Unlock Your Top Score
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-200 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
                    An AI-powered web application for ACT/SAT preparation, featuring AI-generated tests, detailed performance analysis with charts and tables, personalized feedback, and an admin dashboard for monitoring user progress.
                </p>
                <button
                    onClick={onGetStartedClick}
                    className="mt-8 bg-brand-orange text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-600 transition-transform transform hover:scale-105 shadow-lg animate-fade-in-down"
                    style={{ animationDelay: '0.4s' }}
                >
                    Start Preparing Now
                </button>
                <p className="mt-6 text-sm text-blue-300 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    ✨ Your journey to a better score starts now. ✨
                </p>
            </div>
        </section>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-blue-500/10 transition-all hover:-translate-y-2 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 text-brand-blue text-3xl">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-slate-500 mt-2">{description}</p>
    </div>
);

const FeaturesSection: React.FC = () => (
    <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">The Smartest Way to Prepare</h2>
            <p className="text-slate-500 mt-3 mb-16 max-w-xl mx-auto">AI-driven features designed for your success.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                    title="Personalized Learning"
                    description="Our AI analyzes your performance to create a unique study plan, focusing on areas where you need the most help."
                />
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="Instant Analysis"
                    description="Receive detailed, question-by-question feedback and explanations the moment you finish a test."
                />
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    title="Progress Tracking"
                    description="Watch your skills improve over time with our intuitive dashboard that visualizes your growth and achievements."
                />
            </div>
        </div>
    </section>
);

const MissionSection: React.FC = () => (
    <section id="mission" className="py-24 bg-slate-100">
        <div className="container mx-auto px-6 text-center max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">Our Mission</h2>
            <p className="text-slate-500 mt-3 text-lg italic">To make learning an adventure, not a chore.</p>
            <p className="mt-8 text-slate-600 leading-relaxed">
                Refresh Kid Learning is dedicated to transforming standardized test preparation from a daunting task into an engaging, personalized adventure. We believe that with the right tools, every student can unlock their full potential. Our platform combines the power of advanced AI with proven pedagogical strategies to create a learning experience that is not only effective but also motivational and fun. We're not just a test-prep company; we're your partners in building a brighter academic future.
            </p>
        </div>
    </section>
);

const ContactSection: React.FC = () => (
    <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">Get in Touch</h2>
            <p className="text-slate-500 mt-3 text-lg">
                Have questions or feedback? We'd love to hear from you. Reach out and our team will get back to you shortly.
            </p>
            {/* A simple mailto link can be used, or a form could be added here later */}
             <a href="mailto:support@refreshkidlearning.com"
                className="mt-8 inline-block bg-brand-blue text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
                Contact Us
            </a>
        </div>
    </section>
);


const LandingPage: React.FC = () => {
    const [modal, setModal] = useState<'login' | 'signup' | 'reset' | null>(null);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <Header 
                onLoginClick={() => setModal('login')} 
                onGetStartedClick={() => setModal('signup')} 
            />
            <main>
                <HeroSection onGetStartedClick={() => setModal('signup')} />
                <FeaturesSection />
                <MissionSection />
                <ContactSection />
            </main>
            <Footer />

            {modal === 'login' && <LoginModal onClose={() => setModal(null)} onSwitchToSignup={() => setModal('signup')} onForgotPassword={() => setModal('reset')} />}
            {modal === 'signup' && <SignupModal onClose={() => setModal(null)} onSwitchToLogin={() => setModal('login')} />}
            {modal === 'reset' && <RequestResetModal onClose={() => setModal(null)} onSwitchToLogin={() => setModal('login')} />}
        </div>
    );
};

export default LandingPage;