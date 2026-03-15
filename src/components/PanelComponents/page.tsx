'use client';
import { ReactNode } from 'react';

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rp-panel ${className}`.trim()}>{children}</div>;
}

export function PanelTabs({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rp-tabs ${className}`.trim()}>{children}</div>;
}

export function PanelBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rp-panel-body ${className}`.trim()}>{children}</div>;
}

export function PanelList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rp-selected-list ${className}`.trim()}>{children}</div>;
}

export function LogContainer({ children, className = '', refObj }: { children: ReactNode; className?: string; refObj?: React.RefObject<HTMLDivElement | null> }) {
  return <div ref={refObj} className={`debug-logs ${className}`.trim()}>{children}</div>;
}
