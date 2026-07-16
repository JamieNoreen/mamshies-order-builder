import React from 'react';
import { Users } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ServingSizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSelectSize?: (size: string) => void;
  className?: string;
}

const SERVING_SIZE_NUMBERS: Record<string, string> = {
  'S': '10–15',
  'M': '15–20',
  'L': '20–30',
  'XL': '30–40',
  'XXL': '40–50',
};

export const ServingSizeSelector: React.FC<ServingSizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSelectSize,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-4 gap-2 w-full', className)}>
      {sizes.map((size) => {
        const isSelected = size === selectedSize;
        const numberVal = SERVING_SIZE_NUMBERS[size] || size;
        
        return (
          <button
            key={size}
            type="button"
            onClick={() => onSelectSize?.(size)}
            className={cn(
              'flex flex-col items-center justify-center text-center p-2 rounded-xl border transition-all active:scale-[0.98] select-none cursor-pointer',
              isSelected
                ? 'bg-secondary border-secondary text-white shadow-xs'
                : 'bg-background/80 border-secondary/15 text-text-charcoal hover:bg-surface'
            )}
            style={{ minHeight: '52px' }}
          >
            <span className="font-manrope font-extrabold text-sm leading-none block">
              {size}
            </span>
            <div className="flex flex-row items-center justify-center gap-1 mt-1.5 leading-none whitespace-nowrap">
              <Users className={cn(
                "w-3 h-3 shrink-0",
                isSelected ? "text-white/80" : "text-secondary/50"
              )} />
              <span className={cn(
                "font-manrope font-bold text-[10px] leading-none block",
                isSelected ? "text-white/95" : "text-secondary/70"
              )}>
                {numberVal}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
