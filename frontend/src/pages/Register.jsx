import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { TrendingUp, ArrowRight, Eye, EyeOff } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await API.post('/users/register', formData);
      alert(res.data.message || 'Registration successful! Awaiting Admin approval.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'user',     label: 'User',     desc: 'Personal finance tracker' },
    { value: 'analyst',  label: 'Analyst',  desc: 'System auditor & reporter' },
    { value: 'admin',    label: 'Admin',    desc: 'Full user management access' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* ── Left Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md animate-fade-up">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2">Get started for free</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Create your account</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Bootstrap tip */}
          <div className="mb-6 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 p-4 rounded-xl">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wide mb-0.5">First-time setup?</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">The very first account must be an <strong>Administrator</strong> — they can then approve all future registrations.</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                id="register-name"
                type="text" required
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                id="register-email"
                type="email" required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'} required minLength="6"
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: opt.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.role === opt.value
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <p className={`text-xs font-black uppercase tracking-wide ${formData.role === opt.value ? 'text-violet-600 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <> Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── Right Brand Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[45%] relative flex-col items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-violet-600 via-blue-600 to-indigo-800">
        <div className="absolute -top-20 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-2xl ring-1 ring-white/30">
            <TrendingUp size={34} className="text-white" strokeWidth={2} />
          </div>
          <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Join LukWealth</h2>
          <p className="text-blue-100 text-base font-medium mb-2">Start your financial journey today</p>
          <p className="text-blue-200/75 text-sm leading-relaxed mb-8">
            Whether you're tracking personal expenses or managing a team, LukWealth scales with your needs.
          </p>

          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: '📊', label: 'Smart Analytics' },
              { icon: '🔐', label: 'Secure Auth' },
              { icon: '👥', label: 'Team Roles' },
              { icon: '📈', label: 'Trend Charts' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 ring-1 ring-white/20">
                <span className="text-lg">{icon}</span>
                <span className="text-white text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
