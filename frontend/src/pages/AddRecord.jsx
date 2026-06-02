import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { ArrowLeft, TrendingUp, TrendingDown, Save } from 'lucide-react';

const CATEGORIES = {
  expense: ['Food & Dining','Shopping','Transport','Utilities','Healthcare','Entertainment','Education','Rent','Other'],
  income: ['Salary','Freelance','Investment','Bonus','Gift','Business','Other'],
};

function AddRecord() {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/records', { ...formData, amount: parseFloat(formData.amount) });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-up">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold mb-6 transition">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Card header */}
        <div className={`p-6 ${formData.type === 'income' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-rose-500 to-pink-600'} transition-all duration-500`}>
          <div className="flex items-center gap-3">
            {formData.type === 'income' ? <TrendingUp size={24} className="text-white" /> : <TrendingDown size={24} className="text-white" />}
            <div>
              <h2 className="text-xl font-black text-white">Add New Record</h2>
              <p className="text-white/70 text-xs mt-0.5">Log your financial activity</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          {/* Income / Expense Toggle */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Transaction Type</label>
            <div className="inline-flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              {['expense', 'income'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    formData.type === t
                      ? t === 'income'
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                        : 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {t === 'income' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount + Date row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount ($)</label>
                <input
                  id="record-amount"
                  type="number" step="0.01" required min="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition text-gray-900 placeholder-gray-400"
                  value={formData.amount}
                  onChange={e => set('amount', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <input
                  id="record-date"
                  type="date" required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition text-gray-900"
                  value={formData.date}
                  onChange={e => set('date', e.target.value)}
                />
              </div>
            </div>

            {/* Category quick-pick */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {CATEGORIES[formData.type].map(cat => (
                  <button
                    key={cat} type="button"
                    onClick={() => set('category', cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.category === cat
                        ? formData.type === 'income'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 ring-1 ring-rose-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <input
                id="record-category"
                type="text" required
                placeholder="Or type a custom category..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-gray-900 placeholder-gray-400 transition text-sm"
                value={formData.category}
                onChange={e => set('category', e.target.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                id="record-notes"
                rows="3"
                placeholder="What was this for?"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-gray-900 placeholder-gray-400 transition text-sm resize-none"
                value={formData.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>

            <button
              id="record-submit"
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                formData.type === 'income'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/25'
              }`}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <Save size={16} />}
              {loading ? 'Saving...' : 'Save Record'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRecord;
