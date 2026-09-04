import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { SneakPeekEntrance } from '../components/sneakPeek';
import { AuthLoadingScreen } from '../components';
import { ROUTES } from '../constants';

export default function Landing() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // Guard against flash or premature redirect while auth state is resolving
  if (loading) {
    return <AuthLoadingScreen message="Listening to the stars..." />;
  }

  // If already authenticated, direct to the protected main website home
  if (currentUser) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // Public Landing Experience: "Get Started" or "Skip" routes to /login
  return (
    <div className="relative min-h-screen">
      <SneakPeekEntrance
        initialMode="landing"
        onComplete={() => {
          navigate(ROUTES.LOGIN);
        }}
      />
    </div>
  );
}
