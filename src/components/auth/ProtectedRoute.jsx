import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, hasCompletedProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <p className="text-[var(--text-muted)] text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasCompletedProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}
