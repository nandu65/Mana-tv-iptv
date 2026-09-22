import { useState, useEffect, useMemo, useCallback } from 'react';
import { Channel } from '../models/types';
import { StorageService } from '../services/storageService';

export function useChannels(activePlaylistId: string | null) {
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hiddenChannelIds, setHiddenChannelIds] = useState<string[]>(() => StorageService.getHiddenChannels());
  const [hiddenCategoryNames, setHiddenCategoryNames] = useState<string[]>(() => StorageService.getHiddenCategories());
  const [recentlyWatched, setRecentlyWatched] = useState<Channel[]>(() => StorageService.getRecentlyWatched());

  // Reload channels when activePlaylistId changes
  useEffect(() => {
    if (activePlaylistId) {
      const channels = StorageService.getChannels(activePlaylistId);
      setAllChannels(channels);
    } else {
      setAllChannels([]);
    }
    setSelectedCategory('ALL');
  }, [activePlaylistId]);

  // Sync hidden state
  const refreshHiddenState = useCallback(() => {
    setHiddenChannelIds(StorageService.getHiddenChannels());
    setHiddenCategoryNames(StorageService.getHiddenCategories());
  }, []);

  const refreshRecentlyWatched = useCallback(() => {
    setRecentlyWatched(StorageService.getRecentlyWatched());
  }, []);

  // Filter out hidden channels and hidden categories
  const visibleChannels = useMemo(() => {
    const hiddenCatSet = new Set(hiddenCategoryNames.map(c => c.toLowerCase()));
    const hiddenChanSet = new Set(hiddenChannelIds);

    return allChannels.filter(ch => {
      if (hiddenChanSet.has(ch.id)) return false;
      if (hiddenCatSet.has((ch.group || '').toLowerCase())) return false;
      return true;
    });
  }, [allChannels, hiddenChannelIds, hiddenCategoryNames]);

  // Extract categories with counts
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    visibleChannels.forEach(ch => {
      const grp = ch.group || 'General';
      map.set(grp, (map.get(grp) || 0) + 1);
    });

    const list: { id: string; name: string; count: number }[] = [];
    map.forEach((count, name) => {
      list.push({ id: name, name, count });
    });

    list.sort((a, b) => b.count - a.count);
    return list;
  }, [visibleChannels]);

  // Favorites count
  const favoritesCount = useMemo(() => {
    return visibleChannels.filter(c => c.isFavorite).length;
  }, [visibleChannels]);

  // Filter channels based on selected category & search query
  const displayedChannels = useMemo(() => {
    let result = visibleChannels;

    if (selectedCategory === 'FAVORITES') {
      result = result.filter(c => c.isFavorite);
    } else if (selectedCategory === 'RECENT') {
      result = recentlyWatched;
    } else if (selectedCategory !== 'ALL') {
      result = result.filter(c => (c.group || 'General') === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.group && c.group.toLowerCase().includes(q)) ||
        (c.channelNo && c.channelNo.toString().includes(q))
      );
    }

    return result;
  }, [visibleChannels, selectedCategory, searchQuery, recentlyWatched]);

  const toggleFavorite = useCallback((channelId: string) => {
    const isFav = StorageService.toggleFavorite(channelId);
    setAllChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, isFavorite: isFav } : ch));
    setRecentlyWatched(prev => prev.map(ch => ch.id === channelId ? { ...ch, isFavorite: isFav } : ch));
  }, []);

  const hideChannel = useCallback((channel: Channel) => {
    StorageService.hideChannel(channel.id);
    refreshHiddenState();
  }, [refreshHiddenState]);

  const hideCategory = useCallback((categoryName: string) => {
    StorageService.hideCategory(categoryName);
    refreshHiddenState();
  }, [refreshHiddenState]);

  const recordWatched = useCallback((channel: Channel) => {
    StorageService.addRecentlyWatched(channel);
    refreshRecentlyWatched();
  }, [refreshRecentlyWatched]);

  return {
    allChannels: visibleChannels,
    displayedChannels,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    favoritesCount,
    recentlyWatched,
    toggleFavorite,
    hideChannel,
    hideCategory,
    recordWatched,
    refreshHiddenState,
    refreshRecentlyWatched
  };
}