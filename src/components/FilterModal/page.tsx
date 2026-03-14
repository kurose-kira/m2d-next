'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/contexts/AppContext';
import { LOADER_OPTIONS, CATEGORY_OPTIONS, OTHER_FILTER_OPTIONS } from '@/utils/helpers';
import { API } from '@/utils/api';
import CustomSelect from '@/components/CustomSelect/page';
import Icon from '@/components/Icon/page';

import listFilterIconRaw from '@/assets/icons/list-filter.svg';
import xIconRaw from '@/assets/icons/x.svg';

import fabricIconRaw from '@/assets/icons/tags/loaders/fabric.svg';
import forgeIconRaw from '@/assets/icons/tags/loaders/forge.svg';
import neoforgeIconRaw from '@/assets/icons/tags/loaders/neoforge.svg';
import quiltIconRaw from '@/assets/icons/tags/loaders/quilt.svg';

import optimizationIconRaw from '@/assets/icons/tags/categories/optimization.svg';
import technologyIconRaw from '@/assets/icons/tags/categories/technology.svg';
import magicIconRaw from '@/assets/icons/tags/categories/magic.svg';
import adventureIconRaw from '@/assets/icons/tags/categories/adventure.svg';
import decorationIconRaw from '@/assets/icons/tags/categories/decoration.svg';
import equipmentIconRaw from '@/assets/icons/tags/categories/equipment.svg';
import mobsIconRaw from '@/assets/icons/tags/categories/mobs.svg';
import libraryIconRaw from '@/assets/icons/tags/categories/library.svg';
import utilityIconRaw from '@/assets/icons/tags/categories/utility.svg';
import worldgenIconRaw from '@/assets/icons/tags/categories/worldgen.svg';
import foodIconRaw from '@/assets/icons/tags/categories/food.svg';
import storageIconRaw from '@/assets/icons/tags/categories/storage.svg';
import gameMechanicsIconRaw from '@/assets/icons/tags/categories/game-mechanics.svg';

const LOADER_ICON_PATHS: Record<string, string> = {
  fabric: fabricIconRaw, forge: forgeIconRaw, neoforge: neoforgeIconRaw, quilt: quiltIconRaw,
};

const CATEGORY_ICON_MAP: Record<string, string> = {
  optimization: optimizationIconRaw, technology: technologyIconRaw, magic: magicIconRaw,
  adventure: adventureIconRaw, decoration: decorationIconRaw, equipment: equipmentIconRaw,
  mobs: mobsIconRaw, library: libraryIconRaw, utility: utilityIconRaw, worldgen: worldgenIconRaw,
  food: foodIconRaw, storage: storageIconRaw, 'game-mechanics': gameMechanicsIconRaw,
};

interface Filters {
  loaders: Record<string, string | null>;
  categories: Record<string, string | null>;
  environment: { client_side: string | null; server_side: string | null };
  other: Record<string, string | null>;
  version: string;
}

interface FilterModalProps {
  filters: Filters;
  sort: string;
  onApply: (filters: Filters, sort?: string) => void;
  onClose: () => void;
}

export default function FilterModal({ filters, onApply, onClose, sort }: FilterModalProps) {
  const { t, addDebugLog } = useApp();
  const [pending, setPending] = useState<Filters>({
    ...filters,
    loaders: { ...filters.loaders },
    categories: { ...(filters.categories || {}) },
    environment: {
      client_side: filters.environment?.client_side ?? null,
      server_side: filters.environment?.server_side ?? null,
    },
    other: { ...(filters.other || {}) },
  });
  const [pendingSort, setPendingSort] = useState(sort);
  const [snapshot] = useState<Filters>({
    ...filters,
    loaders: { ...filters.loaders },
    categories: { ...(filters.categories || {}) },
    environment: {
      client_side: filters.environment?.client_side ?? null,
      server_side: filters.environment?.server_side ?? null,
    },
    other: { ...(filters.other || {}) },
  });
  const [snapshotSort] = useState(sort);
  const [gameVersions, setGameVersions] = useState<{ version: string; version_type: string }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    API.getGameVersions().then((versions: { version: string; version_type: string }[]) => {
      const releases = versions.filter(v => v.version_type === 'release');
      setGameVersions(releases);
    }).catch((e: unknown) => addDebugLog('warn', `Failed to load game versions: ${e}`));
  }, [addDebugLog]);

  const sortOptions = [
    { value: 'relevance', label: t.sort.relevance },
    { value: 'downloads', label: t.sort.downloads },
    { value: 'follows',   label: t.sort.followers },
    { value: 'newest',    label: t.sort.publishedDate },
    { value: 'updated',   label: t.sort.updatedDate },
  ];

  const toggleLoaderState = (loader: string, state: string) => {
    setPending(prev => ({
      ...prev,
      loaders: { ...prev.loaders, [loader]: prev.loaders[loader] === state ? null : state },
    }));
  };

  const toggleCategoryState = (category: string, state: string) => {
    setPending(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: prev.categories[category] === state ? null : state },
    }));
  };

  const toggleEnvironmentState = (side: 'client_side' | 'server_side', state: string) => {
    setPending(prev => ({
      ...prev,
      environment: { ...prev.environment, [side]: prev.environment[side] === state ? null : state },
    }));
  };

  const toggleOtherState = (key: string, state: string) => {
    setPending(prev => ({
      ...prev,
      other: { ...prev.other, [key]: prev.other[key] === state ? null : state },
    }));
  };

  const handleUndo = () => {
    setPending({
      ...snapshot,
      loaders: { ...snapshot.loaders },
      categories: { ...snapshot.categories },
      environment: { client_side: snapshot.environment?.client_side ?? null, server_side: snapshot.environment?.server_side ?? null },
      other: { ...snapshot.other },
    });
    setPendingSort(snapshotSort);
  };

  const handleApply = () => { onApply(pending, pendingSort); };
  const handleDone = () => { onApply(pending, pendingSort); onClose(); };

  if (!mounted) return null;

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            <Icon svg={listFilterIconRaw} size={20} className="filter-btn-icon" />
            {t.filters.title}
          </h3>
          <button onClick={onClose} className="btn-close-modal">
            <Icon svg={xIconRaw} size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="filter-category">
            <h4 className="filter-category-title">{t.filters.version}</h4>
            <CustomSelect
              options={[
                { value: '', label: t.filters.versionAny || 'Any' },
                ...gameVersions.map(v => ({ value: v.version, label: v.version })),
              ]}
              value={pending.version || ''}
              onChange={v => setPending(prev => ({ ...prev, version: v }))}
            />
          </div>
          <div className="filter-category">
            <h4 className="filter-category-title">{t.sort.label}</h4>
            <CustomSelect options={sortOptions} value={pendingSort} onChange={setPendingSort} />
          </div>
          <div className="filter-category">
            <h4 className="filter-category-title">{t.filters.loader}</h4>
            <div className="filter-items">
              {LOADER_OPTIONS.map(({ value, label }) => {
                const iconSvg = LOADER_ICON_PATHS[value];
                return (
                  <div key={value} className="filter-item-row">
                    <span className="filter-item-label">
                      {iconSvg && <Icon svg={iconSvg} size={16} className="loader-icon-img" />}
                      {label}
                    </span>
                    <div className="filter-item-btns">
                      <button className={`btn-filter-state${pending.loaders[value] === 'include' ? ' active-include' : ''}`} onClick={() => toggleLoaderState(value, 'include')}>{t.filters.include}</button>
                      <button className={`btn-filter-state${pending.loaders[value] === 'exclude' ? ' active-exclude' : ''}`} onClick={() => toggleLoaderState(value, 'exclude')}>{t.filters.exclude}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="filter-category">
            <h4 className="filter-category-title">{t.filters.categories}</h4>
            <div className="filter-items">
              {CATEGORY_OPTIONS.map(({ value, labelKey }) => {
                const label = t.categories[labelKey as keyof typeof t.categories];
                const iconSvg = CATEGORY_ICON_MAP[value];
                return (
                  <div key={value} className="filter-item-row">
                    <span className="filter-item-label">
                      {iconSvg && <Icon svg={iconSvg} size={16} className="category-icon-img" />}
                      {label}
                    </span>
                    <div className="filter-item-btns">
                      <button className={`btn-filter-state${pending.categories[value] === 'include' ? ' active-include' : ''}`} onClick={() => toggleCategoryState(value, 'include')}>{t.filters.include}</button>
                      <button className={`btn-filter-state${pending.categories[value] === 'exclude' ? ' active-exclude' : ''}`} onClick={() => toggleCategoryState(value, 'exclude')}>{t.filters.exclude}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="filter-category">
            <h4 className="filter-category-title">{t.filters.environment}</h4>
            <div className="filter-items">
              <div className="filter-item-row">
                <span className="filter-item-label">{t.filters.clientSide}</span>
                <div className="filter-item-btns">
                  <button className={`btn-filter-state${pending.environment.client_side === 'include' ? ' active-include' : ''}`} onClick={() => toggleEnvironmentState('client_side', 'include')}>{t.filters.include}</button>
                  <button className={`btn-filter-state${pending.environment.client_side === 'exclude' ? ' active-exclude' : ''}`} onClick={() => toggleEnvironmentState('client_side', 'exclude')}>{t.filters.exclude}</button>
                </div>
              </div>
              <div className="filter-item-row">
                <span className="filter-item-label">{t.filters.serverSide}</span>
                <div className="filter-item-btns">
                  <button className={`btn-filter-state${pending.environment.server_side === 'include' ? ' active-include' : ''}`} onClick={() => toggleEnvironmentState('server_side', 'include')}>{t.filters.include}</button>
                  <button className={`btn-filter-state${pending.environment.server_side === 'exclude' ? ' active-exclude' : ''}`} onClick={() => toggleEnvironmentState('server_side', 'exclude')}>{t.filters.exclude}</button>
                </div>
              </div>
            </div>
          </div>
          <div className="filter-category" style={{ marginBottom: 0 }}>
            <h4 className="filter-category-title">{t.filters.other}</h4>
            <div className="filter-items">
              {OTHER_FILTER_OPTIONS.map(({ value, labelKey }) => {
                const label = t.filters[labelKey as keyof typeof t.filters];
                return (
                  <div key={value} className="filter-item-row">
                    <span className="filter-item-label">{label}</span>
                    <div className="filter-item-btns">
                      <button className={`btn-filter-state${pending.other[value] === 'include' ? ' active-include' : ''}`} onClick={() => toggleOtherState(value, 'include')}>{t.filters.include}</button>
                      <button className={`btn-filter-state${pending.other[value] === 'exclude' ? ' active-exclude' : ''}`} onClick={() => toggleOtherState(value, 'exclude')}>{t.filters.exclude}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={handleUndo} className="btn-secondary">{t.filters.undo}</button>
          <button onClick={handleApply} className="btn-secondary">{t.filters.apply}</button>
          <button onClick={handleDone} className="btn-primary" style={{ height: '2.25rem', padding: '0 1rem' }}>{t.filters.done}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
