import { ISportsProviderAdapter } from './ISportsProviderAdapter';
import { SportsEvent, SportsChannel, SportsCategory, EventStatus } from '../models/types';
import { DEV_SPORTS_EVENTS_FIXTURES, DEV_SPORTS_CHANNELS_FIXTURES } from '../services/devFixtures';

const SONYLIV_JSON_URL = 'https://raw.githubusercontent.com/drmlive/sliv-live-events/main/sonyliv.json';

export class SonyLIVAdapter implements ISportsProviderAdapter {
  readonly providerId = 'SONYLIV' as const;
  readonly displayName = 'SonyLIV';

  async isAvailable(): Promise<boolean> {
    try {
      const resp = await fetch(SONYLIV_JSON_URL, { method: 'HEAD', cache: 'no-cache' });
      return resp.ok;
    } catch {
      return false;
    }
  }

  async fetchEvents(): Promise<SportsEvent[]> {
    try {
      const response = await fetch(SONYLIV_JSON_URL, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching SonyLIV catalogue`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.matches)) {
        return DEV_SPORTS_EVENTS_FIXTURES.filter(e => e.provider === 'SONYLIV');
      }

      const events: SportsEvent[] = data.matches.map((item: any) => {
        const id = `sonyliv_${item.contentId || Math.random().toString(36).substring(7)}`;
        const category = this.normalizeCategory(item.event_category);
        const isLive = Boolean(item.isLive);
        const status: EventStatus = isLive ? 'LIVE' : 'UPCOMING';

        // Check token expiration for signed URLs
        const streamUrl = item.video_url || item.dai_url || item.pub_url;
        const isTokenValid = this.validateTokenExpiration(streamUrl);
        const isPlayable = Boolean(streamUrl && isLive && isTokenValid);

        return {
          id,
          provider: 'SONYLIV' as const,
          title: item.match_name || 'SonyLIV Sports Event',
          tournamentName: item.event_name || 'SonyLIV Tournament',
          category,
          status,
          startTime: Date.now(),
          format: 'HLS' as const,
          language: item.audioLanguageName || 'ENG',
          posterUrl: item.src || undefined,
          streamSupportedInApp: isPlayable,
          streamUrl: isPlayable ? streamUrl : undefined,
          externalWebUrl: 'https://www.sonyliv.com/sports',
          externalAppDeepLink: `sonyliv://live/${item.contentId || ''}`,
          lastUpdated: Date.now()
        };
      });

      return events.length > 0 ? events : DEV_SPORTS_EVENTS_FIXTURES.filter(e => e.provider === 'SONYLIV');
    } catch (err) {
      console.warn('[SonyLIVAdapter] Live feed unavailable, falling back to fixtures:', err);
      return DEV_SPORTS_EVENTS_FIXTURES.filter(e => e.provider === 'SONYLIV');
    }
  }

  async fetchChannels(): Promise<SportsChannel[]> {
    return DEV_SPORTS_CHANNELS_FIXTURES.filter(c => c.provider === 'SONYLIV');
  }

  private normalizeCategory(catStr?: string): SportsCategory {
    if (!catStr) return 'OTHER';
    const lower = catStr.toLowerCase();
    if (lower.includes('cricket')) return 'CRICKET';
    if (lower.includes('football') || lower.includes('uefa')) return 'FOOTBALL';
    if (lower.includes('tennis')) return 'TENNIS';
    if (lower.includes('racing') || lower.includes('f1')) return 'RACING';
    return 'OTHER';
  }

  private validateTokenExpiration(url?: string): boolean {
    if (!url) return false;
    // Extract exp=... timestamp from Akamai EdgeAuth or CDN URL
    const match = url.match(/exp=(\d+)/);
    if (match && match[1]) {
      const expSec = parseInt(match[1], 10);
      const nowSec = Math.floor(Date.now() / 1000);
      return expSec > nowSec; // Must not be expired
    }
    return true;
  }
}
