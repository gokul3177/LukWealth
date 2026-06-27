import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, TrendingUp } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddRecord from './pages/AddRecord';
import Register from './pages/Register';
import ManageUsers from './pages/ManageUsers';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';

function NavBar({ theme, toggleTheme }) {
  const isLoggedIn = !!localStorage.getItem('token');
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200/70 dark:border-gray-800/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={isLoggedIn ? '/' : '/login'} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <TrendingUp size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-black text-xl bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            LukWealth
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link
              to="/"
              className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:scale-[1.02] transition-all"
              >
                Get Started
              </Link>
            </>
          )}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <NavBar theme={theme} toggleTheme={toggleTheme} />
        <main>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/add-record" element={<ProtectedRoute><AddRecord /></ProtectedRoute>} />
            <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
