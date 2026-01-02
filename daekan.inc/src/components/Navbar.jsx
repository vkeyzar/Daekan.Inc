import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom' // 👈 useLocation buat deteksi halaman
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaShoppingBag, FaUser } from 'react-icons/fa'
import { supabase } from '../lib/supabaseClient'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation() // 👈 Kita cek sekarang user lagi di halaman mana
  const [session, setSession] = useState(null) // 👈 State buat nyimpen session user

  // Deteksi apakah user lagi di halaman Login atau Register
  // Tambahkan halaman admin di sini
    const isWhitePage = location.pathname === '/' || location.pathname === '/profile' || location.pathname === '/admin-dashboard';
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Biar efeknya halus pas naik
    });
    setIsOpen(false); // Sekalian tutup menu kalau lagi di mobile
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)

    // 1. Cek session pas pertama kali load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Pantau perubahan status (login/logout) secara realtime
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
        window.removeEventListener('scroll', handleScroll);
        subscription.unsubscribe();
        };
  }, [])

  return (
    <nav 
    className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 max-w-[100vw] overflow-x-hidden ${
    scrolled || isOpen || isWhitePage || isAuthPage 
        ? 'bg-white shadow-sm py-4 text-black' 
        : 'bg-transparent py-6 text-white'
    }`}
    >
            <div className="w-full px-6 md:px-12 flex justify-between items-center relative">
        
                {/* LOGO - SUDAH BALIK KE ORIGINAL STYLE */}
                <Link 
                to="/" 
                onClick={scrollToTop} 
                className="font-black text-2xl tracking-tighter italic z-[1001] relative shrink-0 flex items-center"
                >
                    {/* "DAEKAN" - Bold & Italic */}
                    <span>DAEKAN</span>
                    
                    {/* "INC." - Font lebih tipis tapi tetep Italic & ada Garis Miring (/) */}
                    <span className="font-light ml-0.5">INC.</span>
                </Link>

                {/* MENU DESKTOP */}
                <div className="hidden md:flex gap-10 font-bold text-sm tracking-widest absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Link to="/" onClick={scrollToTop} className="hover:opacity-50 transition-all">HOME</Link>
                    
                    {/* Ganti <a> jadi <Link to="/#talents"> */}
                    <Link to="/#talents" className="hover:opacity-50 transition-all">TALENTS</Link>
                    <Link to="/#shop" className="hover:opacity-50 transition-all">MERCH</Link>
                    
                    {session && (
                        <Link to="/admin-dashboard" className="text-red-600 hover:opacity-70 transition-all italic">ADMIN</Link>
                    )}
                </div>

                {/* ICONS & BURGER */}
                <div className="flex items-center gap-6 z-[1001] relative shrink-0">
                    {/* Icon Tas Belanja - Tetap muncul di mobile & desktop */}
                    <FaShoppingBag size={20} className="cursor-pointer hover:text-gray-500 transition-colors" />
                    
                    {/* ICON USER - Kita sembunyikan di mobile (hidden), muncul di desktop (md:flex) */}
                    <Link 
                        to={session ? "/profile" : "/login"} // 👈 Pake logic session di sini
                        className="hidden md:flex hover:scale-110 transition-transform"
                        >
                        <FaUser 
                            size={18} 
                            className={`cursor-pointer ${session ? 'text-green-500' : ''}`} 
                        />
                    </Link>

                    {/* BURGER BUTTON - Muncul di mobile, hilang di desktop */}
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="md:hidden focus:outline-none p-2"
                    >
                        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

        {/* MOBILE MENU DROPDOWN */}
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="md:hidden fixed inset-0 bg-white z-[1000] flex flex-col items-center justify-center gap-8 text-3xl font-black italic uppercase tracking-tighter text-black"
                >
                    <Link to="/" onClick={() => setIsOpen(false)}>HOME</Link>
                    <Link to="/#talents" onClick={() => setIsOpen(false)}>TALENTS</Link>
                    <Link to="/#shop" onClick={() => setIsOpen(false)}>MERCH</Link>
                    
                    {/* PINDAHAN ICON USER KE SINI */}
                    <hr className="w-1/2 border-zinc-200" />
                    {/* ICON USER - Dinamis berdasarkan session */}
                    <Link 
                    to={session ? "/profile" : "/login"} 
                    className="hidden md:flex hover:scale-110 transition-transform"
                    >
                    <FaUser size={18} className={`cursor-pointer ${session ? 'text-green-500' : ''}`} />
                    </Link>
                    
                    <div className="mt-4 text-[10px] font-normal not-italic text-zinc-400 tracking-[0.3em] uppercase">
                        &copy; 2025 DAEKAN INC.
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </nav>
  )
}

export default Navbar