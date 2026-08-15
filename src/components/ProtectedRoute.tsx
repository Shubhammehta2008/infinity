import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: ('admin' | 'client')[] }) {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
          <p className="text-sm tracking-wide text-neutral-500">LOADING PORTAL</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/client'} replace />;
  }
  return <>{children}</>;
}
