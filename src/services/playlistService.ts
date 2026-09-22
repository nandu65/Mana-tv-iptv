import { Channel, Playlist } from '../models/types';
import { M3uParser } from './m3uParser';
import { DEFAULT_MANA_TV_URL, DEFAULT_MANA_TV_NAME, SAMPLE_M3U_CONTENT } from './sampleData';
import { StorageService } from './storageService';

export class PlaylistService {
  public static async loadFromUrl(name: string, url: string): Promise<{ playlist: Playlist; channels: Channel[] }> {
    const cleanUrl = url.trim();
    let content = '';

    try {
      const response = await fetch(cleanUrl, {
        headers: { 'Accept': '*/*' }
      });
      if (response.ok) {
        content = await response.text();
      }
    } catch (e) {
      console.warn('Direct fetch failed, attempting CORS proxy...', e);
    }

    if (!content) {
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`
      ];

      for (const proxyUrl of proxies) {
        try {
          const resp = await fetch(proxyUrl);
          if (resp.ok) {
            content = await resp.text();
            if (content && (content.includes('#EXTINF') || content.includes('#EXTM3U'))) {
              break;
            }
          }
        } catch {
          // Continue to next proxy
        }
      }
    }

    if (!content || (!content.includes('#EXTINF') && !content.includes('#EXTM3U'))) {
      throw new Error('Could not download or parse valid M3U playlist from the provided URL. Please check connection.');
    }

    const playlistId = 'pl_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const channels = M3uParser.parse(content, playlistId);

    if (channels.length === 0) {
      throw new Error('No playable channels found in the playlist.');
    }

    const playlist: Playlist = {
      id: playlistId,
      name: name.trim() || 'Remote Playlist',
      sourceType: 'url',
      sourceUrl: cleanUrl,
      channelCount: channels.length,
      lastRefreshed: Date.now()
    };

    const allPlaylists = StorageService.getPlaylists();
    allPlaylists.push(playlist);
    StorageService.savePlaylists(allPlaylists);
    StorageService.saveChannels(playlistId, channels);
    StorageService.setActivePlaylistId(playlistId);

    return { playlist, channels };
  }

  public static async loadFromContent(name: string, content: string, sourceType: 'file' | 'sample'): Promise<{ playlist: Playlist; channels: Channel[] }> {
    const playlistId = 'pl_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const channels = M3uParser.parse(content, playlistId);

    if (channels.length === 0) {
      throw new Error('No valid channels found in the playlist content.');
    }

    const playlist: Playlist = {
      id: playlistId,
      name: name.trim() || (sourceType === 'sample' ? 'Sample Demo Playlist' : 'Local File Playlist'),
      sourceType,
      channelCount: channels.length,
      lastRefreshed: Date.now()
    };

    const allPlaylists = StorageService.getPlaylists();
    allPlaylists.push(playlist);
    StorageService.savePlaylists(allPlaylists);
    StorageService.saveChannels(playlistId, channels);
    StorageService.setActivePlaylistId(playlistId);

    return { playlist, channels };
  }

  public static async loadDefaultManaTvPlaylist(): Promise<{ playlist: Playlist; channels: Channel[] }> {
    try {
      return await this.loadFromUrl(DEFAULT_MANA_TV_NAME, DEFAULT_MANA_TV_URL);
    } catch (e) {
      console.warn('Failed to load online Mana TV M3U, falling back to local seed:', e);
      return await this.loadFromContent(DEFAULT_MANA_TV_NAME, SAMPLE_M3U_CONTENT, 'sample');
    }
  }

  public static async loadSamplePlaylist(): Promise<{ playlist: Playlist; channels: Channel[] }> {
    return this.loadDefaultManaTvPlaylist();
  }

  public static async refreshPlaylist(playlistId: string): Promise<Channel[]> {
    const playlists = StorageService.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);

    if (!playlist || playlist.sourceType !== 'url' || !playlist.sourceUrl) {
      throw new Error('This playlist cannot be refreshed automatically.');
    }

    const currentChannels = StorageService.getChannels(playlistId);
    const favoriteUrls = new Set(currentChannels.filter(c => c.isFavorite).map(c => c.url.trim()));

    const { channels } = await this.loadFromUrl(playlist.name, playlist.sourceUrl);

    const updatedChannels = channels.map(ch => ({
      ...ch,
      isFavorite: favoriteUrls.has(ch.url.trim())
    }));

    const updatedPlaylists = StorageService.getPlaylists().map(p => {
      if (p.id === playlistId) {
        return { ...p, channelCount: updatedChannels.length, lastRefreshed: Date.now() };
      }
      return p;
    });

    StorageService.savePlaylists(updatedPlaylists);
    StorageService.saveChannels(playlistId, updatedChannels);

    return updatedChannels;
  }

  public static deletePlaylist(playlistId: string): void {
    const playlists = StorageService.getPlaylists().filter(p => p.id !== playlistId);
    StorageService.savePlaylists(playlists);
    StorageService.removeChannels(playlistId);

    const activeId = StorageService.getActivePlaylistId();
    if (activeId === playlistId) {
      StorageService.setActivePlaylistId(playlists.length > 0 ? playlists[0].id : null);
    }
  }
}
