export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
  }

  const { order_id, gross_amount, customer_details, item_details } = req.body;
  
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const authString = Buffer.from(`${serverKey}:`).toString('base64');

  const MIDTRANS_API_URL = serverKey.includes('SB-') 
    ? 'https://app.sandbox.midtrans.com/snap/v1/transactions' 
    : 'https://app.midtrans.com/snap/v1/transactions';

  // Bikin ID unik yang pendek biar ga kena limit 50 karakter Midtrans
  const shortUniqueOrderId = `DAEKAN-${Date.now()}`;

  const payload = {
    transaction_details: {
      order_id: shortUniqueOrderId, // Ini yang masuk ke sistem Midtrans
      gross_amount: Math.round(gross_amount)
    },
    // ✅ FIX: ID asli database kita simpan di laci rahasia custom_field1
    custom_field1: order_id, 
    customer_details: customer_details,
    item_details: item_details
  };

  try {
    const response = await fetch(MIDTRANS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_messages ? data.error_messages[0] : 'Gagal membuat transaksi Midtrans');
    }

    res.status(200).json({ token: data.token, redirect_url: data.redirect_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}