import { useState, useEffect } from 'react';
import { UiPreferences } from '../models/types';
import { StorageService } from '../services/storageService';

export function useUiPreferences() {
  const [preferences, setPreferences] = useState<UiPreferences>(() => StorageService.getUiPreferences());

  useEffect(() => {
    document.body.setAttribute('data-theme', preferences.theme);
    document.body.setAttribute('data-accent', preferences.accentColor);
    document.body.setAttribute('data-card-size', preferences.cardSize);
  }, [preferences.theme, preferences.accentColor, preferences.cardSize]);

  const updatePreferences = (newPrefs: Partial<UiPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      StorageService.saveUiPreferences(updated);
      return updated;
    });
  };

  return { preferences, updatePreferences };
}