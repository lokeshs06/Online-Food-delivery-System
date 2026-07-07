import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminLayout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Lucide.LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Lucide.Users },
    { to: '/admin/restaurants', label: 'Restaurants', icon: Lucide.Store },
    { to: '/admin/orders', label: 'Orders', icon: Lucide.ShoppingBag },
    { to: '/admin/categories', label: 'Categories', icon: Lucide.Tag },
    { to: '/admin/coupons', label: 'Coupons', icon: Lucide.Ticket },
    { to: '/admin/offers', label: 'Offers', icon: Lucide.Tags },
    { to: '/admin/settings', label: 'Settings', icon: Lucide.Settings },
  ];

  return (
    <div className="flex h-[100dvh] bg-slate-50 relative overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-20 flex items-center justify-between px-4 shadow-sm">
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => {
            navigate('/admin/dashboard');
            setMobileMenuOpen(false);
          }}
        >
          <span className="font-black text-xl tracking-tight text-[#1A1A1A]">
            Foodie <span className="text-brand-500 text-xs">Admin</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -mr-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-700"
        >
          <Lucide.Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 md:relative w-64 h-[100dvh] bg-white border-r border-slate-200 shadow-sm flex flex-col shrink-0 transition-transform z-40 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center cursor-pointer group" onClick={() => {
              navigate('/admin/dashboard');
              setMobileMenuOpen(false);
            }}>
              <span className="font-black text-xl md:text-2xl tracking-tight text-[#1A1A1A]">
                Foodie <span className="text-brand-500 text-xs md:text-sm">Admin</span>
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Lucide.X size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-8 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
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
                onClick={() => setMobileMenuOpen(false)}
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

        <div className="shrink-0 p-6 border-t border-slate-100 bg-white">
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
      <main className="flex-1 overflow-y-auto w-full relative z-10">
        <div className="p-4 sm:p-6 md:p-8 pt-20 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
