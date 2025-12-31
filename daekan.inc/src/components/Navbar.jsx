import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaShoppingBag } from 'react-icons/fa'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav 
        // FIX: max-w-[100vw] tetep ada buat mobile, tapi width layout kita bebaskan
        className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 max-w-[100vw] overflow-x-hidden ${
            scrolled || isOpen ? 'bg-white shadow-sm py-4' : 'bg-transparent py-6'
        }`}
    >
        {/* FIX: Ganti 'max-w-screen-xl mx-auto' jadi 'w-full'. 
            Padding md:px-12 biar di PC ada jarak enak dari pinggir. */}
        <div className="w-full px-6 md:px-12 flex justify-between items-center relative">
            
            {/* --- KIRI: LOGO (MENTOK POJOK) --- */}
            <div className="font-black text-2xl tracking-tighter italic z-[1001] relative shrink-0">
                DAEKAN<span className="font-light">INC.</span>
            </div>

            {/* --- TENGAH: MENU DESKTOP (ABSOLUTE CENTER) --- */}
            {/* Teknik: absolute left-1/2 -translate-x-1/2 buat mastiin dia bener2 di titik tengah layar */}
            <div className="hidden md:flex gap-10 font-bold text-sm tracking-widest absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <a href="#" className="hover:text-gray-500 transition-colors">HOME</a>
                <a href="#" className="hover:text-gray-500 transition-colors">TALENTS</a>
                <a href="#shop" className="hover:text-gray-500 transition-colors">MERCH</a>
            </div>

            {/* --- KANAN: ICONS (MENTOK POJOK) --- */}
            <div className="flex items-center gap-6 z-[1001] relative shrink-0">
                <FaShoppingBag size={20} className="cursor-pointer hover:text-gray-500 transition-colors" />
                
                {/* BURGER MENU (HP Only) */}
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="md:hidden focus:outline-none"
                >
                    {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>
        </div>

        {/* --- MOBILE MENU DROPDOWN --- */}
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '100vh', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden absolute top-0 left-0 w-full bg-white flex flex-col items-center justify-center gap-8 text-2xl font-black italic shadow-xl overflow-hidden"
                >
                    <a href="#" onClick={() => setIsOpen(false)} className="hover:text-gray-500">HOME</a>
                    <a href="#" onClick={() => setIsOpen(false)} className="hover:text-gray-500">TALENTS</a>
                    <a href="#shop" onClick={() => setIsOpen(false)} className="hover:text-gray-500">MERCH</a>
                    
                    <div className="mt-8 text-sm font-normal not-italic text-gray-400">
                        &copy; 2025 DAEKAN INC.
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </nav>
  )
}

export default Navbar