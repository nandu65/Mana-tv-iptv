import React, { useState } from 'react';
import { Star, Play, EyeOff } from 'lucide-react';
import { Channel } from '../../models/types';

interface ChannelCardProps {
  channel: Channel;
  showLogos: boolean;
  onSelect: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  onHideChannel?: (channel: Channel) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  showLogos,
  onSelect,
  onToggleFavorite,
  onHideChannel
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generate fallback initials
  const initials = channel.name
    .split(' ')
    .filter(w => w.length > 0)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'TV';

  // Deterministic color hash for fallback avatar
  const getGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `linear-gradient(135deg, hsl(${hue}, 60%, 25%) 0%, hsl(${(hue + 40) % 360}, 65%, 15%) 100%)`;
  };

  return (
    <div
      onClick={() => onSelect(channel)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(channel);
        }
      }}
      style={{
        position: 'relative',
        width: 'var(--card-width)',
        height: 'var(--card-height)',
        borderRadius: '12px',
        backgroundColor: isHovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1.5px solid ${isHovered ? 'var(--glow)' : 'var(--border-subtle)'}`,
        boxShadow: isHovered ? '0 10px 24px var(--glow-shadow)' : '0 2px 8px rgba(0,0,0,0.2)',
        transform: isHovered ? 'scale(1.04) translateY(-2px)' : 'scale(1.0)',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Top Header inside Card: Channel No & Favorite Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
        {channel.channelNo ? (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '6px',
            background: 'rgba(0, 0, 0, 0.4)',
            color: 'var(--text-secondary)'
          }}>
            #{channel.channelNo}
          </span>
        ) : <div />}

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Favorite Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            style={{
              background: 'transparent',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.1s ease'
            }}
            title={channel.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
          >
            <Star
              size={15}
              fill={channel.isFavorite ? 'var(--favorite-yellow)' : 'none'}
              color={channel.isFavorite ? 'var(--favorite-yellow)' : '#9CA3AF'}
            />
          </button>

          {/* Hide Channel Button (visible on hover) */}
          {isHovered && onHideChannel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Hide channel "${channel.name}"? You can unhide it in Settings.`)) {
                  onHideChannel(channel);
                }
              }}
              style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '4px',
                borderRadius: '6px',
                color: '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Hide channel"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              <EyeOff size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Center: Logo or Monogram */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        margin: '4px 0',
        position: 'relative'
      }}>
        {showLogos && channel.logo && !imgError ? (
          <img
            src={channel.logo}
            alt={channel.name}
            onError={() => setImgError(true)}
            style={{
              maxHeight: '44px',
              maxWidth: '80%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'
            }}
          />
        ) : (
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: getGradient(channel.name),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '15px',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {initials}
          </div>
        )}

        {/* Play Icon on Hover */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.45)',
            borderRadius: '8px',
            backdropFilter: 'blur(2px)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--glow-shadow)'
            }}>
              <Play size={16} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info: Channel Title & Group Badge */}
      <div style={{ zIndex: 2 }}>
        <div style={{
          fontSize: '12.5px',
          fontWeight: 700,
          color: isHovered ? '#fff' : 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.3
        }}>
          {channel.name}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '2px'
        }}>
          <span style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: 'var(--live-red)',
            display: 'inline-block'
          }} />
          <span style={{
            fontSize: '10.5px',
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {channel.group || 'Live TV'}
          </span>
        </div>
      </div>
    </div>
  );
};