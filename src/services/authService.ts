import { UserAccount, AuthSession, UserLibraryBackup } from '../models/types';
import { StorageService } from './storageService';

const USERS_STORAGE_KEY = 'mana_tv_registered_users';
const SESSION_STORAGE_KEY = 'mana_tv_active_session';

export class AuthService {
  private static hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
  }

  public static getRegisteredUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load registered users:', e);
    }
    return [];
  }

  private static saveRegisteredUsers(users: UserAccount[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  public static getCurrentSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(SESSION_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
    return null;
  }

  public static getCurrentUser(): UserAccount | null {
    const session = this.getCurrentSession();
    return session ? session.user : null;
  }

  public static register(
    username: string,
    email: string,
    password: string,
    displayName: string,
    avatar?: string,
    migrateGuestPlaylists = true
  ): UserAccount {
    const cleanUser = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || username.trim();

    if (!cleanUser || cleanUser.length < 3) {
      throw new Error('Username must be at least 3 characters.');
    }
    if (!password || password.length < 4) {
      throw new Error('Password must be at least 4 characters.');
    }

    const users = this.getRegisteredUsers();
    if (users.some(u => u.username.toLowerCase() === cleanUser)) {
      throw new Error('Username is already taken. Please choose another.');
    }
    if (cleanEmail && users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Email is already registered. Please sign in instead.');
    }

    const newUser: UserAccount = {
      id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      username: cleanUser,
      email: cleanEmail,
      displayName: cleanName,
      avatar: avatar || undefined,
      createdAt: Date.now(),
      passwordHash: this.hashPassword(password)
    };

    users.push(newUser);
    this.saveRegisteredUsers(users);

    if (migrateGuestPlaylists) {
      const guestScope = 'guest';
      StorageService.setScope(guestScope);
      const guestPlaylists = StorageService.getPlaylists();
      const guestFavs = StorageService.getFavorites();
      const guestUi = StorageService.getUiPreferences();

      StorageService.setScope(newUser.id);
      if (guestPlaylists.length > 0) {
        StorageService.savePlaylists(guestPlaylists);
        guestPlaylists.forEach(pl => {
          StorageService.setScope(guestScope);
          const chs = StorageService.getChannels(pl.id);
          StorageService.setScope(newUser.id);
          StorageService.saveChannels(pl.id, chs);
        });
      }
      StorageService.saveUiPreferences({ ...guestUi, isFirstRunCompleted: true });
      if (guestFavs.length > 0) {
        guestFavs.forEach(fid => StorageService.toggleFavorite(fid));
      }
    } else {
      StorageService.setScope(newUser.id);
    }

    this.saveSession(newUser);
    return newUser;
  }

  public static login(identifier: string, password: string): UserAccount {
    const cleanId = identifier.trim().toLowerCase();
    const users = this.getRegisteredUsers();

    const user = users.find(u => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId);
    if (!user) {
      throw new Error('No account found with this username or email.');
    }

    const inputHash = this.hashPassword(password);
    if (user.passwordHash !== inputHash) {
      throw new Error('Invalid password. Please check your credentials.');
    }

    this.saveSession(user);
    StorageService.setScope(user.id);
    return user;
  }

  public static logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    StorageService.setScope('guest');
  }

  private static saveSession(user: UserAccount): void {
    const session: AuthSession = {
      user,
      token: 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
      createdAt: Date.now()
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  public static updateProfile(userId: string, updates: { displayName?: string; avatar?: string; email?: string }): UserAccount {
    const users = this.getRegisteredUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found.');

    const updatedUser = {
      ...users[index],
      ...updates
    };

    users[index] = updatedUser;
    this.saveRegisteredUsers(users);

    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.user.id === userId) {
      currentSession.user = updatedUser;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
    }

    return updatedUser;
  }

  public static exportUserLibrary(): string {
    const currentUser = this.getCurrentUser();
    const playlists = StorageService.getPlaylists();
    const channelsMap: Record<string, any[]> = {};
    playlists.forEach(pl => {
      channelsMap[pl.id] = StorageService.getChannels(pl.id);
    });

    const backup: UserLibraryBackup = {
      version: '1.0',
      user: {
        username: currentUser?.username || 'Guest',
        displayName: currentUser?.displayName || 'Guest User'
      },
      exportedAt: Date.now(),
      playlists,
      channelsMap,
      favorites: StorageService.getFavorites(),
      hiddenChannels: StorageService.getHiddenChannels(),
      hiddenCategories: StorageService.getHiddenCategories(),
      uiPreferences: StorageService.getUiPreferences()
    };

    return JSON.stringify(backup, null, 2);
  }

  public static importUserLibrary(backupJson: string): void {
    try {
      const backup: UserLibraryBackup = JSON.parse(backupJson);
      if (!backup.playlists || !Array.isArray(backup.playlists)) {
        throw new Error('Invalid IPTV backup file format.');
      }

      StorageService.savePlaylists(backup.playlists);
      if (backup.channelsMap) {
        Object.entries(backup.channelsMap).forEach(([playlistId, channels]) => {
          StorageService.saveChannels(playlistId, channels);
        });
      }

      if (backup.favorites && Array.isArray(backup.favorites)) {
        backup.favorites.forEach(fid => StorageService.toggleFavorite(fid));
      }

      if (backup.uiPreferences) {
        StorageService.saveUiPreferences(backup.uiPreferences);
      }
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Failed to import IPTV backup JSON.');
    }
  }
}
