import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoClose, IoTrashOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/useCartStore'

const SidebarCart = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  
  // Tarik data dan fungsi dari Zustand
  const cart = useCartStore((state) => state.cart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeFromCart = useCartStore((state) => state.removeFromCart)

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
    }).format(price)
  }

  // Hitung total harga semua barang
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  const handleCheckout = () => {
    onClose() // Tutup sidebar
    // Bawa seluruh isi keranjang ke halaman Checkout
    navigate('/checkout', { state: { cartItems: cart } })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY GELAP DI BELAKANG */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
          />

          {/* PANEL SIDEBAR DARI KANAN */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white z-[99999] shadow-2xl flex flex-col"
          >
            {/* HEADER SIDEBAR */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                Keranjang Belanja <span className="text-zinc-400 font-medium text-lg">({cart.length})</span>
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            {/* ISI KERANJANG (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <p className="text-sm font-bold uppercase tracking-widest mb-4">Keranjang Anda masih kosong.</p>
                  <button onClick={onClose} className="px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4 items-start border-b border-zinc-50 pb-6">
                    {/* GAMBAR BARANG */}
                    <div className="w-24 h-24 bg-zinc-50 rounded-xl p-2 shrink-0 border border-zinc-100 flex items-center justify-center">
                      <img src={item.image_url || item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>

                    {/* DETAIL BARANG */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black uppercase text-sm leading-tight">{item.name || item.title}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="text-zinc-400 hover:text-red-500 transition-colors mt-0.5"
                          title="Hapus Barang"
                        >
                          <IoTrashOutline className="w-5 h-5" />
                        </button>
                      </div>

                      {item.size && item.size !== '-' && (
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                          Size: <span className="text-black">{item.size}</span>
                        </p>
                      )}

                      <p className="font-black text-sm mt-2">{formatIDR(item.price)}</p>

                      {/* KONTROL KUANTITAS */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden w-24 h-8">
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="w-1/3 h-full flex items-center justify-center bg-zinc-50 hover:bg-zinc-200 text-zinc-600 font-bold transition-colors"
                          >
                            -
                          </button>
                          <div className="w-1/3 h-full flex items-center justify-center font-black text-xs border-x border-zinc-200">
                            {item.quantity}
                          </div>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="w-1/3 h-full flex items-center justify-center bg-zinc-50 hover:bg-zinc-200 text-zinc-600 font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER: TOTAL & CHECKOUT */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 shrink-0">
                <div className="flex justify-between items-end mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Subtotal</p>
                  <p className="text-2xl font-black italic tracking-tighter">{formatIDR(totalPrice)}</p>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-5 rounded-xl font-black italic uppercase text-xs tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl"
                >
                  LANJUTKAN KE PEMBAYARAN
                </button>
                <p className="text-[9px] text-zinc-400 text-center mt-4 font-medium uppercase tracking-widest">
                  *Biaya pengiriman akan dihitung pada halaman selanjutnya.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SidebarCart