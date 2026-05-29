import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // 1. Fungsi nambah barang ke keranjang
      addToCart: (product, size = '-', quantity = 1) => {
        const currentCart = get().cart
        
        // Cek apakah barang dengan ID dan SIZE yang sama persis udah ada di keranjang
        const existingItemIndex = currentCart.findIndex(
          (item) => item.id === product.id && item.size === size
        )

        if (existingItemIndex !== -1) {
          // Kalau udah ada, tambahin aja quantity-nya (biar ga dobel list)
          const updatedCart = [...currentCart]
          updatedCart[existingItemIndex].quantity += quantity
          set({ cart: updatedCart })
        } else {
          // Kalau belum ada, masukin sebagai baris item baru
          set({ 
            cart: [...currentCart, { ...product, size, quantity }] 
          })
        }
      },

      // 2. Fungsi hapus barang spesifik
      removeFromCart: (productId, size) => {
        set((state) => ({
          cart: state.cart.filter((item) => !(item.id === productId && item.size === size)),
        }))
      },

      // 3. Fungsi update quantity (buat tombol +/- di Sidebar Cart nanti)
      updateQuantity: (productId, size, newQuantity) => {
        if (newQuantity < 1) return // Cegah quantity jadi 0 atau minus
        set((state) => ({
          cart: state.cart.map((item) => 
            item.id === productId && item.size === size
              ? { ...item, quantity: newQuantity }
              : item
          ),
        }))
      },

      // 4. Fungsi bersihin keranjang (dipanggil otomatis kalau sukses bayar di Checkout)
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'daekan-cart-storage', // Nama key penyimpanannya di browser
    }
  )
)

export default useCartStore