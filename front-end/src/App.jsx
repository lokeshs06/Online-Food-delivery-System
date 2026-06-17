import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import CustomerRestaurants from './pages/CustomerRestaurants';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDetail from './pages/RestaurantDetail';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Offers from './pages/Offers';
import OwnerDashboard from './pages/OwnerDashboard'; // Temp wrapper until fully split
import AdminDashboard from './pages/AdminDashboard'; // Temp wrapper until fully split
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

function AppRoutes() {
  const { user, globalSettings } = useApp();
  const location = useLocation();

  // Maintenance Mode Intercept
  const isMaintenance = globalSettings?.maintenance?.maintenanceMode;
  const isAdmin = user?.role === "admin";
  const isLoginRoute = location.pathname === "/login";

  if (isMaintenance && !isAdmin && !isLoginRoute) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Under Maintenance</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          We are currently performing scheduled maintenance to improve {globalSettings?.general?.platformName || "our platform"}. 
          Please check back shortly.
        </p>
        <button onClick={() => window.location.href='/login'} className="text-sm font-bold text-brand-500 hover:text-brand-600">
          Admin Login
        </button>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public/Customer Routes wrapped in PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<Terms />} />
      </Route>

      {/* Protected Customer Routes wrapped in CustomerLayout */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/user/restaurants" element={<CustomerRestaurants />} />
          <Route path="/user/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/user/offers" element={<Offers />} />
          <Route path="/user/checkout" element={<Checkout />} />
          <Route path="/user/orders" element={<Orders />} />
          <Route path="/user/orders/:id" element={<OrderTracking />} />
          <Route path="/user/*" element={<Profile />} />
        </Route>
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Owner Routes (Temporary monolithic component mapped to catch-all) */}
      <Route element={<ProtectedRoute allowedRoles={['restaurant_owner']} />}>
        <Route element={<OwnerLayout />}>
          <Route path="/owner/*" element={<OwnerDashboard />} />
        </Route>
      </Route>

      {/* Admin Routes (Temporary monolithic component mapped to catch-all) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Redirects for legacy/guest restaurant links */}
      <Route path="/restaurants" element={<Navigate to="/user/restaurants" replace />} />
      <Route path="/restaurants/:id" element={<Navigate to="/user/restaurants" replace />} />
      <Route path="/offers" element={<Navigate to="/user/offers" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
