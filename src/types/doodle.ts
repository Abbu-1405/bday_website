export interface DoodlePoint {
  x: number;
  y: number;
  pressure?: number;
}

export type DoodleTool = 'pen' | 'eraser';

export interface DoodleStroke {
  points: DoodlePoint[];
  color: string;
  width: number;
  tool: DoodleTool;
}

export type DoodleSection = 'what-am-i-to-you' | 'your-reflections';

export interface DoodleItem {
  id: string;
  userId: string;
  section: DoodleSection;
  title?: string;
  strokes: DoodleStroke[];
  thumbnailDataUrl?: string; // Transparent PNG data URL for quick preview
  canvasWidth?: number;
  canvasHeight?: number;
  createdAt: string;
  updatedAt: string;
  userDisplayName?: string;
  userEmail?: string;
  userPhotoURL?: string;
  syncedToCloud?: boolean;
}
