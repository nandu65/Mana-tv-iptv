import React, { useState, useEffect, useMemo } from 'react';
import { Channel } from '../../models/types';
import { ChannelCard } from './ChannelCard';
import { Tv, Sparkles, Plus, ChevronDown } from 'lucide-react';

interface ChannelGridProps {
  channels: Channel[];
  showLogos: boolean;
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  onHideChannel?: (channel: Channel) => void;
  onOpenAddPlaylist: () => void;
  onLoadSample: () => void;
}

const PAGE_SIZE = 80;

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  showLogos,
  onSelectChannel,
  onToggleFavorite,
  onHideChannel,
  onOpenAddPlaylist,
  onLoadSample
}) => {
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  // Reset pagination when channel list changes (e.g. search or category change)
  useEffect(() => {
    setVisibleLimit(PAGE_SIZE);
  }, [channels]);

  const pagedChannels = useMemo(() => {
    return channels.slice(0, visibleLimit);
  }, [channels, visibleLimit]);

  const hasMore = visibleLimit < channels.length;

  const handleLoadMore = () => {
    setVisibleLimit(prev => Math.min(prev + PAGE_SIZE, channels.length));
  };

  if (channels.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--glow)'
        }}>
          <Tv size={32} />
        </div>

        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
            No Channels Found
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto' }}>
            No channels match your current filter or search criteria.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onOpenAddPlaylist}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <Plus size={16} />
            <span>Add Playlist</span>
          </button>

          <button
            onClick={onLoadSample}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: '#E2E8F0',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <Sparkles size={16} color="var(--glow)" />
            <span>Load Mana TV Default Playlist</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      padding: '20px 24px'
    }}>
      {/* Channels count indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        <span>Showing {pagedChannels.length} of {channels.length} channels</span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(var(--card-width), 1fr))',
        gap: '16px',
        alignContent: 'flex-start'
      }}>
        {pagedChannels.map((ch) => (
          <ChannelCard
            key={ch.id}
            channel={ch}
            showLogos={showLogos}
            onSelect={onSelectChannel}
            onToggleFavorite={onToggleFavorite}
            onHideChannel={onHideChannel}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <button
            onClick={handleLoadMore}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--glow)';
              e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.backgroundColor = 'var(--bg-card)';
            }}
          >
            <span>Load More Channels ({channels.length - visibleLimit} remaining)</span>
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
