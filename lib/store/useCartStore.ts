import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

type CartId = string | number;

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: CartId, size: string) => void;
  updateQuantity: (id: CartId, size: string, quantity: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id && i.size === item.size);
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.size === item.size
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.size === size)),
        })),
      updateQuantity: (id, size, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'daekan-cart', skipHydration: true }
  )
);

export default useCartStore;
