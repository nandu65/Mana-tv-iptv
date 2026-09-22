import React, { useState } from 'react';
import { X, Link, Upload, Sparkles } from 'lucide-react';

interface AddPlaylistModalProps {
  isOpen: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmitUrl: (name: string, url: string) => void;
  onSubmitFile: (name: string, fileContent: string) => void;
  onLoadSample: () => void;
}

export const AddPlaylistModal: React.FC<AddPlaylistModalProps> = ({
  isOpen,
  isLoading,
  errorMessage,
  onClose,
  onSubmitUrl,
  onSubmitFile,
  onLoadSample
}) => {
  const [tab, setTab] = useState<'url' | 'file'>('url');
  const [playlistName, setPlaylistName] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (!playlistName) {
      setPlaylistName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileContent(ev.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'url') {
      if (!playlistUrl.trim()) return;
      onSubmitUrl(playlistName, playlistUrl);
    } else {
      if (!fileContent.trim()) return;
      onSubmitFile(playlistName, fileContent);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Add M3U Playlist</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Import remote stream URL or local playlist file
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setTab('url')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              borderRadius: '8px',
              background: tab === 'url' ? 'var(--primary)' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <Link size={15} />
            <span>Remote URL</span>
          </button>
          <button
            onClick={() => setTab('file')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              borderRadius: '8px',
              background: tab === 'file' ? 'var(--primary)' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <Upload size={15} />
            <span>File Upload</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#FCA5A5',
            fontSize: '12px'
          }}>
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Playlist Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., My Favorite Sports TV"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {tab === 'url' ? (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                M3U / M3U8 Playlist URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/playlist.m3u"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  marginTop: '6px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select M3U File *
              </label>
              <div style={{
                marginTop: '6px',
                border: '2px dashed var(--border-subtle)',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-main)',
                cursor: 'pointer'
              }}>
                <input
                  type="file"
                  accept=".m3u,.m3u8,.txt"
                  id="m3u-file-upload"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="m3u-file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Upload size={24} color="var(--glow)" />
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                    {fileName ? fileName : 'Click to select or drag .m3u / .m3u8 file'}
                  </span>
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? 'Loading Playlist...' : 'Import Playlist'}
            </button>
          </div>
        </form>

        <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

        {/* Quick Sample Demo Link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Want to test right now?</span>
          <button
            onClick={() => {
              onLoadSample();
              onClose();
            }}
            style={{
              background: 'transparent',
              color: 'var(--glow)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} />
            <span>Load Sample Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
