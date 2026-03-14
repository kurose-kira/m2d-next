'use client';

import { formatNum } from '@/utils/helpers';
import { useApp } from '@/contexts/AppContext';
import Icon from '@/components/Icon/page';
import ModImage from '@/components/ModImage/page';
import userIconRaw from '@/assets/icons/user.svg';
import downloadIconRaw from '@/assets/icons/download.svg';
import starIconRaw from '@/assets/icons/star.svg';

const FALLBACK_ICON = 'https://cdn.modrinth.com/assets/unknown_server.png';

interface ModData {
  project_id: string;
  title: string;
  author: string;
  downloads: number;
  icon_url?: string;
  [key: string]: unknown;
}

interface ModCardProps {
  mod: ModData;
  isDesktop: boolean;
}

export default function ModCard({ mod, isDesktop }: ModCardProps) {
  const { selectedMods, toggleMod, activeModId, setActiveModId, favorites, toggleFavorite } = useApp();
  const isSelected = selectedMods.has(mod.project_id);
  const isFavorite = favorites.has(mod.project_id);
  const isActive = activeModId === mod.project_id;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLInputElement).type === 'checkbox') return;
    if (isDesktop) {
      setActiveModId(mod.project_id);
    } else {
      toggleMod(mod.project_id);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleMod(mod.project_id);
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleFavorite(mod.project_id);
  };

  return (
    <div
      className={`mod-card ${isSelected ? 'selected' : ''} ${isActive && isDesktop ? 'active' : ''}`}
      onClick={handleCardClick}
    >
      <div className="mod-checkbox-wrapper">
        <input
          type="checkbox"
          className="mod-checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
        />
      </div>
      <ModImage
        src={mod.icon_url || FALLBACK_ICON}
        width={56}
        height={56}
        className="mod-icon"
        alt="icon"
      />
      <div className="mod-info">
        <h3 className="mod-title">{mod.title}</h3>
        <div className="mod-meta">
          <span><Icon svg={userIconRaw} size={12} /> {mod.author}</span>
          <span><Icon svg={downloadIconRaw} size={12} /> {formatNum(mod.downloads)}</span>
        </div>
      </div>
      <button
        className={`mod-favorite-btn ${isFavorite ? 'favorited' : ''}`}
        onClick={handleFavoriteClick}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Icon svg={starIconRaw} size={14} />
      </button>
    </div>
  );
}

