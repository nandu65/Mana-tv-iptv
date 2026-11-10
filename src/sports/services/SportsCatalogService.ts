import { SportsEvent, SportsChannel, SportsProvider, ProviderMeta } from '../models/types';
import { ISportsProviderAdapter } from '../providers/ISportsProviderAdapter';
import { FanCodeAdapter } from '../providers/FanCodeAdapter';
import { SonyLIVAdapter } from '../providers/SonyLIVAdapter';
import { TataPlayAdapter } from '../providers/TataPlayAdapter';
import { WillowAdapter } from '../providers/WillowAdapter';
import { JioHotstarAdapter } from '../providers/JioHotstarAdapter';
import { StorageService } from '../../services/storageService';

export const PROVIDERS_META: ProviderMeta[] = [
  {
    id: 'ALL',
    name: 'All Providers',
    badgeColor: '#3b82f6',
    logoText: 'ALL',
    webUrl: ''
  },
  {
    id: 'FANCODE',
    name: 'FanCode',
    badgeColor: '#f97316',
    logoText: 'FC',
    webUrl: 'https://www.fancode.com'
  },
  {
    id: 'SONYLIV',
    name: 'SonyLIV',
    badgeColor: '#0ea5e9',
    logoText: 'SONY',
    webUrl: 'https://www.sonyliv.com'
  },
  {
    id: 'JIOHOTSTAR',
    name: 'JioHotstar',
    badgeColor: '#e11d48',
    logoText: 'JIO',
    webUrl: 'https://www.hotstar.com'
  },
  {
    id: 'TATAPLAY',
    name: 'Tata Play',
    badgeColor: '#8b5cf6',
    logoText: 'TP',
    webUrl: 'https://www.tataplay.com'
  },
  {
    id: 'WILLOW',
    name: 'Willow',
    badgeColor: '#10b981',
    logoText: 'W',
    webUrl: 'https://www.willow.tv'
  }
];

const CACHE_KEY_EVENTS = 'mana_tv_sports_events_cache';
const CACHE_KEY_CHANNELS = 'mana_tv_sports_channels_cache';

export class SportsCatalogService {
  private static adapters: Map<string, ISportsProviderAdapter> = new Map<string, ISportsProviderAdapter>([
    ['FANCODE', new FanCodeAdapter()],
    ['SONYLIV', new SonyLIVAdapter()],
    ['JIOHOTSTAR', new JioHotstarAdapter()],
    ['TATAPLAY', new TataPlayAdapter()],
    ['WILLOW', new WillowAdapter()]
  ]);

  /**
   * Load cached events or fetch fresh from adapters
   */
  public static async getAllEvents(forceRefresh: boolean = false): Promise<SportsEvent[]> {
    const scope = StorageService.getScope();
    const cacheKey = `${CACHE_KEY_EVENTS}_${scope}`;

    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as SportsEvent[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.warn('[SportsCatalogService] Cache read error:', e);
        }
      }
    }

    const allEvents: SportsEvent[] = [];
    for (const adapter of this.adapters.values()) {
      try {
        const events = await adapter.fetchEvents();
        allEvents.push(...events);
      } catch (err) {
        console.error(`[SportsCatalogService] Error fetching from ${adapter.displayName}:`, err);
      }
    }

    // Save to isolated cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify(allEvents));
    } catch (e) {
      console.warn('[SportsCatalogService] Cache write error:', e);
    }

    return allEvents;
  }

  /**
   * Load cached channels or fetch fresh from adapters
   */
  public static async getAllChannels(forceRefresh: boolean = false): Promise<SportsChannel[]> {
    const scope = StorageService.getScope();
    const cacheKey = `${CACHE_KEY_CHANNELS}_${scope}`;

    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as SportsChannel[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.warn('[SportsCatalogService] Channels cache read error:', e);
        }
      }
    }

    const allChannels: SportsChannel[] = [];
    for (const adapter of this.adapters.values()) {
      try {
        const channels = await adapter.fetchChannels();
        allChannels.push(...channels);
      } catch (err) {
        console.error(`[SportsCatalogService] Error fetching channels from ${adapter.displayName}:`, err);
      }
    }

    try {
      localStorage.setItem(cacheKey, JSON.stringify(allChannels));
    } catch (e) {
      console.warn('[SportsCatalogService] Channels cache write error:', e);
    }

    return allChannels;
  }

  /**
   * Refresh specific provider independently
   */
  public static async refreshProvider(provider: Exclude<SportsProvider, 'ALL'>): Promise<SportsEvent[]> {
    const adapter = this.adapters.get(provider);
    if (!adapter) return [];

    const newEvents = await adapter.fetchEvents();
    const existingEvents = await this.getAllEvents(false);
    const updated = [
      ...existingEvents.filter(e => e.provider !== provider),
      ...newEvents
    ];

    const scope = StorageService.getScope();
    localStorage.setItem(`${CACHE_KEY_EVENTS}_${scope}`, JSON.stringify(updated));
    return updated;
  }
}
