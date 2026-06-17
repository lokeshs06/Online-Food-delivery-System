import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';

import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Navbar({ onOpenCart }) {
  const {
    targetSection,
    setTargetSection,
    user,
    logout,
    cartItemsCount,
    cartSubtotal,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (sectionId, e) => {
    if (e) e.preventDefault();
    if (sectionId === 'offers') {
      navigate('/offers');
    } else if (sectionId === 'restaurants') {
      navigate('/restaurants');
    } else if (sectionId === 'home') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (location.pathname === '/') {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setTargetSection(sectionId);
        navigate('/');
      }
    }
    setIsOpen(false);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand Name */}
            <Link
              to={user ? (user.role === 'restaurant_owner' ? '/owner/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/user/restaurants') : '/'}
              className="flex items-center cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center mr-2 shadow-md shadow-brand-500/30">
                <span className="font-bold text-white text-xl leading-none">F</span>
              </div>
              <span className="font-black text-xl tracking-tight text-[#1A1A1A] hidden sm:block">
                Foodie
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {(!user || user.role === 'customer') && (
                <button onClick={(e) => handleNavClick('home', e)} className={`font-semibold text-sm transition-colors ${location.pathname === '/' ? 'text-[#1A1A1A]' : 'text-slate-500 hover:text-brand-500'}`}>Home</button>
              )}
              
              {!user && (
                <>
                  <Link to="/about" className={`font-semibold text-sm transition-colors ${location.pathname === '/about' ? 'text-[#1A1A1A]' : 'text-slate-500 hover:text-brand-500'}`}>About Us</Link>
                  <Link to="/contact" className={`font-semibold text-sm transition-colors ${location.pathname === '/contact' ? 'text-[#1A1A1A]' : 'text-slate-500 hover:text-brand-500'}`}>Contact Us</Link>
                </>
              )}

              {user && user.role === 'customer' && (
                <>
                  <button onClick={(e) => handleNavClick('restaurants', e)} className={`font-semibold text-sm transition-colors ${location.pathname === '/user/restaurants' ? 'text-[#1A1A1A]' : 'text-slate-500 hover:text-brand-500'}`}>Restaurants</button>
                  <button onClick={(e) => handleNavClick('offers', e)} className={`font-semibold text-sm transition-colors ${location.pathname === '/user/offers' ? 'text-[#1A1A1A]' : 'text-slate-500 hover:text-brand-500'}`}>Offers</button>
                </>
              )}

              {user && user.role === 'customer' && (
                <Link
                  to="/user/orders"
                  className={`font-semibold text-sm transition-colors ${location.pathname.startsWith('/user/orders') ? 'text-[#1A1A1A]' : 'text-slate-500 hover:text-brand-500'}`}
                >
                  My Orders
                </Link>
              )}
            </div>

            {/* Right Action buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search Icon */}
              {(user && user.role === 'customer') && (
                <button onClick={() => { /* Navigate to search or open search modal */ }} className="p-2 text-slate-600 hover:text-brand-500 transition-colors">
                  <Lucide.Search size={20} />
                </button>
              )}

              {/* Cart Trigger */}
              {(user && user.role === 'customer') && (
                <button
                  onClick={onOpenCart}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 ml-2"
                >
                  <Lucide.ShoppingBag size={18} className="text-[#1A1A1A]" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-brand-500/30">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Auth Dropdown / Buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 p-1 pr-3 rounded-full bg-white hover:bg-slate-50 shadow-sm transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-medium text-slate-900 leading-tight">{user.name}</p>
                      <p className="text-[10px] text-slate-500 leading-none capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    <Lucide.ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl py-1 z-50 border border-slate-100">
                      {user.role === 'restaurant_owner' ? (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/owner/settings');
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-500 text-left transition-colors"
                        >
                          <Lucide.User size={16} />
                          <span>Profile</span>
                        </button>
                      ) : user.role === 'admin' ? (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/admin/dashboard');
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-500 text-left transition-colors"
                        >
                          <Lucide.LayoutDashboard size={16} />
                          <span>System Dashboard</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              navigate('/user/profile');
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-500 text-left transition-colors"
                          >
                            <Lucide.User size={16} />
                            <span>My Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              navigate('/user/orders');
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-500 text-left transition-colors"
                          >
                            <Lucide.ShoppingBag size={16} />
                            <span>Orders</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              navigate('/user/favorites');
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-500 text-left transition-colors"
                          >
                            <Lucide.Heart size={16} />
                            <span>Favorites</span>
                          </button>
                        </>
                      )}
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 text-left transition-colors"
                      >
                        <Lucide.LogOut size={16} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-brand-500 font-medium text-sm hover:text-brand-600 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="px-5 py-2 rounded-full border border-brand-500 text-brand-500 font-medium text-sm hover:bg-brand-50 transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-2">
              {(user && user.role === 'customer') && (
                <button
                  onClick={onOpenCart}
                  className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                >
                  <Lucide.ShoppingBag size={18} />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900"
              >
                {isOpen ? <Lucide.X size={20} /> : <Lucide.Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-md">
            {(!user || user.role === 'customer') && (
              <button onClick={(e) => handleNavClick('home', e)} className="w-full flex items-center space-x-2 p-2.5 rounded-xl text-slate-700 hover:bg-slate-50">
                <Lucide.Home size={18} /><span>Home</span>
              </button>
            )}
            
            {!user && (
              <>
                <button onClick={() => { navigate('/about'); setIsOpen(false); }} className="w-full flex items-center space-x-2 p-2.5 rounded-xl text-slate-700 hover:bg-slate-50">
                  <Lucide.Info size={18} /><span>About Us</span>
                </button>
                <button onClick={() => { navigate('/contact'); setIsOpen(false); }} className="w-full flex items-center space-x-2 p-2.5 rounded-xl text-slate-700 hover:bg-slate-50">
                  <Lucide.Phone size={18} /><span>Contact Us</span>
                </button>
              </>
            )}

            {user && user.role === 'customer' && (
              <>
                <button onClick={(e) => handleNavClick('restaurants', e)} className="w-full flex items-center space-x-2 p-2.5 rounded-xl text-slate-700 hover:bg-slate-50">
                  <Lucide.Utensils size={18} /><span>Restaurants</span>
                </button>
                <button onClick={(e) => handleNavClick('offers', e)} className="w-full flex items-center space-x-2 p-2.5 rounded-xl text-slate-700 hover:bg-slate-50">
                  <Lucide.Tag size={18} /><span>Offers</span>
                </button>
              </>
            )}

            <div className="h-px bg-slate-200 my-2"></div>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2 p-2.5 rounded-xl text-rose-600 hover:bg-rose-50"
              >
                <Lucide.LogOut size={18} />
                <span>Log Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="block w-full py-2.5 rounded-xl bg-brand-500 text-white font-medium text-center shadow-md shadow-brand-500/20"
              >
                Sign In
              </Link>
            )}
          </div>
        )}

      </nav>
    </>
  );
}
