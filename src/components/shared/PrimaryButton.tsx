import React from 'react';
import { cn } from '../../utils/cn';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-manrope font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';
  
  const variants = {
    primary: 'bg-primary text-background hover:bg-primary/95',
    secondary: 'bg-secondary text-background hover:bg-secondary/95',
    accent: 'bg-accent text-secondary hover:bg-accent/95',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5',
    danger: 'bg-error text-white hover:bg-error/95',
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm', // Target: 40px
    md: 'h-11 px-6 text-base', // Target: 44px (compliant)
    lg: 'h-13 px-8 text-lg rounded-xl', // Target: 52px (compliant)
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
