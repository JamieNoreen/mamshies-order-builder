import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { SearchBar } from '../components/shared/SearchBar';

interface HeaderProps {
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  cartCount?: number;
  cartTotal?: number;
  onOpenCart?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  searchValue = '',
  cartCount = 0,
  cartTotal = 0,
  onOpenCart,
  className,
}) => {
  return (
    <header className={`sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b border-secondary/10 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 ${className}`}>
      {/* Logo & Brand */}
      <div className="flex items-center gap-2.5 min-w-0 select-none">
        <img
          src="/Mamshies logo.png"
          alt="Mamshies Logo"
          className="w-10 h-10 object-contain flex-shrink-0"
        />
        <div className="min-w-0 flex flex-col justify-center leading-none">
          <span className="font-fraunces font-bold text-sm md:text-base text-text-charcoal leading-none block">
            Mamshies
          </span>
          <span className="font-fraunces font-bold text-sm md:text-base text-text-charcoal leading-none mt-0.5 block">
            Meals
          </span>
        </div>
      </div>

      {/* Center Search - Hidden on Small Screens */}
      <div className="hidden md:flex flex-1 justify-center max-w-md">
        <SearchBar value={searchValue} onChange={onSearchChange} placeholder="Search catering dishes..." />
      </div>

      {/* Right Actions: Cart Indicator */}
      <button
        onClick={onOpenCart}
        className="flex items-center gap-2.5 h-11 px-4 rounded-xl border border-secondary/15 bg-surface/50 hover:bg-surface text-text-charcoal hover:text-primary transition-all active:scale-[0.98] select-none"
        aria-label="Open Cart"
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-secondary/75" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-background font-manrope font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-background">
              {cartCount}
            </span>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-none text-left">
          <span className="font-manrope font-semibold text-[10px] text-secondary/50 uppercase">My Order</span>
          <span className="font-manrope font-bold text-sm text-text-charcoal mt-0.5">
            ₱{cartTotal.toLocaleString()}
          </span>
        </div>
      </button>
    </header>
  );
};
