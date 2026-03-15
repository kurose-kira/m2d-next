'use client';

import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'small' | 'icon' | 'action' | 'text-icon' | 'icon-small' | 'search' | 'filter-state';
  color?: 'red' | 'green' | 'blue' | 'gray' | 'red-outline';
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant,
  color,
  className = '',
  children,
  ...props
}, ref) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary';
      case 'secondary': return 'btn-secondary';
      case 'small': return 'btn-small';
      case 'icon': return 'icon-btn';
      case 'action': return 'btn-action';
      case 'icon-small': return 'btn-icon-small';
      case 'text-icon': return 'btn-text-icon';
      case 'search': return 'btn-search';
      case 'filter-state': return 'btn-filter-state';
      default: return '';
    }
  };

  const getColorClass = () => color || '';

  const combinedClassName = [getVariantClass(), getColorClass(), className]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} className={combinedClassName.trim() || undefined} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
