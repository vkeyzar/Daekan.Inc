import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('menu') 
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 pt-20">
      <div className="bg-zinc-900 border border-white/5 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative">
        
        {/* VIEW: MENU UTAMA */}
        {view === 'menu' && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-white text-black rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-white/5">
                <span className="text-3xl font-black italic">D</span>
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">My Profile</h2>
            <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] mb-10 uppercase">{user.email}</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => setView('edit')} 
                className="w-full bg-white text-black font-black text-xs py-5 rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-widest"
              >
                Change Password
              </button>
              
              {/* TOMBOL LOGOUT BALIK LAGI DI SINI */}
              <button 
                onClick={handleLogout} 
                className="w-full bg-transparent border border-white/10 text-zinc-500 font-bold text-xs py-5 rounded-2xl hover:text-red-500 hover:border-red-500/20 transition-all uppercase tracking-widest"
              >
                Logout Account
              </button>

              <button 
                onClick={() => navigate('/')} 
                className="w-full text-zinc-600 text-[10px] font-black uppercase tracking-widest pt-4 hover:text-white transition-colors"
              >
                ← Back to Site
              </button>
            </div>
          </div>
        )}

        {/* VIEW: EDIT PASSWORD */}
        {view === 'edit' && (
          <div className="animate-in slide-in-from-right duration-500">
            <button onClick={() => { setView('menu'); setShowPass(false); }} className="text-zinc-500 text-[10px] font-black uppercase mb-6 flex items-center gap-2 hover:text-white transition-colors">
                ← Back to Menu
            </button>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Security Setting</h2>
            
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase block mb-2 px-1">Current Password</label>
                <input 
                  type={showPass ? "text" : "password"} 
                  className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-white transition-all font-mono"
                  onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                  required
                />
              </div>

              <div className="relative">
                <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase block mb-2 px-1">New Password</label>
                <input 
                  type={showPass ? "text" : "password"} 
                  className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-white transition-all font-mono pr-12"
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute bottom-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPass ? "HIDE" : "SHOW"}
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