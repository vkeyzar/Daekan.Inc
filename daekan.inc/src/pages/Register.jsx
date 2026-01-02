import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMsg("Pendaftaran gagal: " + error.message)
    } else {
      setMsg("Cek email tod untuk verifikasi akun lo!")
    }
    setLoading(false)
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-zinc-950 overflow-hidden text-white p-6 md:p-12">
        
        {/* --- GRADIENT MESH BACKGROUND --- */}
        {/* Bulatan 1: Putih redup di kiri atas */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
        {/* Bulatan 2: Abu-abu di kanan bawah */}
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
            Create your icon account
        </p>
        
        {msg && (
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            <p className="text-sm font-bold text-yellow-400 italic">{msg}</p>
            </div>
        )}

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
            className="w-full bg-white text-black font-black py-4 rounded-xl mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-white/5 disabled:opacity-50"
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