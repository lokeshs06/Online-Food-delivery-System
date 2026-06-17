import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';

export default function CustomerLayout() {
  const { user, logout, cartItemsCount, cartSubtotal } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Restaurants', path: '/user/restaurants' },
    { name: 'Offers', path: '/user/offers' },
    { name: 'My Orders', path: '/user/orders' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Customer Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/user/restaurants" className="flex items-center group">
              <span className="font-black text-2xl tracking-tight text-[#1A1A1A]">
                Foodie
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-bold text-sm transition-colors border-b-2 pb-0.5 ${location.pathname.startsWith(link.path)
                      ? 'text-brand-500 border-brand-500'
                      : 'text-slate-500 border-transparent hover:text-brand-500'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all flex items-center space-x-2"
              >
                <Lucide.ShoppingBag size={18} />
                {cartItemsCount > 0 && (
                  <>
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                      {cartItemsCount}
                    </span>
                    <span className="text-xs font-bold text-brand-500">${cartSubtotal.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-1 pr-3 rounded-full bg-white hover:bg-slate-50 shadow-sm border border-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Customer</p>
                  </div>
                  <Lucide.ChevronDown size={14} className="text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl py-1 z-50 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                    <Link
                      to="/user/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <Lucide.User size={16} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/user/favorites"
                      onClick={() => setShowUserDropdown(false)}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <Lucide.Heart size={16} />
                      <span>Favorites</span>
                    </Link>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <Lucide.LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
              >
                <Lucide.ShoppingBag size={18} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600"
              >
                {isMobileMenuOpen ? <Lucide.X size={20} /> : <Lucide.Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-4 space-y-1 shadow-md">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center space-x-3 p-3 rounded-xl font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-2"></div>
            <Link
              to="/user/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center space-x-3 p-3 rounded-xl font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              <Lucide.User size={18} />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Lucide.LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

     

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
