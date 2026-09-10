import { GoogleAuthProvider, signInWithPopup, signOut, User, browserPopupRedirectResolver } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { UserProfile } from '../types';
import { isAuthorizedAdminEmail } from '../constants';
import { userTrackingService } from './userTrackingService';

let isPopupActive = false;

/**
 * Deterministically and idempotently synchronizes the Firebase Auth user
 * with their authoritative Firestore document at /users/{uid}.
 *
 * Guarantees:
 * 1. Document ID is strictly user.uid (never email).
 * 2. If document is missing, creates it with required profile fields and ISO timestamps.
 * 3. If document exists, updates identity metadata (lastSeenAt, email, displayName, photoURL, role)
 *    using merge semantics without destroying existing activity counters, custom fields, or notes.
 * 4. Awaits Firestore confirmation before returning the synchronized UserProfile.
 */
export const syncUserProfile = async (user: User): Promise<UserProfile> => {
  if (!isFirebaseConfigured || !user?.uid) {
    throw new Error('Cannot synchronize profile: Firebase or user is unconfigured.');
  }

  const userRef = doc(db, 'users', user.uid);
  const nowISO = new Date().toISOString();

  // Check claims to set role appropriately during profile sync
  let hasAdminClaim = false;
  try {
    const tokenResult = await user.getIdTokenResult().catch(() => null);
    hasAdminClaim = Boolean(tokenResult?.claims?.admin);
  } catch {
    // Fallback for backgrounding or offline states
  }

  const isAllowlistedAdmin = isAuthorizedAdminEmail(user.email);
  const isAdminAccount =
    hasAdminClaim ||
    isAllowlistedAdmin ||
    user.uid === 'TyVula514COYthRt1y2XiV4riB83' ||
    user.uid === 'TyVula514C0YhRt1y2XiV4riB83' ||
    user.uid === '42V9so9YzmRNUaorj2Xn67R5NKJ2';

  try {
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Starlit Letters User'),
        photoURL: user.photoURL || null,
        role: isAdminAccount ? 'admin' : 'user',
        createdAt: nowISO,
        lastSeenAt: nowISO,
      };

      // Atomic idempotent write with merge: true to avoid overwriting concurrent partial writes
      await setDoc(userRef, newProfile, { merge: true });
      console.log(`[AUTH] Successfully created initial user profile for UID: ${user.uid}`);
      return newProfile;
    } else {
      const existingData = snap.data();
      const existingRole = existingData?.role;
      const targetRole = isAdminAccount ? 'admin' : (existingRole || 'user');

      const updates: Record<string, any> = {
        lastSeenAt: nowISO,
      };

      // Elevate or synchronize role if needed
      if (existingRole !== targetRole) {
        updates.role = targetRole;
      }

      // Preserve or set createdAt if missing (e.g. from partial tracking document)
      if (!existingData?.createdAt) {
        updates.createdAt = nowISO;
      }

      // Update identity fields only if changed or if missing from existing document
      if (user.displayName && user.displayName !== existingData?.displayName) {
        updates.displayName = user.displayName;
      } else if (!existingData?.displayName && user.displayName) {
        updates.displayName = user.displayName;
      }

      if (user.email && user.email !== existingData?.email) {
        updates.email = user.email;
      } else if (!existingData?.email && user.email) {
        updates.email = user.email;
      }

      if (user.photoURL && user.photoURL !== existingData?.photoURL) {
        updates.photoURL = user.photoURL;
      } else if (!existingData?.photoURL && user.photoURL) {
        updates.photoURL = user.photoURL;
      }

      // Apply updates with merge semantics, strictly preserving all existing fields (notes, counters, sessions)
      await setDoc(userRef, updates, { merge: true });
      console.log(`[AUTH] Successfully synchronized existing user profile for UID: ${user.uid}`);

      return {
        uid: user.uid,
        email: updates.email ?? existingData?.email ?? user.email ?? null,
        displayName: updates.displayName ?? existingData?.displayName ?? user.displayName ?? null,
        photoURL: updates.photoURL ?? existingData?.photoURL ?? user.photoURL ?? null,
        role: targetRole,
        createdAt: existingData?.createdAt || updates.createdAt || nowISO,
        lastSeenAt: nowISO,
        ...existingData,
        ...updates,
      } as UserProfile;
    }
  } catch (error: any) {
    console.error(`[AUTH] Firestore synchronization failed for UID: ${user.uid}:`, error);
    throw error;
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase Authentication is not configured.');
  }

  if (isPopupActive) {
    console.warn('[AUTH] Duplicate sign-in attempt ignored: popup already in progress.');
    throw new Error('A sign-in request is already in progress.');
  }

  isPopupActive = true;
  console.log('[AUTH] Starting Google popup');

  try {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    console.log('[AUTH] Popup resolved successfully');

    const user = result.user;

    // Deterministically await user profile synchronization before proceeding to navigation
    try {
      await syncUserProfile(user);
      console.log('[AUTH] User profile synchronized deterministically for UID:', user.uid);
    } catch (syncError: any) {
      console.error('[AUTH] Critical: User profile synchronization failed:', syncError);
      const friendlySyncErr = new Error('Failed to synchronize user account. Please try again.');
      (friendlySyncErr as any).code = 'auth/sync-failed';
      (friendlySyncErr as any).originalError = syncError;
      throw friendlySyncErr;
    }

    return user;
  } catch (error: any) {
    const isUserCancellation =
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request';

    if (isUserCancellation) {
      console.info('[AUTH] Popup dismissed by user.');
    } else {
      console.error('[AUTH] Popup failed with code:', error?.code || 'unknown');
    }

    let friendlyMessage = 'Failed to sign in with Google. Please try again.';

    switch (error?.code) {
      case 'auth/argument-error':
        friendlyMessage = 'Authentication configuration error. Please refresh the page and try again.';
        break;
      case 'auth/popup-blocked':
        friendlyMessage = 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
        break;
      case 'auth/popup-closed-by-user':
        friendlyMessage = 'Sign-in cancelled by user.';
        break;
      case 'auth/cancelled-popup-request':
        friendlyMessage = 'A sign-in request is already in progress.';
        break;
      case 'auth/unauthorized-domain':
        friendlyMessage = 'This domain is not authorized for Google sign-in in Firebase Authentication.';
        break;
      case 'auth/operation-not-allowed':
        friendlyMessage = 'Google sign-in provider is not enabled in Firebase Authentication.';
        break;
      case 'auth/network-request-failed':
        friendlyMessage = 'Network connection error during sign-in. Please check your internet connection.';
        break;
      case 'auth/account-exists-with-different-credential':
        friendlyMessage = 'An account already exists with the same email using a different sign-in method.';
        break;
      case 'auth/internal-error':
        friendlyMessage = 'Authentication service encountered an internal server error. Please try again shortly.';
        break;
      case 'auth/web-storage-unsupported':
        friendlyMessage = 'Web storage is disabled or unsupported in this browser environment. Please enable cookies and storage.';
        break;
      default:
        if (error?.message) {
          friendlyMessage = error.message;
        }
        break;
    }

    const customErr = new Error(friendlyMessage);
    (customErr as any).code = error?.code;
    (customErr as any).originalMessage = error?.message;
    (customErr as any).originalError = error;
    throw customErr;
  } finally {
    isPopupActive = false;
  }
};

export const logoutUser = async (): Promise<void> => {
  if (!isFirebaseConfigured) return;
  try {
    userTrackingService.handleUserLogout();
    await signOut(auth);
    console.log('[AUTH] User signed out successfully');
  } catch (err) {
    console.error('[AUTH] Logout error:', err);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!isFirebaseConfigured) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('[AUTH] Unable to load user profile from Firestore:', error);
    return null;
  }
};


