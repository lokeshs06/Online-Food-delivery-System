import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminLayout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Lucide.LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Lucide.Users },
    { to: '/admin/restaurants', label: 'Restaurants', icon: Lucide.Store },
    { to: '/admin/orders', label: 'Orders', icon: Lucide.ShoppingBag },
    { to: '/admin/offers', label: 'Offers', icon: Lucide.Tag },
    { to: '/admin/analytics', label: 'Analytics', icon: Lucide.BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Lucide.Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col shrink-0 overflow-y-auto hidden md:flex text-slate-600">
        <div className="p-6">
          <div className="flex items-center cursor-pointer group mb-8" onClick={() => navigate('/admin/dashboard')}>
            <span className="font-black text-2xl tracking-tight text-[#1A1A1A]">
              Foodie <span className="text-brand-500 text-sm">Admin</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 mb-8 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${isActive
                    ? 'bg-brand-50 text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors"
          >
            <Lucide.LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full max-w-[100vw]">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
