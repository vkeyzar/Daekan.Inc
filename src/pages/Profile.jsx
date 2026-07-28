import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { FaUserCircle, FaShoppingBag, FaSignOutAlt, FaCreditCard, FaClock, FaCheckCircle, FaTruck } from 'react-icons/fa'
import Swal from 'sweetalert2'

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [payLoading, setPayLoading] = useState(false)

  // Load script Midtrans (Snap)
  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
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
          navigate('/login')
          return
        }

        // Ambil data profil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setUser(profileData || session.user)

        // Ambil data transaksi user tersebut, urutkan dari yang terbaru
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
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending': return { text: 'MENUNGGU PEMBAYARAN', color: 'text-orange-600 bg-orange-100', icon: <FaClock /> }
      case 'invoiced': return { text: 'MENUNGGU PEMBAYARAN', color: 'text-orange-600 bg-orange-100', icon: <FaClock /> }
      case 'verified': return { text: 'DIBAYAR (PROSES)', color: 'text-blue-600 bg-blue-100', icon: <FaCheckCircle /> }
      case 'production': return { text: 'DALAM PRODUKSI', color: 'text-purple-600 bg-purple-100', icon: <FaShoppingBag /> }
      case 'sending': return { text: 'SEDANG DIKIRIM', color: 'text-vtuber-cyan bg-vtuber-cyan/10', icon: <FaTruck /> }
      case 'success': return { text: 'SELESAI', color: 'text-green-600 bg-green-100', icon: <FaCheckCircle /> }
      case 'canceled': return { text: 'DIBATALKAN', color: 'text-red-600 bg-red-100', icon: <FaUserCircle /> } // fallback icon
      default: return { text: status.toUpperCase(), color: 'text-zinc-600 bg-zinc-100', icon: <FaShoppingBag /> }
    }
  }

  // Fungsi buat ngelanjutin pembayaran yang tertunda
  const handlePayNow = async (trx) => {
    setPayLoading(true);
    try {
      // Re-construct item details buat Midtrans
      const itemDetails = trx.items ? trx.items.map(item => ({
        id: item.id.toString(),
        price: item.price,
        quantity: item.quantity,
        name: item.name.substring(0, 50)
      })) : [];

      // Hitung ongkir (Total Harga - Subtotal Items)
      const subtotal = trx.items ? trx.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) : trx.total_price;
      const shippingCost = trx.total_price - subtotal;
      
      if (shippingCost > 0) {
        itemDetails.push({
          id: 'SHIPPING',
          price: shippingCost,
          quantity: 1,
          name: `Ongkir (${trx.province})`
        });
      }

      // ✅ FIX: Tambahin timestamp biar order_id selalu unik di mata Midtrans setiap kali re-try
      const uniqueOrderId = `${trx.id}-${Date.now()}`;

      const response = await fetch('/api/create-midtrans-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: trx.id, // ✅ Balikin kirim ID aslinya aja
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

      // Munculin pop-up Midtrans
      window.snap.pay(midtransData.token, {
        onSuccess: function(result){
          // ❌ HAPUS KODE AWAIT SUPABASE UPDATE DI SINI!
          // Biarkan Webhook Vercel di background yang bekerja update DB & kirim email.

          Swal.fire({ 
            title: 'PEMBAYARAN BERHASIL!', 
            text: 'Pesanan Anda sedang diproses sistem.', 
            icon: 'success' 
          }).then(() => {
            navigate('/'); 
            // Atau redirect ke profil: navigate('/profile');
          });
        },
        onPending: function(result){
          Swal.fire({ title: 'MENUNGGU PEMBAYARAN', text: 'Silakan selesaikan pembayaran Anda.', icon: 'info' });
        },
        onError: function(result){
          Swal.fire({ title: 'GAGAL', text: 'Terjadi kesalahan pada pembayaran.', icon: 'error' });
        },
        onClose: function(){
          // User nutup pop-up
        }
      });

    } catch (err) {
      Swal.fire({ title: 'ERROR', text: err.message, icon: 'error', confirmButtonColor: '#000' });
      setPayLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-black tracking-widest text-vtuber-cyan animate-pulse">LOADING...</div>
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-28 pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER PROFIL */}
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-zinc-100 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-vtuber-cyan to-vtuber-purple rounded-full flex items-center justify-center text-white shadow-lg">
            <FaUserCircle className="text-6xl" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-800">{user?.full_name || 'DAEKAN MEMBER'}</h1>
            <p className="text-sm font-bold text-zinc-400 mt-1">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors rounded-xl font-bold uppercase tracking-widest text-xs">
            <FaSignOutAlt /> Keluar
          </button>
        </div>

        {/* DAFTAR TRANSAKSI */}
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-zinc-100">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-800 mb-6 flex items-center gap-3">
            <FaShoppingBag className="text-vtuber-cyan" /> Riwayat Pesanan
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-zinc-100">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Belum ada transaksi.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((trx) => {
                const statusInfo = getStatusDisplay(trx.status);
                
                return (
                  <div key={trx.id} className="border border-zinc-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-zinc-50/50">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-zinc-100">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mb-1">Order ID: #{trx.id.split('-')[0].toUpperCase()}</p>
                        <p className="text-sm font-bold text-zinc-600">{new Date(trx.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 w-fit ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.text}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                      <div className="w-full md:w-auto">
                        <p className="font-black uppercase text-sm mb-1 line-clamp-2 max-w-md">{trx.product_name}</p>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total: {formatIDR(trx.total_price)}</p>
                      </div>

                      {/* TOMBOL LANJUT BAYAR */}
                      {(trx.status === 'pending' || trx.status === 'invoiced') && (
                        <button 
                          onClick={() => handlePayNow(trx)}
                          disabled={payLoading}
                          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-black text-white hover:bg-zinc-800 transition-colors rounded-xl font-black uppercase tracking-widest text-xs shadow-lg"
                        >
                          <FaCreditCard /> {payLoading ? 'MEMPROSES...' : 'BAYAR SEKARANG'}
                        </button>
                      )}
                    </div>
                    
                    {/* INFO RESI JIKA ADA */}
                    {trx.courier && trx.tracking_number && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-xs font-bold text-blue-800 uppercase tracking-widest flex items-center gap-2">
                          <FaTruck /> Resi {trx.courier}: <span className="font-black bg-white px-2 py-1 rounded select-all">{trx.tracking_number}</span>
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
  )
}

export default Profile