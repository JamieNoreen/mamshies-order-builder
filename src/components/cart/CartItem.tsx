import React from 'react';
import { Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types';
import { QuantitySelector } from '../shared/QuantitySelector';

interface CartItemProps {
  item: CartItemType;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onChange?: (val: number) => void;
  onRemove?: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onIncrease,
  onDecrease,
  onChange,
  onRemove,
}) => {
  const { product, selectedSize, quantity, price, label, partyBoxDishes } = item;

  return (
    <div className="flex items-start justify-between gap-4 py-5 md:py-5.5 border-b border-secondary/10 last:border-b-0">
      <div className="flex-1 min-w-0">
        <h4 className="font-manrope font-bold text-sm text-text-charcoal leading-snug truncate">
          {product.title}
        </h4>
        
        {partyBoxDishes && partyBoxDishes.length > 0 ? (
          <ul className="text-[11px] text-secondary/60 mt-1 pl-4 list-disc space-y-0.5 select-none font-manrope font-semibold">
            {partyBoxDishes.map((dish, i) => (
              <li key={i}>{dish}</li>
            ))}
          </ul>
        ) : (
          <p className="font-manrope font-semibold text-xs text-secondary/60 mt-0.5 select-none">
            Size: {selectedSize} {label ? `(${label})` : ''}
          </p>
        )}

        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-manrope font-bold text-sm text-primary">
            ₱{(price * quantity).toLocaleString()}
          </span>
          {quantity > 1 && (
            <span className="text-[10px] text-secondary/40 font-medium">
              (₱{price.toLocaleString()} ea)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <QuantitySelector
          quantity={quantity}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          onChange={onChange}
          className="w-24 md:w-26 flex-shrink-0 scale-90"
        />
        <button
          onClick={onRemove}
          className="p-2 rounded-lg text-secondary/40 hover:text-error hover:bg-error/5 transition-all"
          aria-label={`Remove ${product.title}`}
          style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
