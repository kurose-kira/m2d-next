'use client';

import { useApp } from '@/contexts/AppContext';
import Icon from '@/components/Icon/page';
import shieldCheckIconRaw from '@/assets/icons/shield-check.svg';
import downloadIconRaw from '@/assets/icons/download.svg';

interface ActionBarProps {
  onCheckDeps: () => void;
  onDownload: () => void;
}

export default function ActionBar({ onCheckDeps, onDownload }: ActionBarProps) {
  const { selectedMods, clearMods, setSelectedModalOpen } = useApp();
  const count = selectedMods.size;

  return (
    <div className={`action-bar ${count > 0 ? 'visible' : ''}`}>
      <div className="action-bar-top">
        <button onClick={() => setSelectedModalOpen(true)} className="selected-count-btn">
          <span className="selected-badge">{count} Selected</span>
          <span className="view-list-text">View List</span>
        </button>
        <button onClick={clearMods} className="btn-clear">Clear All</button>
      </div>
      <div className="action-buttons">
        <button onClick={onCheckDeps} className="btn-action btn-check">
          <Icon svg={shieldCheckIconRaw} size={16} /> Check
        </button>
        <button onClick={onDownload} className="btn-action btn-download">
          <Icon svg={downloadIconRaw} size={16} /> Download
        </button>
      </div>
    </div>
  );
}

