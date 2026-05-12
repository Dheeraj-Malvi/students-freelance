import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider'; // Path check kar lena

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="bg-slate-950 min-h-screen"></div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.user_metadata?.setup_complete) {
    return <Navigate to="/profilesetup" replace />;
  }

  return children;
};

export default ProtectedRoute;