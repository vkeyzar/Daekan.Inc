import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoClose, IoTrashOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/useCartStore'

const SidebarCart = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const cart = useCartStore((state) => state.cart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeFromCart = useCartStore((state) => state.removeFromCart)

  const formatIDR = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  const handleCheckout = () => { onClose(); navigate('/checkout', { state: { cartItems: cart } }) }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white z-[99999] shadow-2xl flex flex-col border-l border-vtuber-blue/20">
            <div className="flex items-center justify-between p-6 border-b border-vtuber-blue/10 shrink-0">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-800">
                Keranjang Belanja <span className="text-vtuber-pink font-medium text-lg">({cart.length})</span>
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-vtuber-pink/10 hover:text-vtuber-pink rounded-full transition-colors text-vtuber-purple"><IoClose className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
                  <p className="text-sm font-bold uppercase tracking-widest mb-4 text-vtuber-purple">Keranjang Anda masih kosong.</p>
                  <button onClick={onClose} className="px-6 py-3 border-2 border-vtuber-pink text-vtuber-pink rounded-xl font-black text-xs uppercase tracking-widest hover:bg-vtuber-pink hover:text-white transition-colors">Mulai Belanja</button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4 items-start border-b border-vtuber-blue/10 pb-6">
                    <div className="w-24 h-24 bg-vtuber-purple/5 rounded-2xl p-2 shrink-0 border border-vtuber-blue/10 flex items-center justify-center">
                      <img src={item.image_url || item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black uppercase text-sm leading-tight text-zinc-800">{item.name || item.title}</h3>
                        <button onClick={() => removeFromCart(item.id, item.size)} className="text-vtuber-purple hover:text-vtuber-pink transition-colors mt-0.5" title="Hapus Barang"><IoTrashOutline className="w-5 h-5" /></button>
                      </div>
                      {item.size && item.size !== '-' && <p className="text-[10px] font-bold text-vtuber-purple uppercase tracking-widest mt-1">Size: <span className="text-vtuber-cyan">{item.size}</span></p>}
                      <p className="font-black text-sm mt-2 text-vtuber-cyan">{formatIDR(item.price)}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center border border-vtuber-blue/20 rounded-lg overflow-hidden w-24 h-8 text-vtuber-purple">
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="w-1/3 h-full flex items-center justify-center hover:bg-vtuber-cyan/10 font-bold transition-colors">-</button>
                          <div className="w-1/3 h-full flex items-center justify-center font-black text-xs border-x border-vtuber-blue/20">{item.quantity}</div>
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="w-1/3 h-full flex items-center justify-center hover:bg-vtuber-cyan/10 font-bold transition-colors">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-vtuber-blue/10 bg-white shrink-0 shadow-[0_-10px_30px_rgba(164,229,250,0.1)]">
                <div className="flex justify-between items-end mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-vtuber-purple">Subtotal</p>
                  <p className="text-2xl font-black italic tracking-tighter text-zinc-800">{formatIDR(totalPrice)}</p>
                </div>
                <button onClick={handleCheckout} className="w-full bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white py-5 rounded-xl font-black italic uppercase text-xs tracking-[0.2em] hover:from-vtuber-pink hover:to-vtuber-purple transition-all shadow-[0_5px_20px_rgba(164,229,250,0.4)]">
                  LANJUTKAN KE PEMBAYARAN
                </button>
                <p className="text-[9px] text-vtuber-purple text-center mt-4 font-bold uppercase tracking-widest">
                  *Biaya pengiriman dihitung pada halaman selanjutnya.
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