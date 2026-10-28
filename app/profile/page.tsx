'use client';

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { FaUserCircle, FaShoppingBag, FaSignOutAlt, FaCreditCard, FaClock, FaCheckCircle, FaTruck } from 'react-icons/fa'
import Swal from 'sweetalert2'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const Profile = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [payLoading, setPayLoading] = useState(false)

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setUser(profileData || session.user)

        const { data: trxData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        setTransactions(trxData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatIDR = (price: any) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price || 0)
  }

  const getStatusDisplay = (status: any) => {
    switch (status) {
      case 'pending': return { text: 'MENUNGGU PEMBAYARAN', color: 'text-orange-700 bg-orange-100 border-orange-300', icon: <FaClock /> }
      case 'invoiced': return { text: 'MENUNGGU PEMBAYARAN', color: 'text-orange-700 bg-orange-100 border-orange-300', icon: <FaClock /> }
      case 'verified': return { text: 'DIBAYAR (PROSES)', color: 'text-blue-700 bg-blue-100 border-blue-300', icon: <FaCheckCircle /> }
      case 'production': return { text: 'DALAM PRODUKSI', color: 'text-purple-700 bg-purple-100 border-purple-300', icon: <FaShoppingBag /> }
      case 'sending': return { text: 'SEDANG DIKIRIM', color: 'text-indigo-700 bg-indigo-100 border-indigo-300', icon: <FaTruck /> }
      case 'success': return { text: 'SELESAI', color: 'text-green-700 bg-green-100 border-green-300', icon: <FaCheckCircle /> }
      case 'canceled': return { text: 'DIBATALKAN', color: 'text-red-700 bg-red-100 border-red-300', icon: <FaUserCircle /> }
      default: return { text: (status || '').toUpperCase(), color: 'text-zinc-700 bg-zinc-100 border-zinc-300', icon: <FaShoppingBag /> }
    }
  }

  const handlePayNow = async (trx: any) => {
    setPayLoading(true);
    try {
      const itemDetails = trx.items ? trx.items.map((item: any) => ({
        id: item.id.toString(),
        price: item.price,
        quantity: item.quantity,
        name: item.name.substring(0, 50)
      })) : [];

      const subtotal = trx.items ? trx.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) : trx.total_price;
      const shippingCost = trx.total_price - subtotal;

      if (shippingCost > 0) {
        itemDetails.push({
          id: 'SHIPPING',
          price: shippingCost,
          quantity: 1,
          name: `Ongkir (${trx.province})`
        });
      }

      const response = await fetch('/api/create-midtrans-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: trx.id,
          gross_amount: trx.total_price,
          customer_details: {
            first_name: trx.full_name,
            phone: trx.whatsapp,
            email: user?.email || 'customer@daekan.store'
          },
          item_details: itemDetails
        })
      });

      const midtransData = await response.json();
      if (!response.ok) throw new Error(midtransData.error || 'Gagal memanggil layanan pembayaran.');

      setPayLoading(false);

      (window as any).snap.pay(midtransData.token, {
        onSuccess: function () {
          Swal.fire({
            title: 'PEMBAYARAN BERHASIL!',
            text: 'Pesanan Anda sedang diproses sistem.',
            icon: 'success'
          }).then(() => {
            router.push('/');
          });
        },
        onPending: function () {
          Swal.fire({ title: 'MENUNGGU PEMBAYARAN', text: 'Silakan selesaikan pembayaran Anda.', icon: 'info' });
        },
        onError: function () {
          Swal.fire({ title: 'GAGAL', text: 'Terjadi kesalahan pada pembayaran.', icon: 'error' });
        },
        onClose: function () {}
      });

    } catch (err: any) {
      Swal.fire({ title: 'ERROR', text: err.message, icon: 'error', confirmButtonColor: '#000' });
      setPayLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />
      {loading ? (
        <div className="flex-1 flex items-center justify-center font-black tracking-widest text-sm sm:text-base animate-pulse">
          LOADING PROFILE...
        </div>
      ) : (
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* HEADER PROFIL */}
            <div className="bg-white dark:bg-zinc-950 p-6 md:p-10 border-2 border-black dark:border-white flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                <FaUserCircle className="text-5xl" />
              </div>
              <div className="text-center md:text-left flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-black dark:text-white truncate">
                  {user?.full_name || 'DAEKAN MEMBER'}
                </h1>
                <p className="text-sm sm:text-base font-bold text-zinc-500 dark:text-zinc-400 mt-1 break-all">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors font-black uppercase tracking-widest text-xs sm:text-sm cursor-pointer"
              >
                <FaSignOutAlt /> Keluar
              </button>
            </div>

            {/* DAFTAR TRANSAKSI */}
            <div className="bg-white dark:bg-zinc-950 p-6 md:p-10 border-2 border-black dark:border-white">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-black dark:text-white mb-6 flex items-center gap-3 border-b-2 border-black dark:border-white pb-4">
                <FaShoppingBag /> Riwayat Pesanan
              </h2>

              {transactions.length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    Belum ada transaksi.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((trx: any) => {
                    const statusInfo = getStatusDisplay(trx.status);

                    return (
                      <div key={trx.id} className="border-2 border-black dark:border-white p-5 bg-white dark:bg-black">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                          <div>
                            <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 tracking-widest uppercase mb-1">
                              Order ID: #{trx.id.split('-')[0].toUpperCase()}
                            </p>
                            <p className="text-sm sm:text-base font-bold text-black dark:text-white">
                              {new Date(trx.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <div className={`px-4 py-2 border text-xs font-black uppercase tracking-widest flex items-center gap-2 w-fit ${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.text}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="w-full md:w-auto">
                            <p className="font-black uppercase text-sm sm:text-base mb-1 text-black dark:text-white">{trx.product_name}</p>
                            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
                              Total: <span className="text-black dark:text-white font-black">{formatIDR(trx.total_price)}</span>
                            </p>
                          </div>

                          {(trx.status === 'pending' || trx.status === 'invoiced') && (
                            <button
                              onClick={() => handlePayNow(trx)}
                              disabled={payLoading}
                              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity font-black uppercase tracking-widest text-xs sm:text-sm cursor-pointer"
                            >
                              <FaCreditCard /> {payLoading ? 'MEMPROSES...' : 'BAYAR SEKARANG'}
                            </button>
                          )}
                        </div>

                        {trx.courier && trx.tracking_number && (
                          <div className="mt-4 p-3.5 bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white">
                            <p className="text-xs sm:text-sm font-bold text-black dark:text-white uppercase tracking-widest flex flex-wrap items-center gap-2">
                              <FaTruck /> Resi {trx.courier}:{' '}
                              <span className="font-black bg-white dark:bg-black px-2.5 py-1 border border-black dark:border-white select-all">
                                {trx.tracking_number}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default Profile
