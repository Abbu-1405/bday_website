export type BtsItemType = 'image' | 'video' | 'audio' | 'pdf' | 'html';

export type BtsFilterCategory = 'all' | 'photos' | 'videos' | 'audio' | 'pdfs' | 'html';

export interface BtsItem {
  id: string;
  title: string;
  type: BtsItemType;
  path: string;
  thumbnail: string;
  caption: string;
  date: string;
  tags: string[];
  downloadable: boolean;
  fileSize?: string;
  duration?: string;
  htmlContent?: string;
  authorNote?: string;
}

export type BtsActivityType =
  | 'bts_page_open'
  | 'bts_item_open'
  | 'bts_video_play'
  | 'bts_audio_play'
  | 'bts_random'
  | 'bts_html_open_external';

export interface BtsActivityEvent {
  id: string;
  userId: string;
  eventType: BtsActivityType;
  itemId: string;
  itemTitle?: string;
  itemType?: BtsItemType;
  createdAt: string;
  timestampRaw?: any;
  metadata?: Record<string, any>;
  userDisplayName?: string;
  userEmail?: string;
  userPhotoURL?: string;
}

export interface BtsUserSummary {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  firstVisit: string;
  lastVisit: string;
  firstVisitRaw?: any;
  lastVisitRaw?: any;
  totalVisits: number;
  totalItemsOpened: number;
  totalPlays: number;
  totalRandomClicks: number;
  itemInteractions: Record<string, {
    itemId: string;
    itemTitle: string;
    itemType: BtsItemType;
    openCount: number;
    playCount: number;
    firstInteracted: string;
    lastInteracted: string;
  }>;
}

export interface BtsAdminOverviewStats {
  totalUsers: number;
  totalVisits: number;
  totalItemsOpened: number;
  totalPlays: number;
  totalRandoms: number;
  mostActiveUser?: {
    userId: string;
    displayName: string;
    email: string;
    visitCount: number;
    itemsOpened: number;
  };
  mostPopularItem?: {
    itemId: string;
    itemTitle: string;
    itemType: BtsItemType;
    openCount: number;
  };
  formatBreakdown: {
    photos: number;
    videos: number;
    audio: number;
    pdfs: number;
    html: number;
  };
}
