'use client';
import Link from 'next/link';
import { useTheme } from '@/lib/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* KIRI: Logo Text Daekan */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-blue-400 italic">
                DAEKAN<span className="text-blue-200">INC</span>
              </span>
              <span className="text-[10px] text-pink-300 -mt-1 font-medium">ダエカン</span>
            </Link>
          </div>

          {/* TENGAH: Menu Navigasi */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-sm font-bold tracking-widest text-black dark:text-white hover:text-gray-500 transition-colors">HOME</Link>
            <Link href="/products" className="text-sm font-bold tracking-widest text-black dark:text-white hover:text-gray-500 transition-colors">PRODUCTS</Link>
            <Link href="/reviews" className="text-sm font-bold tracking-widest text-black dark:text-white hover:text-gray-500 transition-colors">REVIEWS</Link>
            <Link href="/admin" className="text-sm font-bold tracking-widest text-red-600 hover:text-red-400 transition-colors">ADMIN</Link>
          </nav>

          {/* KANAN: Icon Group (Theme, Cart, Profile) */}
          <div className="flex items-center space-x-5">
            
            {/* 1. Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="p-1.5 border border-black dark:border-gray-400 flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                // Icon Matahari (untuk ubah ke Light Mode)
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"></circle>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                </svg>
              ) : (
                // Icon Bulan (untuk ubah ke Dark Mode)
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
                </svg>
              )}
            </button>

            {/* 2. Cart Icon */}
            <Link href="/checkout" className="relative text-black dark:text-white hover:opacity-70 transition-opacity">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              {/* Cart Badge Placeholder */}
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center bg-black dark:bg-white text-[10px] font-bold text-white dark:text-black">
                1
              </span>
            </Link>

            {/* 3. Profile Icon */}
            <Link href="/profile" className="text-black dark:text-white hover:opacity-70 transition-opacity">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </Link>
            
          </div>
        </div>
      </div>
    </header>
  );
}