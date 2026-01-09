import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('menu') 
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false) // --- STATE TOGGLE MATA ---
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
      else setUser(user)
    }
    getUser()
  }, [navigate])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    const { oldPassword, newPassword } = passData

    // 1. REGEX SECURITY CHECK
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if (!passwordRegex.test(newPassword)) {
      return Swal.fire({
        title: 'PASSWORD LEMAH!',
        html: `<div class="text-left text-xs space-y-2">
            <p>Password baru lo wajib mengandung:</p>
            <ul class="list-disc pl-5">
              <li>Minimal 8 Karakter</li>
              <li>Huruf Besar & Kecil</li>
              <li>Angka (0-9)</li>
              <li>Karakter Spesial (@$!%*?&)</li>
            </ul>
          </div>`,
        icon: 'error',
        confirmButtonColor: '#000'
      })
    }

    if (oldPassword === newPassword) {
      return Swal.fire('WAIT!', 'Password baru harus beda dari yang lama!', 'warning')
    }

    setLoading(true)
    try {
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      })

      if (reAuthError) throw new Error('Password lama lo salah, Bro!')

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError

      await Swal.fire('SUCCESS!', 'Password diganti. Cek email konfirmasi.', 'success')
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      Swal.fire('Failed', error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-white/5 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative">
        
        {/* VIEW: MENU UTAMA */}
        {view === 'menu' && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">My Profile</h2>
            <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] mb-10">{user.email}</p>
            <div className="space-y-4">
              <button onClick={() => setView('edit')} className="w-full bg-white text-black font-black text-xs py-5 rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-widest">Change Password</button>
              <button onClick={() => navigate('/')} className="w-full bg-transparent border border-white/10 text-zinc-500 font-bold text-xs py-5 rounded-2xl transition-all uppercase tracking-widest">Back to Site</button>
            </div>
          </div>
        )}

        {/* VIEW: EDIT PASSWORD */}
        {view === 'edit' && (
          <div className="animate-in slide-in-from-right duration-500">
            <button onClick={() => { setView('menu'); setShowPass(false); }} className="text-zinc-500 text-[10px] font-black uppercase mb-6 flex items-center gap-2">← Back</button>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Security</h2>
            
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              {/* INPUT PASSWORD LAMA */}
              <div className="relative">
                <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase block mb-2 px-1">Current Password</label>
                <input 
                  type={showPass ? "text" : "password"} 
                  className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-white transition-all font-mono"
                  onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                  required
                />
              </div>

              {/* INPUT PASSWORD BARU */}
              <div className="relative">
                <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase block mb-2 px-1">New Password</label>
                <input 
                  type={showPass ? "text" : "password"} 
                  className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-white transition-all font-mono pr-12"
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  required
                />
                {/* TOMBOL MATA */}
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute bottom-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.413 7.962 7.248 4.5 12 4.5c4.752 0 8.587 3.462 9.964 7.878.11.353.11.745 0 1.098C20.587 16.038 16.752 19.5 12 19.5c-4.752 0-8.587-3.462-9.964-7.878z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-red-600 text-white font-black text-xs py-5 rounded-2xl hover:bg-red-700 transition-all uppercase tracking-widest shadow-xl shadow-red-600/10"
              >
                {loading ? 'PROCESSING...' : 'CONFIRM CHANGE'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

export default Profile