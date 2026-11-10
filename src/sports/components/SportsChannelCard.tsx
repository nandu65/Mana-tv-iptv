import React from 'react';
import { Tv, Play, ExternalLink } from 'lucide-react';
import { SportsChannel } from '../models/types';
import { PROVIDERS_META } from '../services/SportsCatalogService';

interface SportsChannelCardProps {
  channel: SportsChannel;
  onPlay: (channel: SportsChannel) => void;
  onOpenExternal: (channel: SportsChannel) => void;
}

export const SportsChannelCard: React.FC<SportsChannelCardProps> = ({
  channel,
  onPlay,
  onOpenExternal
}) => {
  const providerMeta = PROVIDERS_META.find(p => p.id === channel.provider) || {
    id: channel.provider,
    name: channel.provider,
    badgeColor: '#3b82f6',
    logoText: channel.provider,
    webUrl: channel.externalWebUrl || ''
  };

  const handleCardClick = () => {
    if (channel.streamSupportedInApp && channel.streamUrl) {
      onPlay(channel);
    } else {
      onOpenExternal(channel);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        background: 'rgba(18, 27, 48, 0.62)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
        e.currentTarget.style.borderColor = 'var(--glow, #38bdf8)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)';
      }}
    >
      {/* Channel Logo / Initial Badge */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '10px',
        backgroundColor: '#0d131f',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {channel.logoUrl ? (
          <img
            src={channel.logoUrl}
            alt={channel.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <Tv size={22} color="var(--glow, #38bdf8)" />
        )}
      </div>

      {/* Channel Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: providerMeta.badgeColor,
            color: '#fff'
          }}>
            {providerMeta.name}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            {channel.category}
          </span>
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {channel.name}
        </div>
        {channel.currentProgram && (
          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: '2px'
          }}>
            {channel.currentProgram}
          </div>
        )}
      </div>

      {/* Play Action Icon */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: channel.streamSupportedInApp ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: channel.streamSupportedInApp ? '#38bdf8' : '#94a3b8',
        flexShrink: 0
      }}>
        {channel.streamSupportedInApp ? <Play size={16} fill="#38bdf8" /> : <ExternalLink size={15} />}
      </div>
    </div>
  );
};

