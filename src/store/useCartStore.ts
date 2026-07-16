import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity: number, price: number, label: string, partyBoxDishes?: string[]) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, size, quantity, price, label, partyBoxDishes) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => {
          if (product.category === 'party-box' && item.product.category === 'party-box') {
            if (item.partyBoxDishes && partyBoxDishes) {
              const matchAll =
                partyBoxDishes.every((d) => item.partyBoxDishes!.includes(d)) &&
                item.partyBoxDishes.every((d) => partyBoxDishes.includes(d));
              return matchAll;
            }
            return false;
          }
          return item.product.id === product.id && item.selectedSize === size;
        });

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + quantity,
          };
          set({ items: updatedItems });
        } else {
          set({
            items: [
              ...currentItems,
              {
                product,
                selectedSize: size,
                quantity,
                price,
                label,
                partyBoxDishes,
              },
            ],
          });
        }
      },

      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            (item) => !(item.product.id === productId && item.selectedSize === size)
          ),
        });
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId && item.selectedSize === size
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'mamshies-order-builder-cart',
    }
  )
);
