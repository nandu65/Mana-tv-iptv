import React from 'react';
import { SportsProvider } from '../models/types';
import { PROVIDERS_META } from '../services/SportsCatalogService';

interface ProviderSelectorProps {
  selectedProvider: SportsProvider;
  onSelectProvider: (provider: SportsProvider) => void;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProvider,
  onSelectProvider
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflowX: 'auto',
      padding: '4px 0 12px 0',
      scrollbarWidth: 'none'
    }}>
      {PROVIDERS_META.map((meta) => {
        const isSelected = selectedProvider === meta.id;
        return (
          <button
            key={meta.id}
            onClick={() => onSelectProvider(meta.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '24px',
              border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: isSelected ? '#fff' : 'var(--text-secondary, #94a3b8)',
              fontSize: '13px',
              fontWeight: isSelected ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {meta.id !== 'ALL' && (
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: meta.badgeColor,
                display: 'inline-block'
              }} />
            )}
            {meta.name}
          </button>
        );
      })}
    </div>
  );
};

