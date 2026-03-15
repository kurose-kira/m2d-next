interface SettingsRowProps {
  label: React.ReactNode;
  description: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function SettingsRow({
  label,
  description,
  children,
  style,
  className,
}: SettingsRowProps) {
  const rowClass = ['settings-row', className].filter(Boolean).join(' ');

  return (
    <div className={rowClass} style={style}>
      <div>
        <span className="settings-label">{label}</span>
        <span className="settings-description">{description}</span>
      </div>
      {children}
    </div>
  );
}
