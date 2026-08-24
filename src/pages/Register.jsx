import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) throw error

      Swal.fire({ 
        title: 'REGISTRASI BERHASIL', 
        text: 'Cek email Anda untuk konfirmasi.', 
        icon: 'success', 
        confirmButtonColor: '#a4e5fa' 
      })
    } catch (error) {
      let customHtml = ''
      let errorMessage = error.message

      if (error.message.includes("Password should contain at least one character of each")) {
        customHtml = `
          <div style="text-align: left; border-left: 5px solid #000; padding-left: 16px; margin-top: 15px; background-color: #f9fafb; padding-top: 10px; padding-bottom: 10px;">
            <p style="font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-size: 13px; margin-bottom: 10px; color: #000;">Password Terlalu Lemah!</p>
            <p style="font-size: 12px; margin-bottom: 10px; color: #4b5563;">Wajib mengandung kombinasi berikut:</p>
            <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 13px; color: #111827; font-weight: 500;">
              <li style="margin-bottom: 6px;">■ 1 <strong>HURUF BESAR</strong> (A-Z)</li>
              <li style="margin-bottom: 6px;">■ 1 <strong>HURUF KECIL</strong> (a-z)</li>
              <li style="margin-bottom: 6px;">■ 1 <strong>ANGKA</strong> (0-9)</li>
              <li style="margin-bottom: 6px;">■ 1 <strong>SIMBOL SPESIAL</strong> (!@#$ dll)</li>
            </ul>
          </div>
        `
      } else if (error.message.includes("User already registered")) {
        errorMessage = "Email ini sudah terdaftar. Silakan login."
      }

      Swal.fire({ 
        title: 'REGISTRASI GAGAL', 
        icon: 'error', 
        confirmButtonColor: '#000',
        confirmButtonText: 'COBA LAGI',
        background: '#ffffff',
        html: customHtml || errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden text-black p-6 md:p-12">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-vtuber-pink/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-vtuber-cyan/20 rounded-full blur-[100px] pointer-events-none"></div>

        <form onSubmit={handleRegister} className="relative z-10 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-vtuber-blue/20 w-full max-w-md shadow-2xl">
          <h2 className="text-3xl font-black mb-2 italic uppercase tracking-tighter drop-shadow-sm">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-1">JOIN DAEKAN</span><span className="font-light ml-0.5 text-vtuber-pink">INC.</span>
          </h2>
          <p className="text-vtuber-purple text-[10px] md:text-xs uppercase tracking-[0.2em] mb-8 font-bold">Create your daekan account</p>

          <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-vtuber-purple ml-1">Email Address</label>
                <input type="email" placeholder="daekan@inc.com" required className="w-full p-4 bg-white border border-vtuber-blue/30 rounded-2xl focus:outline-none focus:border-vtuber-cyan transition-all text-vtuber-purple" onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-vtuber-purple ml-1">Password</label>
                <input type="password" placeholder="••••••••" required className="w-full p-4 bg-white border border-vtuber-blue/30 rounded-2xl focus:outline-none focus:border-vtuber-cyan transition-all text-vtuber-purple" onChange={(e) => setPassword(e.target.value)} />
              </div>
          </div>

          <button disabled={loading} className="w-full bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white font-black py-4 rounded-2xl mt-8 hover:from-vtuber-pink hover:to-vtuber-purple transition-all shadow-[0_10px_20px_rgba(164,229,250,0.4)] tracking-widest disabled:opacity-50">
              {loading ? 'PROCESSING...' : 'REGISTER ACCOUNT'}
          </button>

          <p className="mt-8 text-vtuber-purple text-[11px] text-center uppercase tracking-widest font-bold">
              Already a member? <Link to="/login" className="text-vtuber-pink font-black hover:underline underline-offset-4">Login</Link>
          </p>
        </form>
    </div>
  )
}

export default Register