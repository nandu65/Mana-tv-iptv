import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Info,
  Tv,
  Star,
  ChevronRight,
  Subtitles,
  Layers,
  RotateCw
} from 'lucide-react';
import { Channel, AspectRatioMode, PlayerQuality, AudioTrack, SubtitleTrack, StreamMetrics } from '../../models/types';

interface VideoPlayerProps {
  channel: Channel;
  allChannels: Channel[];
  onBack: () => void;
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  allChannels,
  onBack,
  onSelectChannel,
  onToggleFavorite
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('FIT');
  const [showControls, setShowControls] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / HUD states
  const [showDrawer, setShowDrawer] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);

  // Available tracks & metrics
  const [qualities, setQualities] = useState<PlayerQuality[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<number>(0);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState<number>(-1);
  const [metrics, setMetrics] = useState<StreamMetrics>({});

  const controlsTimeoutRef = useRef<number | null>(null);

  const isModalOpen = showDrawer || showInfo || showQualityMenu || showAudioMenu || showSubMenu || showAspectMenu;

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (!isModalOpen) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 4500);
    }
  }, [isModalOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setErrorMsg(null);
    setQualities([]);
    setAudioTracks([]);
    setSubtitleTracks([]);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = channel.url;
    const isHls = streamUrl.includes('.m3u8') || streamUrl.includes('/hls') || streamUrl.includes('test-streams.mux.dev');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 15000,
        levelLoadingTimeOut: 15000
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setIsLoading(false);
        video.play().catch(e => console.warn('Autoplay notice:', e));

        const qList: PlayerQuality[] = data.levels.map((lvl, index) => ({
          height: lvl.height,
          bitrate: lvl.bitrate,
          label: lvl.height ? `${lvl.height}p (${Math.round(lvl.bitrate / 1000)} kbps)` : `Quality ${index + 1}`,
          levelIndex: index
        }));
        setQualities(qList);
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_event, data) => {
        const aList: AudioTrack[] = data.audioTracks.map((trk) => ({
          id: trk.id,
          name: trk.name,
          lang: trk.lang,
          label: trk.name || trk.lang || `Track ${trk.id + 1}`
        }));
        setAudioTracks(aList);
        setSelectedAudio(hls.audioTrack);
      });

      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_event, data) => {
        const sList: SubtitleTrack[] = data.subtitleTracks.map((sub) => ({
          id: sub.id,
          name: sub.name,
          lang: sub.lang,
          label: sub.name || sub.lang || `Subtitle ${sub.id + 1}`
        }));
        setSubtitleTracks(sList);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          setMetrics(prev => ({
            ...prev,
            resolution: `${lvl.width}x${lvl.height}`,
            bitrateKbps: Math.round(lvl.bitrate / 1000),
            codec: lvl.videoCodec || lvl.audioCodec
          }));
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setErrorMsg('Unable to play live stream. Check connection or stream URL.');
              setIsLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } else {
      video.src = streamUrl;
      video.load();
      video.play().catch(e => console.warn('Direct play notice:', e));
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.url]);

  const getAspectStyle = (): React.CSSProperties => {
    switch (aspectRatio) {
      case 'FILL': return { objectFit: 'cover' };
      case 'STRETCH': return { objectFit: 'fill' };
      case '16_9': return { aspectRatio: '16/9', objectFit: 'contain' };
      case '4_3': return { aspectRatio: '4/3', objectFit: 'contain' };
      case 'FIT':
      default: return { objectFit: 'contain' };
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimer();
      switch (e.key) {
        case 'Escape':
          if (isModalOpen) {
            setShowDrawer(false);
            setShowInfo(false);
            setShowQualityMenu(false);
            setShowAudioMenu(false);
            setShowSubMenu(false);
            setShowAspectMenu(false);
          } else {
            onBack();
          }
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          setShowInfo(prev => !prev);
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          setShowDrawer(prev => !prev);
          break;
        case 'ArrowUp': {
          e.preventDefault();
          const curIndex = allChannels.findIndex(c => c.id === channel.id);
          if (curIndex > 0) onSelectChannel(allChannels[curIndex - 1]);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const cIndex = allChannels.findIndex(c => c.id === channel.id);
          if (cIndex < allChannels.length - 1 && cIndex !== -1) onSelectChannel(allChannels[cIndex + 1]);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, channel.id, allChannels, resetControlsTimer, onBack, onSelectChannel]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const setQuality = (lvlIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = lvlIndex;
      setSelectedQuality(lvlIndex);
    }
    setShowQualityMenu(false);
  };

  const setAudio = (trkId: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trkId;
      setSelectedAudio(trkId);
    }
    setShowAudioMenu(false);
  };

  const setSubtitle = (subId: number) => {
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = subId;
      setSelectedSubtitle(subId);
    }
    setShowSubMenu(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          ...getAspectStyle()
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
      />

      {isLoading && !errorMsg && (
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0,0,0,0.65)',
          padding: '20px 30px',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          zIndex: 60
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(255,255,255,0.2)',
            borderTopColor: 'var(--glow)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
            Buffering Stream...
          </span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          position: 'absolute',
          background: 'rgba(239, 68, 68, 0.95)',
          padding: '24px 32px',
          borderRadius: '16px',
          color: '#fff',
          textAlign: 'center',
          maxWidth: '450px',
          zIndex: 60,
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)'
        }}>
          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Stream Unavailable</h4>
          <p style={{ fontSize: '13px', marginBottom: '16px', opacity: 0.9 }}>{errorMsg}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setErrorMsg(null);
                if (hlsRef.current) hlsRef.current.startLoad();
              }}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#fff',
                color: '#EF4444',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              Retry
            </button>
            <button
              onClick={onBack}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.4)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              Back to Channels
            </button>
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px',
        opacity: showControls || isModalOpen ? 1 : 0,
        pointerEvents: showControls || isModalOpen ? 'auto' : 'none',
        transition: 'opacity 0.25s ease',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.85) 100%)',
        zIndex: 55
      }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>
                  {channel.name}
                </h2>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--live-red)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  LIVE
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {channel.group || 'Live Stream'} {channel.country ? `• ${channel.country}` : ''}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              title="Channel List (C)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: showDrawer ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <Tv size={16} />
              <span>Channels</span>
            </button>

            <button
              onClick={() => onToggleFavorite(channel.id)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: channel.isFavorite ? 'var(--favorite-yellow)' : '#fff'
              }}
            >
              <Star size={18} fill={channel.isFavorite ? 'var(--favorite-yellow)' : 'none'} />
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={togglePlay}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px var(--glow-shadow)'
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
            </button>

            <button
              onClick={toggleMute}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (videoRef.current) {
                  videoRef.current.volume = val;
                  videoRef.current.muted = false;
                  setIsMuted(false);
                }
              }}
              style={{ width: '90px', accentColor: 'var(--glow)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowInfo(!showInfo)}
              title="Stream Info (I)"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: showInfo ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Info size={15} />
              <span>Info</span>
            </button>

            {qualities.length > 0 && (
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: showQualityMenu ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={15} />
                <span>{selectedQuality === -1 ? 'Auto' : qualities[selectedQuality]?.label || 'Quality'}</span>
              </button>
            )}

            {audioTracks.length > 1 && (
              <button
                onClick={() => setShowAudioMenu(!showAudioMenu)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: showAudioMenu ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Volume2 size={15} />
                <span>{audioTracks[selectedAudio]?.label || 'Audio'}</span>
              </button>
            )}

            {subtitleTracks.length > 0 && (
              <button
                onClick={() => setShowSubMenu(!showSubMenu)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: showSubMenu ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Subtitles size={15} />
                <span>{selectedSubtitle === -1 ? 'Subs Off' : subtitleTracks[selectedSubtitle]?.label || 'Subs'}</span>
              </button>
            )}

            <button
              onClick={() => setShowAspectMenu(!showAspectMenu)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: showAspectMenu ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RotateCw size={15} />
              <span>{aspectRatio}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>

      {showInfo && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '24px',
          width: '280px',
          background: 'rgba(15, 20, 30, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          color: '#fff',
          zIndex: 60
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--glow)' }}>
            Stream Information
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Channel</span>
              <span style={{ fontWeight: 600 }}>{channel.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Resolution</span>
              <span style={{ fontWeight: 600 }}>{metrics.resolution || 'Auto / Native'}</span>
            </div>
            {metrics.bitrateKbps && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bitrate</span>
                <span style={{ fontWeight: 600 }}>{metrics.bitrateKbps} kbps</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Aspect Ratio</span>
              <span style={{ fontWeight: 600 }}>{aspectRatio}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Protocol</span>
              <span style={{ fontWeight: 600 }}>{channel.url.startsWith('https') ? 'HTTPS (Secure)' : 'HTTP'}</span>
            </div>
          </div>
        </div>
      )}

      {showAspectMenu && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '80px',
          background: 'rgba(15, 20, 30, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '8px',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: '160px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 8px', fontWeight: 700 }}>
            ASPECT RATIO
          </div>
          {(['FIT', 'FILL', 'STRETCH', '16_9', '4_3'] as AspectRatioMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setAspectRatio(mode);
                setShowAspectMenu(false);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: aspectRatio === mode ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontSize: '12px',
                fontWeight: aspectRatio === mode ? 700 : 500,
                textAlign: 'left'
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      )}

      {showQualityMenu && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '160px',
          background: 'rgba(15, 20, 30, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '8px',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: '180px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 8px', fontWeight: 700 }}>
            STREAM QUALITY
          </div>
          <button
            onClick={() => setQuality(-1)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: selectedQuality === -1 ? 'var(--primary)' : 'transparent',
              color: '#fff',
              fontSize: '12px',
              fontWeight: selectedQuality === -1 ? 700 : 500,
              textAlign: 'left'
            }}
          >
            Auto (Adaptive)
          </button>
          {qualities.map((q) => (
            <button
              key={q.levelIndex}
              onClick={() => setQuality(q.levelIndex)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: selectedQuality === q.levelIndex ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontSize: '12px',
                fontWeight: selectedQuality === q.levelIndex ? 700 : 500,
                textAlign: 'left'
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {showAudioMenu && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '200px',
          background: 'rgba(15, 20, 30, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '8px',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: '180px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 8px', fontWeight: 700 }}>
            AUDIO TRACK
          </div>
          {audioTracks.map((trk) => (
            <button
              key={trk.id}
              onClick={() => setAudio(trk.id)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: selectedAudio === trk.id ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontSize: '12px',
                fontWeight: selectedAudio === trk.id ? 700 : 500,
                textAlign: 'left'
              }}
            >
              {trk.label}
            </button>
          ))}
        </div>
      )}

      {showSubMenu && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '240px',
          background: 'rgba(15, 20, 30, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '8px',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: '180px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 8px', fontWeight: 700 }}>
            SUBTITLES
          </div>
          <button
            onClick={() => setSubtitle(-1)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: selectedSubtitle === -1 ? 'var(--primary)' : 'transparent',
              color: '#fff',
              fontSize: '12px',
              fontWeight: selectedSubtitle === -1 ? 700 : 500,
              textAlign: 'left'
            }}
          >
            Off
          </button>
          {subtitleTracks.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSubtitle(sub.id)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: selectedSubtitle === sub.id ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontSize: '12px',
                fontWeight: selectedSubtitle === sub.id ? 700 : 500,
                textAlign: 'left'
              }}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {showDrawer && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '320px',
          background: 'rgba(13, 15, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 65,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              Quick Channels ({allChannels.length})
            </h3>
            <button
              onClick={() => setShowDrawer(false)}
              style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '4px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {allChannels.map((ch) => {
              const isCurrent = ch.id === channel.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    onSelectChannel(ch);
                    setShowDrawer(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isCurrent ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#fff',
                    transition: 'background 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ch.name}
                    </span>
                    <span style={{ fontSize: '11px', color: isCurrent ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                      {ch.group || 'Live'}
                    </span>
                  </div>
                  {isCurrent && <ChevronRight size={16} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
