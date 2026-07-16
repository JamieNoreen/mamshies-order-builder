import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import { Card } from '../components/shared/Card';
import { ServingSizeSelector } from '../components/shared/ServingSizeSelector';
import { PrimaryButton } from '../components/shared/PrimaryButton';
import { QuantitySelector } from '../components/shared/QuantitySelector';
import { parsePriceAndLabel } from '../utils/priceParser';

import { getFoodImage } from '../utils/imageResolver';

interface ProductCardProps {
  product: Product;
  onAdd?: (product: Product, size: string, quantity: number, price: number, label: string) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAdd,
  className,
}) => {
  const { title, prices, sizes, category } = product;
  const [selectedSize, setSelectedSize] = useState(sizes[0] || 'S');
  const [quantity, setQuantity] = useState(1);

  // Extract current price & label
  const rawPriceStr = prices[selectedSize] || '';
  const parsed = parsePriceAndLabel(rawPriceStr);

  const imageUrl = getFoodImage(category, title);

  return (
    <Card className={`flex flex-col h-full bg-surface/30 border border-secondary/10 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-150 ${className}`} hoverEffect padding="md">
      {/* Product Image - Contained inside card padding with fallback */}
      <div className="w-full h-40 rounded-xl bg-surface/60 border border-secondary/5 flex items-center justify-center flex-shrink-0 mb-3.5 relative select-none overflow-hidden group">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-food.webp';
          }}
        />
      </div>

      {/* Price Badge - Standalone element below image */}
      <div className="flex-shrink-0 mb-2.5 select-none">
        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold font-manrope">
          ₱{parsed.price.toLocaleString()} {parsed.label ? `(${parsed.label})` : ''}
        </span>
      </div>

      {/* Product Details */}
      <div className="flex-shrink-0 mb-3 flex flex-col justify-start">
        {/* Title clamp to 2 lines */}
        <div className="h-11 flex-shrink-0 overflow-hidden flex items-start leading-tight">
          <h4 className="font-fraunces font-bold text-sm md:text-base text-text-charcoal line-clamp-2" title={title}>
            {title}
          </h4>
        </div>
      </div>

      {/* Size Selector - Select Size Label + Size Chips */}
      <div className="flex flex-col gap-1.5 flex-shrink-0 mb-4 select-none">
        <label className="font-manrope font-bold text-[10px] text-secondary/40 uppercase block leading-none">Choose Serving Size</label>
        {sizes && sizes.length > 0 ? (
          <ServingSizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
          />
        ) : (
          <div className="h-9 w-full" />
        )}
      </div>

      {/* Quantity + Add Button (same row) */}
      <div className="flex items-center gap-2.5 w-full mt-auto pt-2 flex-shrink-0 select-none">
        <QuantitySelector
          quantity={quantity}
          onIncrease={() => setQuantity((q) => q + 1)}
          onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          onChange={setQuantity}
          className="flex-[0_0_42%] min-w-0"
        />

        <PrimaryButton
          variant="primary"
          onClick={() => {
            onAdd?.(product, selectedSize, quantity, parsed.price, parsed.label);
            setQuantity(1); // reset quantity
          }}
          className="flex-1 min-w-0 h-11 flex items-center justify-center gap-1.5 font-bold text-xs transition-all duration-150 active:scale-[0.98] select-none"
          style={{ minHeight: '44px' }}
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Add</span>
        </PrimaryButton>
      </div>
    </Card>
  );
};
