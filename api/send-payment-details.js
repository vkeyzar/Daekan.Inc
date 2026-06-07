import { Resend } from 'resend';

// Mengambil API Key dari environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Cuma terima request berbentuk POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, transaction } = req.body;

    if (!email || !transaction) {
      return res.status(400).json({ error: 'Missing required fields: email or transaction' });
    }

    // Format ke Rupiah
    const formatIDR = (price) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
    };

    // Render list barang yang dibeli
    let itemsListHtml = '';
    if (transaction.items && transaction.items.length > 0) {
      itemsListHtml = transaction.items.map(item => `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #e4e4e7;">
            <strong style="display: block; font-size: 14px; text-transform: uppercase; font-weight: 900;">${item.name}</strong>
            <span style="font-size: 11px; color: #71717a; font-weight: bold; letter-spacing: 1px;">SIZE: ${item.size || '-'} | QTY: ${item.quantity}</span>
          </td>
        </tr>
      `).join('');
    } else {
      itemsListHtml = `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #e4e4e7;">
            <strong style="display: block; font-size: 14px; text-transform: uppercase; font-weight: 900;">${transaction.product_name}</strong>
            <span style="font-size: 11px; color: #71717a; font-weight: bold; letter-spacing: 1px;">QTY: ${transaction.quantity || 1}</span>
          </td>
        </tr>
      `;
    }

    // Template HTML Email yang selaras dengan tema Daekan
    const htmlPaymentDetails = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; color: #000;">
        
        <div style="background-color: #000; padding: 40px 30px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 32px; font-style: italic; letter-spacing: -1px; font-weight: 900;">DAEKAN<span style="font-weight: 300;">INC.</span></h1>
          <p style="margin: 8px 0 0; font-size: 10px; letter-spacing: 6px; color: #facc15; text-transform: uppercase; font-weight: bold;">Waiting For Payment</p>
        </div>

        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px;">Halo, ${transaction.full_name}</h2>
          <p style="color: #52525b; line-height: 1.6; font-size: 15px;">
            Pesanan Anda telah kami terima dan saat ini berstatus <strong style="color: #ca8a04; background-color: #fef08a; padding: 2px 8px; border-radius: 4px; font-weight: 900;">MENUNGGU PEMBAYARAN</strong>. Silakan selesaikan pembayaran agar pesanan dapat segera diproses.
          </p>

          <div style="margin: 32px 0; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead style="background-color: #f4f4f5; font-size: 10px; text-transform: uppercase; color: #71717a; letter-spacing: 2px;">
                <tr>
                  <th style="padding: 16px 20px; border-bottom: 1px solid #e4e4e7;">Order ID: #${transaction.id}</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
              <tfoot style="background-color: #fafafa;">
                <tr>
                  <td style="padding: 20px; font-weight: 900; text-align: right; font-size: 16px; text-transform: uppercase;">
                    <span style="color: #71717a; font-size: 12px; margin-right: 10px;">TOTAL TAGIHAN:</span> 
                    ${formatIDR(transaction.total_price)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; margin-bottom: 15px; border-bottom: 1px solid #e4e4e7; padding-bottom: 10px;">Instruksi Pembayaran</h3>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 5px 0; font-size: 13px; color: #166534; font-weight: bold; text-transform: uppercase;">🏦 Bank Mandiri</p>
            <p style="margin: 0 0 5px 0; font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #14532d;">1840001454113</p>
            <p style="margin: 0 0 15px 0; font-size: 13px; color: #166534;">a.n <strong>Valza Ananta Permady</strong></p>
            
            <hr style="border: none; border-top: 1px dashed #bbf7d0; margin: 0 0 15px 0;">
            
            <p style="margin: 0 0 5px 0; font-size: 13px; color: #166534; font-weight: bold; text-transform: uppercase;">📱 E-Wallet (DANA / OVO / GOPAY)</p>
            <p style="margin: 0 0 5px 0; font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #14532d;">085695999703</p>
            <p style="margin: 0; font-size: 13px; color: #166534;">a.n <strong>daekan</strong></p>
          </div>

          <p style="color: #52525b; line-height: 1.6; font-size: 14px;">
            Anda <strong>tidak perlu mengirimkan bukti transfer atau melakukan konfirmasi pembayaran</strong>. Sistem dan admin kami akan memverifikasi mutasi pembayaran Anda secara berkala.
          </p>

          <p style="color: #52525b; line-height: 1.6; font-size: 14px; margin-top: 15px;">
            <em>Abaikan email ini apabila Anda telah melakukan pembayaran.</em> Jika Anda mengalami kendala teknis, silakan hubungi admin kami melalui WhatsApp di: <a href="https://wa.me/6285695999703" style="color: #0ea5e9; font-weight: bold; text-decoration: none;">wa.me/6285695999703</a>
          </p>

          <p style="background-color: #fffbeb; color: #b45309; padding: 12px; border-radius: 8px; font-size: 12px; font-weight: bold; margin-top: 20px; border: 1px solid #fde68a;">
            ⚠️ Pesanan otomatis dibatalkan jika tidak ada pembayaran yang masuk dalam waktu 2x24 jam.
          </p>
        </div>

        <div style="background-color: #f4f4f5; padding: 24px; text-align: center; font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">
          &copy; ${new Date().getFullYear()} DAEKAN INC.
        </div>
      </div>
    `;

    // 🚀 TEMBAK EMAIL PAKAI RESEND
    const data = await resend.emails.send({
      from: 'DAEKAN INC. <admin@daekan.store>', 
      to: email,
      subject: `Menunggu Pembayaran - Pesanan Daekan #${transaction.id} ⏳`,
      html: htmlPaymentDetails,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('API Send Payment Details Error:', error);
    res.status(500).json({ error: error.message });
  }
}