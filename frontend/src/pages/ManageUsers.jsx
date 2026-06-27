import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { ArrowLeft, Trash2, User, UserCheck, UserX, Activity, CheckCircle, Clock, Shield, BarChart2, Search } from 'lucide-react';
import Pagination from '../components/Pagination';

const RoleBadge = ({ role }) => {
  const map = {
    admin:   'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 ring-1 ring-purple-200 dark:ring-purple-700/40',
    analyst: 'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400  ring-1 ring-amber-200  dark:ring-amber-700/40',
    user:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-700/40',
  };
  const icons = { admin: Shield, analyst: BarChart2, user: User };
  const Icon = icons[role] || User;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${map[role] || map.user}`}>
      <Icon size={10} strokeWidth={2.5} />{role}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  if (status === 'active')  return <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>Active</span>;
  if (status === 'pending') return <span className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-bold"><Clock size={12}/>Pending</span>;
  return <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"/>Inactive</span>;
};

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const navigate = useNavigate();

  const getAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) return { id: null, role: null };
    try { const p = JSON.parse(atob(token.split('.')[1])); return { id: p.id, role: p.role }; }
    catch { return { id: null, role: null }; }
  };
  const { id: currentUserId, role: currentUserRole } = getAuth();

  useEffect(() => {
    if (currentUserRole !== 'admin' && currentUserRole !== 'analyst') { navigate('/'); return; }
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try { 
      setLoading(true);
      const res = await API.get('/users', { params: { page, limit: 10, search } }); 
      setUsers(res.data.data); 
      setTotalPages(res.data.totalPages);
      setTotalUsers(res.data.total);
    }
    catch { console.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try { await API.delete(`/users/${id}`); setUsers(users.filter(u => u.id !== id)); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete user'); }
  };

  const toggleStatus = async (user) => {
    const newStatus = (user.status === 'inactive' || user.status === 'pending') ? 'active' : 'inactive';
    const label = newStatus === 'active' ? 'approve/activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${label} this user?`)) return;
    try {
      await API.put(`/users/${user.id}/status`, { status: newStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err) { alert(err.response?.data?.message || 'Failed to update status'); }
  };

  const canManage = (target) => {
    if (target.id === currentUserId) return false;
    if (currentUserRole === 'analyst' && target.role !== 'user') return false;
    if (currentUserRole === 'analyst' && target.deactivatedByRole === 'admin') return false;
    return true;
  };
  const canAudit = (target) => {
    if (target.role === 'analyst' && currentUserRole !== 'admin') return false;
    return true;
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="h-8 w-40 rounded-lg shimmer mb-8" />
      <div className="h-96 rounded-2xl shimmer" />
    </div>
  );

  const statusCounts = {
    active:  users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-up">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold mb-6 transition">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active', count: statusCounts.active, color: 'from-emerald-400 to-teal-500' },
          { label: 'Pending', count: statusCounts.pending, color: 'from-amber-400 to-orange-500' },
          { label: 'Inactive', count: statusCounts.inactive, color: 'from-gray-400 to-gray-500' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
            <p className="text-2xl font-black">{count}</p>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">{label} Users</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">User Registry</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage approvals and access levels</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-full">{totalUsers} Total</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700/50">
                {['User','Role','Status','Actions'].map((h,i) => (
                  <th key={h} className={`px-6 py-4 font-black ${i===1||i===2||i===3?'text-center':''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={`border-b border-gray-50 dark:border-gray-700/40 last:border-0 transition-colors ${u.id===currentUserId?'bg-blue-50/40 dark:bg-blue-900/10':'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black shadow-sm ${u.id===currentUserId?'bg-gradient-to-br from-blue-500 to-violet-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                          {u.name}
                          {u.id===currentUserId && <span className="text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-black uppercase">You</span>}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center"><RoleBadge role={u.role} /></td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={u.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      {canAudit(u) && (
                        <button onClick={() => navigate(`/?viewUser=${u.id}`)} title="Inspect Metrics"
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition">
                          <Activity size={16}/>
                        </button>
                      )}
                      {canManage(u) && (
                        <button onClick={() => toggleStatus(u)} title={u.status==='pending'?'Approve User':'Toggle Status'}
                          className={`p-2 rounded-xl transition ${u.status==='active'?'text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20':'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>
                          {u.status==='pending' ? <CheckCircle size={16}/> : u.status==='active' ? <UserX size={16}/> : <UserCheck size={16}/>}
                        </button>
                      )}
                      {currentUserRole==='admin' && u.id!==currentUserId && (
                        <button onClick={() => handleDelete(u.id)} title="Permanently Delete"
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default ManageUsers;
