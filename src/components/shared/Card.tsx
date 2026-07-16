import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  padding = 'md',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-surface/30 border border-secondary/10 rounded-2xl transition-all duration-200',
        hoverEffect && 'hover:border-primary/20 hover:bg-surface/50 hover:shadow-[0_4px_12px_rgba(90,58,41,0.04)]',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
