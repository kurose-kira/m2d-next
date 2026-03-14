'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import FilterModal from '@/components/FilterModal/page';
import Icon from '@/components/Icon/page';
import { LOADER_OPTIONS, CATEGORY_OPTIONS, OTHER_FILTER_OPTIONS } from '@/utils/helpers';

import searchIconRaw from '@/assets/icons/search.svg';
import listFilterIconRaw from '@/assets/icons/list-filter.svg';

const INITIAL_LOADER_STATE = Object.fromEntries(LOADER_OPTIONS.map(o => [o.value, null]));
const INITIAL_CATEGORY_STATE = Object.fromEntries(CATEGORY_OPTIONS.map(o => [o.value, null]));
const INITIAL_ENVIRONMENT_STATE = { client_side: null, server_side: null };
const INITIAL_OTHER_STATE = Object.fromEntries(OTHER_FILTER_OPTIONS.map(o => [o.value, null]));

interface Filters {
  loaders: Record<string, string | null>;
  categories: Record<string, string | null>;
  environment: { client_side: string | null; server_side: string | null };
  other: Record<string, string | null>;
  version: string;
}

function hasActiveFilters(filters: Filters, sort: string): boolean {
  const hasLoader = Object.values(filters.loaders).some(v => v !== null);
  const hasCategory = Object.values(filters.categories || {}).some(v => v !== null);
  const hasEnv = Object.values(filters.environment || {}).some(v => v !== null);
  const hasOther = Object.values(filters.other || {}).some(v => v !== null);
  return hasLoader || hasCategory || hasEnv || hasOther || filters.version.trim() !== '' || sort !== 'relevance';
}

interface SearchSectionProps {
  onSearch: (params: { query: string; sort: string; filters: Filters }) => void;
}

export default function SearchSection({ onSearch }: SearchSectionProps) {
  const { fastSearch, t, filterModalOpen, setFilterModalOpen, modVersion, updateModVersion } = useApp();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('relevance');
  const [filters, setFilters] = useState<Filters>(() => ({
    loaders: { ...INITIAL_LOADER_STATE },
    categories: { ...INITIAL_CATEGORY_STATE },
    environment: { ...INITIAL_ENVIRONMENT_STATE },
    other: { ...INITIAL_OTHER_STATE },
    version: modVersion || '',
  }));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = (q = query, s = sort, f = filters) => {
    onSearch({ query: q, sort: s, filters: f });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (fastSearch) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(q, sort, filters), 500);
    }
  };

  const handleApplyFilters = (newFilters: Filters, newSort?: string) => {
    setFilters(newFilters);
    if (newSort !== undefined) setSort(newSort);
    if (newFilters.version && newFilters.version !== modVersion) {
      updateModVersion(newFilters.version);
    }
    doSearch(query, newSort ?? sort, newFilters);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <section className="search-section">
      <div className="search-bar">
        <button
          className="btn-filters"
          onClick={() => setFilterModalOpen(true)}
        >
          <Icon svg={listFilterIconRaw} size={16} className="filter-btn-icon" />
          {t.filters.label}
          {hasActiveFilters(filters, sort) && <span className="filter-active-dot" />}
        </button>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onKeyDown={!fastSearch ? handleKeyPress : undefined}
          placeholder={t.search.placeholder}
          className="input-large search-input"
        />
        {!fastSearch && (
          <button onClick={() => doSearch()} className="btn-search">
            <Icon svg={searchIconRaw} size={20} />
          </button>
        )}
      </div>
      {filterModalOpen && (
        <FilterModal
          filters={filters}
          sort={sort}
          onApply={handleApplyFilters}
          onClose={() => setFilterModalOpen(false)}
        />
      )}
    </section>
  );
}
