import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2' // Pastikan Swal sudah di-import

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 1. Proses Autentikasi
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let message = "Terjadi kesalahan sistem saat proses autentikasi.";
      
      if (error.message.includes("Invalid login credentials")) {
        message = "Email atau password yang Anda masukkan tidak valid.";
      }

      Swal.fire({
        title: 'AUTENTIKASI GAGAL',
        text: message,
        icon: 'error',
        confirmButtonColor: '#000000'
      });
      return;
    }

    // 2. Logic Baru: Cek Verifikasi Email
    if (data.user && data.user.confirmed_at === null) {
      Swal.fire({
        title: 'AKSES DITANGGUHKAN',
        text: 'Silakan lakukan verifikasi email Anda melalui tautan yang kami kirimkan sebelum melanjutkan login.',
        icon: 'warning',
        confirmButtonColor: '#000000'
      });

      // Mengamankan session dengan memaksa logout jika belum verified
      await supabase.auth.signOut();
      return;
    }

    // 3. Notif Sukses & Redirect
    if (data.session) {
      Swal.fire({
        title: 'WELCOME BACK!',
        text: 'Autentikasi berhasil, mengalihkan ke Dashboard...',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => {
        navigate('/dashboard'); // Menggunakan navigate sesuai import lo
      }, 1500);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-zinc-950 overflow-hidden text-white p-6 md:p-12">
      {/* --- GRADIENT MESH BACKGROUND --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* --- LOGIN FORM CONTAINER --- */}
      <form 
        onSubmit={handleLogin} 
        className="relative z-10 bg-zinc-900 backdrop-blur-xl p-10 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-3xl font-black mb-2 italic uppercase tracking-tighter">
          DAEKAN<span className="font-light"> LOGIN</span>
        </h2>
        <p className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-normal md:tracking-[0.2em] mb-8 font-bold leading-none">
          Access your icon dashboard
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@daekan.inc" 
              className="w-full p-4 bg-black/40 border border-white/5 rounded-xl focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-700"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 bg-black/40 border border-white/5 rounded-xl focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-700"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-white text-black font-black py-4 rounded-xl mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-white/5"
        >
          LOG IN
        </button>

        <p className="mt-8 text-zinc-500 text-[11px] text-center uppercase tracking-widest font-medium">
          Belum punya akun? <Link to="/register" className="text-white font-bold hover:underline underline-offset-4">Daftar di sini</Link>
        </p>
      </form>
    </div>
  )
}

export default Login