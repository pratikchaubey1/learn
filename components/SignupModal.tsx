import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const AuthIllustration = () => (
    <div className="absolute inset-0 w-full h-full object-cover">
        <svg width="100%" height="100%" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="authGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stop-color="#f97316"/>
                    <stop offset="100%" stop-color="#ea580c"/>
                </linearGradient>
            </defs>
            <rect width="400" height="600" fill="url(#authGrad)"/>
            <circle cx="200" cy="450" r="120" fill="white" fill-opacity="0.05"/>
            <path d="M-50 250 Q200 350 450 250" stroke="white" stroke-width="1" stroke-opacity="0.2" fill="none"/>
            <path d="M-50 300 Q200 200 450 300" stroke="white" stroke-width="2" stroke-opacity="0.2" fill="none"/>
            <g transform="translate(100 80) scale(1.2)">
                 <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" stroke-width="1.5" stroke-opacity="0.4" fill="none" transform="translate(70 50) scale(4)" />
            </g>
        </svg>
    </div>
);


const SignupModal: React.FC<SignupModalProps> = ({ onClose, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp({ fullName, username, email, password });
      onClose();
    } catch (err: any) {
      const errorData = err.data;
      if (errorData && errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        setError(errorData.errors[0].msg);
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during sign up.');
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
                      <h2 className="text-3xl font-bold">Start Your Journey</h2>
                      <p className="text-white/80 mt-2 text-sm">Create an account to unlock personalized test prep, track your progress, and reach your goals.</p>
                  </div>
                  <p className="text-xs text-white/60">&copy; Refresh Kid Learning</p>
              </div>
          </div>
          {/* Right Panel */}
          <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
               <button onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-3xl transition-colors">&times;</button>
              <div className="w-full">
                  <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
                  <p className="text-slate-500 mt-2">
                      Already have an account?{' '}
                      <button onClick={onSwitchToLogin} className="font-bold text-brand-blue hover:underline">Log In</button>
                  </p>

                  {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mt-6 text-sm font-medium animate-shake">{error}</p>}
                  
                  <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="signup-fullname">Full Name</label>
                            <input id="signup-fullname" type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-slate-50 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-light transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="signup-username">Username</label>
                            <input id="signup-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-light transition" required />
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="signup-email">Email Address</label>
                          <input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-light transition" required />
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="signup-password">Password</label>
                          <input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-light transition" required />
                          <p className="text-xs text-slate-500 mt-1.5">8+ characters with uppercase, lowercase, and a number.</p>
                      </div>
                      <div className="pt-2">
                           <button type="submit" disabled={loading} className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center">
                               {loading ? <Spinner /> : 'Create Account'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      </div>
    </div>
  );
};

export default SignupModal;
