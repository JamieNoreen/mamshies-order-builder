import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChange,
  placeholder = 'Search dishes...',
  className,
}) => {
  return (
    <div className={cn('relative flex items-center w-full max-w-md', className)}>
      <Search className="absolute left-4 w-5 h-5 text-secondary/50 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-12 pr-10 bg-surface/50 border border-secondary/15 rounded-xl text-text-charcoal placeholder:text-secondary/40 font-manrope font-normal focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-base"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange?.('')}
          className="absolute right-3 p-1 rounded-full text-secondary/40 hover:text-secondary/70 hover:bg-secondary/10 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
