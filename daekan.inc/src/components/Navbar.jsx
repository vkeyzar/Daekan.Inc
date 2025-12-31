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
        className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 max-w-[100vw] overflow-x-hidden ${
            scrolled || isOpen ? 'bg-white shadow-sm py-4' : 'bg-transparent py-6'
        }`}
    >
        <div className="w-full px-6 md:px-12 flex justify-between items-center relative">
            
            {/* LOGO */}
            <a href="#home" className="font-black text-2xl tracking-tighter italic z-[1001] relative shrink-0">
                DAEKAN<span className="font-light">INC.</span>
            </a>

            {/* MENU DESKTOP */}
            <div className="hidden md:flex gap-10 font-bold text-sm tracking-widest absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <a href="#home" className="hover:text-gray-500 transition-colors">HOME</a>
                <a href="#talents" className="hover:text-gray-500 transition-colors">TALENTS</a>
                <a href="#shop" className="hover:text-gray-500 transition-colors">MERCH</a>
            </div>

            {/* ICONS & BURGER */}
            <div className="flex items-center gap-6 z-[1001] relative shrink-0">
                <FaShoppingBag size={20} className="cursor-pointer hover:text-gray-500 transition-colors" />
                
                {/* BURGER / CLOSE BUTTON */}
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="md:hidden focus:outline-none p-2"
                >
                    {/* Icon ganti otomatis kalau menu kebuka */}
                    {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    // Fixed agar menutupi layar dan z-index di bawah tombol X tadi
                    className="md:hidden fixed inset-0 bg-white z-[1000] flex flex-col items-center justify-center gap-10 text-3xl font-black italic uppercase tracking-tighter"
                >
                    <a href="#home" onClick={() => setIsOpen(false)} className="hover:text-zinc-500 transition-colors">HOME</a>
                    <a href="#talents" onClick={() => setIsOpen(false)} className="hover:text-zinc-500 transition-colors">TALENTS</a>
                    <a href="#shop" onClick={() => setIsOpen(false)} className="hover:text-zinc-500 transition-colors">MERCH</a>
                    
                    <div className="mt-10 text-xs font-normal not-italic text-zinc-400 tracking-widest uppercase">
                        &copy; 2025 DAEKAN INC.
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </nav>
  )
}

export default Navbar