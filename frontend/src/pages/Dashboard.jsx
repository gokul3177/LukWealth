import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';
import { LogOut, Plus, DollarSign, Trash2, Users, ShieldAlert, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

function SkeletonDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 pb-12 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl shimmer" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl shimmer" />
        <div className="h-80 rounded-2xl shimmer" />
      </div>
      <div className="h-64 rounded-2xl shimmer" />
    </div>
  );
}

function StatCard({ label, value, Icon, gradient, subLabel, prefix='$' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg ${gradient}`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full" />
      <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">{label}</p>
      <p className="text-3xl font-black text-white mt-1">{prefix}{Math.abs(value).toLocaleString(undefined,{minimumFractionDigits:2})}</p>
      <p className="text-white/60 text-xs mt-2 font-medium">{subLabel}</p>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20">
        <Icon size={48} strokeWidth={1.5} />
      </div>
    </div>
  );
}

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899'];

function Dashboard() {
  const [records, setRecords] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewUserName, setViewUserName] = useState(null);
  const [isGlobal, setIsGlobal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const viewUserId = new URLSearchParams(location.search).get('viewUser');

  const getAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) return { id:null, role:null, name:'Guest' };
    try { const p=JSON.parse(atob(token.split('.')[1])); return {id:p.id,role:p.role,name:p.name}; }
    catch { return {id:null,role:null,name:'Guest'}; }
  };
  const { id:currentUserId, role, name:currentUserName } = getAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params = viewUserId ? {userId:viewUserId} : (isGlobal ? {global:true} : {});
        const [recsRes, trendsRes] = await Promise.all([API.get('/records',{params}), API.get('/summary/trends',{params})]);
        setRecords(recsRes.data);
        setTrends(trendsRes.data);
        if (viewUserId) {
          const usersRes = await API.get('/users');
          const target = usersRes.data.find(u => u.id == viewUserId);
          setViewUserName(target ? target.name : 'Unknown User');
        } else { setViewUserName(null); }
      } catch(err) { console.error('Dashboard fetch error:', err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [viewUserId, isGlobal]);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record permanently?')) return;
    try { await API.delete(`/records/${id}`); setRecords(records.filter(r=>r.id!==id)); }
    catch { alert('Access denied or error occurred.'); }
  };

  const totalIncome = records.filter(r=>r.type==='income').reduce((s,r)=>s+r.amount,0);
  const totalExpense = records.filter(r=>r.type==='expense').reduce((s,r)=>s+r.amount,0);
  const balance = totalIncome - totalExpense;
  const categoryData = records.filter(r=>r.type==='expense').reduce((acc,r) => {
    const ex=acc.find(x=>x.name===r.category); if(ex) ex.value+=r.amount; else acc.push({name:r.category,value:r.amount}); return acc;
  }, []);

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 pb-12 pt-6 animate-fade-up">
      {viewUserId && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl"><ShieldAlert size={18}/></div>
            <div>
              <p className="font-black text-sm">Audit Mode Active</p>
              <p className="text-xs text-blue-100">Viewing: <span className="font-black text-white">{viewUserName}</span></p>
            </div>
          </div>
          <button onClick={()=>navigate('/')} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2">
            <ArrowLeft size={14}/> Exit Audit
          </button>
        </div>
      )}

      <div className="flex justify-between items-start pt-2 flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            Welcome, <span className="text-blue-600 dark:text-blue-400">{currentUserName}</span>
            <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded text-[9px]">{role?.toUpperCase()}</span>
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {viewUserId ? 'Audit Report' : isGlobal ? 'System Monitor' : 'My Wallet'}
          </h1>
          <p className="text-gray-400 text-xs mt-1">{viewUserId ? 'Inspecting financial profile' : isGlobal ? 'Aggregated system insights' : 'Your personal financial trail'}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!viewUserId && (role==='admin'||role==='analyst') && (
            <button onClick={()=>setIsGlobal(!isGlobal)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${isGlobal?'bg-indigo-600 text-white border-indigo-600':'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {isGlobal ? 'Personal View' : 'Global Stats'}
            </button>
          )}
          {(role==='admin'||role==='analyst') && (
            <button onClick={()=>navigate('/manage-users')} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
              <Users size={14} className="text-indigo-500"/> Registry
            </button>
          )}
          {!viewUserId && (
            <button onClick={()=>navigate('/add-record')} className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition">
              <Plus size={14}/> Add Record
            </button>
          )}
          <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition" title="Logout">
            <LogOut size={18}/>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard label="Total Balance" value={balance} Icon={DollarSign} subLabel="Net portfolio value"
          gradient={balance>=0 ? 'bg-gradient-to-br from-blue-500 to-violet-600 shadow-blue-500/20' : 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/20'} />
        <StatCard label="Cumulative Income" value={totalIncome} Icon={TrendingUp} subLabel={`${records.filter(r=>r.type==='income').length} income entries`}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/20" />
        <StatCard label="Cumulative Expense" value={totalExpense} Icon={TrendingDown} subLabel={`${records.filter(r=>r.type==='expense').length} expense entries`}
          gradient="bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/20" />
      </div>

      {(categoryData.length>0||trends.length>0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoryData.length>0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"/>Expense Breakdown
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value" animationDuration={800}>
                      {categoryData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} cornerRadius={4}/>)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 10px 25px rgba(0,0,0,0.15)',fontSize:'12px'}} formatter={v=>`$${v.toFixed(2)}`}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'11px'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {trends.length>0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"/>Financial Trends
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{top:5,right:20,left:0,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)"/>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:10,fontWeight:700,fill:'#94a3b8'}}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize:10,fontWeight:700,fill:'#94a3b8'}} width={40}/>
                    <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 10px 25px rgba(0,0,0,0.15)',fontSize:'12px'}}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'11px',paddingTop:'12px'}}/>
                    <Line type="monotone" dataKey="total_income" stroke="#10B981" name="Income" strokeWidth={3} dot={{r:4,fill:'#fff',strokeWidth:2}} activeDot={{r:6}}/>
                    <Line type="monotone" dataKey="total_expense" stroke="#F43F5E" name="Expense" strokeWidth={3} dot={{r:4,fill:'#fff',strokeWidth:2}} activeDot={{r:6}}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/60 dark:bg-gray-800">
          <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest">Recent Activity</h3>
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-full">{records.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700/50">
                {['Date','Category','Notes','Amount','Action'].map((h,i)=>(
                  <th key={h} className={`px-6 py-4 font-black ${i===3?'text-right':i===4?'text-center':i===1?'text-center':''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length===0 ? (
                <tr><td colSpan="5" className="px-6 py-16 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-gray-400 font-semibold text-sm">No financial trails found</p>
                  <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Add your first record to get started</p>
                </td></tr>
              ) : records.map(record=>(
                <tr key={record.id} className="border-b border-gray-50 dark:border-gray-700/40 last:border-0 hover:bg-blue-50/30 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {new Date(record.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">{record.category}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate italic">"{record.notes||'No notes'}"</td>
                  <td className={`px-6 py-4 text-right font-black text-sm ${record.type==='income'?'text-emerald-500':'text-rose-500'}`}>
                    {record.type==='income'?'+':'-'}${record.amount.toLocaleString(undefined,{minimumFractionDigits:2})}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {record.userId==currentUserId && !viewUserId && (
                      <button onClick={()=>handleDelete(record.id)} className="text-gray-300 dark:text-gray-600 hover:text-rose-500 transition p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
