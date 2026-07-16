import React from 'react';

interface CartTotalsProps {
  subtotal: number;
}

export const CartTotals: React.FC<CartTotalsProps> = ({ subtotal }) => {
  return (
    <div className="flex items-center justify-between font-manrope pt-2">
      <span className="text-[12px] font-bold text-secondary/40 uppercase tracking-wider">Total</span>
      <span className="text-[20px] font-extrabold text-primary">₱{subtotal.toLocaleString()}</span>
    </div>
  );
};
