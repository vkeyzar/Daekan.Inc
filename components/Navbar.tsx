"use client";
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaUser, FaShoppingBag } from 'react-icons/fa'
import { supabase } from '../lib/supabaseClient'
import useCartStore from '../store/useCartStore'
import SidebarCart from './SidebarCart'
import { useTheme } from '../lib/ThemeContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const { isDark, toggleTheme } = useTheme()

  const cart = useCartStore((state) => state.cart)
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const pathname = usePathname()

  const getUserRole = async (user) => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (data) setRole(data.role);
  };

  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsOpen(false); };

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

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 font-sans
          bg-white dark:bg-black border-b border-black dark:border-white text-black dark:text-white py-4`}
      >
        <div className="w-full px-6 md:px-12 flex justify-between items-center relative">

          <Link href="/" onClick={scrollToTop} className="z-10 relative shrink-0 flex items-center mt-1 md:mt-1.5">
            <img
              src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/daekan%20new%20logo.png"
              alt="Daekan Inc."
              className="h-6 md:h-8 object-contain transition-transform hover:scale-105"
              style={{ filter: isDark ? 'invert(1)' : 'none' }}
            />
          </Link>

          <div className="hidden md:flex gap-10 font-bold text-sm tracking-widest absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link href="/" onClick={scrollToTop} className="uppercase hover:underline transition-all duration-200">HOME</Link>
            <Link href="/products" onClick={scrollToTop} className="uppercase hover:underline transition-all duration-200">PRODUCTS</Link>
            <Link href="/#reviews" className="uppercase hover:underline transition-all duration-200">REVIEWS</Link>
            {session && role === 'admin' && (
              <Link href="/admin-dashboard" className="text-red-600 dark:text-red-400 uppercase hover:underline transition-all duration-200">ADMIN</Link>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-4 z-10 relative shrink-0 mt-1">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center border border-current hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 text-xs font-black cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? '☀' : '◐'}
            </button>

            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 hover:opacity-60 transition-all focus:outline-none cursor-pointer">
              <FaShoppingBag size={18} className="cursor-pointer" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[9px] font-black w-5 h-5 flex items-center justify-center border-2 bg-black text-white dark:bg-white dark:text-black border-white dark:border-black">
                  {totalItems}
                </span>
              )}
            </button>

            <Link href={session ? "/profile" : "/login"} className="hidden md:flex hover:opacity-60 transition-all">
              <FaUser size={18} className="cursor-pointer" />
            </Link>

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none p-2 hover:opacity-60 transition-all cursor-pointer">
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black dark:bg-white z-40 flex flex-col items-center justify-center gap-8 text-3xl font-black uppercase tracking-tighter text-white dark:text-black"
          >
            <Link href="/" onClick={() => setIsOpen(false)} className="hover:opacity-60 transition-all">HOME</Link>
            <Link href="/products" onClick={() => setIsOpen(false)} className="hover:opacity-60 transition-all">PRODUCTS</Link>
            <Link href="/#reviews" onClick={() => setIsOpen(false)} className="hover:opacity-60 transition-all">REVIEWS</Link>
            {session && role === 'admin' && (
              <Link href="/admin-dashboard" onClick={() => setIsOpen(false)} className="text-red-400 dark:text-red-600 hover:opacity-60">ADMIN</Link>
            )}
            <hr className="w-1/2 border-current opacity-20" />
            <Link href={session ? "/profile" : "/login"} onClick={() => setIsOpen(false)}>
              <FaUser size={30} className="hover:opacity-60 transition-all" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <SidebarCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar
