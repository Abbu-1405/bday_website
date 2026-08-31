import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { userTrackingService } from '../services/userTrackingService';

export function useUserTracking(): void {
  const location = useLocation();
  const { currentUser } = useAuth();
  const activeUserIdRef = useRef<string | null>(null);
  const lastInteractionTimeRef = useRef<number>(0);

  // Synchronize session on user auth state or route change
  useEffect(() => {
    if (currentUser?.uid) {
      activeUserIdRef.current = currentUser.uid;
      userTrackingService.initializeUserSession(currentUser.uid, location.pathname);
    } else {
      activeUserIdRef.current = null;
    }
  }, [currentUser?.uid]);

  // Synchronize route transitions
  useEffect(() => {
    if (currentUser?.uid) {
      userTrackingService.updateRoute(location.pathname);
    }
  }, [location.pathname, currentUser?.uid]);

  // Lightweight interaction signal listener
  useEffect(() => {
    if (!currentUser?.uid) return;

    const handleUserInteraction = () => {
      const now = Date.now();
      // Throttle client-side event check to once per 10 seconds to avoid CPU overhead
      if (now - lastInteractionTimeRef.current >= 10000) {
        lastInteractionTimeRef.current = now;
        userTrackingService.recordActivitySignal();
      }
    };

    // Standard passive interaction events
    window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
  }, [currentUser?.uid]);

  // Browser lifecycle & visibility change handling
  useEffect(() => {
    if (!currentUser?.uid) return;

    const handleVisibilityChange = () => {
      userTrackingService.handleVisibilityChange(document.visibilityState === 'hidden');
    };

    const handlePageHide = () => {
      userTrackingService.handleSessionEnd().catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [currentUser?.uid]);
}
