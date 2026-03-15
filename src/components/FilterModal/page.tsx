'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { LOADER_OPTIONS, CATEGORY_OPTIONS, OTHER_FILTER_OPTIONS } from '@/utils/helpers';
import { API } from '@/utils/api';
import Modal from '@/components/Modal/page';
import Button from '@/components/Button/page';
import CustomSelect from '@/components/CustomSelect/page';
import Icon from '@/components/Icon/page';
import CategoryBlock from '@/components/CategoryBlock/page';
import FilterRow from '@/components/FilterRow/page';

import listFilterIconRaw from '@/assets/icons/list-filter.svg';

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

  const title = (
    <>
      <Icon svg={listFilterIconRaw} size={20} className="filter-btn-icon" />
      {t.filters.title}
    </>
  );

  const footer = (
    <>
      <Button onClick={handleUndo} variant="secondary">{t.filters.undo}</Button>
      <Button onClick={handleApply} variant="secondary">{t.filters.apply}</Button>
      <Button onClick={handleDone} variant="primary" style={{ height: '2.25rem', padding: '0 1rem' }}>{t.filters.done}</Button>
    </>
  );

  return (
    <Modal onClose={onClose} title={title} footer={footer} portal>
      <CategoryBlock title={t.filters.version} noItemsWrapper>
        <CustomSelect
          options={[
            { value: '', label: t.filters.versionAny || 'Any' },
            ...gameVersions.map(v => ({ value: v.version, label: v.version })),
          ]}
          value={pending.version || ''}
          onChange={v => setPending(prev => ({ ...prev, version: v }))}
        />
      </CategoryBlock>
      <CategoryBlock title={t.sort.label} noItemsWrapper>
        <CustomSelect options={sortOptions} value={pendingSort} onChange={setPendingSort} />
      </CategoryBlock>
      <CategoryBlock title={t.filters.loader}>
        {LOADER_OPTIONS.map(({ value, label }) => (
          <FilterRow
            key={value}
            label={label}
            iconSvg={LOADER_ICON_PATHS[value]}
            iconClassName="loader-icon-img"
            state={pending.loaders[value]}
            onToggle={(state) => toggleLoaderState(value, state)}
            includeLabel={t.filters.include}
            excludeLabel={t.filters.exclude}
          />
        ))}
      </CategoryBlock>
      <CategoryBlock title={t.filters.categories}>
        {CATEGORY_OPTIONS.map(({ value, labelKey }) => (
          <FilterRow
            key={value}
            label={t.categories[labelKey as keyof typeof t.categories]}
            iconSvg={CATEGORY_ICON_MAP[value]}
            iconClassName="category-icon-img"
            state={pending.categories[value]}
            onToggle={(state) => toggleCategoryState(value, state)}
            includeLabel={t.filters.include}
            excludeLabel={t.filters.exclude}
          />
        ))}
      </CategoryBlock>
      <CategoryBlock title={t.filters.environment}>
        <FilterRow
          label={t.filters.clientSide}
          state={pending.environment.client_side}
          onToggle={(state) => toggleEnvironmentState('client_side', state)}
          includeLabel={t.filters.include}
          excludeLabel={t.filters.exclude}
        />
        <FilterRow
          label={t.filters.serverSide}
          state={pending.environment.server_side}
          onToggle={(state) => toggleEnvironmentState('server_side', state)}
          includeLabel={t.filters.include}
          excludeLabel={t.filters.exclude}
        />
      </CategoryBlock>
      <CategoryBlock title={t.filters.other} style={{ marginBottom: 0 }}>
        {OTHER_FILTER_OPTIONS.map(({ value, labelKey }) => (
          <FilterRow
            key={value}
            label={t.filters[labelKey as keyof typeof t.filters]}
            state={pending.other[value]}
            onToggle={(state) => toggleOtherState(value, state)}
            includeLabel={t.filters.include}
            excludeLabel={t.filters.exclude}
          />
        ))}
      </CategoryBlock>
    </Modal>
  );
}
