import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddRecord from './pages/AddRecord';
import Register from './pages/Register';
import ManageUsers from './pages/ManageUsers';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-200">
        <nav className="bg-blue-600 dark:bg-gray-800 text-white p-4 shadow-md flex justify-between items-center transition-colors duration-200">
          <div className="font-bold text-xl tracking-wide">LukWealth</div>
          <div className="space-x-6 font-semibold text-sm flex items-center">
            {localStorage.getItem('token') ? (
               <Link to="/" className="hover:text-blue-200 transition">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition">Login</Link>
                <Link to="/register" className="bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-gray-600 transition drop-shadow-sm">Sign Up</Link>
              </>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/20 transition" title="Toggle Dark Mode">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

        </nav>

        <div className="p-8">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-record" element={<ProtectedRoute><AddRecord /></ProtectedRoute>} />
            <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
