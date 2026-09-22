export type AppTheme = 'DARK' | 'OLED_BLACK' | 'BLUE';
export type AccentColor = 'BLUE' | 'PURPLE' | 'GREEN' | 'RED';
export type CardSize = 'COMPACT' | 'NORMAL' | 'LARGE';
export type AspectRatioMode = 'FIT' | 'FILL' | 'STRETCH' | '16_9' | '4_3';

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  country?: string;
  language?: string;
  channelNo?: number;
  isFavorite?: boolean;
  playlistId: string;
  watchedAt?: number;
}

export interface Playlist {
  id: string;
  name: string;
  sourceType: 'url' | 'file' | 'sample';
  sourceUrl?: string;
  channelCount: number;
  lastRefreshed: number;
}

export interface HiddenItem {
  id: string;
  name: string;
  groupTitle?: string;
  type: 'channel' | 'category';
  hiddenAt: number;
}

export interface UiPreferences {
  theme: AppTheme;
  accentColor: AccentColor;
  cardSize: CardSize;
  showLogos: boolean;
  welcomeAudioVolume: number; // 0 - 150
  welcomeAudioEnabled: boolean;
  autoRefreshHours: number; // 0 = off, 1, 3, 6, 12, 24
  isFirstRunCompleted: boolean;
}

export interface PlayerQuality {
  height: number;
  bitrate: number;
  label: string;
  levelIndex: number;
}

export interface AudioTrack {
  id: number;
  name: string;
  lang?: string;
  label: string;
}

export interface SubtitleTrack {
  id: number;
  name: string;
  lang?: string;
  label: string;
}

export interface StreamMetrics {
  resolution?: string;
  bitrateKbps?: number;
  bufferLengthSec?: number;
  droppedFrames?: number;
  codec?: string;
  fps?: number;
}