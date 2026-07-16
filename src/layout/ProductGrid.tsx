import React from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddProduct?: (product: Product, size: string, quantity: number, price: number, label: string) => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddProduct,
  className,
}) => {
  return (
    <div
      className={`grid gap-6 items-stretch w-full max-w-7xl mx-auto ${className}`}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}
    >
      {products.map((product) => (
        <div key={product.id} className="h-full w-full max-w-sm mx-auto">
          <ProductCard
            product={product}
            onAdd={onAddProduct}
          />
        </div>
      ))}
    </div>
  );
};
