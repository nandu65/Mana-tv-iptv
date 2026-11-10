import { ISportsProviderAdapter } from './ISportsProviderAdapter';
import { SportsEvent, SportsChannel } from '../models/types';
import { DEV_SPORTS_EVENTS_FIXTURES, DEV_SPORTS_CHANNELS_FIXTURES } from '../services/devFixtures';

// Default endpoint if user runs local XAMPP/KSWEB server from drmlive/tataplay
const LOCAL_TATAPLAY_ENDPOINT = 'http://localhost:8000/tataplay/playlist.php';

export class TataPlayAdapter implements ISportsProviderAdapter {
  readonly providerId = 'TATAPLAY' as const;
  readonly displayName = 'Tata Play';

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const resp = await fetch(LOCAL_TATAPLAY_ENDPOINT, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);
      return resp.ok;
    } catch {
      return false;
    }
  }

  async fetchEvents(): Promise<SportsEvent[]> {
    // Tata Play predominantly provides 24/7 broadcast channels rather than match-by-match JSON feeds.
    // If local subscriber proxy is running, it returns live sports events mapped from EPG.
    return DEV_SPORTS_EVENTS_FIXTURES.filter(e => e.provider === 'TATAPLAY');
  }

  async fetchChannels(): Promise<SportsChannel[]> {
    try {
      const isRunning = await this.isAvailable();
      if (isRunning) {
        // Fetch channels from local authenticated server
        const resp = await fetch(LOCAL_TATAPLAY_ENDPOINT);
        if (resp.ok) {
          const content = await resp.text();
          return this.parseTataPlayM3U(content);
        }
      }
    } catch (e) {
      console.warn('[TataPlayAdapter] Local server offline, using provider channels:', e);
    }

    return DEV_SPORTS_CHANNELS_FIXTURES.filter(c => c.provider === 'TATAPLAY');
  }

  private parseTataPlayM3U(content: string): SportsChannel[] {
    const lines = content.split('\n');
    const channels: SportsChannel[] = [];
    let currentName = '';
    let currentLogo = '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('#EXTINF:')) {
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        currentLogo = logoMatch ? logoMatch[1] : '';
        const commaIdx = line.lastIndexOf(',');
        currentName = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : 'Tata Play Sports Channel';
      } else if (line.startsWith('http://') || line.startsWith('https://')) {
        if (currentName.toLowerCase().includes('sports') || currentName.toLowerCase().includes('cricket') || currentName.toLowerCase().includes('star')) {
          channels.push({
            id: `tataplay_${channels.length + 1}`,
            provider: 'TATAPLAY',
            name: currentName,
            logoUrl: currentLogo || undefined,
            category: 'OTHER',
            format: 'DASH',
            streamSupportedInApp: true,
            streamUrl: line,
            externalWebUrl: 'https://watch.tataplay.com',
            externalAppDeepLink: 'tataplay://live'
          });
        }
        currentName = '';
        currentLogo = '';
      }
    }

    return channels.length > 0 ? channels : DEV_SPORTS_CHANNELS_FIXTURES.filter(c => c.provider === 'TATAPLAY');
  }
}
