import { create } from 'zustand';

// 1. Definisikan tipe data untuk item di keranjang
interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  // tambahkan atribut lain (misal image, size) sesuai kebutuhan
}

// 2. Definisikan struktur state dan action
interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
}

// 3. Terapkan interface <CartState> ke fungsi create
const useCartStore = create<CartState>((set) => ({
  cart: [],
  addToCart: (item) => set((state) => {
    // Masukkan logika tambah keranjang lo di sini
    return { cart: [...state.cart, item] };
  }),
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id)
  })),
  clearCart: () => set({ cart: [] }),
}));

export default useCartStore;