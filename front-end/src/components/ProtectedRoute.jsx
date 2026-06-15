import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'restaurant_owner') return <Navigate to="/owner/dashboard" replace />;
    if (user.role === 'customer') return <Navigate to="/user/restaurants" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
