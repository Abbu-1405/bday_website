import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { UserProfile } from '../types';

let isPopupActive = false;

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

    const result = await signInWithPopup(auth, googleProvider);
    console.log('[AUTH] Popup resolved successfully');

    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    const nowISO = new Date().toISOString();

    // Check claims to set role appropriately during profile sync
    const tokenResult = await user.getIdTokenResult(true).catch(() => null);
    const hasAdminClaim = Boolean(tokenResult?.claims?.admin);
    const isAdminAccount = hasAdminClaim || user.uid === 'TyVula514C0YhRt1y2XiV4riB83';

    // Async background sync of user profile to Firestore without blocking return
    getDoc(userRef)
      .then(async (snap) => {
        if (!snap.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: isAdminAccount ? 'admin' : 'user',
            createdAt: nowISO,
            lastSeenAt: nowISO,
          };
          await setDoc(userRef, newProfile);
        } else {
          const existingData = snap.data();
          const targetRole = isAdminAccount ? 'admin' : (existingData?.role || 'user');
          await setDoc(
            userRef,
            {
              lastSeenAt: nowISO,
              displayName: user.displayName,
              photoURL: user.photoURL,
              email: user.email,
              role: targetRole,
            },
            { merge: true }
          );
        }
      })
      .catch((dbErr) => {
        console.warn('[AUTH] Firestore user profile sync notice:', dbErr);
      });

    return user;
  } catch (error: any) {
    const isUserCancellation =
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request';

    if (isUserCancellation) {
      console.info('[AUTH] Popup dismissed by user.');
    } else {
      console.error('[AUTH] Popup failed');
      console.error('[Google Auth Error]', {
        code: error?.code,
        message: error?.message,
        name: error?.name,
        customData: error?.customData,
      });
    }

    let friendlyMessage = 'Failed to sign in with Google. Please try again.';

    switch (error?.code) {
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
      default:
        if (error?.message) {
          friendlyMessage = error.message;
        }
        break;
    }

    const customErr = new Error(friendlyMessage);
    (customErr as any).code = error?.code;
    throw customErr;
  } finally {
    isPopupActive = false;
  }
};

export const logoutUser = async (): Promise<void> => {
  if (!isFirebaseConfigured) return;
  try {
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


