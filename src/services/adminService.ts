import {
  collection,
  collectionGroup,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { UserProfile } from '../types';

export interface AdminActivityItem {
  id: string;
  userId: string;
  type: string;
  section: string;
  itemId: string;
  createdAt: string;
  timestampRaw?: any;
  metadata?: Record<string, any>;
  userDisplayName?: string;
  userEmail?: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalActivities: number;
  notesOpened: number;
  wishesCollected: number;
  momentsOpened: number;
  openWhenOpened: number;
  secretsDiscovered: number;
  feelingsSubmitted: number;
  lettersSubmitted: number;
  badgesUnlocked: number;
}

export interface AdminUserItem extends UserProfile {
  activitySummary?: Record<string, any>;
  activityCount?: number;
}

/**
 * Fetch high-level admin metrics from Firestore data.
 */
export async function fetchAdminOverviewStats(): Promise<AdminOverviewStats> {
  const defaultStats: AdminOverviewStats = {
    totalUsers: 0,
    totalActivities: 0,
    notesOpened: 0,
    wishesCollected: 0,
    momentsOpened: 0,
    openWhenOpened: 0,
    secretsDiscovered: 0,
    feelingsSubmitted: 0,
    lettersSubmitted: 0,
    badgesUnlocked: 0,
  };

  if (!isFirebaseConfigured) return defaultStats;

  try {
    // 1. Fetch Users Count
    const usersSnap = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnap.size;

    // 2. Aggregate activity counts across user profiles or activity docs
    let totalActivities = 0;
    let notesOpened = 0;
    let wishesCollected = 0;
    let momentsOpened = 0;
    let openWhenOpened = 0;
    let secretsDiscovered = 0;
    let feelingsSubmitted = 0;
    let lettersSubmitted = 0;
    let badgesUnlocked = 0;

    // First sum up summaries from user profile docs if present
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const summary = data.activitySummary;
      if (summary) {
        notesOpened += summary.notesOpened || 0;
        wishesCollected += summary.wishesCollected || 0;
        momentsOpened += summary.momentsOpened || 0;
        openWhenOpened += summary.openWhenOpened || 0;
        secretsDiscovered += summary.secretsDiscovered || 0;
        feelingsSubmitted += summary.feelingsSubmitted || 0;
      }
    });

    // Query collection group for precise total activity count & detailed breakdowns
    try {
      const actQuery = query(collectionGroup(db, 'activity'), limit(500));
      const actSnap = await getDocs(actQuery);
      totalActivities = actSnap.size;

      let nOpen = 0;
      let wColl = 0;
      let mOpen = 0;
      let owOpen = 0;
      let sDisc = 0;
      let fSub = 0;
      let lSub = 0;
      let bUnl = 0;

      actSnap.forEach((docSnap) => {
        const data = docSnap.data();
        switch (data.type) {
          case 'note_opened':
            nOpen++;
            break;
          case 'wish_collected':
            wColl++;
            break;
          case 'moment_opened':
            mOpen++;
            break;
          case 'open_when_opened':
            owOpen++;
            break;
          case 'secret_discovered':
            sDisc++;
            break;
          case 'feeling_submitted':
            fSub++;
            break;
          case 'letter_submitted':
            lSub++;
            break;
          case 'badge_unlocked':
          case 'milestone_unlocked':
            bUnl++;
            break;
        }
      });

      if (totalActivities > 0) {
        notesOpened = Math.max(notesOpened, nOpen);
        wishesCollected = Math.max(wishesCollected, wColl);
        momentsOpened = Math.max(momentsOpened, mOpen);
        openWhenOpened = Math.max(openWhenOpened, owOpen);
        secretsDiscovered = Math.max(secretsDiscovered, sDisc);
        feelingsSubmitted = Math.max(feelingsSubmitted, fSub);
        lettersSubmitted = lSub;
        badgesUnlocked = bUnl;
      }
    } catch (actErr) {
      console.warn('Activity group query notice:', actErr);
    }

    return {
      totalUsers,
      totalActivities,
      notesOpened,
      wishesCollected,
      momentsOpened,
      openWhenOpened,
      secretsDiscovered,
      feelingsSubmitted,
      lettersSubmitted,
      badgesUnlocked,
    };
  } catch (error) {
    console.warn('Error fetching admin overview stats:', error);
    return defaultStats;
  }
}

/**
 * Fetch recent activity events across all users.
 */
export async function fetchAdminRecentActivity(
  filterType: string = 'all',
  maxCount: number = 50
): Promise<AdminActivityItem[]> {
  if (!isFirebaseConfigured) return [];

  try {
    const actGroupRef = collectionGroup(db, 'activity');
    let q = query(actGroupRef, orderBy('createdAt', 'desc'), limit(maxCount * 2));

    const snapshot = await getDocs(q);
    const items: AdminActivityItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      const docType = data.type || '';

      // Client-side filter matching to avoid composite index requirements
      if (filterType !== 'all') {
        if (filterType === 'notes' && docType !== 'note_opened') return;
        if (filterType === 'wishes' && docType !== 'wish_collected') return;
        if (filterType === 'moments' && docType !== 'moment_opened') return;
        if (filterType === 'open_when' && docType !== 'open_when_opened') return;
        if (filterType === 'feelings' && docType !== 'feeling_submitted') return;
        if (filterType === 'letters' && docType !== 'letter_submitted') return;
        if (filterType === 'secrets' && docType !== 'secret_discovered') return;
        if (filterType === 'achievements' && docType !== 'badge_unlocked' && docType !== 'milestone_unlocked') return;
        if (filterType === 'streaks' && docType !== 'streak_updated') return;
      }

      let dateString = 'Recently';
      if (data.createdAt?.toDate) {
        dateString = data.createdAt.toDate().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (data.createdAt?.seconds) {
        dateString = new Date(data.createdAt.seconds * 1000).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      items.push({
        id: docSnap.id,
        userId: data.userId || 'unknown',
        type: data.type || 'activity',
        section: data.section || 'general',
        itemId: data.itemId || '',
        createdAt: dateString,
        timestampRaw: data.createdAt,
        metadata: data.metadata || {},
      });
    });

    return items.slice(0, maxCount);
  } catch (error) {
    console.warn('Error fetching admin recent activity:', error);
    return [];
  }
}

/**
 * Fetch list of registered users.
 */
export async function fetchAdminUsers(maxCount: number = 50): Promise<AdminUserItem[]> {
  if (!isFirebaseConfigured) return [];

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(maxCount));
    const snapshot = await getDocs(q);

    const usersList: AdminUserItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let createdStr = 'Unknown';
      let lastSeenStr = 'Unknown';

      if (data.createdAt) {
        createdStr = new Date(data.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      if (data.lastSeenAt) {
        lastSeenStr = new Date(data.lastSeenAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      const summary = data.activitySummary || {};
      const totalActs =
        (summary.notesOpened || 0) +
        (summary.wishesCollected || 0) +
        (summary.momentsOpened || 0) +
        (summary.openWhenOpened || 0) +
        (summary.secretsDiscovered || 0) +
        (summary.feelingsSubmitted || 0);

      usersList.push({
        uid: data.uid || docSnap.id,
        displayName: data.displayName || 'Anonymous User',
        email: data.email || 'No email',
        photoURL: data.photoURL || undefined,
        role: data.role || 'user',
        createdAt: createdStr,
        lastSeenAt: lastSeenStr,
        activitySummary: summary,
        activityCount: totalActs,
      });
    });

    return usersList;
  } catch (error) {
    console.warn('Error fetching admin users list:', error);
    return [];
  }
}
