import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { ArrowLeft } from 'lucide-react';

function AddRecord() {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0], // Today's date by default
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Send the data to your backend
      await API.post('/records', {
        ...formData,
        amount: parseFloat(formData.amount) // Make sure amount is a number
      });
      // Head back to the dashboard if successful!
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate('/')} 
        className="text-blue-600 hover:text-blue-800 flex items-center mb-6 font-semibold transition"
      >
        <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
      </button>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Record</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Amount ($)</label>
              <input 
                type="number" step="0.01" required min="0.01"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
              <select 
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
              <input 
                type="text" required placeholder="e.g. Groceries, Salary"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
              <input 
                type="date" required
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Notes (Optional)</label>
            <textarea 
              rows="3"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white font-bold py-3 px-4 rounded mt-4 transition shadow-md ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRecord;
