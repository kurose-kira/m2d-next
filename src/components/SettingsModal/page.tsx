'use client';

import { useApp } from '@/contexts/AppContext';
import CustomSelect from '@/components/CustomSelect/page';
import Icon from '@/components/Icon/page';
import { LOADER_OPTIONS } from '@/utils/helpers';
import settingsIconRaw from '@/assets/icons/settings.svg';
import xIconRaw from '@/assets/icons/x.svg';

import fabricIconRaw from '@/assets/icons/tags/loaders/fabric.svg';
import forgeIconRaw from '@/assets/icons/tags/loaders/forge.svg';
import neoforgeIconRaw from '@/assets/icons/tags/loaders/neoforge.svg';
import quiltIconRaw from '@/assets/icons/tags/loaders/quilt.svg';

const LOADER_ICON_PATHS: Record<string, string> = {
  fabric: fabricIconRaw,
  forge: forgeIconRaw,
  neoforge: neoforgeIconRaw,
  quilt: quiltIconRaw,
};

export default function SettingsModal() {
  const {
    settingsOpen, setSettingsOpen,
    theme, toggleTheme,
    debugMode, toggleDebug,
    fastSearch, toggleFastSearch,
    language, toggleLanguage,
    modLoader, updateModLoader,
    modVersion, updateModVersion,
    clearSearchHistory, clearFavorites,
    showConfirm,
    t,
  } = useApp();

  if (!settingsOpen) return null;

  const themeOptions = [
    { value: 'light', label: t.themes.light },
    { value: 'dark', label: t.themes.dark },
  ];

  const languageOptions = [
    { value: 'en', label: t.languages.en },
    { value: 'ja', label: t.languages.ja },
  ];

  const loaderOptions = [
    { value: '', label: t.loaders.any },
    ...LOADER_OPTIONS.map(o => ({
      ...o,
      label: o.label,
      icon: LOADER_ICON_PATHS[o.value]
        ? <Icon svg={LOADER_ICON_PATHS[o.value]} size={16} className="loader-icon-img" />
        : undefined,
    })),
  ];

  const handleClearHistory = async () => {
    if (await showConfirm(t.settings.clearHistory + '?')) clearSearchHistory();
  };

  const handleClearFavorites = async () => {
    if (await showConfirm(t.settings.clearFavorites + '?')) clearFavorites();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSettingsOpen(false)}>
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            <Icon svg={settingsIconRaw} size={20} /> {t.settings.title}
          </h3>
          <button onClick={() => setSettingsOpen(false)} className="btn-close-modal">
            <Icon svg={xIconRaw} size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="settings-category">
            <h4 className="settings-category-title">{t.settings.categories.mods}</h4>
            <div className="settings-row">
              <div>
                <span className="settings-label">{t.settings.modLoader.label}</span>
                <span className="settings-description">{t.settings.modLoader.description}</span>
              </div>
              <CustomSelect
                className="settings-select"
                options={loaderOptions}
                value={modLoader}
                onChange={updateModLoader}
              />
            </div>
            <div className="settings-row" style={{ marginBottom: 0 }}>
              <div>
                <span className="settings-label">{t.settings.modVersion.label}</span>
                <span className="settings-description">{t.settings.modVersion.description}</span>
              </div>
              <input
                type="text"
                value={modVersion}
                onChange={e => updateModVersion(e.target.value)}
                placeholder="ex: 1.21.1"
                className="input-large settings-version-input"
              />
            </div>
          </div>
          <div className="settings-category">
            <h4 className="settings-category-title">{t.settings.categories.general}</h4>
            <div className="settings-row">
              <div>
                <span className="settings-label">{t.settings.theme.label}</span>
                <span className="settings-description">{t.settings.theme.description}</span>
              </div>
              <CustomSelect
                className="settings-select"
                options={themeOptions}
                value={theme}
                onChange={(v) => toggleTheme(v as 'light' | 'dark')}
              />
            </div>
            <div className="settings-row">
              <div>
                <span className="settings-label">{t.settings.language.label}</span>
                <span className="settings-description">{t.settings.language.description}</span>
              </div>
              <CustomSelect
                className="settings-select"
                options={languageOptions}
                value={language}
                onChange={(v) => toggleLanguage(v as 'en' | 'ja')}
              />
            </div>
            <div className="settings-row" style={{ marginBottom: 0 }}>
              <div>
                <span className="settings-label">{t.settings.fastSearch.label}</span>
                <span className="settings-description">{t.settings.fastSearch.description}</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={fastSearch}
                  onChange={e => toggleFastSearch(e.target.checked)}
                />
                <div className="toggle-bg"><div className="toggle-knob"></div></div>
              </label>
            </div>
          </div>
          <div className="settings-category">
            <h4 className="settings-category-title">Data</h4>
            <div className="settings-row">
              <div>
                <span className="settings-label">{t.settings.clearHistory}</span>
                <span className="settings-description">{t.settings.clearHistoryDesc}</span>
              </div>
              <button onClick={handleClearHistory} className="btn-secondary settings-btn-sm">Clear</button>
            </div>
            <div className="settings-row settings-row-last">
              <div>
                <span className="settings-label">{t.settings.clearFavorites}</span>
                <span className="settings-description">{t.settings.clearFavoritesDesc}</span>
              </div>
              <button onClick={handleClearFavorites} className="btn-secondary settings-btn-sm">Clear</button>
            </div>
          </div>
          <div className="settings-category" style={{ marginBottom: 0 }}>
            <h4 className="settings-category-title">{t.settings.categories.developerMode}</h4>
            <div className="settings-row" style={{ marginBottom: 0 }}>
              <div>
                <span className="settings-label">{t.settings.debugMode.label}</span>
                <span className="settings-description">{t.settings.debugMode.description}</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={debugMode}
                  onChange={e => toggleDebug(e.target.checked)}
                />
                <div className="toggle-bg"><div className="toggle-knob"></div></div>
              </label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={() => setSettingsOpen(false)} className="btn-secondary">{t.settings.close}</button>
        </div>
      </div>
    </div>
  );
}
