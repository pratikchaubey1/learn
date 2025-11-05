import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { avatars } from './avatars';
import Avatar from './Avatar';
import Spinner from './Spinner';

interface ProfileSettingsModalProps {
    onClose: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ onClose }) => {
    const { user, updateUser } = useAuth();

    const [selectedAvatarId, setSelectedAvatarId] = useState(user?.avatarId || 0);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSave = async () => {
        if (!user) return;
        setError('');
        setSuccessMessage('');

        if (newPassword && newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword && newPassword.length < 8) {
            setError("New password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        try {
            const updatePayload: { avatarId: number, password?: string } = {
                avatarId: selectedAvatarId,
            };
            if (newPassword) {
                updatePayload.password = newPassword;
            }
            await updateUser(updatePayload);
            setSuccessMessage("Profile updated successfully!");
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setSuccessMessage('');
                onClose();
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 text-slate-800 animate-fade-in-down" style={{animationDuration: '0.3s'}} onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Profile Settings</h3>
                    <button onClick={onClose} aria-label="Close modal" className="text-slate-400 hover:text-slate-600 text-3xl transition-colors">&times;</button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-medium">{error}</p>}
                    {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded-lg text-sm font-medium">{successMessage}</p>}
                    
                    <div>
                        <h4 className="font-bold text-slate-700 mb-3">Change Avatar</h4>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                            {avatars.map((svg, id) => (
                                <button key={id} onClick={() => setSelectedAvatarId(id)} className={`rounded-full p-1 transition-all ${selectedAvatarId === id ? 'ring-2 ring-brand-blue ring-offset-2' : 'hover:opacity-80'}`}>
                                    <Avatar svg={svg} className="w-12 h-12" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-700 mb-3">Change Password</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">New Password</label>
                                <input type="password" value={newPassword} placeholder="Leave blank to keep current password" onChange={e => setNewPassword(e.target.value)} className="w-full bg-white px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-light"/>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-light"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-5 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="bg-brand-blue text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                        {loading ? <Spinner /> : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;
