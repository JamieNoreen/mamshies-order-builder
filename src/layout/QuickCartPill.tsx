import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { cn } from '../utils/cn';

interface QuickCartPillProps {
  itemCount?: number;
  totalPrice?: number;
  onClick?: () => void;
  className?: string;
}

export const QuickCartPill: React.FC<QuickCartPillProps> = ({
  itemCount = 0,
  totalPrice = 0,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'md:hidden fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-primary text-background font-manrope font-bold text-sm px-5 py-3 rounded-full shadow-lg border border-primary/20 hover:bg-primary/95 transition-all duration-200 active:scale-95 select-none',
        className
      )}
      style={{ minHeight: '48px', minWidth: '120px' }}
      aria-label="View Order Summary"
    >
      <div className="relative">
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-accent text-secondary font-manrope font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-primary">
            {itemCount}
          </span>
        )}
      </div>
      <div className="flex flex-col items-start leading-none text-left">
        <span className="text-[10px] text-background/70 font-semibold uppercase">View Order</span>
        <span className="text-sm mt-0.5">₱{totalPrice.toLocaleString()}</span>
      </div>
    </button>
  );
};
