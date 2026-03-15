'use client';

import { useApp } from '@/contexts/AppContext';
import Modal from '@/components/Modal/page';
import Button from '@/components/Button/page';
import CustomSelect from '@/components/CustomSelect/page';
import Input from '@/components/Input/page';
import ToggleSwitch from '@/components/ToggleSwitch/page';
import Icon from '@/components/Icon/page';
import SettingsRow from '@/components/SettingsRow/page';
import CategoryBlock from '@/components/CategoryBlock/page';
import { LOADER_OPTIONS } from '@/utils/helpers';
import settingsIconRaw from '@/assets/icons/settings.svg';

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

  const onClose = () => setSettingsOpen(false);

  const title = (
    <>
      <Icon svg={settingsIconRaw} size={20} /> {t.settings.title}
    </>
  );

  const footer = (
    <Button onClick={onClose} variant="secondary">{t.settings.close}</Button>
  );

  return (
    <Modal onClose={onClose} title={title} footer={footer}>
      <CategoryBlock title={t.settings.categories.mods} type="settings">
        <SettingsRow label={t.settings.modLoader.label} description={t.settings.modLoader.description}>
          <CustomSelect
            className="settings-select"
            options={loaderOptions}
            value={modLoader}
            onChange={updateModLoader}
          />
        </SettingsRow>
        <SettingsRow label={t.settings.modVersion.label} description={t.settings.modVersion.description} style={{ marginBottom: 0 }}>
          <Input
            variant="large"
            type="text"
            value={modVersion}
            onChange={e => updateModVersion(e.target.value)}
            placeholder="ex: 1.21.1"
            className="settings-version-input"
          />
        </SettingsRow>
      </CategoryBlock>
      <CategoryBlock title={t.settings.categories.general} type="settings">
        <SettingsRow label={t.settings.theme.label} description={t.settings.theme.description}>
          <CustomSelect
            className="settings-select"
            options={themeOptions}
            value={theme}
            onChange={(v) => toggleTheme(v as 'light' | 'dark')}
          />
        </SettingsRow>
        <SettingsRow label={t.settings.language.label} description={t.settings.language.description}>
          <CustomSelect
            className="settings-select"
            options={languageOptions}
            value={language}
            onChange={(v) => toggleLanguage(v as 'en' | 'ja')}
          />
        </SettingsRow>
        <SettingsRow label={t.settings.fastSearch.label} description={t.settings.fastSearch.description} style={{ marginBottom: 0 }}>
          <ToggleSwitch checked={fastSearch} onChange={toggleFastSearch} />
        </SettingsRow>
      </CategoryBlock>
      <CategoryBlock title="Data" type="settings">
        <SettingsRow label={t.settings.clearHistory} description={t.settings.clearHistoryDesc}>
          <Button onClick={handleClearHistory} variant="secondary" className="settings-btn-sm">Clear</Button>
        </SettingsRow>
        <SettingsRow label={t.settings.clearFavorites} description={t.settings.clearFavoritesDesc} className="settings-row-last">
          <Button onClick={handleClearFavorites} variant="secondary" className="settings-btn-sm">Clear</Button>
        </SettingsRow>
      </CategoryBlock>
      <CategoryBlock title={t.settings.categories.developerMode} type="settings" style={{ marginBottom: 0 }}>
        <SettingsRow label={t.settings.debugMode.label} description={t.settings.debugMode.description} style={{ marginBottom: 0 }}>
          <ToggleSwitch checked={debugMode} onChange={toggleDebug} />
        </SettingsRow>
      </CategoryBlock>
    </Modal>
  );
}
