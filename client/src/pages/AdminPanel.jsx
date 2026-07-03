import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Users,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Shirt,
  Layers,
  Award
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [totals, setTotals] = useState({
    totalUsers: 0,
    totalClothes: 0,
    totalOutfits: 0,
    totalPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/admin/users');
      const statsRes = await api.get('/admin/stats');

      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (statsRes.data.success) setTotals(statsRes.data.stats);
    } catch (e) {
      toast.error('Failed to load administrative details');
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('Delete this user account and all their wardrobe files permanently?')) return;

    try {
      const response = await api.delete(`/admin/users/${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        setUsers(prev => prev.filter(u => u._id !== id));
        // Refresh stats
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success) setTotals(statsRes.data.stats);
      }
    } catch (e) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Operations Console</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review system usage, manage registrants, and audit closet counts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Users</span>
            <h3 className="text-2xl font-bold">{totals.totalUsers}</h3>
          </div>
          <div className="p-3 bg-brand-100 text-brand-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase">Uploaded Clothes</span>
            <h3 className="text-2xl font-bold text-sky-500">{totals.totalClothes}</h3>
          </div>
          <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
            <Shirt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase">Created Outfits</span>
            <h3 className="text-2xl font-bold text-amber-500">{totals.totalOutfits}</h3>
          </div>
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase">Community Posts</span>
            <h3 className="text-2xl font-bold text-fuchsia-500">{totals.totalPosts}</h3>
          </div>
          <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
        <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-sm">Registrants Directory</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-500">
                <th className="p-4 font-bold">User Details</th>
                <th className="p-4 font-bold">Email Address</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Streaks</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
                  <td className="p-4 flex items-center gap-3">
                    <img src={item.profileImage} alt={item.username} className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.username}</span>
                  </td>
                  <td className="p-4 text-slate-500">{item.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-orange-500">{item.streak?.count || 0} Days</td>
                  <td className="p-4 text-right">
                    {item.role !== 'admin' && (
                      <button
                        onClick={() => removeUser(item._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
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
};

export default AdminPanel;
