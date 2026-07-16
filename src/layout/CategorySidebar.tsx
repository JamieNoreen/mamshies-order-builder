import React from 'react';
import { CATEGORIES } from '../constants/categories';
import { CategoryChip } from '../components/shared/CategoryChip';
import { cn } from '../utils/cn';
import * as LucideIcons from 'lucide-react';

interface CategorySidebarProps {
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
  className?: string;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategoryId,
  onSelectCategory,
  className,
}) => {
  return (
    <div className={className}>
      {/* Mobile Horizontal Category Chips */}
      <div className="flex md:hidden w-full overflow-x-auto py-3 px-4 gap-2 no-scrollbar bg-white border-b border-secondary/5 sticky top-0 z-30">
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.id}
            name={cat.name}
            emoji={cat.emoji}
            iconName={cat.iconName}
            isActive={selectedCategoryId === cat.id}
            onClick={() => onSelectCategory?.(cat.id)}
          />
        ))}
      </div>

      {/* Desktop Vertical Sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] h-screen bg-white border-r border-secondary/10 py-6 px-4 overflow-y-auto shrink-0 sticky top-0">
        {/* Compact Brand Section */}
        <div className="flex items-center gap-3 px-2 mb-6 select-none">
          <img
            src="/Mamshies logo.webp"
            alt="Mamshies Logo"
            className="h-11 w-auto object-contain flex-shrink-0"
          />
          <span className="font-fraunces font-bold text-base text-primary block whitespace-nowrap">
            Mamshies Meals
          </span>
        </div>

        <div className="mb-4 px-2">
          <h2 className="font-fraunces font-bold text-lg text-text-charcoal">Categories</h2>
          <p className="font-manrope font-normal text-xs text-secondary/50 mt-0.5">Select a category to filter menu</p>
        </div>

        <nav className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const IconComponent = (LucideIcons[cat.iconName as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>) || LucideIcons.Utensils;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory?.(cat.id)}
                className={cn(
                  'flex items-center gap-3.5 w-full h-12 px-4 rounded-xl font-manrope font-bold text-sm text-left transition-all active:scale-[0.98] select-none',
                  isSelected
                    ? 'bg-primary text-background shadow-sm'
                    : 'text-text-charcoal hover:bg-surface hover:text-primary'
                )}
                style={{ minHeight: '44px' }}
              >
                {cat.emoji ? (
                  <span className="text-base select-none shrink-0">{cat.emoji}</span>
                ) : (
                  <IconComponent className={cn('w-4.5 h-4.5', isSelected ? 'text-background' : 'text-primary')} />
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
};
