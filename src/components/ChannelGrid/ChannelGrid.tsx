import React from 'react';
import { Channel } from '../../models/types';
import { ChannelCard } from './ChannelCard';
import { Tv, Sparkles, Plus } from 'lucide-react';

interface ChannelGridProps {
  channels: Channel[];
  showLogos: boolean;
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  onHideChannel?: (channel: Channel) => void;
  onOpenAddPlaylist: () => void;
  onLoadSample: () => void;
}

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  showLogos,
  onSelectChannel,
  onToggleFavorite,
  onHideChannel,
  onOpenAddPlaylist,
  onLoadSample
}) => {
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
            No channels match your current filter or search criteria. Try choosing another category or add a new playlist.
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
            <span>Load Sample Demo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      padding: '20px 24px',
      overflowY: 'auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(var(--card-width), 1fr))',
      gap: '16px',
      alignContent: 'flex-start'
    }}>
      {channels.map((ch) => (
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
  );
};