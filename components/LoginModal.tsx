import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

const AuthIllustration = () => (
    <div className="absolute inset-0 w-full h-full object-cover">
        <svg width="100%" height="100%" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="authGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6"/>
                    <stop offset="100%" stop-color="#6366f1"/>
                </linearGradient>
            </defs>
            <rect width="400" height="600" fill="url(#authGrad)"/>
            <circle cx="200" cy="150" r="120" fill="white" fill-opacity="0.05"/>
            <path d="M-50 250 Q200 150 450 250" stroke="white" stroke-width="1" stroke-opacity="0.2" fill="none"/>
            <path d="M-50 300 Q200 400 450 300" stroke="white" stroke-width="2" stroke-opacity="0.2" fill="none"/>
            <g transform="translate(100 350) scale(1.2)">
                <path d="M150 450 L180 480 L210 450 L240 480 L270 450" stroke="white" stroke-width="5" stroke-opacity="0.3" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(-150 -450)"/>
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="white" stroke-width="1.5" stroke-opacity="0.4" fill="none" transform="translate(70 50) scale(4)" />
            </g>
        </svg>
    </div>
);

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSwitchToSignup, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ identifier: email, password });
      onClose();
    } catch (err: any) {
      const errorData = err.data;
      if (errorData && errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        setError(errorData.errors[0].msg);
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl m-4 text-slate-800 flex overflow-hidden animate-fade-in-down" style={{animationDuration: '0.4s'}} onClick={e => e.stopPropagation()}>
            {/* Left Panel */}
            <div className="hidden md:block w-5/12 relative">
                <AuthIllustration />
                <div className="relative z-10 p-8 flex flex-col justify-between h-full text-white">
                    <div>
                        <h2 className="text-3xl font-bold">Welcome Back</h2>
                        <p className="text-white/80 mt-2 text-sm">Log in to access your personalized study plan and continue your journey to success.</p>
                    </div>
                     <p className="text-xs text-white/60">&copy; Refresh Kid Learning</p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
                 <button onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-3xl transition-colors">&times;</button>
                <div className="w-full">
                    <h2 className="text-3xl font-bold text-slate-800">Log In</h2>
                    <p className="text-slate-500 mt-2">
                        Don't have an account?{' '}
                        <button onClick={onSwitchToSignup} className="font-bold text-brand-blue hover:underline">Sign Up</button>
                    </p>
                
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mt-6 text-sm font-medium animate-shake">{error}</p>}
                
                    <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="login-email">Email Address or Username</label>
                            <input id="login-email" type="text" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light transition" required />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-semibold text-slate-700" htmlFor="login-password">Password</label>
                                <button type="button" onClick={onForgotPassword} className="text-xs font-semibold text-brand-blue hover:underline">Forgot Password?</button>
                            </div>
                            <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light transition" required />
                        </div>
                        <div className="pt-4">
                            <button type="submit" disabled={loading} className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                                {loading ? <Spinner /> : 'Log In'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginModal;