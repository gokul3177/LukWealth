import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddRecord from './pages/AddRecord';
import Register from './pages/Register';
import ManageUsers from './pages/ManageUsers';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
        <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
          <div className="font-bold text-xl tracking-wide">LukWealth</div>
          <div className="space-x-6 font-semibold text-sm flex items-center">
            {localStorage.getItem('token') ? (
               <Link to="/" className="hover:text-blue-200 transition">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition">Login</Link>
                <Link to="/register" className="bg-white text-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50 transition drop-shadow-sm">Sign Up</Link>
              </>
            )}
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
