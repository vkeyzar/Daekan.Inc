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
        html: `<div class="text-left text-xs space-y-2 text-zinc-600 font-medium">
            <p>Password baru lo wajib mengandung:</p>
            <ul class="list-disc pl-5">
              <li>Minimal 8 Karakter</li>
              <li>Huruf Besar & Kecil</li>
              <li>Angka (0-9)</li>
              <li>Karakter Spesial (@$!%*?&)</li>
            </ul>
          </div>`,
        icon: 'error',
        confirmButtonColor: '#e1aecf'
      })
    }

    if (oldPassword === newPassword) {
      return Swal.fire({
        title: 'WAIT!', 
        text: 'Password baru harus beda dari yang lama!', 
        icon: 'warning',
        confirmButtonColor: '#a4e5fa'
      })
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

      await Swal.fire({
        title: 'SUCCESS!', 
        text: 'Password diganti. Cek email konfirmasi.', 
        icon: 'success',
        confirmButtonColor: '#a4e5fa'
      })
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      Swal.fire({
        title: 'Gagal', 
        text: error.message, 
        icon: 'error',
        confirmButtonColor: '#e1aecf'
      })
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
    <div className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden text-black p-6 pt-20">
      
      {/* --- GRADIENT MESH BACKGROUND --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-vtuber-pink/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-vtuber-cyan/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 bg-white/80 backdrop-blur-xl border border-vtuber-blue/20 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        
        {/* VIEW: MENU UTAMA */}
        {view === 'menu' && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-vtuber-cyan to-vtuber-pink text-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-vtuber-pink/30">
                {/* pr-1 biar italic nggak kepotong */}
                <span className="text-4xl font-black italic pr-1">D</span>
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 drop-shadow-sm">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-2">MY</span>
                <span className="text-vtuber-pink">PROFILE</span>
            </h2>
            <p className="text-vtuber-purple text-[10px] font-bold tracking-[0.2em] mb-10 uppercase">{user.email}</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => setView('edit')} 
                className="w-full bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white font-black text-xs py-5 rounded-2xl hover:from-vtuber-pink hover:to-vtuber-purple transition-all uppercase tracking-widest shadow-[0_5px_15px_rgba(164,229,250,0.4)]"
              >
                Change Password
              </button>
              
              <button 
                onClick={handleLogout} 
                className="w-full bg-transparent border-2 border-vtuber-pink text-vtuber-pink font-bold text-xs py-5 rounded-2xl hover:bg-vtuber-pink hover:text-white transition-all uppercase tracking-widest shadow-sm"
              >
                Logout Account
              </button>

              <button 
                onClick={() => navigate('/')} 
                className="w-full text-vtuber-purple text-[10px] font-black uppercase tracking-widest pt-4 hover:text-vtuber-cyan transition-colors"
              >
                ← Back to Site
              </button>
            </div>
          </div>
        )}

        {/* VIEW: EDIT PASSWORD */}
        {view === 'edit' && (
          <div className="animate-in slide-in-from-right duration-500">
            <button onClick={() => { setView('menu'); setShowPass(false); }} className="text-vtuber-purple text-[10px] font-black uppercase mb-6 flex items-center gap-2 hover:text-vtuber-pink transition-colors">
                ← Back to Menu
            </button>
            
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 drop-shadow-sm">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-2">SECURITY</span>
                <span className="text-vtuber-pink">SETTING</span>
            </h2>
            
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black tracking-widest text-vtuber-purple uppercase block mb-2 px-1">Current Password</label>
                <input 
                  type={showPass ? "text" : "password"} 
                  className="w-full bg-white/60 backdrop-blur-md border border-vtuber-blue/30 p-4 rounded-xl text-sm outline-none focus:border-vtuber-cyan focus:shadow-[0_0_15px_rgba(164,229,250,0.4)] transition-all font-mono text-zinc-800 placeholder:text-zinc-300"
                  onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                  required
                />
              </div>

              <div className="relative">
                <label className="text-[10px] font-black tracking-widest text-vtuber-purple uppercase block mb-2 px-1">New Password</label>
                <input 
                  type={showPass ? "text" : "password"} 
                  className="w-full bg-white/60 backdrop-blur-md border border-vtuber-blue/30 p-4 rounded-xl text-sm outline-none focus:border-vtuber-cyan focus:shadow-[0_0_15px_rgba(164,229,250,0.4)] transition-all font-mono pr-12 text-zinc-800 placeholder:text-zinc-300"
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute bottom-4 right-4 text-vtuber-purple hover:text-vtuber-pink transition-colors text-xs font-bold"
                >
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-vtuber-pink text-white font-black text-xs py-5 rounded-2xl hover:bg-vtuber-cyan transition-all uppercase tracking-widest shadow-[0_5px_15px_rgba(225,174,207,0.4)] disabled:opacity-50"
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