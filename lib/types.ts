export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'unknown';

export interface VideoFormat {
  formatId: string;
  quality: string;
  ext: string;
  hasAudio: boolean;
  hasVideo: boolean;
  height: number;
  filesizeApproxBytes: number | null;
  isProgressive: boolean;
}

export interface ResolveResponse {
  success: boolean;
  requestId: string;
  cached?: boolean;
  platform?: Platform;
  title?: string;
  thumbnail?: string | null;
  author?: string | null;
  durationSeconds?: number | null;
  formats?: VideoFormat[];
  sourceUrl?: string;
  error?: string;
}

export interface HistoryItem {
  _id: string;
  originalUrl: string;
  platform: Platform;
  title: string | null;
  thumbnail: string | null;
  author: string | null;
  status: 'success' | 'failed';
  createdAt: string;
}

export interface HistoryResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: HistoryItem[];
  error?: string;
}
