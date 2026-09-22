import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  onSearch?: () => void;
  onEscape?: () => void;
  onFullscreen?: () => void;
  onMuteToggle?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input / textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === '/' || (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        options.onSearch?.();
      } else if (e.key === 'Escape') {
        options.onEscape?.();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        options.onFullscreen?.();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        options.onMuteToggle?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}