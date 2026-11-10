import { ISportsProviderAdapter } from './ISportsProviderAdapter';
import { SportsEvent, SportsChannel, SportsCategory, EventStatus } from '../models/types';
import { DEV_SPORTS_EVENTS_FIXTURES, DEV_SPORTS_CHANNELS_FIXTURES } from '../services/devFixtures';

const FANCODE_JSON_URL = 'https://raw.githubusercontent.com/drmlive/fancode-live-events/main/fancode.json';

export class FanCodeAdapter implements ISportsProviderAdapter {
  readonly providerId = 'FANCODE' as const;
  readonly displayName = 'FanCode';

  async isAvailable(): Promise<boolean> {
    try {
      const resp = await fetch(FANCODE_JSON_URL, { method: 'HEAD', cache: 'no-cache' });
      return resp.ok;
    } catch {
      return false;
    }
  }

  async fetchEvents(): Promise<SportsEvent[]> {
    try {
      const response = await fetch(FANCODE_JSON_URL, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching FanCode catalogue`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.matches)) {
        return DEV_SPORTS_EVENTS_FIXTURES.filter(e => e.provider === 'FANCODE');
      }

      const events: SportsEvent[] = data.matches.map((item: any) => {
        const id = `fancode_${item.match_id || Math.random().toString(36).substring(7)}`;
        const category = this.normalizeCategory(item.event_category);
        const status = this.normalizeStatus(item.status);
        const startTime = this.parseDate(item.startTime);

        // Check if legitimately playable or requires official subscription
        const streamUrl = item.stream_url || item.dai_url || item.video_url;
        const isPlayable = Boolean(streamUrl && status === 'LIVE' && !streamUrl.includes('placeholder'));

        return {
          id,
          provider: 'FANCODE' as const,
          title: item.match_name || item.title || 'FanCode Live Match',
          tournamentName: item.event_name || 'FanCode Event',
          category,
          status,
          startTime,
          format: 'HLS' as const,
          language: 'ENG',
          posterUrl: item.src || undefined,
          homeTeam: item.team_1 ? { name: item.team_1, shortName: item.team_1 } : undefined,
          awayTeam: item.team_2 ? { name: item.team_2, shortName: item.team_2 } : undefined,
          streamSupportedInApp: isPlayable,
          streamUrl: isPlayable ? streamUrl : undefined,
          externalWebUrl: 'https://www.fancode.com',
          externalAppDeepLink: `fancode://match/${item.match_id || ''}`,
          lastUpdated: Date.now()
        };
      });

      return events.length > 0 ? events : DEV_SPORTS_EVENTS_FIXTURES.filter(e => e.provider === 'FANCODE');
    } catch (err) {
      console.warn('[FanCodeAdapter] Live feed unavailable, falling back to fixtures:', err);
      return DEV_SPORTS_EVENTS_FIXTURES.filter(e => e.provider === 'FANCODE');
    }
  }

  async fetchChannels(): Promise<SportsChannel[]> {
    return DEV_SPORTS_CHANNELS_FIXTURES.filter(c => c.provider === 'FANCODE');
  }

  private normalizeCategory(catStr?: string): SportsCategory {
    if (!catStr) return 'OTHER';
    const lower = catStr.toLowerCase();
    if (lower.includes('cricket')) return 'CRICKET';
    if (lower.includes('football') || lower.includes('soccer')) return 'FOOTBALL';
    if (lower.includes('racing') || lower.includes('f1') || lower.includes('motor')) return 'RACING';
    if (lower.includes('tennis')) return 'TENNIS';
    if (lower.includes('basketball')) return 'BASKETBALL';
    if (lower.includes('combat') || lower.includes('ufc') || lower.includes('wwe')) return 'COMBAT';
    return 'OTHER';
  }

  private normalizeStatus(statusStr?: string): EventStatus {
    if (!statusStr) return 'UPCOMING';
    const upper = statusStr.toUpperCase();
    if (upper === 'LIVE') return 'LIVE';
    if (upper === 'COMPLETED' || upper === 'ENDED' || upper === 'FINISHED') return 'COMPLETED';
    return 'UPCOMING';
  }

  private parseDate(dateStr?: string): number {
    if (!dateStr) return Date.now();
    try {
      // Date strings like "01:40:00 PM 10-11-2026"
      const parts = dateStr.split(' ');
      if (parts.length === 3) {
        const timePart = parts[0];
        const amPm = parts[1];
        const datePart = parts[2];
        const [day, month, year] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');

        let hour = parseInt(hours, 10);
        if (amPm.toUpperCase() === 'PM' && hour < 12) hour += 12;
        if (amPm.toUpperCase() === 'AM' && hour === 12) hour = 0;

        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), hour, parseInt(minutes, 10), parseInt(seconds || '0', 10));
        return date.getTime();
      }
      return Date.parse(dateStr) || Date.now();
    } catch {
      return Date.now();
    }
  }
}
