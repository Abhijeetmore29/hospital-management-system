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

  if (user?.role === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/medical-imaging" replace />;
  }

  return <Navigate to="/staff/dashboard" replace />;
}
