import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RoleRedirect() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="page-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user?.role === 'doctor' ? '/doctor/dashboard' : '/staff/dashboard'} replace />;
}

