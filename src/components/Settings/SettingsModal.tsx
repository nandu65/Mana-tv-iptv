import React, { useState } from 'react';
import {
  X,
  Palette,
  Volume2,
  Tv,
  EyeOff,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { AppTheme, AccentColor, CardSize, Playlist, UiPreferences } from '../../models/types';
import { StorageService } from '../../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  uiPreferences: UiPreferences;
  onUpdatePreferences: (prefs: Partial<UiPreferences>) => void;
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  onSelectPlaylist: (id: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRefreshPlaylist: (id: string) => void;
  onOpenAddPlaylist: () => void;
  onLoadSample: () => void;
  onDataCleared: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  uiPreferences,
  onUpdatePreferences,
  playlists,
  activePlaylist,
  onSelectPlaylist,
  onDeletePlaylist,
  onRefreshPlaylist,
  onOpenAddPlaylist,
  onLoadSample,
  onDataCleared
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'welcome' | 'playlists' | 'privacy' | 'data'>('appearance');
  const [hiddenChannels, setHiddenChannels] = useState<string[]>(() => StorageService.getHiddenChannels());
  const [hiddenCategories, setHiddenCategories] = useState<string[]>(() => StorageService.getHiddenCategories());

  if (!isOpen) return null;

  const themes: { id: AppTheme; label: string; desc: string }[] = [
    { id: 'DARK', label: 'Dark Modern', desc: 'Sleek dark slate background' },
    { id: 'OLED_BLACK', label: 'OLED Pure Black', desc: 'Infinite contrast true black' },
    { id: 'BLUE', label: 'Midnight Blue', desc: 'Deep navy midnight blue' }
  ];

  const accents: { id: AccentColor; label: string; color: string }[] = [
    { id: 'BLUE', label: 'Electric Blue', color: '#3B82F6' },
    { id: 'PURPLE', label: 'Vibrant Purple', color: '#8B5CF6' },
    { id: 'GREEN', label: 'Emerald Green', color: '#10B981' },
    { id: 'RED', label: 'Ruby Red', color: '#EF4444' }
  ];

  const cardSizes: { id: CardSize; label: string }[] = [
    { id: 'COMPACT', label: 'Compact (150px)' },
    { id: 'NORMAL', label: 'Normal (180px)' },
    { id: 'LARGE', label: 'Large (215px)' }
  ];

  const handleUnhideChannel = (id: string) => {
    StorageService.unhideChannel(id);
    setHiddenChannels(StorageService.getHiddenChannels());
  };

  const handleUnhideCategory = (cat: string) => {
    StorageService.unhideCategory(cat);
    setHiddenCategories(StorageService.getHiddenCategories());
  };

  const handleUnhideAll = () => {
    StorageService.unhideAllChannels();
    StorageService.unhideAllCategories();
    setHiddenChannels([]);
    setHiddenCategories([]);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '760px',
        maxHeight: '85vh',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Settings & Preferences</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Tabs Layout */}
        <div style={{ display: 'flex', flex: 1, minHeight: '420px', overflow: 'hidden' }}>
          {/* Sidebar Tabs */}
          <div style={{
            width: '200px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRight: '1px solid var(--border-subtle)',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <TabButton
              icon={<Palette size={16} />}
              label="Appearance"
              isActive={activeTab === 'appearance'}
              onClick={() => setActiveTab('appearance')}
            />
            <TabButton
              icon={<Volume2 size={16} />}
              label="Welcome Video"
              isActive={activeTab === 'welcome'}
              onClick={() => setActiveTab('welcome')}
            />
            <TabButton
              icon={<Tv size={16} />}
              label="Playlists"
              isActive={activeTab === 'playlists'}
              onClick={() => setActiveTab('playlists')}
            />
            <TabButton
              icon={<EyeOff size={16} />}
              label="Hidden Items"
              isActive={activeTab === 'privacy'}
              onClick={() => setActiveTab('privacy')}
            />
            <TabButton
              icon={<Trash2 size={16} />}
              label="Data & Reset"
              isActive={activeTab === 'data'}
              onClick={() => setActiveTab('data')}
            />
          </div>

          {/* Tab Body */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {activeTab === 'appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Theme Background
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
                    {themes.map(t => (
                      <div
                        key={t.id}
                        onClick={() => onUpdatePreferences({ theme: t.id })}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          border: `2px solid ${uiPreferences.theme === t.id ? 'var(--glow)' : 'var(--border-subtle)'}`,
                          background: uiPreferences.theme === t.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{t.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Accent Color
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '8px' }}>
                    {accents.map(a => (
                      <div
                        key={a.id}
                        onClick={() => onUpdatePreferences({ accentColor: a.id })}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: `2px solid ${uiPreferences.accentColor === a.id ? a.color : 'var(--border-subtle)'}`,
                          background: 'rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: a.color }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{a.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Channel Card Size
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
                    {cardSizes.map(s => (
                      <div
                        key={s.id}
                        onClick={() => onUpdatePreferences({ cardSize: s.id })}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: `2px solid ${uiPreferences.cardSize === s.id ? 'var(--glow)' : 'var(--border-subtle)'}`,
                          background: uiPreferences.cardSize === s.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#fff'
                        }}
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Show Channel Logos</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Display channel logos from M3U or fallback monograms</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={uiPreferences.showLogos}
                    onChange={(e) => onUpdatePreferences({ showLogos: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--glow)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'welcome' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Enable Welcome Audio</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Play welcome theme sound on startup</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={uiPreferences.welcomeAudioEnabled}
                    onChange={(e) => onUpdatePreferences({ welcomeAudioEnabled: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--glow)', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Welcome Audio Volume Boost
                    </label>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--glow)' }}>
                      {uiPreferences.welcomeAudioVolume}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="5"
                    value={uiPreferences.welcomeAudioVolume}
                    onChange={(e) => onUpdatePreferences({ welcomeAudioVolume: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: 'var(--glow)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>0% (Muted)</span>
                    <span>100% (Standard)</span>
                    <span>150% (Enhanced Boost)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button
                    onClick={() => {
                      onUpdatePreferences({ isFirstRunCompleted: false });
                      onClose();
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid var(--glow)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    Preview Welcome Experience Screen
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'playlists' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Manage Playlists ({playlists.length})</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={onOpenAddPlaylist}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      + Add M3U
                    </button>
                    <button
                      onClick={onLoadSample}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      Load Sample Demo
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {playlists.map(pl => {
                    const isActive = pl.id === activePlaylist?.id;
                    return (
                      <div
                        key={pl.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          borderRadius: '10px',
                          background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${isActive ? 'var(--glow)' : 'var(--border-subtle)'}`
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{pl.name}</span>
                            {isActive && (
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--primary)', color: '#fff' }}>
                                Active
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {pl.channelCount} channels • Type: {pl.sourceType}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {pl.sourceType === 'url' && (
                            <button
                              onClick={() => onRefreshPlaylist(pl.id)}
                              title="Refresh Channels"
                              style={{ padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: '#fff' }}
                            >
                              <RefreshCw size={14} />
                            </button>
                          )}
                          {!isActive && (
                            <button
                              onClick={() => onSelectPlaylist(pl.id)}
                              style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--primary)', color: '#fff', fontSize: '12px', fontWeight: 600 }}
                            >
                              Select
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Delete playlist "${pl.name}"?`)) {
                                onDeletePlaylist(pl.id);
                              }
                            }}
                            title="Delete Playlist"
                            style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Hidden Content & Parental Filtering</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Restore channels or categories you previously hid</div>
                  </div>
                  {(hiddenChannels.length > 0 || hiddenCategories.length > 0) && (
                    <button
                      onClick={handleUnhideAll}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--primary)', color: '#fff', fontSize: '12px', fontWeight: 600 }}
                    >
                      Unhide All
                    </button>
                  )}
                </div>

                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Hidden Channels ({hiddenChannels.length})
                  </h4>
                  {hiddenChannels.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No hidden channels.</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {hiddenChannels.map(id => (
                        <div
                          key={id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.06)',
                            fontSize: '12px',
                            color: '#fff'
                          }}
                        >
                          <span>{id}</span>
                          <button onClick={() => handleUnhideChannel(id)} style={{ background: 'transparent', color: 'var(--glow)' }}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Hidden Categories ({hiddenCategories.length})
                  </h4>
                  {hiddenCategories.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No hidden categories.</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {hiddenCategories.map(cat => (
                        <div
                          key={cat}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.06)',
                            fontSize: '12px',
                            color: '#fff'
                          }}
                        >
                          <span>{cat}</span>
                          <button onClick={() => handleUnhideCategory(cat)} style={{ background: 'transparent', color: 'var(--glow)' }}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Storage & Data Management</div>

                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Clear Favorites</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Remove all starred favorite channels</div>
                    </div>
                    <button
                      onClick={() => {
                        StorageService.clearFavorites();
                        alert('Favorites cleared.');
                      }}
                      style={{ padding: '6px 14px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', fontWeight: 600 }}
                    >
                      Clear
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Clear Watch History</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Remove all recently watched streams</div>
                    </div>
                    <button
                      onClick={() => {
                        StorageService.clearRecentlyWatched();
                        alert('Watch history cleared.');
                      }}
                      style={{ padding: '6px 14px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', fontWeight: 600 }}
                    >
                      Clear
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#EF4444' }}>Factory Reset All Data</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Deletes all playlists, history, and settings</div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all data and clear all playlists?')) {
                          StorageService.clearAllData();
                          onDataCleared();
                          onClose();
                        }
                      }}
                      style={{ padding: '6px 14px', borderRadius: '6px', background: '#EF4444', color: '#fff', fontSize: '12px', fontWeight: 700 }}
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      borderRadius: '8px',
      background: isActive ? 'var(--primary)' : 'transparent',
      color: isActive ? '#fff' : 'var(--text-primary)',
      fontSize: '13px',
      fontWeight: isActive ? 700 : 500,
      textAlign: 'left',
      transition: 'all 0.12s ease'
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);
