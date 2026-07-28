export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
  }

  const { order_id, gross_amount, customer_details, item_details } = req.body;
  
  // Ambil Server Key dari Environment Variable
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  // Encode Server Key pakai Base64 buat Authorization Header Midtrans
  const authString = Buffer.from(`${serverKey}:`).toString('base64');

  // Otomatis pakai URL Sandbox kalau key-nya depannya 'SB-', selain itu pakai URL Production
  const MIDTRANS_API_URL = serverKey.includes('SB-') 
    ? 'https://app.sandbox.midtrans.com/snap/v1/transactions' 
    : 'https://app.midtrans.com/snap/v1/transactions';

  const payload = {
    transaction_details: {
      order_id: `DAEKAN-${order_id}`, // Prefix biar rapi di dashboard Midtrans
      gross_amount: Math.round(gross_amount)
    },
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

    // Kembalikan token ke frontend
    res.status(200).json({ token: data.token, redirect_url: data.redirect_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}