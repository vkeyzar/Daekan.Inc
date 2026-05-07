import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Fungsi untuk Kirim Ulang Email Konfirmasi (Resend)
  const handleResendEmail = async (targetEmail) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: targetEmail,
    })

    if (error) {
      Swal.fire({
        title: 'GAGAL MENGIRIM',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#000000'
      })
    } else {
      Swal.fire({
        title: 'EMAIL TERKIRIM',
        text: 'Tautan verifikasi baru telah dikirim ke inbox Anda.',
        icon: 'success',
        confirmButtonColor: '#000000'
      })
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 1. LOGIC PRE-CHECK: Cek apakah email sudah ada di tabel profiles lo
    const { data: existingUser } = await supabase
      .from('profiles') // Nama tabel database lo
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      setLoading(false)
      return Swal.fire({
        title: 'PENDAFTARAN GAGAL',
        text: 'Email ini sudah terdaftar dalam sistem kami. Silakan gunakan email lain atau masuk ke akun Anda.',
        icon: 'error',
        confirmButtonColor: '#000000'
      })
    }

    // 2. Jika email aman, lanjut ke SignUp Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      let friendlyMsg = "Terjadi kesalahan sistem saat proses pendaftaran."
      
      if (error.message.includes("Password should contain")) {
        friendlyMsg = "Keamanan Password rendah: Wajib kombinasi Huruf Besar, Huruf Kecil, Angka, dan Simbol."
      }

      Swal.fire({
        title: 'PENDAFTARAN GAGAL',
        text: friendlyMsg,
        icon: 'error',
        confirmButtonColor: '#000000'
      })
    } else {
      // 3. Notif Sukses dengan Fitur Resend
      Swal.fire({
        title: 'REGISTRASI BERHASIL',
        html: `
          <p style="font-size: 14px; margin-bottom: 20px;">Silakan periksa kotak masuk atau folder spam email Anda untuk melakukan konfirmasi akun.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;">
          <p style="font-size: 12px; color: #666;">Tidak menerima email?</p>
        `,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Kirim Ulang Email',
        cancelButtonText: 'Tutup',
        confirmButtonColor: '#000000',
        cancelButtonColor: '#d33',
      }).then((result) => {
        if (result.isConfirmed) {
          handleResendEmail(email)
        }
      })
    }
    setLoading(false)
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-zinc-950 overflow-hidden text-white p-6 md:p-12">
        {/* --- GRADIENT MESH BACKGROUND --- */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none"></div>

        {/* --- REGISTER FORM CONTAINER --- */}
        <form 
          onSubmit={handleRegister} 
          className="relative z-10 bg-zinc-900 backdrop-blur-xl p-10 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl"
        >
          <h2 className="text-3xl font-black mb-2 italic uppercase tracking-tighter">
              JOIN DAEKAN<span className="font-light"> INC.</span>
          </h2>
          <p className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-normal md:tracking-[0.2em] mb-8 font-bold leading-none">
              Create your daekan account
          </p>

          <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                <input 
                    type="email" 
                    placeholder="daekan@inc.com" 
                    required
                    className="w-full p-4 bg-black/40 border border-white/5 rounded-xl focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-700"
                    onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
                <input 
                    type="password" 
                    placeholder="••••••••" 
                    required
                    className="w-full p-4 bg-black/40 border border-white/5 rounded-xl focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-700"
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
          </div>

          <button 
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-xl mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {loading ? 'PROCESSING...' : 'REGISTER ACCOUNT'}
          </button>

          <p className="mt-8 text-zinc-500 text-[11px] text-center uppercase tracking-widest font-medium">
              Already a member? <Link to="/login" className="text-white font-bold hover:underline underline-offset-4">Login</Link>
          </p>
        </form>
    </div>
  )
}

export default Register