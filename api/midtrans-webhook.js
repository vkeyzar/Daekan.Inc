import { createClient } from '@supabase/supabase-js';

// Setup koneksi Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
  }

  try {
    const data = req.body;
    
    // Deteksi otomatis kalau ini cuma "Test Notification" dari Midtrans
    if (data.order_id && data.order_id.includes('payment_notif_test')) {
      return res.status(200).json({ message: 'Test webhook berhasil tersambung bosku!' });
    }

    // 1. EKSTRAK ID TRANSAKSI
    let dbOrderId = data.custom_field1;
    if (!dbOrderId) {
      dbOrderId = data.order_id.replace('DAEKAN-', '').substring(0, 36);
    }

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;
    let newStatus = '';

    // 2. LOGIKA STATUS DARI MIDTRANS
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || transactionStatus === 'settlement') {
        newStatus = 'verified'; 
      }
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      newStatus = 'canceled'; 
    }

    if (!newStatus) return res.status(200).json({ status: 'Ignored' });

    // 3. AMBIL DATA TRANSAKSI (Tanpa Join Tabel biar aman dari bug Supabase)
    const { data: trxData, error: trxError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', dbOrderId)
      .single();

    if (trxError || !trxData) return res.status(404).json({ error: 'Order not found' });

    // 4. AMBIL EMAIL USER SECARA TERPISAH (Sama persis kayak logika di TransactionList.jsx)
    let userEmail = '';
    if (trxData.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', trxData.user_id)
        .single();
      userEmail = profileData?.email;
    }

    // 5. PAKSA PROTOKOL HTTPS UNTUK VERCEL (Anti-Redirect 308)
    const isLocal = req.headers.host.includes('localhost');
    const baseUrl = `${isLocal ? 'http' : 'https'}://${req.headers.host}`;

    // ==============================================
    // EKSEKUSI JIKA STATUS: LUNAS
    // ==============================================
    if (newStatus === 'verified' && trxData.status !== 'verified') {
      await supabase.from('transactions').update({ 
        status: 'verified', 
        paid_at: new Date().toISOString() 
      }).eq('id', dbOrderId);

      if (userEmail) {
        console.log(`Mengirim email LUNAS ke: ${userEmail}`);
        await fetch(`${baseUrl}/api/send-invoice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, transaction: trxData, status: 'paid' })
        }).catch(err => console.error("Gagal kirim invoice:", err));
      }
    }

    // ==============================================
    // EKSEKUSI JIKA STATUS: BATAL / EXPIRED
    // ==============================================
    if (newStatus === 'canceled' && (trxData.status === 'pending' || trxData.status === 'invoiced')) {
      if (trxData.items) {
        for (const item of trxData.items) {
          if (item.label === 'LIMITED GEAR') {
            const itemSize = item.size || '-';
            const { data: stockData } = await supabase.from('product_stocks').select('stock_reserved').eq('product_id', item.id).eq('size', itemSize).single();
            if (stockData) {
              const newReserved = Math.max(0, stockData.stock_reserved - item.quantity);
              await supabase.from('product_stocks').update({ stock_reserved: newReserved }).eq('product_id', item.id).eq('size', itemSize);
            }
          }
        }
      }

      await supabase.from('transactions').update({ status: 'canceled' }).eq('id', dbOrderId);

      if (userEmail) {
        console.log(`Mengirim email BATAL ke: ${userEmail}`);
        await fetch(`${baseUrl}/api/send-status-update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, transaction: trxData, status: 'canceled' })
        }).catch(err => console.error("Gagal kirim email batal:", err));
      }
    }

    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: error.message });
  }
}