import React, { useState } from 'react';
import { Radio, Calendar, Trophy, Tv, RefreshCw, AlertCircle, Compass } from 'lucide-react';
import { SportsEvent, SportsChannel } from '../models/types';
import { useSportsCatalog } from '../hooks/useSportsCatalog';
import { ProviderSelector } from './ProviderSelector';
import { SportsEventCard } from './SportsEventCard';
import { SportsChannelCard } from './SportsChannelCard';
import { ExternalFallbackModal } from './ExternalFallbackModal';

interface SportsHomeProps {
  onPlayStream: (streamUrl: string, title: string, logo?: string) => void;
}

export const SportsHome: React.FC<SportsHomeProps> = ({ onPlayStream }) => {
  const {
    selectedProvider,
    setSelectedProvider,
    isLoading,
    error,
    refreshCatalog,
    totalCount,
    liveEvents,
    upcomingEvents,
    cricketEvents,
    footballEvents,
    otherSportsEvents,
    sportsChannels
  } = useSportsCatalog();

  const [fallbackItem, setFallbackItem] = useState<SportsEvent | SportsChannel | null>(null);

  const handlePlayEvent = (event: SportsEvent) => {
    if (event.streamSupportedInApp && event.streamUrl) {
      onPlayStream(event.streamUrl, event.title, event.posterUrl);
    } else {
      setFallbackItem(event);
    }
  };

  const handlePlayChannel = (channel: SportsChannel) => {
    if (channel.streamSupportedInApp && channel.streamUrl) {
      onPlayStream(channel.streamUrl, channel.name, channel.logoUrl);
    } else {
      setFallbackItem(channel);
    }
  };

  const handleOpenExternal = (item: SportsEvent | SportsChannel) => {
    setFallbackItem(item);
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      backgroundColor: 'var(--bg-main, #0a0f1d)',
      padding: '24px 32px 60px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      {/* Top Header & Provider Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 4px 0',
              letterSpacing: '-0.5px'
            }}>
              Live Sports
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary, #94a3b8)',
              margin: 0
            }}>
              Official live fixtures, streams & schedules from FanCode, SonyLIV, Tata Play and Willow.
            </p>
          </div>

          <button
            onClick={() => refreshCatalog()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              color: '#e2e8f0',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Provider Filters */}
        <ProviderSelector
          selectedProvider={selectedProvider}
          onSelectProvider={setSelectedProvider}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(56, 189, 248, 0.2)',
            borderTopColor: '#38bdf8',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
            Loading sports schedules & live feeds...
          </span>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: '#f87171'
        }}>
          <AlertCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Unable to load sports fixtures</div>
            <div style={{ fontSize: '13px', color: '#fca5a5' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && totalCount === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          gap: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '16px',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}>
          <Compass size={48} color="#64748b" />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 6px 0' }}>
              No matches currently available
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, maxWidth: '400px' }}>
              There are no scheduled matches or channels for the selected provider filter at this moment.
            </p>
          </div>
        </div>
      )}

      {/* Main Sections */}
      {!isLoading && !error && totalCount > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

          {/* 1. Live Now Section */}
          {liveEvents.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  <Radio size={14} />
                  LIVE NOW
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Active Matches ({liveEvents.length})
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {liveEvents.map(event => (
                  <SportsEventCard
                    key={event.id}
                    event={event}
                    onPlay={handlePlayEvent}
                    onOpenExternal={handleOpenExternal}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 2. Upcoming Matches Section */}
          {upcomingEvents.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Calendar size={20} color="#38bdf8" />
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Upcoming Matches ({upcomingEvents.length})
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {upcomingEvents.map(event => (
                  <SportsEventCard
                    key={event.id}
                    event={event}
                    onPlay={handlePlayEvent}
                    onOpenExternal={handleOpenExternal}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 3. Cricket Section */}
          {cricketEvents.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Trophy size={20} color="#f59e0b" />
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Cricket Hub ({cricketEvents.length})
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {cricketEvents.map(event => (
                  <SportsEventCard
                    key={event.id}
                    event={event}
                    onPlay={handlePlayEvent}
                    onOpenExternal={handleOpenExternal}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 4. Football Section */}
          {footballEvents.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Trophy size={20} color="#10b981" />
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Football Hub ({footballEvents.length})
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {footballEvents.map(event => (
                  <SportsEventCard
                    key={event.id}
                    event={event}
                    onPlay={handlePlayEvent}
                    onOpenExternal={handleOpenExternal}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 5. Other Sports Section */}
          {otherSportsEvents.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Trophy size={20} color="#a855f7" />
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Other Sports ({otherSportsEvents.length})
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {otherSportsEvents.map(event => (
                  <SportsEventCard
                    key={event.id}
                    event={event}
                    onPlay={handlePlayEvent}
                    onOpenExternal={handleOpenExternal}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 6. Sports Channels Section */}
          {sportsChannels.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Tv size={20} color="#38bdf8" />
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  24/7 Sports Channels ({sportsChannels.length})
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {sportsChannels.map(channel => (
                  <SportsChannelCard
                    key={channel.id}
                    channel={channel}
                    onPlay={handlePlayChannel}
                    onOpenExternal={handleOpenExternal}
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* External Fallback Modal */}
      <ExternalFallbackModal
        item={fallbackItem}
        onClose={() => setFallbackItem(null)}
      />
    </div>
  );
};

