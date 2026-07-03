import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Shirt,
  CalendarDays,
  Sparkles,
  WashingMachine,
  BarChart3,
  Luggage,
  Users,
  Heart,
  ShieldCheck,
  LogOut,
  Sparkle
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Wardrobe', path: '/wardrobe', icon: Shirt },
    { name: 'Outfit Planner', path: '/outfit-planner', icon: CalendarDays },
    { name: 'AI Stylist', path: '/ai-stylist', icon: Sparkles },
    { name: 'Laundry Tracker', path: '/laundry', icon: WashingMachine },
    { name: 'Closet Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Travel Packer', path: '/travel', icon: Luggage },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
  ];

  if (user && user.role === 'admin') {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col w-64 glass-card border-r border-slate-200/50 dark:border-slate-800/50">
      {/* Brand Header */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500 text-white">
          <Sparkle className="w-5 h-5 fill-current" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-fuchsia-400">
          StyleSphere AI
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile Summary */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <img
            src={user?.profileImage}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border border-brand-500/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
              {user?.username}
            </p>
            <p className="text-xs text-slate-500 truncate dark:text-slate-400 capitalize">
              {user?.role} Stylist
            </p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
