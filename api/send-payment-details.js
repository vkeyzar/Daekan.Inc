import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
  }

  const { email, transaction } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'DAEKAN INC. <admin@daekan.store>', // Sesuaikan
      to: email,
      subject: 'Instruksi Pembayaran Pesanan Daekan Inc.',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #000000; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; font-style: italic; letter-spacing: 2px;">DAEKAN INC.</h1>
          </div>
          <div style="padding: 40px; color: #374151;">
            <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Instruksi Pembayaran</h2>
            <p style="line-height: 1.8; font-size: 15px; color: #4b5563;">
              Yth. Bapak/Ibu <strong>${transaction.full_name}</strong>,<br/><br/>
              Terima kasih telah melakukan pemesanan di Daekan Inc. Pesanan Anda telah kami terima dan saat ini berstatus <strong>Menunggu Pembayaran</strong>. Mohon segera melakukan pembayaran sesuai dengan rincian di bawah ini untuk menghindari pembatalan otomatis.
            </p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin-top: 30px; border: 1px solid #f3f4f6;">
              <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px;">Rincian Tagihan</h3>
              <p style="margin: 8px 0; font-size: 15px;"><strong>ID Pesanan:</strong> #${transaction.id}</p>
              <p style="margin: 8px 0; font-size: 15px;"><strong>Total Tagihan:</strong> <span style="font-size: 18px; font-weight: 900; color: #111827;">Rp ${(transaction.total_price || 0).toLocaleString('id-ID')}</span></p>
            </div>

            <div style="margin-top: 30px;">
              <h3 style="font-size: 14px; text-transform: uppercase; color: #111827; letter-spacing: 1px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Metode Pembayaran Tersedia</h3>
              
              <div style="margin-top: 15px;">
                <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Transfer Bank Mandiri</p>
                <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #111827; letter-spacing: 1px;">1840001454113</p>
                <p style="margin: 4px 0 0 0; font-size: 14px;">a.n. Valza Ananta Permady</p>
              </div>

              <div style="margin-top: 20px;">
                <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; font-weight: bold;">E-Wallet (DANA/OVO/GoPay)</p>
                <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #111827; letter-spacing: 1px;">085695999703</p>
                <p style="margin: 4px 0 0 0; font-size: 14px;">a.n. Daekan Inc</p>
              </div>
            </div>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #dc2626; line-height: 1.6; font-weight: 600;">
              *Penting: Mohon transfer TEPAT sesuai dengan nominal tagihan di atas. Abaikan pesan jika sudah melakukan pembayaran.
            </p>
          </div>
        </div>
      `,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}