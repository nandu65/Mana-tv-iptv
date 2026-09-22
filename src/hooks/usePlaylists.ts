import { useState, useEffect, useCallback } from 'react';
import { Playlist, Channel } from '../models/types';
import { PlaylistService } from '../services/playlistService';
import { StorageService } from '../services/storageService';

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => StorageService.getPlaylists());
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(() => StorageService.getActivePlaylistId());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePlaylist = playlists.find(p => p.id === activePlaylistId) || (playlists.length > 0 ? playlists[0] : null);

  useEffect(() => {
    if (!activePlaylistId && playlists.length > 0) {
      setActivePlaylistId(playlists[0].id);
      StorageService.setActivePlaylistId(playlists[0].id);
    }
  }, [playlists, activePlaylistId]);

  const selectPlaylist = useCallback((id: string) => {
    setActivePlaylistId(id);
    StorageService.setActivePlaylistId(id);
  }, []);

  const loadFromUrl = useCallback(async (name: string, url: string): Promise<Playlist> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await PlaylistService.loadFromUrl(name, url);
      setPlaylists(StorageService.getPlaylists());
      setActivePlaylistId(result.playlist.id);
      return result.playlist;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load playlist from URL';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromContent = useCallback(async (name: string, content: string, sourceType: 'file' | 'sample'): Promise<Playlist> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await PlaylistService.loadFromContent(name, content, sourceType);
      setPlaylists(StorageService.getPlaylists());
      setActivePlaylistId(result.playlist.id);
      return result.playlist;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to parse playlist file';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSample = useCallback(async (): Promise<Playlist> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await PlaylistService.loadSamplePlaylist();
      setPlaylists(StorageService.getPlaylists());
      setActivePlaylistId(result.playlist.id);
      return result.playlist;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load sample demo';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshPlaylist = useCallback(async (playlistId: string): Promise<Channel[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const channels = await PlaylistService.refreshPlaylist(playlistId);
      setPlaylists(StorageService.getPlaylists());
      return channels;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to refresh playlist';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    PlaylistService.deletePlaylist(playlistId);
    const updated = StorageService.getPlaylists();
    setPlaylists(updated);
    const newActiveId = StorageService.getActivePlaylistId();
    setActivePlaylistId(newActiveId);
  }, []);

  return {
    playlists,
    activePlaylist,
    activePlaylistId,
    isLoading,
    error,
    selectPlaylist,
    loadFromUrl,
    loadFromContent,
    loadSample,
    refreshPlaylist,
    deletePlaylist
  };
}