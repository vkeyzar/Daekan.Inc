import { createClient } from '@supabase/supabase-js';

// Setup koneksi Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Gunakan Service Role Key jika ada, untuk bypass RLS (Opsional, tapi Anon sudah jalan)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
  }

  try {
    const data = req.body;
    
    // 1. Pelindung Test Notification dari Midtrans
    if (data.order_id && data.order_id.includes('payment_notif_test')) {
      return res.status(200).json({ message: 'Test webhook berhasil!' });
    }

    // 2. Ekstrak ID Transaksi (Cek custom_field1 dulu)
    let dbOrderId = data.custom_field1;
    if (!dbOrderId && data.order_id) {
      dbOrderId = data.order_id.replace('DAEKAN-', '').substring(0, 36);
    }

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;
    let newStatus = '';

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || transactionStatus === 'settlement') {
        newStatus = 'verified'; 
      }
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      newStatus = 'canceled'; 
    }

    if (!newStatus) return res.status(200).json({ status: 'Ignored' });

    // 3. Ambil Data Transaksi dari Supabase
    const { data: trxData, error: trxError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', dbOrderId)
      .single();

    // Balas 200 OK agar Midtrans tidak mengira URL Error/Not Found
    if (trxError || !trxData) {
      console.error("Order tidak ditemukan di DB:", dbOrderId);
      return res.status(200).json({ message: 'Order tidak ditemukan, tapi diterima.' });
    }

    // 4. Ambil Email User Secara Aman
    let userEmail = '';
    if (trxData.user_id) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', trxData.user_id)
          .maybeSingle(); // Pakai maybeSingle agar tidak crash jika user dihapus
        userEmail = profileData?.email;
      } catch (err) {
        console.error("Gagal get email:", err);
      }
    }

    // Setup URL untuk tembak API internal
    const isLocal = req.headers.host.includes('localhost');
    const baseUrl = `${isLocal ? 'http' : 'https'}://${req.headers.host}`;

    // ==============================================
    // EKSEKUSI JIKA STATUS: LUNAS
    // ==============================================
    if (newStatus === 'verified' && trxData.status !== 'verified') {
      
      // Update DB Lunas
      await supabase.from('transactions').update({ 
        status: 'verified', 
        paid_at: new Date().toISOString() 
      }).eq('id', dbOrderId);

      // Tembak Email Lunas (Dibungkus Try-Catch agar tak mematikan sistem)
      if (userEmail) {
        try {
          await fetch(`${baseUrl}/api/send-invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, transaction: trxData, status: 'paid' })
          });
          console.log("Invoice Lunas Terkirim ke:", userEmail);
        } catch (emailErr) {
          console.error("Gagal kirim invoice lunas:", emailErr);
        }
      }
    }

    // ==============================================
    // EKSEKUSI JIKA STATUS: BATAL / EXPIRED
    // ==============================================
    if (newStatus === 'canceled' && (trxData.status === 'pending' || trxData.status === 'invoiced')) {
      
      // A. Restore Stok (Dibungkus Try-Catch Terpisah)
      try {
        // Parsing JSON items dengan aman
        const items = typeof trxData.items === 'string' ? JSON.parse(trxData.items) : trxData.items;
        
        if (items && Array.isArray(items)) {
          for (const item of items) {
            if (item.label === 'LIMITED GEAR') {
              const itemSize = item.size || '-';
              // WAJIB pakai .maybeSingle() agar tak crash jika stok tidak ada
              const { data: stockData } = await supabase.from('product_stocks').select('stock_reserved').eq('product_id', item.id).eq('size', itemSize).maybeSingle();
              
              if (stockData) {
                const newReserved = Math.max(0, stockData.stock_reserved - (item.quantity || 1));
                await supabase.from('product_stocks').update({ stock_reserved: newReserved }).eq('product_id', item.id).eq('size', itemSize);
              }
            }
          }
        }
      } catch (stockErr) {
        console.error("Crash saat restore stok:", stockErr);
      }

      // B. Update DB Canceled (Pasti tereksekusi karena aman dari crash stok)
      await supabase.from('transactions').update({ status: 'canceled' }).eq('id', dbOrderId);

      // C. Tembak Email Batal
      if (userEmail) {
        try {
          await fetch(`${baseUrl}/api/send-status-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, transaction: trxData, status: 'canceled' })
          });
          console.log("Email Batal Terkirim ke:", userEmail);
        } catch (emailErr) {
          console.error("Gagal kirim email batal:", emailErr);
        }
      }
    }

    // Jawab Midtrans dengan senyuman
    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error("Webhook Error Fatal:", error);
    // Tetap balas 200 agar Midtrans tidak ngamuk "URL Not Found"
    return res.status(200).json({ error: error.message });
  }
}