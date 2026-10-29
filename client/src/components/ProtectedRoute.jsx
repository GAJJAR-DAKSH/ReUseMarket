import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white border border-rose-200 rounded-card text-center">
        <h2 className="text-lg font-semibold text-rose-700 mb-2">Access Denied</h2>
        <p className="text-sm text-charcoal-muted mb-4">
          This area is restricted to campus administrators.
        </p>
        <a href="/" className="btn-secondary text-xs">
          Return to Marketplace
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

