import { Channel, Playlist, UiPreferences } from '../models/types';

const BASE_KEYS = {
  PLAYLISTS: 'mana_tv_playlists',
  CHANNELS_PREFIX: 'mana_tv_channels_',
  ACTIVE_PLAYLIST_ID: 'mana_tv_active_playlist_id',
  FAVORITES: 'mana_tv_favorites',
  RECENTLY_WATCHED: 'mana_tv_recently_watched',
  HIDDEN_CHANNELS: 'mana_tv_hidden_channels',
  HIDDEN_CATEGORIES: 'mana_tv_hidden_categories',
  UI_PREFS: 'mana_tv_ui_preferences'
};

const DEFAULT_UI_PREFS: UiPreferences = {
  theme: 'DARK',
  accentColor: 'BLUE',
  cardSize: 'NORMAL',
  showLogos: true,
  welcomeAudioVolume: 150,
  welcomeAudioEnabled: true,
  autoRefreshHours: 0,
  isFirstRunCompleted: false
};

export class StorageService {
  private static currentUserId: string = 'guest';

  public static setScope(userId: string | null): void {
    this.currentUserId = userId && userId.trim() ? userId.trim() : 'guest';
  }

  public static getScope(): string {
    return this.currentUserId;
  }

  private static getKey(baseKey: string): string {
    return `${baseKey}_${this.currentUserId}`;
  }

  public static getUiPreferences(): UiPreferences {
    try {
      const data = localStorage.getItem(this.getKey(BASE_KEYS.UI_PREFS));
      if (data) {
        return { ...DEFAULT_UI_PREFS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load UI preferences:', e);
    }
    return DEFAULT_UI_PREFS;
  }

  public static saveUiPreferences(prefs: UiPreferences): void {
    try {
      localStorage.setItem(this.getKey(BASE_KEYS.UI_PREFS), JSON.stringify(prefs));
    } catch (e) {
      console.error('Failed to save UI preferences:', e);
    }
  }

  public static getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(this.getKey(BASE_KEYS.PLAYLISTS));
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to get playlists:', e);
    }
    return [];
  }

  public static savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(this.getKey(BASE_KEYS.PLAYLISTS), JSON.stringify(playlists));
    } catch (e) {
      console.error('Failed to save playlists:', e);
    }
  }

  public static getActivePlaylistId(): string | null {
    return localStorage.getItem(this.getKey(BASE_KEYS.ACTIVE_PLAYLIST_ID));
  }

  public static setActivePlaylistId(id: string | null): void {
    const key = this.getKey(BASE_KEYS.ACTIVE_PLAYLIST_ID);
    if (id) {
      localStorage.setItem(key, id);
    } else {
      localStorage.removeItem(key);
    }
  }

  public static getChannels(playlistId: string): Channel[] {
    try {
      const data = localStorage.getItem(`${this.getKey(BASE_KEYS.CHANNELS_PREFIX)}${playlistId}`);
      if (data) {
        const channels: Channel[] = JSON.parse(data);
        const favorites = this.getFavorites();
        return channels.map(ch => ({
          ...ch,
          isFavorite: favorites.includes(ch.id)
        }));
      }
    } catch (e) {
      console.error('Failed to get channels for playlist:', playlistId, e);
    }
    return [];
  }

  public static saveChannels(playlistId: string, channels: Channel[]): void {
    try {
      localStorage.setItem(`${this.getKey(BASE_KEYS.CHANNELS_PREFIX)}${playlistId}`, JSON.stringify(channels));
    } catch (e) {
      console.error('Failed to save channels:', e);
    }
  }

  public static removeChannels(playlistId: string): void {
    localStorage.removeItem(`${this.getKey(BASE_KEYS.CHANNELS_PREFIX)}${playlistId}`);
  }

  public static getFavorites(): string[] {
    try {
      const data = localStorage.getItem(this.getKey(BASE_KEYS.FAVORITES));
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to get favorites:', e);
    }
    return [];
  }

  public static toggleFavorite(channelId: string): boolean {
    const favs = this.getFavorites();
    const index = favs.indexOf(channelId);
    let isFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
      isFav = false;
    } else {
      favs.push(channelId);
      isFav = true;
    }
    try {
      localStorage.setItem(this.getKey(BASE_KEYS.FAVORITES), JSON.stringify(favs));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
    return isFav;
  }

  public static clearFavorites(): void {
    localStorage.setItem(this.getKey(BASE_KEYS.FAVORITES), JSON.stringify([]));
  }

  public static getRecentlyWatched(): Channel[] {
    try {
      const data = localStorage.getItem(this.getKey(BASE_KEYS.RECENTLY_WATCHED));
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to get recently watched:', e);
    }
    return [];
  }

  public static addRecentlyWatched(channel: Channel): void {
    const list = this.getRecentlyWatched().filter(c => c.id !== channel.id);
    const updated = [{ ...channel, watchedAt: Date.now() }, ...list].slice(0, 30);
    try {
      localStorage.setItem(this.getKey(BASE_KEYS.RECENTLY_WATCHED), JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recently watched:', e);
    }
  }

  public static clearRecentlyWatched(): void {
    localStorage.setItem(this.getKey(BASE_KEYS.RECENTLY_WATCHED), JSON.stringify([]));
  }

  public static getHiddenChannels(): string[] {
    try {
      const data = localStorage.getItem(this.getKey(BASE_KEYS.HIDDEN_CHANNELS));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to get hidden channels:', e);
    }
    return [];
  }

  public static hideChannel(channelId: string): void {
    const hidden = this.getHiddenChannels();
    if (!hidden.includes(channelId)) {
      hidden.push(channelId);
      localStorage.setItem(this.getKey(BASE_KEYS.HIDDEN_CHANNELS), JSON.stringify(hidden));
    }
  }

  public static unhideChannel(channelId: string): void {
    const hidden = this.getHiddenChannels().filter(id => id !== channelId);
    localStorage.setItem(this.getKey(BASE_KEYS.HIDDEN_CHANNELS), JSON.stringify(hidden));
  }

  public static unhideAllChannels(): void {
    localStorage.setItem(this.getKey(BASE_KEYS.HIDDEN_CHANNELS), JSON.stringify([]));
  }

  public static getHiddenCategories(): string[] {
    try {
      const data = localStorage.getItem(this.getKey(BASE_KEYS.HIDDEN_CATEGORIES));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to get hidden categories:', e);
    }
    return [];
  }

  public static hideCategory(categoryName: string): void {
    const hidden = this.getHiddenCategories();
    const catLower = categoryName.trim().toLowerCase();
    if (!hidden.map(c => c.toLowerCase()).includes(catLower)) {
      hidden.push(categoryName.trim());
      localStorage.setItem(this.getKey(BASE_KEYS.HIDDEN_CATEGORIES), JSON.stringify(hidden));
    }
  }

  public static unhideCategory(categoryName: string): void {
    const catLower = categoryName.trim().toLowerCase();
    const hidden = this.getHiddenCategories().filter(c => c.trim().toLowerCase() !== catLower);
    localStorage.setItem(this.getKey(BASE_KEYS.HIDDEN_CATEGORIES), JSON.stringify(hidden));
  }

  public static unhideAllCategories(): void {
    localStorage.setItem(this.getKey(BASE_KEYS.HIDDEN_CATEGORIES), JSON.stringify([]));
  }

  public static clearUserData(): void {
    const prefix = `mana_tv_`;
    const userSuffix = `_${this.currentUserId}`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix) && k.endsWith(userSuffix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }

  public static clearAllData(): void {
    localStorage.clear();
  }
}
