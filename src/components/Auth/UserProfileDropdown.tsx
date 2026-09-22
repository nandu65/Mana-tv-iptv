import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Download, Upload, ChevronDown } from 'lucide-react';
import { UserAccount, Playlist } from '../../models/types';
import { AuthService } from '../../services/authService';

interface UserProfileDropdownProps {
  user: UserAccount | null;
  playlists: Playlist[];
  favoritesCount: number;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onLibraryImported: () => void;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  user,
  playlists,
  favoritesCount,
  onOpenAuthModal,
  onLogout,
  onLibraryImported
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = () => {
    const data = AuthService.exportUserLibrary();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mana_tv_${user ? user.username : 'guest'}_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string;
        AuthService.importUserLibrary(content);
        alert('IPTV Library imported successfully!');
        onLibraryImported();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to import backup file.');
      }
    };
    reader.readAsText(file);
  };

  if (!user) {
    return (
      <button
        onClick={onOpenAuthModal}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 14px',
          borderRadius: '8px',
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid var(--glow)',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 700,
          transition: 'all 0.15s ease'
        }}
      >
        <User size={15} color="var(--glow)" />
        <span>Sign In / Create Account</span>
      </button>
    );
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid var(--border-subtle)',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 600,
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--glow)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
      >
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px'
        }}>
          {user.avatar || user.displayName[0].toUpperCase()}
        </div>
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.displayName}
        </span>
        <ChevronDown size={14} color="var(--text-secondary)" />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '260px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
          padding: '12px',
          zIndex: 100,
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            marginBottom: '10px'
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {user.avatar || user.displayName[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                @{user.username}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            <div style={{ padding: '6px 8px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--glow)' }}>{playlists.length}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Playlists</div>
            </div>
            <div style={{ padding: '6px 8px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--favorite-yellow)' }}>{favoritesCount}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Favorites</div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '6px 0' }} />

          <button
            onClick={() => { setIsOpen(false); handleExport(); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              background: 'transparent',
              color: '#fff',
              fontSize: '12.5px',
              fontWeight: 500,
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Download size={15} color="var(--glow)" />
            <span>Export IPTV Backup (JSON)</span>
          </button>

          <button
            onClick={() => { setIsOpen(false); fileInputRef.current?.click(); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              background: 'transparent',
              color: '#fff',
              fontSize: '12.5px',
              fontWeight: 500,
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Upload size={15} color="var(--glow)" />
            <span>Import IPTV Backup (JSON)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />

          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '6px 0' }} />

          <button
            onClick={() => {
              setIsOpen(false);
              if (confirm('Log out from Mana TV? Your playlists remain safely stored in your account.')) {
                onLogout();
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              background: 'transparent',
              color: '#EF4444',
              fontSize: '12.5px',
              fontWeight: 600,
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
