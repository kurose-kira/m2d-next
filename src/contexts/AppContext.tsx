'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import {
  STORAGE_KEY,
  DEBUG_KEY,
  THEME_KEY,
  FAST_SEARCH_KEY,
  LANGUAGE_KEY,
  LOADER_KEY,
  VERSION_KEY,
  FAVORITES_KEY,
  SEARCH_HISTORY_KEY,
  MAX_SEARCH_HISTORY,
} from '@/utils/helpers';
import translations, { type TranslationKey, type Translation } from '@/i18n/translations';

// ── Types ────────────────────────────────────────────
type Theme = 'light' | 'dark';

interface ProgressState {
  current: number;
  total: number;
  percent: number;
  progressText: string;
  etaText: string;
}

interface LoadingState {
  visible: boolean;
  text: string;
  progress: ProgressState | null;
}

interface DialogState {
  type: 'alert' | 'confirm';
  message: string;
}

interface Profile {
  [key: string]: unknown;
}

interface ModData {
  [key: string]: unknown;
}

interface AppContextValue {
  // Theme
  theme: Theme;
  toggleTheme: (value: Theme) => void;

  // Debug
  debugMode: boolean;
  toggleDebug: (enabled: boolean) => void;

  // Fast Search
  fastSearch: boolean;
  toggleFastSearch: (enabled: boolean) => void;

  // Language
  language: TranslationKey;
  toggleLanguage: (lang: TranslationKey) => void;
  t: Translation;

  // Mod Loader / Version
  modLoader: string;
  updateModLoader: (value: string) => void;
  modVersion: string;
  updateModVersion: (value: string) => void;

  // Menu
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Active Mod
  activeModId: string | null;
  setActiveModId: React.Dispatch<React.SetStateAction<string | null>>;

  // Favorites
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;

  // Search History
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  removeSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  // Profiles
  profiles: Profile[];
  saveProfiles: (newProfiles: Profile[]) => void;

  // Selected Mods
  selectedMods: Set<string>;
  toggleMod: (id: string) => void;
  clearMods: () => void;
  addMod: (id: string) => void;
  removeMod: (id: string) => void;
  replaceSelectedMods: (modsArray: string[]) => void;

  // Mod Data Map
  modDataMap: Record<string, ModData>;
  updateModDataMap: (updates: Record<string, ModData>) => void;

  // Loading
  loading: LoadingState;
  showLoading: (text: string) => void;
  updateLoading: (text: string) => void;
  showProgress: (total?: number) => void;
  updateProgress: (current: number, total: number, startTime?: number) => void;
  hideLoading: () => void;

  // Modals
  settingsOpen: boolean;
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  depModalOpen: boolean;
  setDepModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedModalOpen: boolean;
  setSelectedModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filterModalOpen: boolean;
  setFilterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Debug Logs
  debugLogs: DebugLogEntry[];
  addDebugLog: (level: string, msg: string) => void;
  clearDebugLogs: () => void;

  // Dialog
  dialog: DialogState | null;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
  closeDialog: (result?: boolean) => void;
}

interface DebugLogEntry {
  level: string;
  msg: string;
  time: string;
}

// ── Helpers ──────────────────────────────────────────
function getStorageItem(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return localStorage.getItem(key) ?? fallback;
}

function getStorageBool(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(key) === 'true';
}

function getStorageJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) as T;
  } catch {
    return fallback;
  }
}

// ── Context ──────────────────────────────────────────
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // ── State ────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>(() => getStorageItem(THEME_KEY, 'dark') as Theme);
  const [debugMode, setDebugMode] = useState(() => getStorageBool(DEBUG_KEY));
  const [fastSearch, setFastSearch] = useState(() => getStorageBool(FAST_SEARCH_KEY));
  const [language, setLanguage] = useState<TranslationKey>(
    () => getStorageItem(LANGUAGE_KEY, 'en') as TranslationKey,
  );
  const [modLoader, setModLoader] = useState(() => getStorageItem(LOADER_KEY, 'fabric'));
  const [modVersion, setModVersion] = useState(() => getStorageItem(VERSION_KEY, '1.21.1'));
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModId, setActiveModId] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(getStorageJSON<string[]>(FAVORITES_KEY, [])),
  );
  const [searchHistory, setSearchHistory] = useState<string[]>(
    () => getStorageJSON<string[]>(SEARCH_HISTORY_KEY, []),
  );
  const [profiles, setProfiles] = useState<Profile[]>(
    () => getStorageJSON<Profile[]>(STORAGE_KEY, []),
  );

  const [selectedMods, setSelectedMods] = useState<Set<string>>(new Set());
  const [modDataMap, setModDataMap] = useState<Record<string, ModData>>({});

  // Loading
  const [loading, setLoading] = useState<LoadingState>({
    visible: false,
    text: '',
    progress: null,
  });

  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [depModalOpen, setDepModalOpen] = useState(false);
  const [selectedModalOpen, setSelectedModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Dialog
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const dialogResolverRef = useRef<((value: unknown) => void) | null>(null);

  const showAlert = useCallback((message: string): Promise<void> => {
    return new Promise((resolve) => {
      dialogResolverRef.current = resolve as (value: unknown) => void;
      setDialog({ type: 'alert', message });
    });
  }, []);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      dialogResolverRef.current = resolve as (value: unknown) => void;
      setDialog({ type: 'confirm', message });
    });
  }, []);

  const closeDialog = useCallback((result?: boolean) => {
    const resolver = dialogResolverRef.current;
    dialogResolverRef.current = null;
    setDialog(null);
    if (resolver) resolver(result);
  }, []);

  // Debug Logs
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([]);
  const debugLogsRef = useRef<DebugLogEntry[]>([]);

  // ── Actions ──────────────────────────────────────
  const toggleTheme = useCallback((value: Theme) => {
    setTheme(value);
    localStorage.setItem(THEME_KEY, value);
  }, []);

  const toggleDebug = useCallback((enabled: boolean) => {
    setDebugMode(enabled);
    localStorage.setItem(DEBUG_KEY, String(enabled));
  }, []);

  const toggleFastSearch = useCallback((enabled: boolean) => {
    setFastSearch(enabled);
    localStorage.setItem(FAST_SEARCH_KEY, String(enabled));
  }, []);

  const toggleLanguage = useCallback((lang: TranslationKey) => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  const updateModLoader = useCallback((value: string) => {
    setModLoader(value);
    localStorage.setItem(LOADER_KEY, value);
  }, []);

  const updateModVersion = useCallback((value: string) => {
    setModVersion(value);
    localStorage.setItem(VERSION_KEY, value);
  }, []);

  const addDebugLog = useCallback((level: string, msg: string) => {
    const entry: DebugLogEntry = {
      level,
      msg,
      time: new Date().toLocaleTimeString('ja-JP', { hour12: false }),
    };
    debugLogsRef.current = [...debugLogsRef.current.slice(-499), entry];
    setDebugLogs([...debugLogsRef.current]);
  }, []);

  const clearDebugLogs = useCallback(() => {
    debugLogsRef.current = [];
    setDebugLogs([]);
  }, []);

  // Loading helpers
  const showLoading = useCallback((text: string) => {
    setLoading({ visible: true, text, progress: null });
  }, []);

  const updateLoading = useCallback((text: string) => {
    setLoading((prev) => ({ ...prev, text }));
  }, []);

  const showProgress = useCallback((total?: number) => {
    setLoading((prev) => ({
      ...prev,
      progress: {
        current: 0,
        total: total ?? 0,
        percent: 0,
        progressText: total !== undefined ? `0 / ${total}` : '',
        etaText: 'ETA: Calculating...',
      },
    }));
  }, []);

  const updateProgress = useCallback((current: number, total: number, startTime?: number) => {
    const percent = (current / total) * 100;
    let etaText = '';
    if (current > 0 && startTime) {
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = current / elapsed;
      const remaining = total - current;
      const eta = Math.ceil(remaining / speed);
      etaText = `ETA: ${eta > 60 ? `${Math.floor(eta / 60)}m ${eta % 60}s` : `${eta}s`}`;
    }
    setLoading((prev) => ({
      ...prev,
      progress: { current, total, percent, progressText: `${current} / ${total}`, etaText },
    }));
  }, []);

  const hideLoading = useCallback(() => {
    setLoading({ visible: false, text: '', progress: null });
  }, []);

  // Profiles
  const saveProfiles = useCallback((newProfiles: Profile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles));
  }, []);

  // Selected Mods
  const toggleMod = useCallback((id: string) => {
    setSelectedMods((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearMods = useCallback(() => setSelectedMods(new Set()), []);

  const addMod = useCallback((id: string) => {
    setSelectedMods((prev) => new Set([...prev, id]));
  }, []);

  const removeMod = useCallback((id: string) => {
    setSelectedMods((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const updateModDataMap = useCallback((updates: Record<string, ModData>) => {
    setModDataMap((prev) => ({ ...prev, ...updates }));
  }, []);

  const replaceSelectedMods = useCallback((modsArray: string[]) => {
    setSelectedMods(new Set(modsArray));
  }, []);

  // Favorites
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
    localStorage.removeItem(FAVORITES_KEY);
  }, []);

  // Search History
  const addSearchHistory = useCallback((query: string) => {
    if (!query?.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((q) => q !== query.trim());
      const next = [query.trim(), ...filtered].slice(0, MAX_SEARCH_HISTORY);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeSearchHistory = useCallback((query: string) => {
    setSearchHistory((prev) => {
      const next = prev.filter((q) => q !== query);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  // ── Value ────────────────────────────────────────
  const value: AppContextValue = {
    theme, toggleTheme,
    debugMode, toggleDebug,
    fastSearch, toggleFastSearch,
    language, toggleLanguage,
    modLoader, updateModLoader,
    modVersion, updateModVersion,
    t: translations[language],
    menuOpen, setMenuOpen,
    activeModId, setActiveModId,
    favorites, toggleFavorite, clearFavorites,
    searchHistory, addSearchHistory, removeSearchHistory, clearSearchHistory,
    profiles, saveProfiles,
    selectedMods, toggleMod, clearMods, addMod, removeMod, replaceSelectedMods,
    modDataMap, updateModDataMap,
    loading, showLoading, updateLoading, showProgress, updateProgress, hideLoading,
    settingsOpen, setSettingsOpen,
    depModalOpen, setDepModalOpen,
    selectedModalOpen, setSelectedModalOpen,
    filterModalOpen, setFilterModalOpen,
    debugLogs, addDebugLog, clearDebugLogs,
    dialog, showAlert, showConfirm, closeDialog,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within <AppProvider>');
  }
  return ctx;
}
