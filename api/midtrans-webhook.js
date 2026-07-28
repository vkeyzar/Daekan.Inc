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
    
    // ✅ FIX: Deteksi otomatis kalau ini cuma "Test Notification" dari tombol Midtrans
    // ✅ FIX: Deteksi otomatis kalau ini cuma "Test Notification" dari tombol Midtrans
    if (data.order_id && data.order_id.includes('payment_notif_test')) {
      return res.status(200).json({ message: 'Test webhook berhasil tersambung bosku!' });
    }

    // 1. EKSTRAK ID TRANSAKSI
    // Cek laci custom_field1 dulu (untuk order baru), kalau kosong baru potong order_id (untuk order lama)
    let dbOrderId = data.custom_field1;
    
    if (!dbOrderId) {
      dbOrderId = data.order_id.replace('DAEKAN-', '').substring(0, 36);
    }

    // Validasi apakah dbOrderId adalah UUID yang valid (36 karakter)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(dbOrderId)) {
      // Kalau bukan UUID (misal data test dari Midtrans), kita pura-pura sukses aja biar Midtrans seneng
      return res.status(200).json({ message: 'Bukan ID Daekan, diabaikan.' });
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

    // 3. AMBIL DATA DARI DATABASE
    const { data: trxData, error: trxError } = await supabase
      .from('transactions')
      .select('*, profiles!inner(email)')
      .eq('id', dbOrderId)
      .single();

    if (trxError || !trxData) return res.status(404).json({ error: 'Order not found' });

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = `${protocol}://${req.headers.host}`;
    const userEmail = trxData.profiles.email;

    // ==============================================
    // EKSEKUSI JIKA STATUS: LUNAS
    // ==============================================
    if (newStatus === 'verified' && trxData.status !== 'verified') {
      await supabase.from('transactions').update({ 
        status: 'verified', 
        paid_at: new Date().toISOString() 
      }).eq('id', dbOrderId);

      if (userEmail) {
        await fetch(`${baseUrl}/api/send-invoice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, transaction: trxData, status: 'paid' })
        });
      }
    }

    // ==============================================
    // EKSEKUSI JIKA STATUS: BATAL / EXPIRED
    // ==============================================
    if (newStatus === 'canceled' && (trxData.status === 'pending' || trxData.status === 'invoiced')) {
      
      // A. Restore Stok Barang ke Etalase
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
        await fetch(`${baseUrl}/api/send-status-update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, transaction: trxData, status: 'canceled' })
        });
      }
    }

    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: error.message });
  }
}