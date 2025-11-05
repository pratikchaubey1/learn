import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

interface RequestResetModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const AuthIllustration = () => (
    <div className="absolute inset-0 w-full h-full object-cover">
        <svg width="100%" height="100%" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="authGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stop-color="#1e293b"/>
                    <stop offset="100%" stop-color="#334155"/>
                </linearGradient>
            </defs>
            <rect width="400" height="600" fill="url(#authGrad)"/>
            <circle cx="200" cy="300" r="150" fill="white" fill-opacity="0.05" transform="rotate(45 200 300)"/>
             <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="white" stroke-width="1.5" stroke-opacity="0.4" fill="none" transform="translate(130 180) scale(5)" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>
);


const RequestResetModal: React.FC<RequestResetModalProps> = ({ onClose, onSwitchToLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { requestPasswordReset } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await requestPasswordReset(identifier);
      setSuccess(result.message);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
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
                      <h2 className="text-3xl font-bold">Forgot Password?</h2>
                      <p className="text-white/80 mt-2 text-sm">No problem. Enter your email and we'll send you a link to get back into your account.</p>
                  </div>
                  <p className="text-xs text-white/60">&copy; Refresh Kid Learning</p>
              </div>
          </div>
          {/* Right Panel */}
          <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
               <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-3xl transition-colors" aria-label="Close modal">&times;</button>
              <div className="w-full">
                  <h2 className="text-3xl font-bold text-slate-800">Reset Password</h2>
                  <p className="text-slate-500 mt-2">
                      Remember your password?{' '}
                      <button onClick={onSwitchToLogin} className="font-bold text-brand-blue hover:underline">Log In</button>
                  </p>

                  {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mt-6 text-sm font-medium animate-shake">{error}</p>}
                  {success && <p className="bg-green-100 text-green-700 p-3 rounded-lg mt-6 text-sm font-medium">{success}</p>}
                  
                  {!success && (
                    <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="reset-identifier">Email Address</label>
                            <input id="reset-identifier" type="email" value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full bg-slate-50 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light transition" required />
                        </div>
                        <div className="pt-4">
                            <button type="submit" disabled={loading} className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                                {loading ? <Spinner /> : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default RequestResetModal;
