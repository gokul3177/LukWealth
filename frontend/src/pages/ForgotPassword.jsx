import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await api.post('/users/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="w-full max-w-md p-8 m-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl animate-fade-up border border-slate-100 dark:border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Forgot Password</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your email to receive a reset link.</p>
                </div>

                {message && (
                    <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800/30">
                        {message}
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
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            required 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Remember your password?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
