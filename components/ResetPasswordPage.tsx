import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import Logo from './Logo';

const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!token) {
        return <div>Invalid or missing password reset token.</div>;
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { message } = await userService.resetPassword(token, password);
            setSuccess(message + " You will be redirected to the login page shortly.");
            setTimeout(() => navigate('/'), 4000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="mb-8 mx-auto w-fit">
                    <Logo isLightMode={true} />
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Create New Password</h2>
                    <p className="text-center text-slate-500 mb-6">Your new password must be at least 8 characters long.</p>

                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium">{error}</p>}
                    {success && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm font-medium">{success}</p>}
                    
                    {!success && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">New Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-light"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-light"
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={loading} className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
