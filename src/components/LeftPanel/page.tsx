"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  LOADER_OPTIONS,
  CATEGORY_OPTIONS,
  OTHER_FILTER_OPTIONS,
} from "@/utils/helpers";
import { API } from "@/utils/api";
import CustomSelect from "@/components/CustomSelect/page";
import Icon from "@/components/Icon/page";
import CategoryBlock from "@/components/CategoryBlock/page";
import FilterRow from "@/components/FilterRow/page";

import cubeIconRaw from "@/assets/icons/cube.svg";
import packageIconRaw from "@/assets/icons/package.svg";
import blocksIconRaw from "@/assets/icons/blocks.svg";
import bookmarkIconRaw from "@/assets/icons/bookmark.svg";

import fabricIconRaw from "@/assets/icons/tags/loaders/fabric.svg";
import forgeIconRaw from "@/assets/icons/tags/loaders/forge.svg";
import neoforgeIconRaw from "@/assets/icons/tags/loaders/neoforge.svg";
import quiltIconRaw from "@/assets/icons/tags/loaders/quilt.svg";

import optimizationIconRaw from "@/assets/icons/tags/categories/optimization.svg";
import technologyIconRaw from "@/assets/icons/tags/categories/technology.svg";
import magicIconRaw from "@/assets/icons/tags/categories/magic.svg";
import adventureIconRaw from "@/assets/icons/tags/categories/adventure.svg";
import decorationIconRaw from "@/assets/icons/tags/categories/decoration.svg";
import equipmentIconRaw from "@/assets/icons/tags/categories/equipment.svg";
import mobsIconRaw from "@/assets/icons/tags/categories/mobs.svg";
import libraryIconRaw from "@/assets/icons/tags/categories/library.svg";
import utilityIconRaw from "@/assets/icons/tags/categories/utility.svg";
import worldgenIconRaw from "@/assets/icons/tags/categories/worldgen.svg";
import foodIconRaw from "@/assets/icons/tags/categories/food.svg";
import storageIconRaw from "@/assets/icons/tags/categories/storage.svg";
import gameMechanicsIconRaw from "@/assets/icons/tags/categories/game-mechanics.svg";

const LOADER_ICON_PATHS: Record<string, string> = {
  fabric: fabricIconRaw,
  forge: forgeIconRaw,
  neoforge: neoforgeIconRaw,
  quilt: quiltIconRaw,
};

const CATEGORY_ICON_MAP: Record<string, string> = {
  optimization: optimizationIconRaw,
  technology: technologyIconRaw,
  magic: magicIconRaw,
  adventure: adventureIconRaw,
  decoration: decorationIconRaw,
  equipment: equipmentIconRaw,
  mobs: mobsIconRaw,
  library: libraryIconRaw,
  utility: utilityIconRaw,
  worldgen: worldgenIconRaw,
  food: foodIconRaw,
  storage: storageIconRaw,
  "game-mechanics": gameMechanicsIconRaw,
};

const NAV_TABS = ["mods", "resourcePacks", "shaders"] as const;

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
  const [activeNav, setActiveNav] = useState("mods");
  const [gameVersions, setGameVersions] = useState<
    { version: string; version_type: string }[]
  >([]);
  const [filters, setFilters] = useState<Filters>(() => ({
    loaders: Object.fromEntries(LOADER_OPTIONS.map((o) => [o.value, null])),
    categories: Object.fromEntries(
      CATEGORY_OPTIONS.map((o) => [o.value, null]),
    ),
    environment: { client_side: null, server_side: null },
    other: Object.fromEntries(OTHER_FILTER_OPTIONS.map((o) => [o.value, null])),
    version: modVersion || "",
    license: "",
  }));

  useEffect(() => {
    API.getGameVersions()
      .then((versions: { version: string; version_type: string }[]) => {
        const releases = versions.filter((v) => v.version_type === "release");
        setGameVersions(releases);
      })
      .catch((e: unknown) =>
        addDebugLog("warn", `Failed to load game versions: ${e}`),
      );
  }, [addDebugLog]);

  const emit = (newFilters: Filters) => {
    onFilterChange(newFilters);
  };

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
      loaders: {
        ...filters.loaders,
        [loader]: filters.loaders[loader] === state ? null : state,
      },
    };
    setFilters(newFilters);
    emit(newFilters);
  };

  const toggleCategory = (cat: string, state: string) => {
    const newFilters = {
      ...filters,
      categories: {
        ...filters.categories,
        [cat]: filters.categories[cat] === state ? null : state,
      },
    };
    setFilters(newFilters);
    emit(newFilters);
  };

  const toggleEnvironment = (
    side: "client_side" | "server_side",
    state: string,
  ) => {
    const newFilters = {
      ...filters,
      environment: {
        ...filters.environment,
        [side]: filters.environment[side] === state ? null : state,
      },
    };
    setFilters(newFilters);
    emit(newFilters);
  };

  const toggleOther = (key: string, state: string) => {
    const newFilters = {
      ...filters,
      other: {
        ...filters.other,
        [key]: filters.other[key] === state ? null : state,
      },
    };
    setFilters(newFilters);
    emit(newFilters);
  };

  const navIcons: Record<string, string> = {
    mods: cubeIconRaw,
    resourcePacks: packageIconRaw,
    shaders: blocksIconRaw,
  };

  const LICENSE_OPTIONS = [
    { value: "", label: t.filters.versionAny },
    { value: "mit", label: "MIT" },
    { value: "apache-2", label: "Apache 2.0" },
    { value: "lgpl-3", label: "LGPL 3.0" },
    { value: "gpl-3", label: "GPL 3.0" },
    { value: "mpl", label: "MPL 2.0" },
    { value: "arr", label: "ARR" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="left-panel">
      <div className="left-panel-nav">
        {NAV_TABS.map((tab) => (
          <button
            key={tab}
            className={`left-nav-btn ${activeNav === tab ? "active" : ""} ${tab !== "mods" ? "disabled" : ""}`}
            onClick={() => tab === "mods" && setActiveNav(tab)}
            title={tab !== "mods" ? "Coming soon" : undefined}
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
        <CategoryBlock
          title={t.filters.version}
          type="leftPanel"
          noItemsWrapper
        >
          <CustomSelect
            options={[
              { value: "", label: t.filters.versionAny },
              ...gameVersions.map((v) => ({
                value: v.version,
                label: v.version,
              })),
            ]}
            value={filters.version}
            onChange={setVersion}
          />
        </CategoryBlock>
        <CategoryBlock title={t.filters.loader} type="leftPanel">
          {LOADER_OPTIONS.map(({ value, label }) => (
            <FilterRow
              key={value}
              type="leftPanel"
              label={label}
              iconSvg={LOADER_ICON_PATHS[value]}
              iconClassName="loader-icon-img"
              state={filters.loaders[value]}
              onToggle={(state) => toggleLoader(value, state)}
              includeLabel={t.filters.include}
              excludeLabel={t.filters.exclude}
            />
          ))}
        </CategoryBlock>
        <CategoryBlock title={t.filters.categories} type="leftPanel">
          {CATEGORY_OPTIONS.map(({ value, labelKey }) => (
            <FilterRow
              key={value}
              type="leftPanel"
              label={t.categories[labelKey as keyof typeof t.categories]}
              iconSvg={CATEGORY_ICON_MAP[value]}
              iconClassName="category-icon-img"
              state={filters.categories[value]}
              onToggle={(state) => toggleCategory(value, state)}
              includeLabel={t.filters.include}
              excludeLabel={t.filters.exclude}
            />
          ))}
        </CategoryBlock>
        <CategoryBlock title={t.filters.environment} type="leftPanel">
          <FilterRow
            type="leftPanel"
            label={t.filters.clientSide}
            state={filters.environment["client_side"]}
            onToggle={(state) => toggleEnvironment("client_side", state)}
            includeLabel={t.filters.include}
            excludeLabel={t.filters.exclude}
          />
          <FilterRow
            type="leftPanel"
            label={t.filters.serverSide}
            state={filters.environment["server_side"]}
            onToggle={(state) => toggleEnvironment("server_side", state)}
            includeLabel={t.filters.include}
            excludeLabel={t.filters.exclude}
          />
        </CategoryBlock>
        <CategoryBlock
          title={t.filters.license}
          type="leftPanel"
          noItemsWrapper
        >
          <CustomSelect
            options={LICENSE_OPTIONS}
            value={filters.license}
            onChange={setLicense}
          />
        </CategoryBlock>
        <CategoryBlock title={t.filters.other} type="leftPanel">
          {OTHER_FILTER_OPTIONS.map(({ value, labelKey }) => (
            <FilterRow
              key={value}
              type="leftPanel"
              label={t.filters[labelKey as keyof typeof t.filters]}
              state={filters.other[value]}
              onToggle={(state) => toggleOther(value, state)}
              includeLabel={t.filters.include}
              excludeLabel={t.filters.exclude}
            />
          ))}
        </CategoryBlock>
      </div>
    </div>
  );
}
