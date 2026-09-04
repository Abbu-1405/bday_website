import React from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { currentUser, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen message="Verifying authorization..." />;
  }

  // Preserve existing Admin security check
  if (requireAdmin && (!currentUser || !isAdmin)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100 mb-2">
          Access denied.
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
          You do not have permission to view this area.
        </p>
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-700"
        >
          Return to Starlit Letters
        </Link>
      </div>
    );
  }

  if (!currentUser) {
    const isIntentionalLogout =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('starlit_intentional_logout') === 'true';

    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={isIntentionalLogout ? {} : { from: location }}
        replace
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export const RequireAuth = ProtectedRoute;
