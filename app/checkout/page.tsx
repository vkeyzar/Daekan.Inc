'use client';

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createTransaction } from '@/app/actions/transaction'
import { supabase } from '@/lib/supabaseClient'
import { FaArrowLeft, FaShieldAlt, FaCheckCircle, FaChevronDown } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import useCartStore from '@/lib/store/useCartStore'
import Navbar from '@/components/Navbar'

const Checkout = () => {
  const router = useRouter()
  const cartItems = useCartStore((state) => state.items)
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const clearCart = useCartStore((state) => state.clearCart)
  const [formData, setFormData] = useState({ full_name: '', whatsapp: '', address: '', province: 'JAWA_TENGAH' })
  const [loading, setLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login?redirect=/checkout')
        return
      }
      setAuthChecking(false)
    }
    verifyAuth()
  }, [router])

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
    const snapUrl = clientKey.includes('SB-')
      ? "https://app.sandbox.midtrans.com/snap/snap.js"
      : "https://app.midtrans.com/snap/snap.js";

    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const formatIDR = (price: any) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price || 0)
  }

  if (authChecking || !hasHydrated) return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center font-black tracking-[0.2em] text-xs uppercase animate-pulse">
        MEMVERIFIKASI SESI...
      </div>
    </div>
  )

  if (!cartItems || cartItems.length === 0) return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-black dark:text-white font-bold tracking-widest uppercase mb-6 text-sm sm:text-base">Keranjang belanja kosong.</p>
        <button onClick={() => router.push('/')} className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-black text-xs sm:text-sm uppercase tracking-[0.2em] hover:opacity-80 transition-opacity cursor-pointer">
          Kembali ke Beranda
        </button>
      </div>
    </div>
  )

  const shippingRates: Record<string, number> = { 'JAWA_TENGAH': 15000, 'JAWA_TIMUR': 17000, 'JABODETABEK': 20000, 'JAWA_BARAT': 20000, 'LUAR_JAWA': 30000 }
  const provinceOptions = [
    { value: 'JAWA_TENGAH', label: 'JAWA TENGAH' }, { value: 'JAWA_TIMUR', label: 'JAWA TIMUR' },
    { value: 'JABODETABEK', label: 'JABODETABEK' }, { value: 'JAWA_BARAT', label: 'JAWA BARAT' }, { value: 'LUAR_JAWA', label: 'LUAR JAWA / OTHERS' }
  ]

  const basePrice = cartItems.reduce((total: number, item: any) => total + (item.price * item.quantity), 0)
  const shippingCost = shippingRates[formData.province] || 20000
  const totalPrice = basePrice + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
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
      const result = await createTransaction(cartItems as any, formData);

      if (!result.ok) {
        setLoading(false);
        return Swal.fire({
          title: result.code === 'OUT_OF_STOCK' ? 'STOK TIDAK MENCUKUPI' : 'GAGAL MEMPROSES',
          text: result.message,
          icon: result.code === 'OUT_OF_STOCK' ? 'error' : 'warning',
          confirmButtonColor: '#000'
        });
      }

      const response = await fetch('/api/create-midtrans-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: result.transactionId,
          gross_amount: result.totalPrice,
          customer_details: {
            first_name: formData.full_name,
            phone: formData.whatsapp,
            email: result.userEmail
          },
          item_details: result.itemDetails
        })
      });

      const midtransData = await response.json();
      if (!response.ok) throw new Error(midtransData.error || 'Gagal memanggil layanan pembayaran.');

      setLoading(false);

      (window as any).snap.pay(midtransData.token, {
        onSuccess: function () {
          clearCart();
          Swal.fire({
            title: 'PEMBAYARAN BERHASIL!',
            text: 'Pesanan Anda sedang diproses sistem.',
            icon: 'success'
          }).then(() => {
            router.push('/');
          });
        },
        onPending: function () {
          clearCart();
          Swal.fire({ title: 'MENUNGGU PEMBAYARAN', text: 'Silakan selesaikan pembayaran Anda.', icon: 'info' });
        },
        onError: function () {
          Swal.fire({ title: 'GAGAL', text: 'Terjadi kesalahan pada pembayaran.', icon: 'error' });
        },
        onClose: function () {
          clearCart();
          Swal.fire({ title: 'MENUNGGU PEMBAYARAN', text: 'Anda menutup layar pembayaran. Silakan cek menu Profile untuk melanjutkan pembayaran pesanan Anda.', icon: 'warning', confirmButtonColor: '#000' })
            .then(() => router.push('/profile'));
        }
      });

    } catch (err: any) {
      Swal.fire({ title: 'GAGAL MEMPROSES', text: `Terjadi kendala pada sistem: ${err.message}`, icon: 'error', confirmButtonColor: '#000' })
      setLoading(false)
    }
  }

  const handleReturnHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />
      <div className="max-w-6xl mx-auto w-full pt-10 pb-36 md:pb-44 px-4 sm:px-8 md:px-12 flex-1">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-2 border-black dark:border-white pb-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 font-black uppercase text-xs sm:text-sm tracking-widest text-black dark:text-white hover:opacity-60 transition-opacity cursor-pointer">
            <FaArrowLeft /> KEMBALI
          </button>
          <div className="text-xl md:text-2xl font-black uppercase tracking-tighter text-black dark:text-white">
            DAEKAN <span className="font-light text-zinc-500 dark:text-zinc-400">SECURE CHECKOUT</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-950 p-6 sm:p-8 border-2 border-black dark:border-white">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black dark:border-white pb-4 text-black dark:text-white">
              <FaShieldAlt className="text-xl shrink-0" />
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Informasi Pengiriman</h2>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label className="text-xs sm:text-sm font-black tracking-[0.15em] uppercase text-black dark:text-white mb-2 block">Nama Lengkap</label>
                <input required placeholder="JOHN DOE" className="w-full border-2 border-black dark:border-white p-3.5 outline-none font-bold uppercase text-sm sm:text-base transition-colors text-black dark:text-white placeholder:text-zinc-400 bg-transparent" onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-black tracking-[0.15em] uppercase text-black dark:text-white mb-2 block">Nomor WhatsApp Aktif</label>
                <input required type="tel" placeholder="081234567890" className="w-full border-2 border-black dark:border-white p-3.5 outline-none font-bold uppercase text-sm sm:text-base transition-colors text-black dark:text-white placeholder:text-zinc-400 bg-transparent" onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-black tracking-[0.15em] uppercase text-black dark:text-white mb-2 block">Alamat Lengkap</label>
                <textarea required placeholder="NAMA JALAN NO. 12, KOTA..." rows={3} className="w-full border-2 border-black dark:border-white p-3.5 outline-none font-medium text-sm sm:text-base transition-colors resize-none text-black dark:text-white placeholder:text-zinc-400 bg-transparent" onChange={(e) => setFormData({ ...formData, address: e.target.value })}></textarea>
              </div>

              <div className="relative">
                <label className="text-xs sm:text-sm font-black tracking-[0.15em] uppercase text-black dark:text-white mb-2 block">Provinsi Tujuan</label>
                <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full border-2 border-black dark:border-white p-3.5 outline-none flex items-center justify-between font-black text-xs sm:text-sm uppercase text-black dark:text-white bg-transparent cursor-pointer">
                  <span className="truncate">{provinceOptions.find(opt => opt.value === formData.province)?.label}</span>
                  <FaChevronDown className={`shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="absolute z-[100] top-full left-0 w-full mt-1 bg-white dark:bg-black border-2 border-black dark:border-white shadow-2xl">
                      {provinceOptions.map((opt) => (
                        <div key={opt.value} onClick={() => { setFormData({ ...formData, province: opt.value }); setIsDropdownOpen(false); }} className={`px-5 py-3.5 text-xs sm:text-sm font-black uppercase cursor-pointer transition-colors ${formData.province === opt.value ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}>
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
            <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 border-2 border-black dark:border-white flex flex-col">
              <h3 className="font-black uppercase text-lg sm:text-xl mb-4 tracking-tighter border-b-2 border-black dark:border-white pb-3 text-black dark:text-white">
                Ringkasan Pesanan
              </h3>

              <div className="max-h-60 overflow-y-auto pr-2 mb-4 space-y-4">
                {cartItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-3 last:border-0">
                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 p-1.5 shrink-0 border border-black dark:border-white">
                      {(() => {
                        const itemImg = (Array.isArray(item.image_url) ? item.image_url[0] : item.image_url) || item.image;
                        return <img src={itemImg || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-contain" />;
                      })()}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="font-black uppercase tracking-tight text-sm leading-tight mb-1 text-black dark:text-white truncate">{item.name}</h4>
                      <p className="text-xs font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase">
                        QTY: {item.quantity} {item.size && item.size !== '-' && <>• SIZE: <span className="text-black dark:text-white">{item.size}</span></>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-black text-black dark:text-white">{formatIDR(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-4 text-left border-t-2 border-black dark:border-white pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs sm:text-sm">Subtotal</span>
                  <span className="font-black text-sm sm:text-base text-black dark:text-white">{formatIDR(basePrice)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs sm:text-sm">Pengiriman (Reguler)</span>
                  <span className="font-black text-sm sm:text-base text-black dark:text-white">{formatIDR(shippingCost)}</span>
                </div>
              </div>
              <div className="border-t-2 border-black dark:border-white pt-4 mt-auto text-left">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-black text-sm sm:text-base uppercase tracking-widest text-black dark:text-white">Total Akhir</span>
                  <span className="text-2xl sm:text-3xl font-black tracking-tighter text-black dark:text-white">{formatIDR(totalPrice)}</span>
                </div>
                <p className="text-xs text-right font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  *Pembayaran aman ditenagai oleh Midtrans.
                </p>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white py-4 sm:py-5 font-black uppercase text-xs sm:text-sm tracking-[0.2em] hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {loading ? "MEMPROSES..." : "LANJUT KE PEMBAYARAN"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white w-full max-w-lg p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden my-8">
              <FaCheckCircle className="text-green-600 text-5xl sm:text-6xl mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4 leading-tight">LUNAS!</h2>
              <p className="text-sm sm:text-base font-medium text-zinc-600 dark:text-zinc-300 mb-8 px-2">
                Terima kasih! Pembayaran Anda telah kami terima dan pesanan akan segera kami proses.
              </p>

              <button onClick={handleReturnHome} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 font-black uppercase text-xs sm:text-sm tracking-[0.2em] hover:opacity-80 transition-all cursor-pointer">
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
