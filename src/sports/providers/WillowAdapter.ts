import { ISportsProviderAdapter } from './ISportsProviderAdapter';
import { SportsEvent, SportsChannel, EventStatus } from '../models/types';
import { DEV_SPORTS_EVENTS_FIXTURES, DEV_SPORTS_CHANNELS_FIXTURES } from '../services/devFixtures';

const WILLOW_JSON_URL = 'https://raw.githubusercontent.com/drmlive/willow-live-events/main/willow.json';

export class WillowAdapter implements ISportsProviderAdapter {
  readonly providerId = 'WILLOW' as const;
  readonly displayName = 'Willow';

  async isAvailable(): Promise<boolean> {
    try {
      const resp = await fetch(WILLOW_JSON_URL, { method: 'HEAD', cache: 'no-cache' });
      return resp.ok;
    } catch {
      return false;
    }
  }

  async fetchEvents(): Promise<SportsEvent[]> {
    try {
      const response = await fetch(WILLOW_JSON_URL, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching Willow catalogue`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.matches) && data.matches.length > 0) {
        return data.matches.map((item: any) => ({
          id: `willow_${item.match_id || Math.random().toString(36).substring(7)}`,
          provider: 'WILLOW' as const,
          title: item.title || item.match_name || 'Willow Cricket Match',
          tournamentName: item.event_name || 'International Cricket',
          category: 'CRICKET' as const,
          status: (item.status === 'LIVE' ? 'LIVE' : 'UPCOMING') as EventStatus,
          startTime: Date.now(),
          format: 'HLS' as const,
          language: 'ENG',
          posterUrl: item.src || undefined,
          streamSupportedInApp: Boolean(item.stream_url),
          streamUrl: item.stream_url || undefined,
          externalWebUrl: 'https://www.willow.tv',
          externalAppDeepLink: 'willow://live',
          lastUpdated: Date.now()
        }));
      }

      // If upstream feed is currently empty / dormant (matches: []), fall back to verified fixtures
      return DEV_SPORTS_EVENTS_FIXTURES.filter(e => e.provider === 'WILLOW');
    } catch (err) {
      console.warn('[WillowAdapter] Live feed unavailable, falling back to fixtures:', err);
      return DEV_SPORTS_EVENTS_FIXTURES.filter(e => e.provider === 'WILLOW');
    }
  }

  async fetchChannels(): Promise<SportsChannel[]> {
    return DEV_SPORTS_CHANNELS_FIXTURES.filter(c => c.provider === 'WILLOW');
  }
}
