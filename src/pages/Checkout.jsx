import React, { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { FaArrowLeft, FaShieldAlt, FaCheckCircle, FaChevronDown } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import useCartStore from '../store/useCartStore' 

const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const clearCart = useCartStore((state) => state.clearCart)
  const { cartItems } = location.state || { cartItems: [] }
  const [formData, setFormData] = useState({ full_name: '', whatsapp: '', address: '', province: 'JAWA_TENGAH' })
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const uniqueCode = useMemo(() => Math.floor(Math.random() * 900) + 100, [])

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  }

  if (!cartItems || cartItems.length === 0) return (
    <div className="min-h-screen relative z-[999] flex flex-col items-center justify-center bg-white px-4 text-center">
      <p className="text-vtuber-purple font-bold tracking-widest uppercase mb-4 text-sm">Keranjang belanja kosong.</p>
      <button onClick={() => navigate('/')} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em]">Kembali ke Beranda</button>
    </div>
  )

  const shippingRates = { 'JAWA_TENGAH': 15000, 'JAWA_TIMUR': 17000, 'JABODETABEK': 20000, 'JAWA_BARAT': 20000, 'LUAR_JAWA': 30000 }
  const provinceOptions = [
    { value: 'JAWA_TENGAH', label: 'JAWA TENGAH' }, { value: 'JAWA_TIMUR', label: 'JAWA TIMUR' },
    { value: 'JABODETABEK', label: 'JABODETABEK' }, { value: 'JAWA_BARAT', label: 'JAWA BARAT' }, { value: 'LUAR_JAWA', label: 'LUAR JAWA / OTHERS' }
  ]

  const basePrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  const shippingCost = shippingRates[formData.province] || 20000
  const totalPrice = basePrice + shippingCost + uniqueCode

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.full_name.trim() || !formData.whatsapp.trim() || !formData.address.trim()) {
      setLoading(false);
      return Swal.fire({ title: 'DATA TIDAK LENGKAP', text: 'Mohon lengkapi Nama Lengkap, Nomor WhatsApp, dan Alamat Anda demi kelancaran pengiriman.', icon: 'warning', confirmButtonColor: '#000' });
    }

    if (formData.whatsapp.trim().length < 9) {
      setLoading(false);
      return Swal.fire({ title: 'NOMOR WA TIDAK VALID', text: 'Mohon pastikan nomor WhatsApp yang Anda masukkan valid dan aktif untuk proses konfirmasi.', icon: 'warning', confirmButtonColor: '#000' });
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (sessionError || !userId) throw new Error("Sesi otentikasi tidak valid. Silakan login kembali.");

      const reservedItems = []; 

      for (const item of cartItems) {
        if (item.label === 'LIMITED GEAR') {
          const sizeToReserve = item.size || '-';
          
          const { data: isSuccess, error: rpcError } = await supabase.rpc('reserve_stock', { p_product_id: item.id, p_size: sizeToReserve, p_qty: item.quantity });
          if (rpcError) throw new Error(`Kesalahan sinkronisasi stok: ${rpcError.message}`);

          if (isSuccess) {
            reservedItems.push({ id: item.id, size: sizeToReserve, qty: item.quantity });
          } else {
            for (const resItem of reservedItems) {
               const { data: stockData } = await supabase.from('product_stocks').select('stock_reserved').eq('product_id', resItem.id).eq('size', resItem.size).single();
               if(stockData) await supabase.from('product_stocks').update({ stock_reserved: stockData.stock_reserved - resItem.qty }).eq('product_id', resItem.id).eq('size', resItem.size);
            }
            Swal.fire({ title: 'STOK TIDAK MENCUKUPI', text: `Mohon maaf, stok untuk produk "${item.name}" (Ukuran: ${sizeToReserve}) baru saja habis dipesan oleh pelanggan lain. Silakan sesuaikan keranjang belanja Anda.`, icon: 'error', confirmButtonColor: '#000' });
            setLoading(false);
            return; 
          }
        }
      }

      const productSummary = cartItems.map(item => `${item.name} [Size: ${item.size || '-'}] (Qty: ${item.quantity})`).join(' | ');
      const totalQty = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
      const sizeSummary = cartItems.map(item => item.size || '-').join(', ');

      const { error } = await supabase.from('transactions').insert([{
        user_id: userId, full_name: formData.full_name, whatsapp: formData.whatsapp, address: formData.address,
        province: formData.province, city: '-', items: cartItems, product_name: productSummary, 
        quantity: totalQty, size: sizeSummary, shipping_method: `REGULER (${formData.province})`,
        delivery_method: 'SHIPMENT', total_price: totalPrice, status: 'pending'
      }])

      if (error) throw error
      clearCart(); setShowModal(true)
    } catch (err) {
      Swal.fire({ title: 'GAGAL MEMPROSES', text: `Terjadi kendala pada sistem: ${err.message}`, icon: 'error', confirmButtonColor: '#000' })
    } finally { setLoading(false) }
  }

  const handleReturnHome = () => {
    Swal.fire({
      title: 'PERHATIAN!',
      text: 'Apakah Anda sudah memastikan Nomor Rekening Pembayaran tersimpan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#77cbf0',
      cancelButtonColor: '#e1aecf',
      confirmButtonText: 'SUDAH TERSIMPAN',
      cancelButtonText: 'KEMBALI KE INFO',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-3',
        cancelButton: 'rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) navigate('/')
    })
  }

  return (
    // ✅ FIX: Hapus justify-center kalau bikin mobile sempit, kasih overflow-x-hidden biar gak geser ke samping
    <div className="min-h-screen relative z-[999] bg-white text-black pt-20 pb-8 md:pt-28 md:pb-10 px-4 sm:px-8 md:px-20 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold uppercase text-xs md:text-sm tracking-widest text-vtuber-purple hover:text-vtuber-pink transition-colors">
            <FaArrowLeft /> KEMBALI
          </button>
          <div className="text-lg md:text-2xl font-black italic tracking-tighter uppercase drop-shadow-sm">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-1">DAEKAN</span><span className="font-light text-vtuber-pink">SECURE</span>
          </div>
        </div>

        {/* ✅ MOBILE FRIENDLY: Grid 1 kolom di HP, 12 kolom (7:5) di Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 md:p-8 rounded-3xl shadow-[0_10px_40px_rgba(164,229,250,0.15)] border border-vtuber-blue/10">
            <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-vtuber-blue/10 pb-4 text-vtuber-cyan">
              <FaShieldAlt className="text-lg shrink-0 drop-shadow-sm" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-black italic uppercase tracking-tighter text-zinc-800">Informasi Pengiriman</h2>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5 md:space-y-6 text-left">
              <div>
                <label className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple mb-1.5 block">Nama Lengkap</label>
                <input required placeholder="JOHN DOE" className="w-full border-b-2 border-vtuber-blue/20 py-2 outline-none focus:border-vtuber-cyan font-black uppercase text-sm sm:text-base transition-colors text-zinc-800 placeholder:text-zinc-300 bg-transparent" onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple mb-1.5 block">Nomor WhatsApp Aktif</label>
                <input required type="tel" placeholder="081234567890" className="w-full border-b-2 border-vtuber-blue/20 py-2 outline-none focus:border-vtuber-cyan font-black uppercase text-sm sm:text-base transition-colors text-zinc-800 placeholder:text-zinc-300 bg-transparent" onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple mb-1.5 block">Alamat Lengkap</label>
                <textarea required placeholder="NAMA JALAN NO. 12, KOTA..." rows="3" className="w-full border-b-2 border-vtuber-blue/20 py-2 outline-none focus:border-vtuber-cyan font-medium text-sm sm:text-base transition-colors resize-none text-zinc-800 placeholder:text-zinc-300 bg-transparent" onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
              </div>

              <div className="relative">
                <label className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple mb-1.5 block">Provinsi Tujuan</label>
                <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full border-b-2 border-vtuber-blue/20 py-2 outline-none flex items-center justify-between font-black text-xs sm:text-sm uppercase text-zinc-800 hover:border-vtuber-cyan bg-transparent">
                  <span className="truncate">{provinceOptions.find(opt => opt.value === formData.province)?.label}</span>
                  <FaChevronDown className={`shrink-0 text-vtuber-cyan transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* ✅ FIX DROPDOWN: Pake max-h-52 dan overflow-y-auto biar bisa di-scroll dalemnya, gak ngerusak layout halaman */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="absolute z-[100] top-full left-0 w-full mt-2 bg-white border border-vtuber-blue/20 rounded-2xl shadow-2xl overflow-y-auto max-h-52 scrollbar-thin scrollbar-thumb-vtuber-blue/30 py-2">
                      {provinceOptions.map((opt) => (
                        <div key={opt.value} onClick={() => { setFormData({...formData, province: opt.value}); setIsDropdownOpen(false); }} className={`px-4 sm:px-5 py-3 text-[10px] sm:text-xs md:text-sm font-black uppercase cursor-pointer transition-colors ${formData.province === opt.value ? 'bg-vtuber-purple/10 text-vtuber-cyan' : 'text-vtuber-purple hover:bg-vtuber-purple/5 hover:text-vtuber-cyan'}`}>
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
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-3xl shadow-[0_10px_40px_rgba(164,229,250,0.15)] border border-vtuber-blue/10 flex flex-col">
              <h3 className="font-black italic uppercase text-lg sm:text-xl mb-4 tracking-tighter border-b border-vtuber-blue/10 pb-3 text-zinc-800">Ringkasan Pesanan</h3>
              
              <div className="max-h-56 md:max-h-60 overflow-y-auto pr-2 mb-4 space-y-4 scrollbar-thin scrollbar-thumb-vtuber-blue/20">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-vtuber-purple/5 rounded-2xl p-1.5 shrink-0 border border-vtuber-blue/10">
                      <img src={item.image_url || item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="font-black italic uppercase tracking-tighter text-xs sm:text-sm leading-tight mb-1 text-zinc-800 truncate">{item.name}</h4>
                      <p className="text-[9px] sm:text-[10px] font-bold tracking-widest text-vtuber-purple uppercase mt-0.5">
                        QTY: {item.quantity} {item.size && item.size !== '-' && <><span className="mx-1 text-vtuber-cyan">•</span> SIZE: <span className="text-vtuber-cyan">{item.size}</span></>}
                      </p>
                    </div>
                    <div className="text-right shrink-0"><p className="text-[10px] sm:text-xs font-black text-vtuber-cyan">{formatIDR(item.price * item.quantity)}</p></div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-4 text-left border-t border-vtuber-blue/10 pt-4">
                <div className="flex justify-between items-center text-xs sm:text-sm"><span className="text-vtuber-purple font-bold uppercase tracking-widest text-[10px] sm:text-xs">Subtotal</span><span className="font-black text-sm sm:text-base text-zinc-800">{formatIDR(basePrice)}</span></div>
                <div className="flex justify-between items-center text-xs sm:text-sm"><span className="text-vtuber-purple font-bold uppercase tracking-widest text-[10px] sm:text-xs">Pengiriman (Reguler)</span><span className="font-black text-sm sm:text-base text-zinc-800">{formatIDR(shippingCost)}</span></div>
                <div className="flex justify-between items-center text-xs sm:text-sm"><span className="text-vtuber-pink font-bold uppercase tracking-widest text-[10px] sm:text-xs">Kode Unik</span><span className="font-black text-sm sm:text-base text-vtuber-pink">+ Rp {uniqueCode}</span></div>
              </div>
              <div className="border-t border-vtuber-blue/10 pt-4 mt-auto text-left">
                <div className="flex justify-between items-end mb-1"><span className="font-black text-sm sm:text-base md:text-lg uppercase tracking-widest text-vtuber-purple">Total Akhir</span><span className="text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tighter text-zinc-800">{formatIDR(totalPrice)}</span></div>
                <p className="text-[9px] sm:text-[10px] text-right font-bold text-vtuber-pink uppercase tracking-widest">*Mohon transfer TEPAT SESUAI nominal di atas.</p>
              </div>
            </div>

            <button type="submit" form="checkout-form" disabled={loading} className="w-full bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white py-4 sm:py-5 font-black italic uppercase text-xs sm:text-sm tracking-[0.2em] hover:from-vtuber-pink hover:to-vtuber-purple transition-all shadow-[0_10px_20px_rgba(164,229,250,0.4)] rounded-2xl">
              {loading ? "MEMPROSES PESANAN..." : "KONFIRMASI PESANAN"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            {/* ✅ FIX MODAL MOBILE: Tambahin my-8 biar kalo di layar HP kecil modalnya tetep bisa di-scroll dan gak mentok */}
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-[2rem] p-6 sm:p-10 md:p-12 shadow-2xl text-center relative overflow-hidden my-8">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-vtuber-cyan to-vtuber-pink"></div>
              <FaCheckCircle className="text-vtuber-cyan text-5xl sm:text-6xl mx-auto mb-4 sm:mb-6 drop-shadow-md" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-3 sm:mb-4 text-zinc-800 leading-tight">PESANAN DITERIMA!</h2>
              <p className="text-sm sm:text-base md:text-lg font-medium text-vtuber-purple mb-6 sm:mb-10 px-2">Data pesanan Anda telah tersimpan secara aman di dalam sistem kami.</p>
              
              <div className="bg-vtuber-purple/5 border border-vtuber-blue/10 p-5 sm:p-8 rounded-3xl mb-6 sm:mb-10">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-vtuber-pink mb-2 sm:mb-3">TOTAL PEMBAYARAN</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-black italic text-zinc-800 mb-6 sm:mb-8">{formatIDR(totalPrice)}</p>
                
                <div className="space-y-5 sm:space-y-6 border-t border-vtuber-blue/10 pt-6 sm:pt-8 text-left max-w-md mx-auto">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-vtuber-cyan">BANK MANDIRI</p>
                    <p className="font-black text-lg sm:text-xl md:text-2xl tracking-widest text-zinc-800 break-all">1840001454113</p>
                    <p className="font-bold text-[10px] sm:text-sm text-vtuber-purple uppercase tracking-widest">A/N VALZA ANANTA PERMADY</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-vtuber-cyan">E-WALLET (DANA/OVO/GOPAY)</p>
                    <p className="font-black text-lg sm:text-xl md:text-2xl tracking-widest text-zinc-800 break-all">085695999703</p>
                    <p className="font-bold text-[10px] sm:text-sm text-vtuber-purple uppercase tracking-widest">A/N DAEKAN INC</p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] sm:text-xs md:text-sm text-vtuber-pink mb-8 sm:mb-10 font-bold italic leading-relaxed px-2">*Mohon simpan bukti transfer Anda. Tim kami akan memverifikasi pesanan setelah pembayaran terkonfirmasi.</p>

              <button onClick={handleReturnHome} className="w-full bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white py-4 sm:py-6 font-black italic uppercase text-xs sm:text-base tracking-[0.2em] sm:tracking-[0.3em] hover:from-vtuber-pink hover:to-vtuber-purple transition-all rounded-2xl shadow-[0_10px_20px_rgba(164,229,250,0.4)]">
                KEMBALI KE BERANDA
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Checkout