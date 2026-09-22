import React from 'react';
import { Tv, Star, History, Folder, EyeOff } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategorySidebarProps {
  categories: Category[];
  totalChannelsCount: number;
  favoritesCount: number;
  recentCount: number;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onHideCategory?: (name: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  totalChannelsCount,
  favoritesCount,
  recentCount,
  selectedCategory,
  onSelectCategory,
  onHideCategory
}) => {
  return (
    <aside style={{
      width: '240px',
      height: '100%',
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 10px',
      overflowY: 'auto',
      userSelect: 'none',
      flexShrink: 0
    }}>
      {/* Primary Navigation Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
        {/* All Channels */}
        <SidebarItem
          icon={<Tv size={18} />}
          label="All Channels"
          count={totalChannelsCount}
          isActive={selectedCategory === 'ALL'}
          onClick={() => onSelectCategory('ALL')}
        />

        {/* Favorites */}
        <SidebarItem
          icon={<Star size={18} fill={selectedCategory === 'FAVORITES' ? 'var(--favorite-yellow)' : 'none'} color="var(--favorite-yellow)" />}
          label="Favorites"
          count={favoritesCount}
          isActive={selectedCategory === 'FAVORITES'}
          onClick={() => onSelectCategory('FAVORITES')}
        />

        {/* Recently Watched */}
        <SidebarItem
          icon={<History size={18} color="var(--glow)" />}
          label="Recently Watched"
          count={recentCount}
          isActive={selectedCategory === 'RECENT'}
          onClick={() => onSelectCategory('RECENT')}
        />
      </div>

      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0 8px 12px' }} />

      {/* Category Header */}
      <div style={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        color: 'var(--text-secondary)',
        padding: '0 10px 8px',
        textTransform: 'uppercase'
      }}>
        Categories ({categories.length})
      </div>

      {/* Categories List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: isActive ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--glow)' : '3px solid transparent',
                color: isActive ? '#fff' : 'var(--text-primary)',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <Folder size={15} color={isActive ? 'var(--glow)' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {cat.name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? 'var(--glow)' : 'var(--text-secondary)'
                }}>
                  {cat.count}
                </span>

                {onHideCategory && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hide category "${cat.name}"? You can unhide it in Settings.`)) {
                        onHideCategory(cat.name);
                      }
                    }}
                    title="Hide this category"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      opacity: 0.5,
                      padding: '2px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.color = '#EF4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.5';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <EyeOff size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, count, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: '10px',
        cursor: 'pointer',
        background: isActive ? 'var(--primary)' : 'transparent',
        color: isActive ? '#fff' : 'var(--text-primary)',
        boxShadow: isActive ? '0 4px 14px var(--glow-shadow)' : 'none',
        fontWeight: isActive ? 700 : 500,
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {icon}
        <span style={{ fontSize: '14px' }}>{label}</span>
      </div>
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: '10px',
        background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
        color: isActive ? '#fff' : 'var(--text-secondary)'
      }}>
        {count}
      </span>
    </div>
  );
};