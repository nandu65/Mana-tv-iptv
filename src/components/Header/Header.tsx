import React, { useState, useRef, useEffect } from 'react';
import { Search, Settings as SettingsIcon, Plus, ChevronDown, Check, RefreshCw, Star, Tv } from 'lucide-react';
import { Playlist, UserAccount } from '../../models/types';
import { UserProfileDropdown } from '../Auth/UserProfileDropdown';

interface HeaderProps {
  user: UserAccount | null;
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  favoritesCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectPlaylist: (id: string) => void;
  onOpenAddPlaylist: () => void;
  onOpenSettings: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onLibraryImported: () => void;
  onRefreshActivePlaylist?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  playlists,
  activePlaylist,
  favoritesCount,
  searchQuery,
  onSearchChange,
  onSelectPlaylist,
  onOpenAddPlaylist,
  onOpenSettings,
  onOpenAuthModal,
  onLogout,
  onLibraryImported,
  onRefreshActivePlaylist,
  isRefreshing = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      gap: '20px',
      zIndex: 30,
      userSelect: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src="/assets/app_logo.png"
          alt="Mana TV"
          style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            Mana TV
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Live IPTV Player
          </span>
        </div>

        <div ref={dropdownRef} style={{ position: 'relative', marginLeft: '16px' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--glow)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <Tv size={15} color="var(--glow)" />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activePlaylist ? activePlaylist.name : 'No Playlist'}
            </span>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </button>

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              minWidth: '240px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              padding: '6px',
              zIndex: 100,
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '6px 10px', fontWeight: 600 }}>
                PLAYLISTS ({playlists.length})
              </div>

              {playlists.map((pl) => {
                const isActive = pl.id === activePlaylist?.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => {
                      onSelectPlaylist(pl.id);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: isActive ? 'var(--glow)' : 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      transition: 'background 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div>
                      <div>{pl.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {pl.channelCount} channels
                      </div>
                    </div>
                    {isActive && <Check size={16} color="var(--glow)" />}
                  </div>
                );
              })}

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '6px 0' }} />

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenAddPlaylist();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: 'var(--glow)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Plus size={15} />
                <span>Add New Playlist</span>
              </button>
            </div>
          )}
        </div>

        {activePlaylist?.sourceType === 'url' && onRefreshActivePlaylist && (
          <button
            onClick={onRefreshActivePlaylist}
            disabled={isRefreshing}
            title="Refresh Playlist Channels"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'var(--glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      <div style={{ flex: 1, maxWidth: '440px', position: 'relative' }}>
        <Search
          size={16}
          color="var(--text-secondary)"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Search channels, numbers, or groups... (Press /)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            height: '38px',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            paddingLeft: '38px',
            paddingRight: '14px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--glow)';
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--glow-shadow)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'rgba(250, 204, 21, 0.1)',
          border: '1px solid rgba(250, 204, 21, 0.25)',
          color: 'var(--favorite-yellow)',
          fontSize: '13px',
          fontWeight: 600
        }}>
          <Star size={14} fill="var(--favorite-yellow)" />
          <span>{favoritesCount}</span>
        </div>

        <button
          onClick={onOpenAddPlaylist}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 12px var(--glow-shadow)',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
        >
          <Plus size={16} />
          <span>Add M3U</span>
        </button>

        <UserProfileDropdown
          user={user}
          playlists={playlists}
          favoritesCount={favoritesCount}
          onOpenAuthModal={onOpenAuthModal}
          onLogout={onLogout}
          onLibraryImported={onLibraryImported}
        />

        <button
          onClick={onOpenSettings}
          title="Settings & Appearance"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'var(--glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
};
