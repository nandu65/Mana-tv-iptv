import React from 'react';
import { Play, ExternalLink, Clock, Trophy } from 'lucide-react';
import { SportsEvent } from '../models/types';
import { PROVIDERS_META } from '../services/SportsCatalogService';

interface SportsEventCardProps {
  event: SportsEvent;
  onPlay: (event: SportsEvent) => void;
  onOpenExternal: (event: SportsEvent) => void;
}

export const SportsEventCard: React.FC<SportsEventCardProps> = ({
  event,
  onPlay,
  onOpenExternal
}) => {
  const providerMeta = PROVIDERS_META.find(p => p.id === event.provider) || {
    id: event.provider,
    name: event.provider,
    badgeColor: '#3b82f6',
    logoText: event.provider,
    webUrl: event.externalWebUrl
  };

  const isLive = event.status === 'LIVE';
  const isUpcoming = event.status === 'UPCOMING';
  const isCompleted = event.status === 'COMPLETED';

  const formatStartTime = (timeMs: number) => {
    const date = new Date(timeMs);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Today, ${timeStr}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  const handleCardClick = () => {
    if (isCompleted) {
      // Completed events are not presented as currently playable
      return;
    }
    if (isLive && event.streamSupportedInApp) {
      onPlay(event);
    } else {
      onOpenExternal(event);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: 'var(--bg-card, #141c2c)',
        borderRadius: '14px',
        border: isLive ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: isCompleted ? 'default' : 'pointer',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        boxShadow: isLive ? '0 4px 20px rgba(239, 68, 68, 0.12)' : '0 4px 12px rgba(0, 0, 0, 0.25)',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        if (!isCompleted) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = isLive ? '#ef4444' : 'var(--glow, #3b82f6)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isCompleted) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = isLive ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle, rgba(255, 255, 255, 0.08))';
          e.currentTarget.style.boxShadow = isLive ? '0 4px 20px rgba(239, 68, 68, 0.12)' : '0 4px 12px rgba(0, 0, 0, 0.25)';
        }
      }}
    >
      {/* Top Banner / Poster Thumbnail */}
      <div style={{ position: 'relative', height: '140px', backgroundColor: '#0d131f', overflow: 'hidden' }}>
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isCompleted ? 0.45 : 0.85 }}
            loading="lazy"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
            <Trophy size={40} color="rgba(255, 255, 255, 0.2)" />
          </div>
        )}

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(20, 28, 44, 0.95) 0%, rgba(20, 28, 44, 0.2) 60%, rgba(0, 0, 0, 0.4) 100%)'
        }} />

        {/* Status Badge (Top-Left) */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          {isLive && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              letterSpacing: '0.5px'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                animation: 'pulse 1.5s infinite'
              }} />
              LIVE
            </div>
          )}

          {isUpcoming && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(30, 41, 59, 0.85)',
              backdropFilter: 'blur(4px)',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              <Clock size={12} />
              {formatStartTime(event.startTime)}
            </div>
          )}

          {isCompleted && (
            <div style={{
              backgroundColor: 'rgba(71, 85, 105, 0.85)',
              color: '#cbd5e1',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px'
            }}>
              COMPLETED
            </div>
          )}
        </div>

        {/* Provider Badge (Top-Right) */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: providerMeta.badgeColor,
          color: '#fff',
          fontSize: '10px',
          fontWeight: 800,
          padding: '3px 8px',
          borderRadius: '6px',
          letterSpacing: '0.5px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}>
          {providerMeta.name}
        </div>

        {/* Sport Category (Bottom-Left of Poster) */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--glow, #38bdf8)',
          textTransform: 'uppercase',
          letterSpacing: '0.6px'
        }}>
          {event.category}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Tournament Name */}
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary, #94a3b8)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '4px'
          }}>
            {event.tournamentName}
          </div>

          {/* Match Title */}
          <div style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.3,
            marginBottom: '10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {event.title}
          </div>

          {/* Team / Competitor Badges & Scores */}
          {(event.homeTeam || event.awayTeam) && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              padding: '8px 10px',
              marginBottom: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              {event.homeTeam && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
                    {event.homeTeam.shortName || event.homeTeam.name}
                  </span>
                  {event.homeTeam.score && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
                      {event.homeTeam.score}
                    </span>
                  )}
                </div>
              )}
              {event.awayTeam && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
                    {event.awayTeam.shortName || event.awayTeam.name}
                  </span>
                  {event.awayTeam.score && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
                      {event.awayTeam.score}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
          {isLive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '9px 12px',
                borderRadius: '8px',
                backgroundColor: event.streamSupportedInApp ? '#ef4444' : '#2563eb',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              {event.streamSupportedInApp ? (
                <>
                  <Play size={14} fill="#fff" />
                  Watch Live Now
                </>
              ) : (
                <>
                  <ExternalLink size={14} />
                  Open in {providerMeta.name}
                </>
              )}
            </button>
          )}

          {isUpcoming && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenExternal(event);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={13} />
              Match Info & Schedule
            </button>
          )}

          {isCompleted && (
            <div style={{
              width: '100%',
              textAlign: 'center',
              fontSize: '12px',
              color: '#64748b',
              fontWeight: 500,
              padding: '6px'
            }}>
              Match Concluded
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
