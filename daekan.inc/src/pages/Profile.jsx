import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login') // Proteksi: Kalau gak ada user, tendang ke login
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/') // Balik ke home setelah logout
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-white/10 p-10 rounded-3xl w-full max-w-md text-center">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">My Profile</h2>
        <p className="text-zinc-500 text-xs mb-8">{user.email}</p>
        
        <button 
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all"
        >
          LOGOUT ACCOUNT
        </button>
      </div>
    </div>
  )
}

export default Profile