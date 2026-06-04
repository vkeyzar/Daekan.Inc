import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link, useLocation } from 'react-router-dom' 
import Swal from 'sweetalert2' 

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation() 

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let message = "Terjadi kesalahan sistem.";
      if (error.message.includes("Invalid login credentials")) message = "Email atau password tidak valid.";
      Swal.fire({ title: 'AUTENTIKASI GAGAL', text: message, icon: 'error', confirmButtonColor: '#e1aecf' });
      return;
    }

    if (data.user && data.user.confirmed_at === null) {
      Swal.fire({ title: 'AKSES DITANGGUHKAN', text: 'Silakan verifikasi email Anda.', icon: 'warning', confirmButtonColor: '#e1aecf' });
      await supabase.auth.signOut();
      return;
    }

    if (data.session) {
      Swal.fire({ title: 'WELCOME!', text: 'Login berhasil!', icon: 'success', timer: 1500, showConfirmButton: false });
      const redirectTo = location.state?.returnTo || '/';
      setTimeout(() => navigate(redirectTo), 1500);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden text-black p-6 md:p-12">
      {/* Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-vtuber-pink/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-vtuber-cyan/20 rounded-full blur-[100px] pointer-events-none"></div>

      <form onSubmit={handleLogin} className="relative z-10 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-vtuber-blue/20 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black mb-2 italic uppercase tracking-tighter drop-shadow-sm">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-1">DAEKAN</span>
          <span className="font-light ml-0.5 text-vtuber-pink">LOGIN</span>
        </h2>
        <p className="text-vtuber-purple text-[10px] md:text-xs uppercase tracking-[0.2em] mb-8 font-bold">Access your icon dashboard</p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-vtuber-purple ml-1">Email Address</label>
            <input type="email" placeholder="name@daekan.inc" className="w-full p-4 bg-white border border-vtuber-blue/30 rounded-2xl focus:outline-none focus:border-vtuber-cyan focus:shadow-[0_0_15px_rgba(164,229,250,0.4)] transition-all text-vtuber-purple" onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-vtuber-purple ml-1">Password</label>
            <input type="password" placeholder="••••••••" className="w-full p-4 bg-white border border-vtuber-blue/30 rounded-2xl focus:outline-none focus:border-vtuber-cyan focus:shadow-[0_0_15px_rgba(164,229,250,0.4)] transition-all text-vtuber-purple" onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white font-black py-4 rounded-2xl mt-8 hover:from-vtuber-pink hover:to-vtuber-purple transition-all shadow-[0_10px_20px_rgba(164,229,250,0.4)] tracking-widest hover:scale-[1.02]">
          LOG IN
        </button>

        <p className="mt-8 text-vtuber-purple text-[11px] text-center uppercase tracking-widest font-bold">
          Belum punya akun? <Link to="/register" className="text-vtuber-pink font-black hover:underline underline-offset-4">Daftar di sini</Link>
        </p>
      </form>
    </div>
  )
}

export default Login