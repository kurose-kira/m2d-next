import { useApp } from "@/contexts/AppContext";
import Icon from "@/components/Icon/page";
import hamburgerIconRaw from "@/assets/icons/hamburger.svg";
import settingsIconRaw from "@/assets/icons/settings.svg";

export default function Header() {
  const { setMenuOpen, setSettingsOpen } = useApp();
  return (
    <header className="header">
      <button
        onClick={() => setMenuOpen(true)}
        className="icon-btn hamburger-btn"
      >
        <Icon svg={hamburgerIconRaw} size={24} className="hamburger-icon" />
      </button>
      <h1>Mod Manager</h1>
      <button onClick={() => setSettingsOpen(true)} className="icon-btn">
        <Icon svg={settingsIconRaw} size={24} className="settings-icon" />
      </button>
    </header>
  );
}
