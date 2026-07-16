import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../components/cart/CartItem';
import { CartTotals } from '../components/cart/CartTotals';
import { PrimaryButton } from '../components/shared/PrimaryButton';
import { cn } from '../utils/cn';

import { useCartStore } from '../store/useCartStore';

interface OrderSummaryProps {
  className?: string;
  onCheckout?: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  className,
  onCheckout,
}) => {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = items.length > 0;

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (totalQuantity > 0) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 200);
      return () => clearTimeout(t);
    }
  }, [totalQuantity]);

  return (
    <div className={cn("flex flex-col h-full bg-white border-l border-secondary/10 overflow-hidden", className)}>
      {/* Title Header - Sticky / Non-shrinking */}
      <div className="p-6 border-b border-secondary/10 flex items-center gap-2 select-none flex-shrink-0">
        <ShoppingBag className="w-5 h-5 text-primary" />
        <h3 className="font-fraunces font-bold text-lg text-text-charcoal">
          Order Summary
        </h3>
        {hasItems && (
          <span className={cn(
            "font-manrope font-bold text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full ml-auto transition-all duration-200",
            animate && "scale-115 bg-primary/20"
          )}>
            {totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'}
          </span>
        )}
      </div>

      {/* Cart Items List - Scrollable (No space-y gap, divider is handled internally by CartItem) */}
      <div className="flex-1 overflow-y-auto px-6 py-2">
        {hasItems ? (
          items.map((item, idx) => (
            <CartItem
              key={`${item.product.id}-${item.selectedSize}-${idx}`}
              item={item}
              onIncrease={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
              onDecrease={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
              onChange={(val) => updateQuantity(item.product.id, item.selectedSize, val)}
              onRemove={() => removeItem(item.product.id, item.selectedSize)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-secondary/40 select-none py-12 px-4 text-center">
            <ShoppingBag className="w-12 h-12 mb-3 opacity-55 text-primary" />
            <h4 className="font-fraunces font-bold text-base text-text-charcoal mb-1">Your order is empty</h4>
            <p className="font-manrope text-xs text-secondary/60 max-w-[200px]">Browse the menu to begin building your order.</p>
          </div>
        )}
      </div>

      {/* Cart Totals & CTA - Sticky / Non-shrinking */}
      <div className="p-6 border-t border-secondary/10 bg-white flex-shrink-0 mt-auto">
        {hasItems && (
          <div className="mb-4">
            <CartTotals subtotal={subtotal} />
          </div>
        )}
        
        <PrimaryButton
          variant="primary"
          disabled={!hasItems}
          className="w-full h-12 flex items-center justify-center gap-2 text-base rounded-xl active:scale-[0.99] transition-all duration-300 ease-out hover:shadow-[0_6px_16px_rgba(182,90,60,0.25)] hover:bg-[#A34F33] hover:-translate-y-0.5"
          onClick={onCheckout}
          style={{ minHeight: '44px' }}
        >
          <span>Continue to Order Details</span>
          <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </div>
    </div>
  );
};
