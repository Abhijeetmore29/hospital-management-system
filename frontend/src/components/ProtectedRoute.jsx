import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from './AppLayout';

function roleHome(role) {
  return role === 'doctor' ? '/doctor/dashboard' : '/staff/dashboard';
}

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="page-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <AppLayout />;
}

