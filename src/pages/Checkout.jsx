import React, { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { FaArrowLeft, FaShieldAlt, FaPlus, FaMinus, FaCheckCircle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { product } = location.state || {}

  const [formData, setFormData] = useState({
    full_name: '',
    whatsapp: '',
    address: '',
    province: 'JAWA_TENGAH',
    quantity: 1
  })
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const uniqueCode = useMemo(() => Math.floor(Math.random() * 900) + 100, [])

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
      <p className="text-zinc-400 font-bold tracking-widest uppercase mb-4 text-sm">No gear selected.</p>
      <button onClick={() => navigate('/')} className="px-8 py-4 bg-black text-white font-bold text-xs uppercase tracking-[0.2em]">Back to Shop</button>
    </div>
  )

  const handleIncrement = () => {
    setFormData({ ...formData, quantity: (Number(formData.quantity) || 0) + 1 })
  }
  const handleDecrement = () => {
    if (formData.quantity > 1) setFormData({ ...formData, quantity: Number(formData.quantity) - 1 })
  }

  const shippingRates = { 
    'JAWA_TENGAH': 15000, 
    'JAWA_TIMUR': 17000,
    'JAWA_BARAT': 20000, 
    'JABODETABEK': 20000, 
    'LUAR_JAWA': 30000 
  }
  const shippingCost = shippingRates[formData.province] || 20000
  const basePrice = product.price * (Number(formData.quantity) || 1)
  const totalPrice = basePrice + shippingCost + uniqueCode

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.quantity || formData.quantity < 1) return alert("Quantity minimal 1, Bro!")

    setLoading(true)
    try {
      const { error } = await supabase.from('transactions').insert([{
        full_name: formData.full_name,
        whatsapp: formData.whatsapp,
        address: formData.address,
        province: formData.province,
        city: '-', 
        product_name: product.name || product.title,
        quantity: Number(formData.quantity),
        shipping_method: `REGULER (${formData.province})`,
        total_price: totalPrice,
        status: 'pending'
      }])

      if (error) throw error
      setShowModal(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-black pt-4 pb-8 md:pt-6 md:pb-10 px-4 md:px-20 font-sans flex flex-col justify-center relative">
      <div className="max-w-6xl mx-auto w-full">
        {/* HEADER */}
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold uppercase text-xs md:text-sm tracking-widest hover:text-zinc-500 transition-colors">
            <FaArrowLeft /> BACK TO SHOP
          </button>
          <div className="text-lg md:text-2xl font-black italic tracking-tighter uppercase">
            DAEKAN<span className="font-light">SECURE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* LEFT: FORM */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-100">
            <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-zinc-100 pb-4 text-green-600">
              <FaShieldAlt className="text-lg" />
              <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-black">Delivery Info</h2>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-5 text-left">
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-1 block">Full Name</label>
                <input required placeholder="JOHN DOE" className="w-full border-b-2 border-zinc-200 py-2 outline-none focus:border-black font-black uppercase text-base transition-colors" onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-1 block">WhatsApp Number</label>
                <input required type="tel" placeholder="081234567890" className="w-full border-b-2 border-zinc-200 py-2 outline-none focus:border-black font-black uppercase text-base transition-colors" onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-1 block">Shipping Address</label>
                <textarea required placeholder="STREET NAME NO. 12, CITY..." rows="2" className="w-full border-b-2 border-zinc-200 py-2 outline-none focus:border-black font-medium text-base transition-colors resize-none" onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-1 block">Province</label>
                  <select className="w-full border-b-2 border-zinc-200 py-2 outline-none focus:border-black font-black text-sm uppercase cursor-pointer bg-transparent" onChange={(e) => setFormData({...formData, province: e.target.value})}>
                    <option value="JAWA_TENGAH">JAWA TENGAH</option>
                    <option value="JAWA_TIMUR">JAWA TIMUR</option>
                    <option value="JABODETABEK">JABODETABEK</option>
                    <option value="JAWA_BARAT">JAWA BARAT</option>
                    <option value="LUAR_JAWA">LUAR JAWA / OTHERS</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-1 block">Quantity</label>
                  <div className="flex items-center justify-between border-b-2 border-zinc-200 py-1">
                    <button type="button" onClick={handleDecrement} className="w-8 h-8 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg"><FaMinus size={10} /></button>
                    <input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-16 text-center font-black text-base outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <button type="button" onClick={handleIncrement} className="w-8 h-8 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg"><FaPlus size={10} /></button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
              <h3 className="font-black italic uppercase text-xl mb-4 tracking-tighter border-b border-zinc-100 pb-3">Summary</h3>
              <div className="flex items-center gap-4 border-b border-zinc-100 pb-4 mb-4">
                <div className="w-20 h-20 bg-zinc-50 rounded-xl p-2 shrink-0 border border-zinc-100">
                  <img src={product.image_url || product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="text-left">
                  <h4 className="font-black italic uppercase tracking-tighter text-base md:text-lg leading-tight mb-1">{product.name || product.title}</h4>
                  <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">QTY: {formData.quantity || 1}</p>
                </div>
              </div>
              <div className="space-y-3 mb-4 text-left">
                <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Subtotal</span><span className="font-black text-base">Rp {basePrice.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Shipping</span><span className="font-black text-base">Rp {shippingCost.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold uppercase tracking-widest text-xs text-green-600">Unique Code</span><span className="font-black text-base text-green-600">+ Rp {uniqueCode}</span></div>
              </div>
              <div className="border-t border-zinc-100 pt-4 mt-auto text-left">
                <div className="flex justify-between items-end mb-1"><span className="font-black text-base md:text-lg uppercase tracking-widest text-zinc-400">Total</span><span className="text-3xl md:text-4xl font-black italic tracking-tighter text-black">Rp {totalPrice.toLocaleString('id-ID')}</span></div>
                <p className="text-[10px] text-right font-bold text-red-500 uppercase tracking-widest">*Please transfer EXACTLY this amount.</p>
              </div>
            </div>

            <button type="submit" form="checkout-form" disabled={loading} className="w-full bg-black text-white py-5 font-black italic uppercase text-sm tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl rounded-xl">
              {loading ? "PROCESSING..." : "CONFIRM & PLACE ORDER"}
            </button>
          </div>
        </div>
      </div>

      {/* --- UPGRADED CUSTOM POPUP MODAL (BIGGER TEXT) --- */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-3xl p-10 md:p-12 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-green-500"></div>
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">ORDER PLACED!</h2>
              <p className="text-lg font-medium text-zinc-600 mb-10">Your order has been recorded in our secure system.</p>
              
              <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-3xl mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-3">TOTAL TO TRANSFER</p>
                <p className="text-5xl md:text-6xl font-black italic text-black mb-8">Rp {totalPrice.toLocaleString('id-ID')}</p>
                
                <div className="space-y-6 border-t border-zinc-200 pt-8 text-left max-w-md mx-auto">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">BANK MANDIRI</p>
                    <p className="font-black text-xl md:text-2xl tracking-widest text-black">1840001454113</p>
                    <p className="font-bold text-sm text-zinc-500 uppercase tracking-widest">A/N VALZA ANANTA PERMADY</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">E-WALLET (DANA/OVO/GOPAY)</p>
                    <p className="font-black text-xl md:text-2xl tracking-widest text-black">085695999703</p>
                    <p className="font-bold text-sm text-zinc-500 uppercase tracking-widest">A/N DAEKAN INC</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-400 mb-10 font-medium italic leading-relaxed">
                *Please save your transfer receipt. Our admin will contact you via WhatsApp shortly to confirm your order.
              </p>

              <button onClick={() => navigate('/')} className="w-full bg-black text-white py-6 font-black italic uppercase text-base tracking-[0.3em] hover:bg-zinc-800 transition-all rounded-2xl shadow-xl">
                I UNDERSTAND, BACK TO SHOP
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Checkout