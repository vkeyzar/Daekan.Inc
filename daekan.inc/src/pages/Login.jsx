import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate() // Ini buat mindahin halaman lewat kodingan

  const handleLogin = async (e) => {
  e.preventDefault();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    let message = "Terjadi kesalahan saat login.";
    
    // Custom pesan berdasarkan tipe error dari Supabase
    if (error.message.includes("Invalid login credentials")) {
      message = "Email atau Password lo salah, Bro!";
    } else if (error.message.includes("Email not confirmed")) {
      message = "Cek email lo dulu buat konfirmasi akun!";
    }

    Swal.fire({
      title: 'LOGIN FAILED!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#000000'
    });
  } else {
    // Notif Sukses
    Swal.fire({
      title: 'WELCOME BACK!',
      text: 'Login berhasil, mengalihkan...',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  }
};
    

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-zinc-950 overflow-hidden text-white p-6 md:p-12">
        
        {/* --- GRADIENT MESH BACKGROUND --- */}
        {/* Bulatan 1: Putih redup di kiri atas */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
        {/* Bulatan 2: Abu-abu di kanan bawah */}
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
        
        {errorMsg && <p className="mb-4 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{errorMsg}</p>}

        <div className="space-y-4">
            <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
            <input 
                type="email" 
                placeholder="name@daekan.inc" 
                className="w-full p-4 bg-black/40 border border-white/5 rounded-xl focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-700"
                onChange={(e) => setEmail(e.target.value)}
            />
            </div>
            
            <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
            <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 bg-black/40 border border-white/5 rounded-xl focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-700"
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>
        </div>

        <button className="w-full bg-white text-black font-black py-4 rounded-xl mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-white/5">
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