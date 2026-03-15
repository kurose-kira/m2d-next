'use client';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'base' | 'large';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ variant = 'base', className = '', ...props }, ref) => {
  const baseClass = variant === 'large' ? 'input-large' : 'input-base';
  const combinedClassName = `${baseClass} ${className}`.trim();

  return (
    <input ref={ref} className={combinedClassName} {...props} />
  );
});

Input.displayName = 'Input';
export default Input;
