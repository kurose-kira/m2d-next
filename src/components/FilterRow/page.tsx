'use client';

import Icon from '@/components/Icon/page';
import Button from '@/components/Button/page';

interface FilterRowProps {
  label: string;
  iconSvg?: string;
  iconSize?: number;
  iconClassName?: string;
  state: string | null;
  onToggle: (state: 'include' | 'exclude') => void;
  includeLabel: string;
  excludeLabel: string;
  type?: 'filter' | 'leftPanel';
}

export default function FilterRow({
  label,
  iconSvg,
  iconSize = 16,
  iconClassName,
  state,
  onToggle,
  includeLabel,
  excludeLabel,
  type = 'filter'
}: FilterRowProps) {
  const rowClass = type === 'filter' ? 'filter-item-row' : 'lp-filter-row';
  const labelClass = type === 'filter' ? 'filter-item-label' : 'lp-filter-label';
  const btnsClass = type === 'filter' ? 'filter-item-btns' : 'lp-filter-btns';

  return (
    <div className={rowClass}>
      <span className={labelClass}>
        {iconSvg && <Icon svg={iconSvg} size={iconSize} className={iconClassName} />}
        {label}
      </span>
      <div className={btnsClass}>
        <Button
          variant="filter-state"
          className={state === 'include' ? 'active-include' : ''}
          onClick={() => onToggle('include')}
        >
          {includeLabel}
        </Button>
        <Button
          variant="filter-state"
          className={state === 'exclude' ? 'active-exclude' : ''}
          onClick={() => onToggle('exclude')}
        >
          {excludeLabel}
        </Button>
      </div>
    </div>
  );
}
