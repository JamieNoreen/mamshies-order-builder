import React from 'react';
import { cn } from '../../utils/cn';
import * as LucideIcons from 'lucide-react';

interface CategoryChipProps {
  name: string;
  iconName?: string;
  emoji?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  name,
  iconName,
  emoji,
  isActive = false,
  onClick,
  className,
}) => {
  // Resolve Lucide icon dynamically (safely fall back to Utensils if invalid)
  const IconComponent = iconName
    ? (LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
    : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 h-11 px-4 rounded-full font-manrope font-semibold text-sm transition-all duration-150 select-none border whitespace-nowrap active:scale-95',
        isActive
          ? 'bg-primary border-primary text-white shadow-md font-bold scale-[1.02]'
          : 'bg-white/95 border-[#8A6A59]/35 text-text-charcoal hover:bg-surface hover:text-primary hover:border-primary/40 hover:-translate-y-[1px]',
        className
      )}
      style={{ minHeight: '44px' }} // Touch target size
    >
      {emoji ? (
        <span className="text-base select-none shrink-0">{emoji}</span>
      ) : (
        IconComponent && <IconComponent className={cn('w-4 h-4', isActive ? 'text-background' : 'text-primary')} />
      )}
      <span>{name}</span>
    </button>
  );
};
