'use client';
import { ReactNode } from 'react';
import ModImage from '@/components/ModImage/page';

interface RightPanelModItemProps {
  iconUrl: string;
  title: string;
  children?: ReactNode;
}

export default function RightPanelModItem({ iconUrl, title, children }: RightPanelModItemProps) {
  return (
    <div className="rp-mod-item">
      <ModImage src={iconUrl} width={28} height={28} className="rp-mod-icon" alt="icon" />
      <span className="rp-mod-title">{title}</span>
      {children}
    </div>
  );
}
