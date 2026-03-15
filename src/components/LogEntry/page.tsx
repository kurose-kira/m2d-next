'use client';

interface LogEntryProps {
  time: string;
  level: string;
  msg: string;
}

export default function LogEntry({ time, level, msg }: LogEntryProps) {
  return (
    <div className={`log-entry log-${level}`}>
      <span className="log-time">{time}</span>
      <span className="log-level-badge">{level.toUpperCase()}</span>
      <span className="log-msg">{msg}</span>
    </div>
  );
}
