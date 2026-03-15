'use client';

import { ReactNode, CSSProperties } from 'react';

interface CategoryBlockProps {
  title: string;
  children: ReactNode;
  type?: 'filter' | 'leftPanel' | 'settings';
  style?: CSSProperties;
  noItemsWrapper?: boolean;
}

export default function CategoryBlock({ title, children, type = 'filter', style, noItemsWrapper = false }: CategoryBlockProps) {
  const containerClass = type === 'filter' ? 'filter-category' : type === 'leftPanel' ? 'lp-filter-section' : 'settings-category';
  const titleClass = type === 'filter' ? 'filter-category-title' : type === 'leftPanel' ? 'lp-filter-title' : 'settings-category-title';
  const itemsClass = type === 'filter' ? 'filter-items' : type === 'leftPanel' ? 'lp-filter-items' : undefined;

  return (
    <div className={containerClass} style={style}>
      <h4 className={titleClass}>{title}</h4>
      {itemsClass && !noItemsWrapper ? <div className={itemsClass}>{children}</div> : children}
    </div>
  );
}
