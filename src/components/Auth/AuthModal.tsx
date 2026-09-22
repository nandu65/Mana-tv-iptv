import React, { useState } from 'react';
import { X, User, Lock, Mail, ArrowRight, Shield } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { UserAccount } from '../../models/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
}

const AVATAR_OPTIONS = [
  '⚡', '📺', '🚀', '🔥', '👑', '🎬', '🌟', '🎯', '🦁', '💎'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚡');
  const [migrateData, setMigrateData] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const user = AuthService.login(username, password);
        onAuthSuccess(user);
        onClose();
      } else {
        const user = AuthService.register(username, email, password, displayName, selectedAvatar, migrateData);
        onAuthSuccess(user);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '18px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/assets/app_logo.png"
            alt="Mana TV"
            style={{ height: '36px', width: 'auto' }}
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              {mode === 'signin' ? 'Sign In to Mana TV' : 'Create Mana TV Account'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {mode === 'signin'
                ? 'Access your saved IPTV playlists and favorite channels'
                : 'Keep your playlists saved forever with persistent login'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.35)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => { setMode('signin'); setErrorMessage(null); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              background: mode === 'signin' ? 'var(--primary)' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              background: mode === 'signup' ? 'var(--primary)' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            Create Account
          </button>
        </div>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Choose Profile Avatar
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                {AVATAR_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      fontSize: '18px',
                      background: selectedAvatar === emoji ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${selectedAvatar === emoji ? 'var(--glow)' : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Username {mode === 'signin' ? 'or Email' : ''} *
            </label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <User size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                placeholder={mode === 'signin' ? 'Username or email address' : 'Choose a username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    marginTop: '6px',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0 12px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Email Address (Optional)
                </label>
                <div style={{ position: 'relative', marginTop: '6px' }}>
                  <Mail size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      paddingLeft: '38px',
                      paddingRight: '12px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Password *
            </label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
              <input
                type="checkbox"
                id="migrate-check"
                checked={migrateData}
                onChange={(e) => setMigrateData(e.target.checked)}
                style={{ accentColor: 'var(--glow)', width: '16px', height: '16px' }}
              />
              <label htmlFor="migrate-check" style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Import current playlists & favorites into this account
              </label>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            fontSize: '12px',
            color: 'var(--glow)'
          }}>
            <Shield size={15} style={{ flexShrink: 0 }} />
            <span>Persistent session: Stay logged in until you choose to log out.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: '44px',
              borderRadius: '10px',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px',
              boxShadow: '0 4px 14px var(--glow-shadow)'
            }}
          >
            <span>{mode === 'signin' ? 'Sign In' : 'Create Account & Save IPTV'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
