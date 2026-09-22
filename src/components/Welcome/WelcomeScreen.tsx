import React, { useEffect, useRef } from 'react';
import { Plus, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { AudioService } from '../../services/audioService';

interface WelcomeScreenProps {
  onOpenAddPlaylist: () => void;
  onLoadSample: () => void;
  welcomeAudioVolume: number;
  welcomeAudioEnabled: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onOpenAddPlaylist,
  onLoadSample,
  welcomeAudioVolume,
  welcomeAudioEnabled
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Play muted video background
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.warn('Video playback notice:', e));
    }

    // Play welcome audio if enabled
    if (welcomeAudioEnabled && welcomeAudioVolume > 0) {
      AudioService.playWelcomeAudio('/assets/welcome_audio.mp3', welcomeAudioVolume);
    }

    return () => {
      AudioService.stopWelcomeAudio();
    };
  }, [welcomeAudioEnabled, welcomeAudioVolume]);

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* 16:9 Video Background (Fitted without stretching) */}
      <video
        ref={videoRef}
        src="/assets/welcome_video.mp4"
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000'
        }}
      />

      {/* Subtle Vignette and Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(5,8,17,0.4) 60%, rgba(5,8,17,0.95) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Mana TV Watermark & Branding Top Right */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10
      }}>
        <img
          src="/assets/app_logo.png"
          alt="Mana TV"
          style={{ height: '40px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px', color: '#fff' }}>
          Mana TV
        </span>
      </div>

      {/* Audio Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        borderRadius: '20px',
        background: 'rgba(15, 20, 30, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '13px',
        color: '#9CA3AF',
        zIndex: 10
      }}>
        {welcomeAudioEnabled && welcomeAudioVolume > 0 ? (
          <>
            <Volume2 size={16} color="var(--glow)" />
            <span>Audio {welcomeAudioVolume}%</span>
          </>
        ) : (
          <>
            <VolumeX size={16} color="#6B7280" />
            <span>Audio Muted</span>
          </>
        )}
      </div>

      {/* Action Overlay Bottom Center */}
      <div style={{
        position: 'absolute',
        bottom: '48px',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        zIndex: 20
      }}>
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {/* Add M3U Button */}
          <button
            onClick={onOpenAddPlaylist}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 700,
              boxShadow: '0 8px 24px var(--glow-shadow)',
              border: '2px solid var(--glow)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1.0)';
            }}
          >
            <Plus size={22} />
            <span>Add M3U Playlist</span>
          </button>

          {/* Try Sample Demo Button */}
          <button
            onClick={onLoadSample}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '14px',
              background: 'rgba(17, 24, 39, 0.85)',
              backdropFilter: 'blur(12px)',
              color: '#E2E8F0',
              fontSize: '16px',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.borderColor = 'var(--glow)';
              e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1.0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.85)';
            }}
          >
            <Sparkles size={22} color="var(--glow)" />
            <span>Try Sample Demo</span>
          </button>
        </div>

        <p style={{
          fontSize: '13px',
          color: '#9CA3AF',
          letterSpacing: '0.3px',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          Mana TV • Live Streams • Ultra Low Latency • Custom Playlists
        </p>
      </div>
    </div>
  );
};