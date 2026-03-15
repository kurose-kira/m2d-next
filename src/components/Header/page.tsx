import { useApp } from "@/contexts/AppContext";
import Button from "@/components/Button/page";
import Icon from "@/components/Icon/page";
import hamburgerIconRaw from "@/assets/icons/hamburger.svg";
import settingsIconRaw from "@/assets/icons/settings.svg";

export default function Header() {
  const { setMenuOpen, setSettingsOpen } = useApp();
  return (
    <header className="header">
      <Button variant="icon" className="hamburger-btn" onClick={() => setMenuOpen(true)}>
        <Icon svg={hamburgerIconRaw} size={24} className="hamburger-icon" />
      </Button>
      <h1>Mod Manager</h1>
      <Button variant="icon" onClick={() => setSettingsOpen(true)}>
        <Icon svg={settingsIconRaw} size={24} className="settings-icon" />
      </Button>
    </header>
  );
}
