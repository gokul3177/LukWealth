import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/users/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login to LukWealth</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm text-center font-semibold">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
