import React from 'react';
import { ExternalLink, X, ShieldAlert } from 'lucide-react';
import { SportsEvent, SportsChannel } from '../models/types';
import { PROVIDERS_META } from '../services/SportsCatalogService';

interface ExternalFallbackModalProps {
  item: SportsEvent | SportsChannel | null;
  onClose: () => void;
}

export const ExternalFallbackModal: React.FC<ExternalFallbackModalProps> = ({
  item,
  onClose
}) => {
  if (!item) return null;

  const providerMeta = PROVIDERS_META.find(p => p.id === item.provider) || {
    id: item.provider,
    name: item.provider,
    badgeColor: '#3b82f6',
    logoText: item.provider,
    webUrl: item.externalWebUrl || 'https://www.google.com'
  };

  const title = 'title' in item ? item.title : item.name;
  const targetUrl = item.externalWebUrl || providerMeta.webUrl;

  const handleOpenProvider = () => {
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#131b2c',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        animation: 'fadeIn 0.15s ease-out'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: providerMeta.badgeColor,
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px'
            }}>
              {providerMeta.name}
            </span>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
              Live Sports Broadcast
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
            {title}
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
            This live broadcast requires official authentication and subscription verification on the <strong>{providerMeta.name}</strong> platform.
          </p>
        </div>

        {/* Callout box */}
        <div style={{
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <ShieldAlert size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.4 }}>
            Click below to open the official {providerMeta.name} broadcast page or mobile app directly.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleOpenProvider}
            style={{
              flex: 1.4,
              padding: '11px',
              borderRadius: '10px',
              backgroundColor: providerMeta.badgeColor,
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ExternalLink size={16} />
            Open in {providerMeta.name}
          </button>
        </div>
      </div>
    </div>
  );
};
