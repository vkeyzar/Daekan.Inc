import { Resend } from 'resend';

// Vercel akan otomatis baca ENV ini dari settingan dashboard/file .env lo
const resend = new Resend(process.env.RESEND_API_KEY); 

export default async function handler(req, res) {
  // Cuma terima request berbentuk POST (karena kita ngirim data dari frontend)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, transaction } = req.body;

    if (!email || !transaction) {
      return res.status(400).json({ error: 'Missing required fields: email or transaction' });
    }

    // Ngeracik Desain Email HTML 
    // Lo bisa custom warna, teks, dan layout di sini
    const htmlInvoice = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; color: #000;">
        
        <div style="background-color: #000; padding: 40px 30px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 32px; font-style: italic; letter-spacing: -1px; font-weight: 900;">DAEKAN<span style="font-weight: 300;">INC.</span></h1>
          <p style="margin: 8px 0 0; font-size: 10px; letter-spacing: 6px; color: #a1a1aa; text-transform: uppercase; font-weight: bold;">Official E-Receipt</p>
        </div>

        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px;">Halo, ${transaction.full_name}</h2>
          <p style="color: #52525b; line-height: 1.6; font-size: 15px;">
            Pembayaran untuk pesanan Anda telah berhasil diverifikasi oleh Admin Daekan. Pesanan Anda saat ini berstatus <strong style="color: #16a34a; font-weight: 900;">PAID & VERIFIED</strong> dan sedang dipersiapkan untuk pengiriman.
          </p>

          <div style="margin: 32px 0; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead style="background-color: #f4f4f5; font-size: 10px; text-transform: uppercase; color: #71717a; letter-spacing: 2px;">
                <tr>
                  <th style="padding: 16px 20px; border-bottom: 1px solid #e4e4e7;">Item</th>
                  <th style="padding: 16px 20px; border-bottom: 1px solid #e4e4e7; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${transaction.items ? transaction.items.map(item => `
                  <tr>
                    <td style="padding: 20px; border-bottom: 1px solid #e4e4e7;">
                      <strong style="display: block; font-size: 14px; text-transform: uppercase; font-weight: 900;">${item.name}</strong>
                      <span style="font-size: 11px; color: #71717a; font-weight: bold; letter-spacing: 1px;">SIZE: ${item.size || '-'} | QTY: ${item.quantity}</span>
                    </td>
                    <td style="padding: 20px; border-bottom: 1px solid #e4e4e7; text-align: right; font-weight: 900; font-size: 14px;">
                      Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td style="padding: 20px; border-bottom: 1px solid #e4e4e7;">
                      <strong style="display: block; font-size: 14px; text-transform: uppercase; font-weight: 900;">${transaction.product_name || 'MERCH'}</strong>
                    </td>
                    <td style="padding: 20px; border-bottom: 1px solid #e4e4e7; text-align: right; font-weight: 900;">
                      Rp ${transaction.total_price.toLocaleString('id-ID')}
                    </td>
                  </tr>
                `}
              </tbody>
              <tfoot style="background-color: #fafafa;">
                <tr>
                  <td style="padding: 20px; font-weight: 900; text-align: right; font-size: 12px; text-transform: uppercase; color: #71717a;" colspan="1">Grand Total</td>
                  <td style="padding: 20px; font-weight: 900; text-align: right; font-size: 20px; font-style: italic;">
                    Rp ${transaction.total_price.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p style="color: #52525b; line-height: 1.6; font-size: 14px;">
            Detail resi pengiriman <strong>${transaction.delivery_method || 'REGULER'}</strong> akan diinformasikan kembali jika pesanan sudah diserahkan ke kurir. Simpan email ini sebagai bukti transaksi yang sah.
          </p>
        </div>

        <div style="background-color: #f4f4f5; padding: 24px; text-align: center; font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">
          &copy; ${new Date().getFullYear()} DAEKAN INC.
        </div>
      </div>
    `;

    // 🚀 TEMBAK EMAIL PAKAI RESEND
    const data = await resend.emails.send({
      // 👇 GANTI EMAIL INI DENGAN DOMAIN LO YANG UDAH VERIFIED DI RESEND
      from: 'DAEKAN INC. <admin@daekan.store>', 
      to: email,
      subject: `Invoice & Konfirmasi Pesanan Daekan - PAID ✅`,
      html: htmlInvoice,
    });

    // Balikin response sukses ke frontend
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('API Send Invoice Error:', error);
    res.status(500).json({ error: error.message });
  }
}