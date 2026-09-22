import React, { useState } from 'react';
import { Channel } from './models/types';
import { useUiPreferences } from './hooks/useUiPreferences';
import { usePlaylists } from './hooks/usePlaylists';
import { useChannels } from './hooks/useChannels';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { WelcomeScreen } from './components/Welcome/WelcomeScreen';
import { Header } from './components/Header/Header';
import { CategorySidebar } from './components/Sidebar/CategorySidebar';
import { ChannelGrid } from './components/ChannelGrid/ChannelGrid';
import { VideoPlayer } from './components/VideoPlayer/VideoPlayer';
import { SettingsModal } from './components/Settings/SettingsModal';
import { AddPlaylistModal } from './components/Playlist/AddPlaylistModal';

export const App: React.FC = () => {
  const { preferences, updatePreferences } = useUiPreferences();
  const {
    playlists,
    activePlaylist,
    activePlaylistId,
    isLoading: isPlaylistLoading,
    error: playlistError,
    selectPlaylist,
    loadFromUrl,
    loadFromContent,
    loadSample,
    refreshPlaylist,
    deletePlaylist
  } = usePlaylists();

  const {
    allChannels,
    displayedChannels,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    favoritesCount,
    recentlyWatched,
    toggleFavorite,
    hideChannel,
    hideCategory,
    recordWatched,
    refreshHiddenState,
    refreshRecentlyWatched
  } = useChannels(activePlaylistId);

  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // If first run not completed and no playlists, show welcome
  const showWelcome = !preferences.isFirstRunCompleted && playlists.length === 0;

  const handlePlayChannel = (channel: Channel) => {
    setActiveChannel(channel);
    recordWatched(channel);
  };

  const handleLoadSample = async () => {
    try {
      await loadSample();
      updatePreferences({ isFirstRunCompleted: true });
    } catch (e) {
      console.error('Failed to load sample demo:', e);
    }
  };

  const handleAddUrl = async (name: string, url: string) => {
    try {
      await loadFromUrl(name, url);
      updatePreferences({ isFirstRunCompleted: true });
      setIsAddModalOpen(false);
    } catch (e) {
      console.error('Failed to load playlist from URL:', e);
    }
  };

  const handleAddFile = async (name: string, content: string) => {
    try {
      await loadFromContent(name, content, 'file');
      updatePreferences({ isFirstRunCompleted: true });
      setIsAddModalOpen(false);
    } catch (e) {
      console.error('Failed to load playlist from file:', e);
    }
  };

  useKeyboardShortcuts({
    onSearch: () => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) input.focus();
    },
    onEscape: () => {
      if (isAddModalOpen) setIsAddModalOpen(false);
      else if (isSettingsOpen) setIsSettingsOpen(false);
    }
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {showWelcome ? (
        <WelcomeScreen
          onOpenAddPlaylist={() => setIsAddModalOpen(true)}
          onLoadSample={handleLoadSample}
          welcomeAudioVolume={preferences.welcomeAudioVolume}
          welcomeAudioEnabled={preferences.welcomeAudioEnabled}
        />
      ) : (
        <>
          <Header
            playlists={playlists}
            activePlaylist={activePlaylist}
            favoritesCount={favoritesCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectPlaylist={selectPlaylist}
            onOpenAddPlaylist={() => setIsAddModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onRefreshActivePlaylist={activePlaylist?.sourceType === 'url' ? () => refreshPlaylist(activePlaylist.id) : undefined}
            isRefreshing={isPlaylistLoading}
          />

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <CategorySidebar
              categories={categories}
              totalChannelsCount={allChannels.length}
              favoritesCount={favoritesCount}
              recentCount={recentlyWatched.length}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onHideCategory={hideCategory}
            />

            <ChannelGrid
              channels={displayedChannels}
              showLogos={preferences.showLogos}
              onSelectChannel={handlePlayChannel}
              onToggleFavorite={toggleFavorite}
              onHideChannel={hideChannel}
              onOpenAddPlaylist={() => setIsAddModalOpen(true)}
              onLoadSample={handleLoadSample}
            />
          </div>
        </>
      )}

      {/* Video Player Overlay */}
      {activeChannel && (
        <VideoPlayer
          channel={activeChannel}
          allChannels={displayedChannels}
          onBack={() => setActiveChannel(null)}
          onSelectChannel={handlePlayChannel}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          refreshHiddenState();
          refreshRecentlyWatched();
        }}
        uiPreferences={preferences}
        onUpdatePreferences={updatePreferences}
        playlists={playlists}
        activePlaylist={activePlaylist}
        onSelectPlaylist={selectPlaylist}
        onDeletePlaylist={deletePlaylist}
        onRefreshPlaylist={refreshPlaylist}
        onOpenAddPlaylist={() => setIsAddModalOpen(true)}
        onLoadSample={handleLoadSample}
        onDataCleared={() => {
          selectPlaylist('');
          refreshHiddenState();
          refreshRecentlyWatched();
        }}
      />

      {/* Add Playlist Modal */}
      <AddPlaylistModal
        isOpen={isAddModalOpen}
        isLoading={isPlaylistLoading}
        errorMessage={playlistError}
        onClose={() => setIsAddModalOpen(false)}
        onSubmitUrl={handleAddUrl}
        onSubmitFile={handleAddFile}
        onLoadSample={handleLoadSample}
      />
    </div>
  );
};
