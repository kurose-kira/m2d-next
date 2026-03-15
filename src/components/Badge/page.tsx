'use client';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'debug' | 'rp';
}

export default function Badge({ children, variant }: BadgeProps) {
  const className = variant === 'debug' ? 'debug-filter-count' : 'rp-count-badge';
  return (
    <span className={className}>{children}</span>
  );
}
