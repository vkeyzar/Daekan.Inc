import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
  }

  try {
    const { email, transaction } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.VITE_EMAIL_USER,
        pass: process.env.VITE_EMAIL_PASS
      }
    });

    const formatIDR = (price) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
    };

    const mailOptions = {
      from: `"DAEKAN INC." <${process.env.VITE_EMAIL_USER}>`,
      to: email,
      subject: `MENUNGGU PEMBAYARAN - Order #${transaction.id.split('-')[0].toUpperCase()}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 30px; border-radius: 12px; color: #1f2937;">
          <h2 style="color: #d97706; text-align: center; font-style: italic; font-weight: 900; letter-spacing: 1px; margin-bottom: 5px;">MENUNGGU PEMBAYARAN</h2>
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 0;">Selesaikan pembayaran Anda segera.</p>
          
          <p style="margin-top: 30px;">Halo <strong>${transaction.full_name}</strong>,</p>
          <p>Terima kasih telah berbelanja di <strong>Daekan Inc</strong>. Pesanan Anda telah kami catat ke dalam sistem dan saat ini sedang menunggu proses pembayaran.</p>
          
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #92400e;"><strong>Order ID:</strong> #${transaction.id.split('-')[0].toUpperCase()}</p>
            <p style="margin: 0 0 10px 0; color: #92400e;"><strong>Total Tagihan:</strong> <span style="font-size: 18px; font-weight: 900;">${formatIDR(transaction.total_price)}</span></p>
            <p style="margin: 0; font-size: 13px; color: #b45309;">Pastikan Anda menyelesaikan pembayaran sebelum batas waktu berakhir agar pesanan tidak dibatalkan otomatis oleh sistem.</p>
          </div>

          <p>Jika Anda tidak sengaja menutup halaman pembayaran *pop-up* sebelumnya, jangan khawatir. Anda dapat melanjutkan proses pembayaran melalui halaman profil Anda dengan mengklik tombol di bawah ini:</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://daekan.store/profile" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">LANJUTKAN PEMBAYARAN</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            Abaikan email ini jika Anda sudah melakukan pembayaran.<br>
            <strong>DAEKAN INC.</strong>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email instruksi pembayaran berhasil dikirim' });
  } catch (error) {
    console.error("Error kirim email pending:", error);
    return res.status(500).json({ error: error.message });
  }
}