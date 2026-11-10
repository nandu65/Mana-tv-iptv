export type SportsProvider = 'ALL' | 'FANCODE' | 'SONYLIV' | 'TATAPLAY' | 'WILLOW' | 'JIOHOTSTAR';

export type SportsCategory = 'CRICKET' | 'FOOTBALL' | 'RACING' | 'TENNIS' | 'BASKETBALL' | 'COMBAT' | 'OTHER';

export type EventStatus = 'LIVE' | 'UPCOMING' | 'COMPLETED';

export interface TeamInfo {
  name: string;
  shortName?: string;
  logoUrl?: string;
  score?: string;
}

export interface SportsEvent {
  id: string;
  provider: 'FANCODE' | 'SONYLIV' | 'TATAPLAY' | 'WILLOW' | 'JIOHOTSTAR';
  title: string;
  tournamentName: string;
  category: SportsCategory;
  status: EventStatus;
  startTime: number; // Unix timestamp in milliseconds
  endTime?: number;
  language?: string;
  format?: 'HLS' | 'DASH';
  posterUrl?: string;
  thumbnailUrl?: string;
  homeTeam?: TeamInfo;
  awayTeam?: TeamInfo;
  venue?: string;
  streamSupportedInApp: boolean;
  streamUrl?: string;
  externalWebUrl: string;
  externalAppDeepLink?: string;
  lastUpdated: number;
}

export interface SportsChannel {
  id: string;
  provider: 'FANCODE' | 'SONYLIV' | 'TATAPLAY' | 'WILLOW' | 'JIOHOTSTAR';
  name: string;
  logoUrl?: string;
  category: SportsCategory;
  language?: string;
  format?: 'HLS' | 'DASH';
  currentProgram?: string;
  streamSupportedInApp: boolean;
  streamUrl?: string;
  externalWebUrl?: string;
  externalAppDeepLink?: string;
}

export interface ProviderMeta {
  id: SportsProvider;
  name: string;
  badgeColor: string;
  logoText: string;
  logoUrl?: string;
  webUrl: string;
}

