import { SportsEvent, SportsChannel, SportsProvider } from '../models/types';

export interface ISportsProviderAdapter {
  readonly providerId: Exclude<SportsProvider, 'ALL'>;
  readonly displayName: string;
  isAvailable(): Promise<boolean>;
  fetchEvents(): Promise<SportsEvent[]>;
  fetchChannels(): Promise<SportsChannel[]>;
}

