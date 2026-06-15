import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaUser, FaShoppingBag } from 'react-icons/fa' 
import { supabase } from '../lib/supabaseClient'
import useCartStore from '../store/useCartStore' 
import SidebarCart from './SidebarCart' 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null) 
  const [isCartOpen, setIsCartOpen] = useState(false)

  const cart = useCartStore((state) => state.cart)
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const location = useLocation()

  const isWhitePage = location.pathname === '/' || location.pathname === '/profile' || location.pathname === '/admin-dashboard' || location.pathname === '/products';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  const getUserRole = async (user) => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (data) setRole(data.role);
  };

  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsOpen(false); };

  // ✅ FIX 2: Kunci scroll body pas menu mobile kebuka biar ga bocor
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) getUserRole(session.user);
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) getUserRole(session.user);
      else setRole(null);
    })

    return () => { window.removeEventListener('scroll', handleScroll); subscription.unsubscribe(); };
  }, [])

  const isNavbarLight = scrolled || isOpen || isWhitePage || isAuthPage;

  return (
    <>
      {/* ✅ FIX 3: Hapus max-w-[100vw] dan overflow-x-hidden */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isNavbarLight ? 'bg-white/90 backdrop-blur-md shadow-sm py-4 text-vtuber-purple font-black' : 'bg-transparent py-6 text-white'
        }`}
      >
        <div className="w-full px-6 md:px-12 flex justify-between items-center relative">
          
          <Link to="/" onClick={scrollToTop} className="z-10 relative shrink-0 flex items-center mt-1 md:mt-1.5">
              <img 
                src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/daekan%20new%20logo.png" 
                alt="Daekan Inc." 
                className="h-6 md:h-8 object-contain transition-transform hover:scale-105"
              />
          </Link>

          <div className="hidden md:flex gap-10 font-bold text-sm tracking-widest absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Link to="/" onClick={scrollToTop} className="hover:text-vtuber-cyan transition-colors duration-300">HOME</Link>
              <Link to="/products" onClick={scrollToTop} className="hover:text-vtuber-cyan transition-colors duration-300">PRODUCTS</Link>
              <Link to="/#reviews" className="hover:text-vtuber-cyan transition-colors duration-300">REVIEWS</Link>
              {session && role === 'admin' && (
                  <Link to="/admin-dashboard" className="text-red-600 hover:text-vtuber-pink transition-colors duration-300 italic tracking-tighter">ADMIN</Link>
              )}
          </div>

          <div className="flex items-center gap-3 md:gap-6 z-10 relative shrink-0 mt-1">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 hover:scale-110 hover:text-vtuber-pink transition-all focus:outline-none">
                <FaShoppingBag size={18} className="cursor-pointer" />
                {totalItems > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 font-mono text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isNavbarLight ? 'bg-vtuber-pink text-white border-white' : 'bg-vtuber-pink text-white border-black/10'
                  }`}>
                    {totalItems}
                  </span>
                )}
              </button>

              <Link to={session ? "/profile" : "/login"} className="hidden md:flex hover:scale-110 hover:text-vtuber-cyan transition-all">
                  <FaUser size={18} className={`cursor-pointer ${session ? 'text-vtuber-cyan' : ''}`} />
              </Link>

              <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none p-2 hover:text-vtuber-pink transition-colors">
                  {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
          </div>
        </div>
      </nav>

      {/* ✅ FIX 1: Tambahin properti initial, animate, exit di motion.div */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-white/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center gap-8 text-3xl font-black italic uppercase tracking-tighter text-vtuber-purple"
          >
              <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-vtuber-cyan">HOME</Link>
              <Link to="/products" onClick={() => setIsOpen(false)} className="hover:text-vtuber-cyan">PRODUCTS</Link>
              <Link to="/#reviews" onClick={() => setIsOpen(false)} className="hover:text-vtuber-cyan">REVIEWS</Link>
              {session && role === 'admin' && (
                <Link to="/admin-dashboard" onClick={() => setIsOpen(false)} className="text-red-600 hover:text-vtuber-pink">ADMIN</Link>
              )}
              <hr className="w-1/2 border-vtuber-pink/20" />
              <Link to={session ? "/profile" : "/login"} onClick={() => setIsOpen(false)}>
                  <FaUser size={30} className={`hover:text-vtuber-cyan transition-colors ${session ? 'text-vtuber-cyan' : ''}`} />
              </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <SidebarCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar