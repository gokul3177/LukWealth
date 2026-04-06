import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { ArrowLeft, Trash2, User, UserCheck, UserX, Activity, CheckCircle, Clock } from 'lucide-react';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Helper to figure out who is current logged in
    const getAuth = () => {
        const token = localStorage.getItem('token');
        if(!token) return { id: null, role: null };
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return { id: payload.id, role: payload.role };
        } catch(err) { return { id: null, role: null }; }
    };
    const { id: currentUserId, role: currentUserRole } = getAuth();

    useEffect(() => {
        if (currentUserRole !== 'admin' && currentUserRole !== 'analyst') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await API.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user");
        }
    };

    const toggleStatus = async (user) => {
        const newStatus = user.status === 'inactive' || user.status === 'pending' ? 'active' : 'inactive';
        const actionLabel = newStatus === 'active' ? "approve/activate" : "deactivate";
        
        if (!window.confirm(`Are you sure you want to ${actionLabel} this user?`)) return;

        try {
            await API.put(`/users/${user.id}/status`, { status: newStatus });
            setUsers(users.map(u => u.id === user.id ? {...u, status: newStatus} : u));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status");
        }
    }

    if (loading) return <div className="text-center mt-20">Loading registry...</div>;

    // Safety & Hierarchy Logic
    const canManage = (target) => {
        // 1. Cannot deactivate self
        if (target.id === currentUserId) return false;
        
        // 2. Analyst can only manage 'user' role
        if (currentUserRole === 'analyst' && target.role !== 'user') return false;

        // 3. Hierarchy Lock: Analyst cannot activate Admin-deactivated user
        if (currentUserRole === 'analyst' && target.deactivatedByRole === 'admin') return false;

        return true;
    };

    const canAudit = (target) => {
        // Only Admin can audit Analysts
        if (target.role === 'analyst' && currentUserRole !== 'admin') return false;
        return true;
    }

    return (
        <div className="max-w-5xl mx-auto px-4">
            <button 
                onClick={() => navigate('/')} 
                className="text-blue-600 hover:text-blue-800 flex items-center mb-6 font-semibold transition"
            >
                <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage registration approvals and account access levels.</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {users.length} Users
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-200 text-gray-400 text-[10px] tracking-widest uppercase">
                                <th className="p-5 font-bold">Identity</th>
                                <th className="p-5 font-bold text-center">Role</th>
                                <th className="p-5 font-bold text-center">Status</th>
                                <th className="p-5 font-bold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className={`border-b border-gray-50 transition ${u.id === currentUserId ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                                    <td className="p-5">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-lg mr-3 ${u.id === currentUserId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 flex items-center">
                                                    {u.name} {u.id === currentUserId && <span className="ml-2 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">You</span>}
                                                </div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${
                                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                            u.role === 'analyst' ? 'bg-orange-100 text-orange-700' : 
                                            'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {u.role === 'user' ? 'USER' : u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        {u.status === 'active' ? (
                                            <span className="inline-flex items-center text-emerald-600 text-[11px] font-bold">
                                                <UserCheck size={14} className="mr-1" /> Active
                                            </span>
                                        ) : u.status === 'pending' ? (
                                            <span className="inline-flex items-center text-amber-500 text-[11px] font-bold italic animate-pulse">
                                                <Clock size={14} className="mr-1" /> Pending Approval
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-red-400 text-[11px] font-bold">
                                                <UserX size={14} className="mr-1" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center justify-center space-x-4">
                                            {/* Drill-down Audit Icon */}
                                            {canAudit(u) && (
                                                <button 
                                                    onClick={() => navigate(`/?viewUser=${u.id}`)} 
                                                    className="text-gray-400 hover:text-blue-600 transition"
                                                    title="Inspect Metrics"
                                                >
                                                    <Activity size={20} />
                                                </button>
                                            )}

                                            {/* Toggle Button: Supports Approval and Deactivation */}
                                            {canManage(u) && (
                                                <button 
                                                    onClick={() => toggleStatus(u)} 
                                                    className={`transition ${u.status === 'active' ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-emerald-500'}`}
                                                    title={u.status === 'pending' ? "Approve User" : "Toggle Status"}
                                                >
                                                   {u.status === 'pending' ? <CheckCircle size={20} /> : <UserCheck size={20} />}
                                                </button>
                                            )}
                                            
                                            {/* Delete Button: Strictly Admin only and check safety */}
                                            {currentUserRole === 'admin' && u.id !== currentUserId && (
                                                <button 
                                                    onClick={() => handleDelete(u.id)} 
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
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

export default ManageUsers;
