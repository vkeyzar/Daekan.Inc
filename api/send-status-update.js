import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode Tidak Diizinkan' });
  }

  // ✅ FIX: Tangkap parameter courier & tracking_number dari body request
  const { email, transaction, status, courier, tracking_number } = req.body;

  let subject = '';
  let message = '';
  let badgeColor = '';
  let trackingBox = ''; // Buat nampilin kotak resi di email

  if (status === 'production') {
    subject = 'Pemberitahuan: Pesanan Anda Sedang Diproses';
    message = `Yth. Bapak/Ibu <strong>${transaction.full_name}</strong>,<br/><br/>Kami ingin menginformasikan bahwa pesanan Anda saat ini telah memasuki tahap produksi dan pengerjaan. Kami berkomitmen untuk memberikan kualitas terbaik dan akan segera menghubungi Anda kembali apabila pesanan telah siap untuk dikirimkan.`;
    badgeColor = '#9333ea'; 
  } else if (status === 'sending') {
    subject = 'Pemberitahuan: Pesanan Anda Sedang Dikirim';
    
    // ✅ FIX: Sisipin data kurir dan resi kalau dia pilih SHIPMENT
    if (transaction.delivery_method === 'SHIPMENT') {
        message = `Yth. Bapak/Ibu <strong>${transaction.full_name}</strong>,<br/><br/>Kabar baik! Pesanan Anda saat ini sedang dalam proses pengiriman menuju alamat tujuan yang telah didaftarkan. Anda dapat melacak paket Anda menggunakan detail pengiriman di bawah ini.`;
        trackingBox = `
            <div style="background-color: #fff7ed; padding: 20px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #ea580c;">
                <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; color: #ea580c; letter-spacing: 1px;">Detail Pengiriman</h3>
                <p style="margin: 8px 0; font-size: 16px;"><strong>Kurir:</strong> ${courier}</p>
                <p style="margin: 8px 0; font-size: 16px;"><strong>No. Resi:</strong> <span style="letter-spacing: 1px; font-weight: bold;">${tracking_number}</span></p>
            </div>
        `;
    } else {
        message = `Yth. Bapak/Ibu <strong>${transaction.full_name}</strong>,<br/><br/>Kabar baik! Pesanan Anda saat ini sedang dalam proses pengantaran menuju titik temu (COD) yang telah disepakati. Silakan bersiap-siap dan tunggu kedatangan tim kami.`;
    }
    
    badgeColor = '#ea580c'; 
  } else if (status === 'success') {
    subject = 'Pemberitahuan: Pesanan Selesai';
    message = `Yth. Bapak/Ibu <strong>${transaction.full_name}</strong>,<br/><br/>Pesanan Anda telah kami tandai sebagai selesai. Kami mengucapkan terima kasih yang sebesar-besarnya atas kepercayaan Anda dalam berbelanja di Daekan Inc. Kami sangat menantikan kehadiran Anda pada koleksi kami selanjutnya.`;
    badgeColor = '#16a34a'; 
  } else {
    return res.status(400).json({ error: 'Parameter status tidak valid' });
  }

  try {
    const data = await resend.emails.send({
      from: 'DAEKAN INC. <admin@daekan.store>',
      to: email,
      subject: subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="background-color: ${badgeColor}; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; font-style: italic; letter-spacing: 2px;">DAEKAN INC.</h1>
          </div>
          <div style="padding: 40px; color: #374151;">
            <h2 style="margin-top: 0; color: #111827; font-size: 20px;">${subject}</h2>
            <p style="line-height: 1.8; font-size: 15px; color: #4b5563;">${message}</p>
            
            ${trackingBox}
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin-top: 30px; border: 1px solid #f3f4f6;">
              <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px;">Rincian Pesanan</h3>
              <p style="margin: 8px 0; font-size: 15px;"><strong>ID Pesanan:</strong> #${transaction.id}</p>
              <p style="margin: 8px 0; font-size: 15px;"><strong>Produk:</strong> ${transaction.product_name}</p>
              <p style="margin: 8px 0; font-size: 15px;"><strong>Total:</strong> Rp ${(transaction.total_price || 0).toLocaleString('id-ID')}</p>
              <p style="margin: 8px 0; font-size: 15px;"><strong>Pengiriman:</strong> ${transaction.delivery_method || 'SHIPMENT'}</p>
            </div>
            
            <p style="margin-top: 40px; font-size: 14px; color: #6b7280; text-align: center; line-height: 1.6;">
              Salam hangat,<br/>
              <strong>DAEKAN INC.</strong>
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