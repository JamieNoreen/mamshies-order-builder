import React from 'react';
import { Menu, FileText } from 'lucide-react';
import { cn } from '../utils/cn';

interface MobileBottomNavigationProps {
  activeTab: 'menu' | 'summary';
  onTabChange: (tab: 'menu' | 'summary') => void;
  cartCount?: number;
  className?: string;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  activeTab,
  onTabChange,
  cartCount = 0,
  className,
}) => {
  return (
    <nav
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-secondary/10 flex items-center justify-around h-16 px-4',
        className
      )}
    >
      <button
        onClick={() => onTabChange('menu')}
        className={cn(
          'flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs font-manrope font-semibold transition-colors select-none',
          activeTab === 'menu' ? 'text-primary' : 'text-secondary/50'
        )}
        style={{ minHeight: '44px' }}
      >
        <Menu className="w-5 h-5" />
        <span>Menu</span>
      </button>

      <button
        onClick={() => onTabChange('summary')}
        className={cn(
          'flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs font-manrope font-semibold transition-colors select-none relative',
          activeTab === 'summary' ? 'text-primary' : 'text-secondary/50'
        )}
        style={{ minHeight: '44px' }}
      >
        <div className="relative">
          <FileText className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-primary text-background font-manrope font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-background">
              {cartCount}
            </span>
          )}
        </div>
        <span>Order ({cartCount})</span>
      </button>
    </nav>
  );
};
