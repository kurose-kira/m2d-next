'use client';
import { ReactNode } from 'react';

interface EmptyStateProps {
  children: ReactNode;
  variant?: 'default' | 'right-panel' | 'debug' | 'mod-detail';
  style?: React.CSSProperties;
}

export default function EmptyState({ children, variant = 'default', style }: EmptyStateProps) {
  let className = 'empty-state';
  if (variant === 'right-panel') className = 'rp-empty';
  if (variant === 'debug') className = 'debug-empty';
  if (variant === 'mod-detail') className = 'mod-detail-empty';

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
