import { useState, useEffect, useMemo, useCallback } from 'react';
import { SportsEvent, SportsChannel, SportsProvider } from '../models/types';
import { SportsCatalogService } from '../services/SportsCatalogService';

export function useSportsCatalog() {
  const [selectedProvider, setSelectedProvider] = useState<SportsProvider>('ALL');
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [channels, setChannels] = useState<SportsChannel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedEvents, fetchedChannels] = await Promise.all([
        SportsCatalogService.getAllEvents(forceRefresh),
        SportsCatalogService.getAllChannels(forceRefresh)
      ]);
      setEvents(fetchedEvents);
      setChannels(fetchedChannels);
    } catch (err: any) {
      console.error('[useSportsCatalog] Failed to load sports catalog:', err);
      setError(err?.message || 'Failed to load live sports data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Provider Filtered Events & Channels
  const filteredEvents = useMemo(() => {
    if (selectedProvider === 'ALL') return events;
    return events.filter(e => e.provider === selectedProvider);
  }, [events, selectedProvider]);

  const filteredChannels = useMemo(() => {
    if (selectedProvider === 'ALL') return channels;
    return channels.filter(c => c.provider === selectedProvider);
  }, [channels, selectedProvider]);

  // Section 1: Live Now
  const liveEvents = useMemo(() => {
    return filteredEvents.filter(e => e.status === 'LIVE');
  }, [filteredEvents]);

  // Section 2: Upcoming Matches
  const upcomingEvents = useMemo(() => {
    return filteredEvents
      .filter(e => e.status === 'UPCOMING')
      .sort((a, b) => a.startTime - b.startTime);
  }, [filteredEvents]);

  // Section 3: Cricket
  const cricketEvents = useMemo(() => {
    return filteredEvents.filter(e => e.category === 'CRICKET');
  }, [filteredEvents]);

  // Section 4: Football
  const footballEvents = useMemo(() => {
    return filteredEvents.filter(e => e.category === 'FOOTBALL');
  }, [filteredEvents]);

  // Section 5: Other Sports
  const otherSportsEvents = useMemo(() => {
    return filteredEvents.filter(e => e.category !== 'CRICKET' && e.category !== 'FOOTBALL');
  }, [filteredEvents]);

  return {
    selectedProvider,
    setSelectedProvider,
    isLoading,
    error,
    refreshCatalog: () => loadData(true),
    totalCount: filteredEvents.length,
    liveEvents,
    upcomingEvents,
    cricketEvents,
    footballEvents,
    otherSportsEvents,
    sportsChannels: filteredChannels
  };
}

