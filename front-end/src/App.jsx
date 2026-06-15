import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

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

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      {/* Public/Customer Routes wrapped in PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Home />} /> {/* Temporarily point to Home, can add dedicated search later */}
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
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

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
