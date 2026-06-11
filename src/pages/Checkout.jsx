import React, { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { FaArrowLeft, FaShieldAlt, FaCheckCircle, FaHandshake, FaTruck, FaChevronDown } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import useCartStore from '../store/useCartStore' 

const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const clearCart = useCartStore((state) => state.clearCart)
  const { cartItems } = location.state || { cartItems: [] }
  const [formData, setFormData] = useState({ full_name: '', whatsapp: '', address: '', province: 'JAWA_TENGAH', deliveryMethod: 'SHIPMENT' })
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const uniqueCode = useMemo(() => Math.floor(Math.random() * 900) + 100, [])

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
    }).format(price)
  }

  if (!cartItems || cartItems.length === 0) return (
    <div className="min-h-screen relative z-[999] flex flex-col items-center justify-center bg-white">
      <p className="text-vtuber-purple font-bold tracking-widest uppercase mb-4 text-sm">Keranjang belanja kosong.</p>
      <button onClick={() => navigate('/')} className="px-8 py-4 bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em]">Kembali ke Beranda</button>
    </div>
  )

  const isCOD = formData.deliveryMethod === 'COD'
  const shippingRates = { 'JAWA_TENGAH': 15000, 'JAWA_TIMUR': 17000, 'JABODETABEK': 20000, 'JAWA_BARAT': 20000, 'LUAR_JAWA': 30000 }
  const provinceOptions = [
    { value: 'JAWA_TENGAH', label: 'JAWA TENGAH' }, { value: 'JAWA_TIMUR', label: 'JAWA TIMUR' },
    { value: 'JABODETABEK', label: 'JABODETABEK' }, { value: 'JAWA_BARAT', label: 'JAWA BARAT' }, { value: 'LUAR_JAWA', label: 'LUAR JAWA / OTHERS' }
  ]

  const basePrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  const shippingCost = isCOD ? 0 : (shippingRates[formData.province] || 20000)
  const activeUniqueCode = isCOD ? 0 : uniqueCode
  const totalPrice = basePrice + shippingCost + activeUniqueCode

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (sessionError || !userId) throw new Error("Sesi login tidak valid. Silakan kembali dan login ulang.");

      // ✅ FIX: Format nama barang biar rapi di Supabase (Nama Barang [Size: XL] (Qty: 2))
      const productSummary = cartItems.map(item => `${item.name} [Size: ${item.size || '-'}] (Qty: ${item.quantity})`).join(' | ');
      const totalQty = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
      const sizeSummary = cartItems.map(item => item.size || '-').join(', ');

      const { error } = await supabase.from('transactions').insert([{
        user_id: userId, full_name: formData.full_name, whatsapp: formData.whatsapp, address: formData.address,
        province: isCOD ? 'KUDUS' : formData.province, city: '-', items: cartItems, product_name: productSummary, 
        quantity: totalQty, size: sizeSummary, shipping_method: isCOD ? 'COD (KUDUS ONLY)' : `REGULER (${formData.province})`,
        delivery_method: formData.deliveryMethod, total_price: totalPrice, status: 'pending'
      }])
      if (error) throw error
      clearCart(); setShowModal(true)
    } catch (err) {
      Swal.fire({ title: 'GAGAL MEMPROSES', text: `Terjadi kendala pada sistem: ${err.message}`, icon: 'error', confirmButtonColor: '#e1aecf' })
    } finally { setLoading(false) }
  }

  const handleReturnHome = () => {
    if (isCOD) {
      Swal.fire({
        title: 'KEMBALI KE BERANDA?',
        text: 'Pastikan nomor WhatsApp Anda aktif agar admin dapat menghubungi Anda.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#77cbf0',
        cancelButtonColor: '#e1aecf',
        confirmButtonText: 'YA, KEMBALI',
        cancelButtonText: 'BATAL'
      }).then((result) => {
        if (result.isConfirmed) navigate('/')
      })
    } else {
      Swal.fire({
        title: 'PERHATIAN!',
        text: 'Apakah Anda sudah men-screenshot atau mencatat Nomor Rekening Pembayaran?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#77cbf0',
        cancelButtonColor: '#e1aecf',
        confirmButtonText: 'SUDAH DICATAT',
        cancelButtonText: 'KEMBALI KE INFO'
      }).then((result) => {
        if (result.isConfirmed) navigate('/')
      })
    }
  }

  return (
    <div className="min-h-screen relative z-[999] bg-white text-black pt-4 pb-8 md:pt-6 md:pb-10 px-4 md:px-20 font-sans flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold uppercase text-xs md:text-sm tracking-widest text-vtuber-purple hover:text-vtuber-pink transition-colors">
            <FaArrowLeft /> KEMBALI
          </button>
          <div className="text-lg md:text-2xl font-black italic tracking-tighter uppercase drop-shadow-sm">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-1">DAEKAN</span><span className="font-light text-vtuber-pink">SECURE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl shadow-[0_10px_40px_rgba(164,229,250,0.15)] border border-vtuber-blue/10">
            <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-vtuber-blue/10 pb-4 text-vtuber-cyan">
              <FaShieldAlt className="text-lg drop-shadow-sm" />
              <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-zinc-800">Informasi Pengiriman</h2>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-5 text-left">
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple mb-1 block">Nama Lengkap</label>
                <input required placeholder="JOHN DOE" className="w-full border-b-2 border-vtuber-blue/20 py-2 outline-none focus:border-vtuber-cyan font-black uppercase text-base transition-colors text-zinc-800 placeholder:text-zinc-300" onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple mb-1 block">Nomor WhatsApp Aktif</label>
                <input required type="tel" placeholder="081234567890" className="w-full border-b-2 border-vtuber-blue/20 py-2 outline-none focus:border-vtuber-cyan font-black uppercase text-base transition-colors text-zinc-800 placeholder:text-zinc-300" onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
              </div>
              
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple mb-2 block">Metode Pengiriman</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({...formData, deliveryMethod: 'SHIPMENT'})} className={`flex items-center justify-center gap-2 py-3 font-black text-[10px] md:text-xs uppercase tracking-widest border-2 transition-all rounded-2xl ${!isCOD ? 'border-vtuber-cyan bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white shadow-[0_5px_15px_rgba(164,229,250,0.4)]' : 'border-vtuber-blue/20 text-vtuber-purple hover:border-vtuber-cyan hover:text-vtuber-cyan'}`}>
                    <FaTruck size={14} /> REGULER
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, deliveryMethod: 'COD'})} className={`flex items-center justify-center gap-2 py-3 font-black text-[10px] md:text-xs uppercase tracking-widest border-2 transition-all rounded-2xl ${isCOD ? 'border-vtuber-cyan bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white shadow-[0_5px_15px_rgba(164,229,250,0.4)]' : 'border-vtuber-blue/20 text-vtuber-purple hover:border-vtuber-cyan hover:text-vtuber-cyan'}`}>
                    <FaHandshake size={14} /> COD (KUDUS ONLY)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple mb-1 block">
                  {isCOD ? 'Lokasi Titik Temu (Area Kudus)' : 'Alamat Lengkap'}
                </label>
                <textarea required placeholder={isCOD ? "ALUN-ALUN KUDUS / UMK / DLL..." : "NAMA JALAN NO. 12, KOTA..."} rows="3" className="w-full border-b-2 border-vtuber-blue/20 py-2 outline-none focus:border-vtuber-cyan font-medium text-base transition-colors resize-none text-zinc-800 placeholder:text-zinc-300" onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
              </div>

              <div className={`transition-opacity duration-300 relative ${isCOD ? 'opacity-40 pointer-events-none' : ''}`}>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple mb-1 block">Provinsi Tujuan</label>
                <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full border-b-2 border-vtuber-blue/20 py-2 outline-none flex items-center justify-between font-black text-xs md:text-sm uppercase text-zinc-800 hover:border-vtuber-cyan">
                  {provinceOptions.find(opt => opt.value === formData.province)?.label}
                  <FaChevronDown className={`text-vtuber-cyan transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 top-full left-0 w-full mt-2 bg-white border border-vtuber-blue/10 rounded-2xl shadow-xl overflow-hidden py-2">
                      {provinceOptions.map((opt) => (
                        <div key={opt.value} onClick={() => { setFormData({...formData, province: opt.value}); setIsDropdownOpen(false); }} className={`px-5 py-3 text-xs md:text-sm font-black uppercase cursor-pointer transition-colors ${formData.province === opt.value ? 'bg-vtuber-purple/10 text-vtuber-cyan' : 'text-vtuber-purple hover:bg-vtuber-purple/5 hover:text-vtuber-cyan'}`}>
                          {opt.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(164,229,250,0.15)] border border-vtuber-blue/10 flex flex-col">
              <h3 className="font-black italic uppercase text-xl mb-4 tracking-tighter border-b border-vtuber-blue/10 pb-3 text-zinc-800">Ringkasan Pesanan</h3>
              
              <div className="max-h-60 overflow-y-auto pr-2 mb-4 space-y-4 scrollbar-thin scrollbar-thumb-vtuber-blue/20">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-vtuber-purple/5 rounded-2xl p-1.5 shrink-0 border border-vtuber-blue/10">
                      <img src={item.image_url || item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="font-black italic uppercase tracking-tighter text-sm leading-tight mb-1 text-zinc-800">{item.name}</h4>
                      <p className="text-[10px] font-bold tracking-widest text-vtuber-purple uppercase mt-0.5">
                        QTY: {item.quantity} {item.size && item.size !== '-' && <><span className="mx-1 text-vtuber-cyan">•</span> SIZE: <span className="text-vtuber-cyan">{item.size}</span></>}
                      </p>
                    </div>
                    <div className="text-right"><p className="text-xs font-black text-vtuber-cyan">{formatIDR(item.price * item.quantity)}</p></div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-4 text-left border-t border-vtuber-blue/10 pt-4">
                <div className="flex justify-between items-center text-sm"><span className="text-vtuber-purple font-bold uppercase tracking-widest text-xs">Subtotal</span><span className="font-black text-base text-zinc-800">{formatIDR(basePrice)}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-vtuber-purple font-bold uppercase tracking-widest text-xs">Pengiriman {isCOD ? '(COD)' : ''}</span><span className="font-black text-base text-zinc-800">{formatIDR(shippingCost)}</span></div>
                {!isCOD && <div className="flex justify-between items-center text-sm"><span className="text-vtuber-pink font-bold uppercase tracking-widest text-xs">Kode Unik</span><span className="font-black text-base text-vtuber-pink">+ Rp {activeUniqueCode}</span></div>}
              </div>
              <div className="border-t border-vtuber-blue/10 pt-4 mt-auto text-left">
                <div className="flex justify-between items-end mb-1"><span className="font-black text-base md:text-lg uppercase tracking-widest text-vtuber-purple">Total</span><span className="text-3xl md:text-4xl font-black italic tracking-tighter text-zinc-800">{formatIDR(totalPrice)}</span></div>
                <p className="text-[10px] text-right font-bold text-vtuber-pink uppercase tracking-widest">{isCOD ? "*Siapkan nominal tunai yang sesuai." : "*Mohon transfer TEPAT SESUAI nominal di atas."}</p>
              </div>
            </div>

            <button type="submit" form="checkout-form" disabled={loading} className="w-full bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white py-5 font-black italic uppercase text-sm tracking-[0.2em] hover:from-vtuber-pink hover:to-vtuber-purple transition-all shadow-[0_10px_20px_rgba(164,229,250,0.4)] rounded-2xl">
              {loading ? "MEMPROSES PESANAN..." : "KONFIRMASI & BUAT PESANAN"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-[2rem] p-10 md:p-12 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-vtuber-cyan to-vtuber-pink"></div>
              {isCOD ? <FaHandshake className="text-vtuber-cyan text-6xl mx-auto mb-6 drop-shadow-md" /> : <FaCheckCircle className="text-vtuber-cyan text-6xl mx-auto mb-6 drop-shadow-md" />}
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-zinc-800">PESANAN DITERIMA!</h2>
              <p className="text-lg font-medium text-vtuber-purple mb-10">Data pesanan Anda telah tersimpan secara aman di dalam sistem kami.</p>
              
              <div className="bg-vtuber-purple/5 border border-vtuber-blue/10 p-8 rounded-3xl mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-vtuber-pink mb-3">{isCOD ? "TOTAL TUNAI YANG HARUS DISIAPKAN" : "TOTAL PEMBAYARAN"}</p>
                <p className="text-5xl md:text-6xl font-black italic text-zinc-800 mb-8">{formatIDR(totalPrice)}</p>
                
                {!isCOD ? (
                  <div className="space-y-6 border-t border-vtuber-blue/10 pt-8 text-left max-w-md mx-auto">
                    <div className="flex flex-col gap-1"><p className="text-xs font-bold uppercase tracking-[0.2em] text-vtuber-cyan">BANK MANDIRI</p><p className="font-black text-xl md:text-2xl tracking-widest text-zinc-800">1840001454113</p><p className="font-bold text-sm text-vtuber-purple uppercase tracking-widest">A/N VALZA ANANTA PERMADY</p></div>
                    <div className="flex flex-col gap-1"><p className="text-xs font-bold uppercase tracking-[0.2em] text-vtuber-cyan">E-WALLET (DANA/OVO/GOPAY)</p><p className="font-black text-xl md:text-2xl tracking-widest text-zinc-800">085695999703</p><p className="font-bold text-sm text-vtuber-purple uppercase tracking-widest">A/N DAEKAN INC</p></div>
                  </div>
                ) : (
                  <div className="border-t border-vtuber-blue/10 pt-8 text-center max-w-md mx-auto">
                    <p className="font-black text-lg md:text-xl uppercase tracking-widest text-vtuber-cyan mb-2">🤝 PEMBAYARAN DI TEMPAT (COD)</p>
                    <p className="font-bold text-sm text-vtuber-purple uppercase tracking-widest leading-relaxed">Admin akan menghubungi Anda via WhatsApp untuk menentukan jadwal dan titik temu (Khusus Area Kudus).</p>
                  </div>
                )}
              </div>

              <p className="text-sm text-vtuber-pink mb-10 font-bold italic leading-relaxed">{!isCOD ? "*Harap simpan bukti transfer Anda. Admin kami akan segera memverifikasi setelah pembayaran masuk." : "*Pastikan nomor WhatsApp yang Anda masukkan aktif untuk proses konfirmasi."}</p>

              <button onClick={handleReturnHome} className="w-full bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white py-6 font-black italic uppercase text-base tracking-[0.3em] hover:from-vtuber-pink hover:to-vtuber-purple transition-all rounded-2xl shadow-[0_10px_20px_rgba(164,229,250,0.4)]">
                SAYA MENGERTI, KEMBALI KE BERANDA
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Checkout