import { Resend } from 'resend';

// Ambil key dari env variable yang kita set di Vercel tadi
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (userEmail) => {
  try {
    const data = await resend.emails.send({
      from: 'DAEKAN INC <admin@daekan.store>', // <--- PAKE DOMAIN LO SENDIRI!
      to: [userEmail],
      subject: 'WELCOME TO THE ICONIC CIRCLE',
      html: '<strong>Registrasi lo berhasil, tod! Selamat bergabung di Daekan Inc.</strong>',
    });

    console.log('Email terkirim:', data);
  } catch (error) {
    console.error('Email gagal:', error);
  }
};