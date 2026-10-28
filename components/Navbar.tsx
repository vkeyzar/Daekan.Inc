'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/ThemeContext';
import useCartStore from '@/lib/store/useCartStore';
import SidebarCart from '@/components/SidebarCart';
import { supabase } from '@/lib/supabaseClient';
import { FaBars, FaTimes, FaUser, FaShoppingBag } from 'react-icons/fa';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const items = useCartStore((state) => state.items);

  const getUserRole = async (user: any) => {
    if (!user) {
      setRole(null);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (data) setRole(data.role);
    else setRole(null);
  };

  useEffect(() => {
    useCartStore.persist.rehydrate();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) getUserRole(session.user);
      else setRole(null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) getUserRole(session.user);
      else setRole(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="sticky top-0 left-0 w-full z-50 transition-all duration-300 font-sans bg-white dark:bg-black border-b border-black dark:border-white text-black dark:text-white py-3.5 md:py-4">
        <div className="w-full px-6 md:px-12 flex justify-between items-center relative">
          
          {/* KIRI: Logo Daekan */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="z-10 relative shrink-0 flex items-center"
          >
            <img
              src={
                theme === 'dark'
                  ? 'https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Daekan_New_Logo_White_Copy33.33x2.png'
                  : 'https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Daekan_New_Logo_Black33.33x_copy2.png'
              }
              alt="Daekan Inc."
              className="h-9 md:h-11 w-auto object-contain scale-[1.35] origin-left transition-transform hover:scale-[1.4]"
            />
          </Link>

          {/* TENGAH: Menu Navigasi Desktop */}
          <div className="hidden md:flex gap-10 font-bold text-[13px] md:text-sm tracking-[0.2em] absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="uppercase hover:opacity-60 transition-opacity duration-200">
              HOME
            </Link>
            <Link href="/products" className="uppercase hover:opacity-60 transition-opacity duration-200">
              PRODUCTS
            </Link>
            <Link href="/#reviews" className="uppercase hover:opacity-60 transition-opacity duration-200">
              REVIEWS
            </Link>
            {session && role === 'admin' && (
              <Link href="/admin" className="text-red-600 dark:text-red-500 uppercase hover:opacity-70 transition-opacity duration-200">
                ADMIN
              </Link>
            )}
          </div>

          {/* KANAN: Icon Group (Theme, Cart, Profile, Mobile Menu) */}
          <div className="flex items-center gap-3.5 md:gap-4 z-10 relative shrink-0">
            
            {/* 1. Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border border-current hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 text-xs md:text-sm font-black cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? '☀' : '◐'}
            </button>

            {/* 2. Cart Icon */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:opacity-60 transition-all focus:outline-none cursor-pointer"
              aria-label="Open Cart"
            >
              <FaShoppingBag size={18} />
              <span className="absolute -top-0.5 -right-0.5 text-[10px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center border bg-black text-white dark:bg-white dark:text-black border-white dark:border-black">
                {totalItems}
              </span>
            </button>

            {/* 3. Profile Icon */}
            <Link
              href={session ? '/profile' : '/login'}
              className="hidden md:flex p-1 hover:opacity-60 transition-all"
              aria-label="Profile"
            >
              <FaUser size={17} />
            </Link>

            {/* 4. Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 hover:opacity-60 transition-all focus:outline-none cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <FaTimes size={21} /> : <FaBars size={21} />}
            </button>
            
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[61px] bottom-0 bg-white dark:bg-black border-t border-black dark:border-white z-50 flex flex-col justify-between p-8 overflow-y-auto">
            <nav className="flex flex-col space-y-5">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 hover:opacity-60 transition-opacity"
              >
                HOME
              </Link>
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 hover:opacity-60 transition-opacity"
              >
                PRODUCTS
              </Link>
              <Link
                href="/#reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 hover:opacity-60 transition-opacity"
              >
                REVIEWS
              </Link>
              <Link
                href={session ? '/profile' : '/login'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 hover:opacity-60 transition-opacity"
              >
                {session ? 'PROFILE / ACCOUNT' : 'LOGIN / REGISTER'}
              </Link>
              {session && role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-black uppercase tracking-[0.25em] text-red-600 dark:text-red-500 pb-4 hover:opacity-70 transition-opacity"
                >
                  ADMIN
                </Link>
              )}
            </nav>

            <div className="pt-6 border-t border-black dark:border-white text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              DAEKAN INC. — OFFICIAL STORE
            </div>
          </div>
        )}
      </nav>

      <SidebarCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
