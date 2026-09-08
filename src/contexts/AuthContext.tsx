import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';
import { loginWithGoogle as googleLogin, logoutUser, getUserProfile } from '../services';
import { AuthContextType, UserProfile } from '../types';
import { isAuthorizedAdminEmail } from '../constants';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.log('[AUTH] Firebase not configured; auth listener bypassed.');
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          console.log('[AUTH] onAuthStateChanged', {
            hasUser: !!user,
            uid: user?.uid || null,
            email: user?.email || null,
          });

          setCurrentUser(user);

          if (user) {
            try {
              let hasAdminClaim = false;
              let tokenResult = null;
              try {
                // Force token refresh to fetch newly assigned custom claims immediately
                tokenResult = await user.getIdTokenResult(true);
                hasAdminClaim = Boolean(tokenResult?.claims?.admin);
              } catch {
                try {
                  tokenResult = await user.getIdTokenResult();
                  hasAdminClaim = Boolean(tokenResult?.claims?.admin);
                } catch {
                  // Fallback for backgrounding or offline states
                }
              }

              // Fetch user profile from Firestore
              let profile = await getUserProfile(user.uid);

              // If profile does not exist or role needs synchronization
              const isAllowlistedAdmin = isAuthorizedAdminEmail(user.email);
              const isEligibleAdmin = hasAdminClaim || isAllowlistedAdmin;

              if (profile && profile.role !== 'admin' && isEligibleAdmin) {
                try {
                  const { doc, setDoc } = await import('firebase/firestore');
                  const { db } = await import('../firebase');
                  await setDoc(
                    doc(db, 'users', user.uid),
                    { role: 'admin' },
                    { merge: true }
                  );
                  profile = await getUserProfile(user.uid);
                } catch (syncErr) {
                  console.warn('[AUTH] Profile role sync notice:', syncErr);
                }
              }

              const computedIsAdmin = hasAdminClaim || profile?.role === 'admin' || isAllowlistedAdmin;

              if (process.env.NODE_ENV !== 'production' || import.meta.env.DEV) {
                console.log('[ADMIN DEBUG]', {
                  uid: user.uid,
                  email: user.email,
                  claims: tokenResult?.claims,
                  adminClaim: tokenResult?.claims?.admin,
                  userProfile: profile,
                  userProfileRole: profile?.role,
                  isAdmin: computedIsAdmin,
                  requireAdminResult: computedIsAdmin,
                });
              }

              setUserProfile(profile);
              setIsAdmin(computedIsAdmin);
            } catch (profileErr) {
              console.warn('[AUTH] Error resolving user profile claims:', profileErr);
              setUserProfile(null);
              setIsAdmin(false);
            }
          } else {
            setUserProfile(null);
            setIsAdmin(false);
          }

          setLoading(false);
        },
        (error) => {
          const errMsg = (error?.message || String(error)).toLowerCase();
          if (
            errMsg.includes('database is closing') ||
            errMsg.includes('closing/hidden') ||
            errMsg.includes('the database is closed') ||
            errMsg.includes('client is offline')
          ) {
            return;
          }
          console.error('[AUTH] onAuthStateChanged error:', error);
          setCurrentUser(null);
          setUserProfile(null);
          setIsAdmin(false);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('[AUTH] Firebase auth state subscription failure:', err);
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    try {
      await googleLogin();
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('starlit_intentional_logout', 'true');
      }
      await logoutUser();
    } catch (err) {
      console.error('[AUTH] Logout failed:', err);
    }
  };

  const authenticated = !!currentUser;
  const userId = currentUser?.uid || null;

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        currentUser,
        user: currentUser,
        userId,
        userProfile,
        loading,
        isAdmin,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

