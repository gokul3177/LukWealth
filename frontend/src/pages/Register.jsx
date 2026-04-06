import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' // Default to active User role
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Hit your userController.js registerUser function
      const res = await API.post('/users/register', formData);
      
      alert(res.data.message || "Registration successful! Awaiting Admin approval.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-[400px] border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Create an Account</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm text-center font-semibold">{error}</div>}
        {successMsg && <div className="bg-green-100 text-green-600 p-3 rounded mb-4 text-sm text-center font-semibold">{successMsg}</div>}
        
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input 
              type="text" required
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input 
              type="email" required
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input 
              type="password" required minLength="6"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Account Role</label>
            <select 
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User (Personal Finance)</option>
              <option value="analyst">Analyst (System Auditor)</option>
              <option value="admin">Admin (User Manager)</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
