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
      subject: 'Pembayaran Diterima - Resi Pemesanan Daekan Inc.',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #2563eb; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; font-style: italic; letter-spacing: 2px;">DAEKAN INC.</h1>
          </div>
          <div style="padding: 40px; color: #374151;">
            <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Pembayaran Terverifikasi</h2>
            <p style="line-height: 1.8; font-size: 15px; color: #4b5563;">
              Yth. Bapak/Ibu <strong>${transaction.full_name}</strong>,<br/><br/>
              Pembayaran Anda untuk pesanan dengan nomor identitas <strong>#${transaction.id}</strong> telah berhasil kami verifikasi. Kami akan segera memproses pesanan Anda untuk tahap selanjutnya.
            </p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin-top: 30px; border: 1px solid #bbf7d0;">
              <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #166534; letter-spacing: 1px; display: flex; align-items: center;">
                <span style="font-size: 18px; margin-right: 8px;">✓</span> LUNAS
              </h3>
              <p style="margin: 8px 0; font-size: 15px; color: #166534;"><strong>Total Dibayar:</strong> Rp ${(transaction.total_price || 0).toLocaleString('id-ID')}</p>
              <p style="margin: 8px 0; font-size: 15px; color: #166534;"><strong>Tanggal Verifikasi:</strong> ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <p style="margin-top: 40px; font-size: 14px; color: #6b7280; text-align: center; line-height: 1.6;">
              Terima kasih atas pembayaran Anda.<br/>
              <strong>Daekan Inc.</strong>
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