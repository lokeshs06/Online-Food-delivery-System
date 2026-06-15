import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import { useApp } from '../context/AppContext';

export default function PublicLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useApp();

  // Enforce isolation: If an admin or owner hits a public page, redirect them to their dashboard
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'restaurant_owner') return <Navigate to="/owner/dashboard" replace />;
  if (user?.role === 'customer') return <Navigate to="/user/restaurants" replace />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Navigation bar */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      {/* Cart Sliding Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Main Pages Mount point */}
      <main className="flex-grow pb-16">
        <Outlet />
      </main>
    </div>
  );
}
