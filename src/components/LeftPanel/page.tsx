'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { LOADER_OPTIONS, CATEGORY_OPTIONS, OTHER_FILTER_OPTIONS } from '@/utils/helpers';
import { API } from '@/utils/api';
import CustomSelect from '@/components/CustomSelect/page';
import Icon from '@/components/Icon/page';

import cubeIconRaw from '@/assets/icons/cube.svg';
import packageIconRaw from '@/assets/icons/package.svg';
import blocksIconRaw from '@/assets/icons/blocks.svg';
import bookmarkIconRaw from '@/assets/icons/bookmark.svg';

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

const NAV_TABS = ['mods', 'resourcePacks', 'shaders'] as const;

interface Filters {
  loaders: Record<string, string | null>;
  categories: Record<string, string | null>;
  environment: { client_side: string | null; server_side: string | null };
  other: Record<string, string | null>;
  version: string;
  license: string;
}

interface LeftPanelProps {
  onFilterChange: (filters: Filters) => void;
}

export default function LeftPanel({ onFilterChange }: LeftPanelProps) {
  const { t, modVersion, updateModVersion, addDebugLog } = useApp();
  const [activeNav, setActiveNav] = useState('mods');
  const [gameVersions, setGameVersions] = useState<{ version: string; version_type: string }[]>([]);
  const [filters, setFilters] = useState<Filters>(() => ({
    loaders: Object.fromEntries(LOADER_OPTIONS.map(o => [o.value, null])),
    categories: Object.fromEntries(CATEGORY_OPTIONS.map(o => [o.value, null])),
    environment: { client_side: null, server_side: null },
    other: Object.fromEntries(OTHER_FILTER_OPTIONS.map(o => [o.value, null])),
    version: modVersion || '',
    license: '',
  }));

  useEffect(() => {
    API.getGameVersions()
      .then((versions: { version: string; version_type: string }[]) => {
        const releases = versions.filter(v => v.version_type === 'release');
        setGameVersions(releases);
      })
      .catch((e: unknown) => addDebugLog('warn', `Failed to load game versions: ${e}`));
  }, [addDebugLog]);

  const emit = (newFilters: Filters) => { onFilterChange(newFilters); };

  const setVersion = (v: string) => {
    const newFilters = { ...filters, version: v };
    setFilters(newFilters);
    if (v && v !== modVersion) updateModVersion(v);
    emit(newFilters);
  };

  const setLicense = (v: string) => {
    const newFilters = { ...filters, license: v };
    setFilters(newFilters);
    emit(newFilters);
  };

  const toggleLoader = (loader: string, state: string) => {
    const newFilters = {
      ...filters,
      loaders: { ...filters.loaders, [loader]: filters.loaders[loader] === state ? null : state },
    };
    setFilters(newFilters);
    emit(newFilters);
  };

  const toggleCategory = (cat: string, state: string) => {
    const newFilters = {
      ...filters,
      categories: { ...filters.categories, [cat]: filters.categories[cat] === state ? null : state },
    };
    setFilters(newFilters);
    emit(newFilters);
  };

  const toggleEnvironment = (side: 'client_side' | 'server_side', state: string) => {
    const newFilters = {
      ...filters,
      environment: { ...filters.environment, [side]: filters.environment[side] === state ? null : state },
    };
    setFilters(newFilters);
    emit(newFilters);
  };

  const toggleOther = (key: string, state: string) => {
    const newFilters = {
      ...filters,
      other: { ...filters.other, [key]: filters.other[key] === state ? null : state },
    };
    setFilters(newFilters);
    emit(newFilters);
  };

  const navIcons: Record<string, string> = { mods: cubeIconRaw, resourcePacks: packageIconRaw, shaders: blocksIconRaw };

  const LICENSE_OPTIONS = [
    { value: '', label: t.filters.versionAny },
    { value: 'mit', label: 'MIT' },
    { value: 'apache-2', label: 'Apache 2.0' },
    { value: 'lgpl-3', label: 'LGPL 3.0' },
    { value: 'gpl-3', label: 'GPL 3.0' },
    { value: 'mpl', label: 'MPL 2.0' },
    { value: 'arr', label: 'ARR' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="left-panel">
      <div className="left-panel-nav">
        {NAV_TABS.map(tab => (
          <button
            key={tab}
            className={`left-nav-btn ${activeNav === tab ? 'active' : ''} ${tab !== 'mods' ? 'disabled' : ''}`}
            onClick={() => tab === 'mods' && setActiveNav(tab)}
            title={tab !== 'mods' ? 'Coming soon' : undefined}
          >
            <Icon svg={navIcons[tab]} size={16} />
            <span>{t.nav[tab]}</span>
          </button>
        ))}
      </div>
      <div className="left-panel-profiles-hint">
        <Icon svg={bookmarkIconRaw} size={14} />
        <span>{t.nav.profilesHint}</span>
      </div>
      <div className="left-panel-filters">
        <div className="lp-filter-section">
          <h4 className="lp-filter-title">{t.filters.version}</h4>
          <CustomSelect
            options={[
              { value: '', label: t.filters.versionAny },
              ...gameVersions.map(v => ({ value: v.version, label: v.version })),
            ]}
            value={filters.version}
            onChange={setVersion}
          />
        </div>
        <div className="lp-filter-section">
          <h4 className="lp-filter-title">{t.filters.loader}</h4>
          <div className="lp-filter-items">
            {LOADER_OPTIONS.map(({ value, label }) => {
              const iconSvg = LOADER_ICON_PATHS[value];
              return (
                <div key={value} className="lp-filter-row">
                  <span className="lp-filter-label">
                    {iconSvg && <Icon svg={iconSvg} size={14} className="loader-icon-img" />}
                    {label}
                  </span>
                  <div className="lp-filter-btns">
                    <button className={`btn-filter-state${filters.loaders[value] === 'include' ? ' active-include' : ''}`} onClick={() => toggleLoader(value, 'include')}>{t.filters.include}</button>
                    <button className={`btn-filter-state${filters.loaders[value] === 'exclude' ? ' active-exclude' : ''}`} onClick={() => toggleLoader(value, 'exclude')}>{t.filters.exclude}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="lp-filter-section">
          <h4 className="lp-filter-title">{t.filters.categories}</h4>
          <div className="lp-filter-items">
            {CATEGORY_OPTIONS.map(({ value, labelKey }) => {
              const label = t.categories[labelKey as keyof typeof t.categories];
              const iconSvg = CATEGORY_ICON_MAP[value];
              return (
                <div key={value} className="lp-filter-row">
                  <span className="lp-filter-label">
                    {iconSvg && <Icon svg={iconSvg} size={14} className="category-icon-img" />}
                    {label}
                  </span>
                  <div className="lp-filter-btns">
                    <button className={`btn-filter-state${filters.categories[value] === 'include' ? ' active-include' : ''}`} onClick={() => toggleCategory(value, 'include')}>{t.filters.include}</button>
                    <button className={`btn-filter-state${filters.categories[value] === 'exclude' ? ' active-exclude' : ''}`} onClick={() => toggleCategory(value, 'exclude')}>{t.filters.exclude}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="lp-filter-section">
          <h4 className="lp-filter-title">{t.filters.environment}</h4>
          <div className="lp-filter-items">
            {([
              { key: 'client_side' as const, label: t.filters.clientSide },
              { key: 'server_side' as const, label: t.filters.serverSide },
            ]).map(({ key, label }) => (
              <div key={key} className="lp-filter-row">
                <span className="lp-filter-label">{label}</span>
                <div className="lp-filter-btns">
                  <button className={`btn-filter-state${filters.environment[key] === 'include' ? ' active-include' : ''}`} onClick={() => toggleEnvironment(key, 'include')}>{t.filters.include}</button>
                  <button className={`btn-filter-state${filters.environment[key] === 'exclude' ? ' active-exclude' : ''}`} onClick={() => toggleEnvironment(key, 'exclude')}>{t.filters.exclude}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-filter-section">
          <h4 className="lp-filter-title">{t.filters.license}</h4>
          <CustomSelect options={LICENSE_OPTIONS} value={filters.license} onChange={setLicense} />
        </div>
        <div className="lp-filter-section">
          <h4 className="lp-filter-title">{t.filters.other}</h4>
          <div className="lp-filter-items">
            {OTHER_FILTER_OPTIONS.map(({ value, labelKey }) => {
              const label = t.filters[labelKey as keyof typeof t.filters];
              return (
                <div key={value} className="lp-filter-row">
                  <span className="lp-filter-label">{label}</span>
                  <div className="lp-filter-btns">
                    <button className={`btn-filter-state${filters.other[value] === 'include' ? ' active-include' : ''}`} onClick={() => toggleOther(value, 'include')}>{t.filters.include}</button>
                    <button className={`btn-filter-state${filters.other[value] === 'exclude' ? ' active-exclude' : ''}`} onClick={() => toggleOther(value, 'exclude')}>{t.filters.exclude}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
