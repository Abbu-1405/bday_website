import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  createdAt?: string;
  lastSeenAt?: string;
  activitySummary?: Record<string, any>;
}

export interface AuthContextType {
  authenticated: boolean;
  currentUser: User | null;
  user: User | null;
  userId: string | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

