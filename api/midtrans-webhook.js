import { createClient } from '@supabase/supabase-js';

// Setup koneksi Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Pastikan hanya menerima request POST dari Midtrans
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
  }

  try {
    const data = req.body;
    
    // 1. EKSTRAK ID TRANSAKSI
    // Midtrans ngirim order_id format: DAEKAN-[UUID]-[TIMESTAMP]
    const rawOrderId = data.order_id;
    
    // Buang tulisan 'DAEKAN-'
    let dbOrderId = rawOrderId.replace('DAEKAN-', '');
    
    // Ambil 36 karakter pertama saja (Karena UUID Supabase selalu 36 karakter)
    // Otomatis '-timestamp' di belakangnya bakal terbuang
    dbOrderId = dbOrderId.substring(0, 36);

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    let newStatus = '';

    // 2. LOGIKA STATUS DARI MIDTRANS
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || transactionStatus === 'settlement') {
        newStatus = 'verified'; // OTOMATIS LUNAS
      }
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      newStatus = 'canceled'; // OTOMATIS BATAL / EXPIRED
    }

    // Jika statusnya pending atau tidak relevan, hiraukan
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
      // Update Database
      await supabase.from('transactions').update({ 
        status: 'verified', 
        paid_at: new Date().toISOString() 
      }).eq('id', dbOrderId);

      // Tembak API Email Invoice kita sendiri
      if (userEmail) {
        await fetch(`${baseUrl}/api/send-invoice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, transaction: trxData, status: 'paid' })
        });
      }
    }

    // ==============================================
    // EKSEKUSI JIKA STATUS: BATAL / EXPIRED (15 Menit / 2x24 Jam)
    // ==============================================
    if (newStatus === 'canceled' && trxData.status !== 'canceled') {
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

      // B. Update Database
      await supabase.from('transactions').update({ status: 'canceled' }).eq('id', dbOrderId);

      // C. Tembak API Email Batal
      if (userEmail) {
        await fetch(`${baseUrl}/api/send-status-update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, transaction: trxData, status: 'canceled' })
        });
      }
    }

    // Beri tahu Midtrans bahwa notifikasi sudah diterima dengan baik
    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: error.message });
  }
}