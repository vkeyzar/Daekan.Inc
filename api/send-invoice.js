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

    // Render list barang belanjaan biar rapi di email
    let itemsHtml = '';
    if (transaction.items) {
      const items = typeof transaction.items === 'string' ? JSON.parse(transaction.items) : transaction.items;
      itemsHtml = items.map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${item.name}</strong><br>
            <span style="color: #6b7280; font-size: 12px;">Size: ${item.size || '-'}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatIDR(item.price * item.quantity)}</td>
        </tr>
      `).join('');
    } else {
      itemsHtml = `<tr><td colspan="3" style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${transaction.product_name}</td></tr>`;
    }

    const mailOptions = {
      from: `"DAEKAN INC." <${process.env.VITE_EMAIL_USER}>`,
      to: email,
      subject: `INVOICE LUNAS - Order #${transaction.id.split('-')[0].toUpperCase()}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 30px; border-radius: 12px; color: #1f2937;">
          <h2 style="color: #2563eb; text-align: center; font-style: italic; font-weight: 900; letter-spacing: 1px; margin-bottom: 5px;">PEMBAYARAN BERHASIL!</h2>
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 0;">Terima kasih atas pembayaran Anda.</p>
          
          <p style="margin-top: 30px;">Halo <strong>${transaction.full_name}</strong>,</p>
          <p>Kami telah menerima pembayaran Anda. Pesanan Anda saat ini sedang masuk ke dalam antrean sistem kami dan akan segera diproses.</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #f3f4f6;">
            <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> #${transaction.id.split('-')[0].toUpperCase()}</p>
            <p style="margin: 0 0 10px 0;"><strong>Tanggal Pembayaran:</strong> ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 0;"><strong>Metode Pengiriman:</strong> ${transaction.delivery_method || 'SHIPMENT'}</p>
          </div>

          <h3 style="font-size: 16px; border-bottom: 2px solid #000; padding-bottom: 10px;">Rincian Pesanan</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left;">Produk</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">TOTAL PEMBAYARAN:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px; color: #2563eb;">${formatIDR(transaction.total_price)}</td>
              </tr>
            </tfoot>
          </table>

          <p>Anda dapat memantau status pesanan secara berkala melalui menu profil di website kami.</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://daekan.store/profile" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">CEK STATUS PESANAN</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            Email ini dibuat otomatis oleh sistem.<br>
            <strong>DAEKAN INC.</strong>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Invoice Lunas berhasil dikirim' });
  } catch (error) {
    console.error("Error kirim email invoice:", error);
    return res.status(500).json({ error: error.message });
  }
}