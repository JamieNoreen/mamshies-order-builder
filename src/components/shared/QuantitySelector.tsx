import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onChange?: (val: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  onChange,
  min = 1,
  max = 99,
  className,
}) => {
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 200);
    return () => clearTimeout(t);
  }, [quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      const clamped = Math.max(min, Math.min(max, val));
      onChange?.(clamped);
    } else if (e.target.value === '') {
      // Allow user to clear input temporarily while typing, but default to min on blur
      onChange?.(min);
    }
  };

  return (
    <div className={cn('flex items-center bg-surface border border-secondary/15 rounded-lg overflow-hidden w-full', className)}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        className="flex-1 h-11 flex items-center justify-center text-secondary/70 hover:text-primary disabled:opacity-30 disabled:hover:text-secondary/70 hover:bg-secondary/5 transition-all active:scale-[0.9] select-none min-w-0"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4 shrink-0" />
      </button>
      
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        className={cn(
          "w-10 text-center bg-transparent border-none font-manrope font-bold text-base text-text-charcoal focus:outline-none focus:ring-0 focus:border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shrink-0 transition-all duration-200",
          animate && "scale-115 text-primary"
        )}
      />
      
      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= max}
        className="flex-1 h-11 flex items-center justify-center text-secondary/70 hover:text-primary disabled:opacity-30 disabled:hover:text-secondary/70 hover:bg-secondary/5 transition-all active:scale-[0.9] select-none min-w-0"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4 shrink-0" />
      </button>
    </div>
  );
};
