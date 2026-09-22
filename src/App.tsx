import React, { useState } from 'react';
import { Channel, UserAccount } from './models/types';
import { useUiPreferences } from './hooks/useUiPreferences';
import { usePlaylists } from './hooks/usePlaylists';
import { useChannels } from './hooks/useChannels';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { AuthService } from './services/authService';
import { StorageService } from './services/storageService';
import { WelcomeScreen } from './components/Welcome/WelcomeScreen';
import { Header } from './components/Header/Header';
import { CategorySidebar } from './components/Sidebar/CategorySidebar';
import { ChannelGrid } from './components/ChannelGrid/ChannelGrid';
import { VideoPlayer } from './components/VideoPlayer/VideoPlayer';
import { SettingsModal } from './components/Settings/SettingsModal';
import { AddPlaylistModal } from './components/Playlist/AddPlaylistModal';
import { AuthModal } from './components/Auth/AuthModal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const user = AuthService.getCurrentUser();
    StorageService.setScope(user ? user.id : 'guest');
    return user;
  });

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    StorageService.setScope(user.id);
    const updatedPlaylists = StorageService.getPlaylists();
    if (updatedPlaylists.length > 0) {
      selectPlaylist(updatedPlaylists[0].id);
    }
    refreshHiddenState();
    refreshRecentlyWatched();
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    StorageService.setScope('guest');
    const guestPlaylists = StorageService.getPlaylists();
    selectPlaylist(guestPlaylists.length > 0 ? guestPlaylists[0].id : '');
    refreshHiddenState();
    refreshRecentlyWatched();
  };

  const handleLibraryReload = () => {
    const updatedPlaylists = StorageService.getPlaylists();
    if (updatedPlaylists.length > 0) {
      selectPlaylist(updatedPlaylists[0].id);
    }
    refreshHiddenState();
    refreshRecentlyWatched();
  };

  useKeyboardShortcuts({
    onSearch: () => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) input.focus();
    },
    onEscape: () => {
      if (isAddModalOpen) setIsAddModalOpen(false);
      else if (isSettingsOpen) setIsSettingsOpen(false);
      else if (isAuthModalOpen) setIsAuthModalOpen(false);
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
            user={currentUser}
            playlists={playlists}
            activePlaylist={activePlaylist}
            favoritesCount={favoritesCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectPlaylist={selectPlaylist}
            onOpenAddPlaylist={() => setIsAddModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onLibraryImported={handleLibraryReload}
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

      {activeChannel && (
        <VideoPlayer
          channel={activeChannel}
          allChannels={displayedChannels}
          onBack={() => setActiveChannel(null)}
          onSelectChannel={handlePlayChannel}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          refreshHiddenState();
          refreshRecentlyWatched();
        }}
        uiPreferences={preferences}
        onUpdatePreferences={updatePreferences}
        user={currentUser}
        playlists={playlists}
        activePlaylist={activePlaylist}
        onSelectPlaylist={selectPlaylist}
        onDeletePlaylist={deletePlaylist}
        onRefreshPlaylist={refreshPlaylist}
        onOpenAddPlaylist={() => setIsAddModalOpen(true)}
        onLoadSample={handleLoadSample}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onDataCleared={() => {
          selectPlaylist('');
          refreshHiddenState();
          refreshRecentlyWatched();
        }}
      />

      <AddPlaylistModal
        isOpen={isAddModalOpen}
        isLoading={isPlaylistLoading}
        errorMessage={playlistError}
        onClose={() => setIsAddModalOpen(false)}
        onSubmitUrl={handleAddUrl}
        onSubmitFile={handleAddFile}
        onLoadSample={handleLoadSample}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};
