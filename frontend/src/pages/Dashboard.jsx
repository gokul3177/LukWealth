import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';
import { LogOut, Plus, DollarSign, Trash2, Users, ShieldAlert, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

function Dashboard() {
  const [records, setRecords] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewUserName, setViewUserName] = useState(null);
  const [isGlobal, setIsGlobal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query params for Audit Mode
  const queryParams = new URLSearchParams(location.search);
  const viewUserId = queryParams.get('viewUser');

  // Helper to figure out who is logged in
  const getAuth = () => {
    const token = localStorage.getItem('token');
    if(!token) return { id: null, role: null, name: 'Guest' };
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { id: payload.id, role: payload.role, name: payload.name };
    } catch(err) { return { id: null, role: null, name: 'Guest' }; }
  };
  const { id: currentUserId, role, name: currentUserName } = getAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const params = viewUserId ? { userId: viewUserId } : (isGlobal ? { global: true } : {});
        
        const [recsRes, trendsRes] = await Promise.all([
            API.get('/records', { params }),
            API.get('/summary/trends', { params })
        ]);
        
        setRecords(recsRes.data);
        setTrends(trendsRes.data);

        // If in Audit Mode, fetch the user's name for the banner
        if (viewUserId) {
            const usersRes = await API.get('/users');
            const target = usersRes.data.find(u => u.id == viewUserId);
            setViewUserName(target ? target.name : 'Unknown User');
        } else {
            setViewUserName(null);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally { setLoading(false); }
    };
    fetchDashboardData();
  }, [viewUserId, isGlobal]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      await API.delete(`/records/${id}`);
      setRecords(records.filter(record => record.id !== id));
    } catch (err) { alert("Access denied or error occurred."); }
  };

  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryData = records.filter(r => r.type === 'expense').reduce((acc, record) => {
    const existing = acc.find(item => item.name === record.category);
    if (existing) existing.value += record.amount;
    else acc.push({ name: record.category, value: record.amount });
    return acc;
  }, []);

  const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) return <div className="text-center mt-20 text-gray-400 font-bold animate-pulse">Synchronizing secure data...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 pb-12">
      
      {/* AUDIT MODE BANNER */}
      {viewUserId && (
          <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center">
                  <ShieldAlert className="mr-3" />
                  <div>
                      <p className="font-bold text-sm">Audit Mode Active</p>
                      <p className="text-xs opacity-90">Viewing financial profile for: <span className="font-black text-white">{viewUserName}</span></p>
                  </div>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center"
              >
                  <ArrowLeft size={14} className="mr-2" /> Exit Audit
              </button>
          </div>
      )}

      <div className="flex justify-between items-center mb-8 pt-4">
        <div>
           <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
             Welcome, <span className="text-blue-600">{currentUserName}</span>
             <span className="ml-2 bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[9px]">{role?.toUpperCase()}</span>
           </p>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">
             {viewUserId ? 'Audit Report' : (isGlobal ? 'System Monitor' : 'My Wallet')}
           </h1>
           <p className="text-gray-500 text-xs mt-1">
             {viewUserId ? `Inspecting financial profile` : (isGlobal ? 'Aggregated system insights' : 'Your personal financial trail')}
           </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Global Toggle for Admins/Analysts */}
          {!viewUserId && (role === 'admin' || role === 'analyst') && (
              <button 
                onClick={() => setIsGlobal(!isGlobal)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center shadow-sm border ${
                  isGlobal ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {isGlobal ? 'Switch to Personal' : 'View Global Stats'}
              </button>
          )}

          {(role === 'admin' || role === 'analyst') && (
              <button onClick={()=> navigate('/manage-users')} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm hover:shadow-md flex items-center font-bold transition">
                <Users size={18} className="mr-2 text-indigo-500" /> Registry
              </button>
          )}

          {/* Universal Add Record: Enabled for Admin, Analyst, and User (Personal use) */}
          {!viewUserId && (
              <button onClick={()=> navigate('/add-record')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 flex items-center font-bold transition">
                <Plus size={18} className="mr-2" /> Add Record
              </button>
          )}

          <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 transition tooltip" title="Logout">
            <LogOut size={22} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Balance</p>
                <h3 className={`text-2xl font-black ${balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><DollarSign size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group transition hover:border-emerald-200">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Cumulative Income</p>
            <h3 className="text-2xl font-black text-emerald-500">+${totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group transition hover:border-red-200">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Cumulative Expense</p>
            <h3 className="text-2xl font-black text-red-500">-${totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Category Breakdown */}
        {categoryData.length > 0 && (
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Expense Breakdown
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" animationDuration={800}>
                    {categoryData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} /> ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                    formatter={(value) => `$${value.toFixed(2)}`} 
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Universal Line Chart: Ensuring perfect consistency across all roles */}
        {trends.length > 0 && (
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> Financial Trends
            </h2>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" padding={{ left: 20, right: 20 }} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Legend iconType="line" iconSize={10} verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px'}} />
                  <Line type="monotone" dataKey="total_income" stroke="#10B981" name="Income" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="total_expense" stroke="#EF4444" name="Expense" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 tracking-tight">Recent Activity</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{records.length} Records</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="text-gray-400 text-[10px] tracking-widest uppercase">
                    <th className="p-5 font-bold">Date</th>
                    <th className="p-5 font-bold text-center">Category</th>
                    <th className="p-5 font-bold">Details</th>
                    <th className="p-5 font-bold text-right">Amount</th>
                    <th className="p-5 font-bold text-center">Manage</th>
                </tr>
            </thead>
            <tbody>
                {records.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-12 text-gray-400 font-medium">No financial trails found.</td></tr>
                ) : (
                records.map((record) => (
                    <tr key={record.id} className="border-b border-gray-50 last:border-0 transition hover:bg-gray-50/50">
                        <td className="p-5 text-gray-800 font-semibold text-sm">{new Date(record.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                        <td className="p-5 text-center">
                            <span className="bg-gray-100 text-gray-500 text-[9px] px-2 py-1 rounded font-black uppercase tracking-tighter">{record.category}</span>
                        </td>
                        <td className="p-5 text-gray-500 text-sm max-w-xs truncate italic">"{record.notes || 'No notes provided'}"</td>
                        <td className={`p-5 text-right font-black text-sm ${record.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {record.type === 'income' ? '+' : '-'}${record.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        
                        {/* Smart Trash Icon: Only show if the record belongs to you and not in Audit Mode */}
                        <td className="p-5 text-center">
                            {record.userId == currentUserId && !viewUserId && (
                                <button onClick={() => handleDelete(record.id)} className="text-gray-300 hover:text-red-500 transition transform hover:scale-110">
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
