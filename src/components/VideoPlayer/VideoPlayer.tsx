import React, { useEffect, useRef, useState } from 'react';
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
  RotateCw,
  RefreshCw,
  ShieldAlert
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

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('FIT');
  const [showControls, setShowControls] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useProxy, setUseProxy] = useState(false);

  // HUD Popups
  const [showDrawer, setShowDrawer] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);

  // Tracks & Info
  const [qualities, setQualities] = useState<PlayerQuality[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<number>(0);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState<number>(-1);
  const [metrics, setMetrics] = useState<StreamMetrics>({});

  const controlsTimeoutRef = useRef<number | null>(null);
  const isModalOpen = showDrawer || showInfo || showQualityMenu || showAudioMenu || showSubMenu || showAspectMenu;

  // Auto-hide controls timer
  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (!isModalOpen) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 4500);
    }
  };

  // Main Stream Loader Effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setErrorMsg(null);
    setQualities([]);
    setAudioTracks([]);
    setSubtitleTracks([]);
    setMetrics({});

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const rawUrl = channel.url.trim();
    const finalUrl = useProxy
      ? (window.location.origin + '/api/proxy?url=' + encodeURIComponent(rawUrl))
      : rawUrl;

    const isHls = finalUrl.includes('.m3u8') || finalUrl.includes('/hls') || !finalUrl.includes('.mp4');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 20000,
        levelLoadingMaxRetry: 3,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 4
      });

      hlsRef.current = hls;
      hls.loadSource(finalUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setIsLoading(false);
        setErrorMsg(null);
        video.play().catch(e => console.warn('Autoplay notice:', e));

        const qList: PlayerQuality[] = data.levels.map((lvl, index) => ({
          height: lvl.height,
          bitrate: lvl.bitrate,
          label: lvl.height ? (lvl.height + 'p') : ('Level ' + (index + 1)),
          levelIndex: index
        }));
        setQualities(qList);
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_event, data) => {
        const aList: AudioTrack[] = data.audioTracks.map((trk) => ({
          id: trk.id,
          name: trk.name,
          lang: trk.lang,
          label: trk.name || trk.lang || ('Audio ' + (trk.id + 1))
        }));
        setAudioTracks(aList);
        setSelectedAudio(hls.audioTrack);
      });

      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_event, data) => {
        const sList: SubtitleTrack[] = data.subtitleTracks.map((sub) => ({
          id: sub.id,
          name: sub.name,
          lang: sub.lang,
          label: sub.name || sub.lang || ('Sub ' + (sub.id + 1))
        }));
        setSubtitleTracks(sList);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          setMetrics(prev => ({
            ...prev,
            resolution: lvl.width + 'x' + lvl.height,
            bitrateKbps: Math.round(lvl.bitrate / 1000)
          }));
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (!useProxy && window.location.protocol === 'https:' && rawUrl.startsWith('http:')) {
                // Auto try proxy for HTTP streams on HTTPS
                setUseProxy(true);
              } else {
                setErrorMsg('Network error: stream server is offline or blocking connection.');
                setIsLoading(false);
                hls.destroy();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setErrorMsg('Unable to play this live stream.');
              setIsLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHls) {
      // Native HLS support (Safari / iOS) or Direct MP4/WebM
      video.src = finalUrl;
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
  }, [channel.id, channel.url, useProxy]);

  // Keyboard Shortcuts
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
  }, [isModalOpen, channel.id, allChannels, onBack, onSelectChannel]);

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
        onError={() => {
          if (!useProxy) {
            setUseProxy(true);
          } else {
            setErrorMsg('Stream playback error: codec not supported or source offline.');
            setIsLoading(false);
          }
        }}
      />

      {/* Loading Spinner */}
      {isLoading && !errorMsg && (
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0,0,0,0.75)',
          padding: '20px 30px',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          zIndex: 60,
          border: '1px solid rgba(255,255,255,0.1)'
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
            {useProxy ? 'Loading via HTTPS Proxy...' : 'Connecting Stream...'}
          </span>
        </div>
      )}

      {/* Error State */}
      {errorMsg && (
        <div style={{
          position: 'absolute',
          background: 'rgba(20, 24, 33, 0.95)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          padding: '24px 32px',
          borderRadius: '16px',
          color: '#fff',
          textAlign: 'center',
          maxWidth: '480px',
          zIndex: 60,
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#EF4444' }}>
            <ShieldAlert size={40} />
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Stream Unavailable</h4>
          <p style={{ fontSize: '13px', marginBottom: '16px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {errorMsg}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setErrorMsg(null);
                setUseProxy(false);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} /> Retry Direct
            </button>
            <button
              onClick={() => {
                setErrorMsg(null);
                setUseProxy(true);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '12px'
              }}
            >
              Try HTTPS Proxy
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: showControls ? 1 : 0,
        pointerEvents: showControls ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 55
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{channel.name}</h2>
              <span style={{
                background: '#EF4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}>
                LIVE
              </span>
            </div>
            {channel.group && (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{channel.group}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowDrawer(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
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
              padding: '8px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: channel.isFavorite ? '#F59E0B' : '#fff'
            }}
          >
            <Star size={18} fill={channel.isFavorite ? '#F59E0B' : 'none'} />
          </button>
        </div>
      </div>

      {/* Bottom Bar Controls (Left Aligned to avoid Netlify Badge) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '24px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        opacity: showControls ? 1 : 0,
        pointerEvents: showControls ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 55
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Play / Pause */}
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
              boxShadow: '0 4px 16px var(--glow-shadow)',
              flexShrink: 0
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
          </button>

          {/* Mute */}
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
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Volume slider */}
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
            style={{ width: '85px', accentColor: 'var(--glow)', cursor: 'pointer', flexShrink: 0 }}
          />

          {/* Vertical divider */}
          <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.2)', margin: '0 2px', flexShrink: 0 }} />

          {/* Stream Info HUD Toggle */}
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
              gap: '6px',
              flexShrink: 0
            }}
          >
            <Info size={15} />
            <span>Info</span>
          </button>

          {/* Quality Selector */}
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
                gap: '6px',
                flexShrink: 0
              }}
            >
              <Layers size={15} />
              <span>{selectedQuality === -1 ? 'Auto' : (qualities[selectedQuality]?.label || 'Quality')}</span>
            </button>
          )}

          {/* Audio Tracks */}
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
                gap: '6px',
                flexShrink: 0
              }}
            >
              <Volume2 size={15} />
              <span>{audioTracks[selectedAudio]?.label || 'Audio'}</span>
            </button>
          )}

          {/* Subtitles */}
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
                gap: '6px',
                flexShrink: 0
              }}
            >
              <Subtitles size={15} />
              <span>{selectedSubtitle === -1 ? 'Subs Off' : (subtitleTracks[selectedSubtitle]?.label || 'Subs')}</span>
            </button>
          )}

          {/* Aspect Ratio */}
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
              gap: '6px',
              flexShrink: 0
            }}
          >
            <RotateCw size={15} />
            <span>{aspectRatio}</span>
          </button>

          {/* Fullscreen */}
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
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Stream Info HUD Overlay */}
      {showInfo && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '24px',
          width: '320px',
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
              <span style={{ color: 'var(--text-secondary)' }}>Route</span>
              <span style={{ fontWeight: 600, color: useProxy ? '#60A5FA' : '#34D399' }}>
                {useProxy ? 'HTTPS Proxy' : 'Direct'}
              </span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Stream URL</span>
              <span style={{
                fontSize: '10px',
                background: 'rgba(0,0,0,0.4)',
                padding: '4px 6px',
                borderRadius: '4px',
                wordBreak: 'break-all',
                color: 'rgba(255,255,255,0.7)'
              }}>
                {channel.url}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Aspect Ratio Menu Popup */}
      {showAspectMenu && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '380px',
          background: 'rgba(15, 20, 30, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '8px',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: '150px'
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

      {/* Quality Menu Popup */}
      {showQualityMenu && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '260px',
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

      {/* Audio Menu Popup */}
      {showAudioMenu && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '300px',
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

      {/* Subtitles Menu Popup */}
      {showSubMenu && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '340px',
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

      {/* Quick Channel Drawer */}
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
