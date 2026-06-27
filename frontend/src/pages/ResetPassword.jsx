import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/users/reset-password', { token, newPassword });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Invalid Request</h2>
                    <p className="mb-6">No reset token provided. Please use the link from your email.</p>
                    <Link to="/forgot-password" className="text-blue-600 hover:underline">Request a new link</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="w-full max-w-md p-8 m-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl animate-fade-up border border-slate-100 dark:border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Reset Password</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your new password below.</p>
                </div>

                {message && (
                    <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800/30">
                        {message} Redirecting to login...
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            New Password
                        </label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Confirm New Password
                        </label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !!message}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
