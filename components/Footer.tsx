import React from 'react'
import { FaInstagram, FaEnvelope, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from "react-icons/fa6"
import { useTheme } from '../lib/ThemeContext'

const Footer = () => {
  const { isDark } = useTheme()

  return (
    <footer className="bg-white dark:bg-black pt-20 pb-10 border-t border-black dark:border-white relative z-10 font-sans text-black dark:text-white">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">

          {/* Left column: Logo & description */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="mb-6">
              <img
                src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/daekan%20new%20logo.png"
                alt="Daekan Inc."
                className="h-8 md:h-10 object-contain"
                style={{ filter: isDark ? 'invert(1)' : 'none' }}
              />
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm leading-relaxed max-w-md text-justify">
              At its core, we believe that true design shouldn't just look good, it should be 'Daekan.'
              Borrowed from local philosophy of being instinctively helpful and versatile,
              our products are crafted to adapt to your every need.
            </p>
          </div>

          {/* Right column: Socials, Contact, Partnership */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right">

            {/* Socials */}
            <div className="mb-8 flex flex-col md:items-end">
              <h4 className="font-bold text-sm uppercase tracking-[0.2em] mb-4 text-black dark:text-white">Socials</h4>
              <div className="flex gap-5 text-black dark:text-white">
                <a href="https://instagram.com/daekan.inc" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 hover:-translate-y-1 transition-all duration-300">
                  <FaInstagram size={20} className="cursor-pointer" />
                </a>
                <a href="https://x.com/DaekanInc" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 hover:-translate-y-1 transition-all duration-300">
                  <FaXTwitter size={20} className="cursor-pointer" />
                </a>
              </div>
            </div>

            {/* Contact Us */}
            <div className="flex flex-col md:items-end">
              <h4 className="font-black text-sm uppercase tracking-[0.1em] mb-4 text-black dark:text-white">Contact Us</h4>
              <div className="flex gap-5 mb-6 text-black dark:text-white">
                <a href="mailto:daekan.inc@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 hover:-translate-y-1 transition-all duration-300">
                  <FaEnvelope size={20} className="cursor-pointer" />
                </a>
                <a href="https://wa.me/+6285695999703" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 hover:-translate-y-1 transition-all duration-300">
                  <FaWhatsapp size={20} className="cursor-pointer" />
                </a>
              </div>
              <a href="/terms" className="hover:opacity-60 transition-all text-sm font-black uppercase tracking-[0.1em] mb-4 text-black dark:text-white">Terms &amp; Conditions</a>

              {/* Open for Partnership */}
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-black dark:text-white uppercase mt-2">
                <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></span>
                Open for Partnership
              </div>
            </div>

          </div>
        </div>

        <div className="pt-8 border-t border-black dark:border-white flex md:flex-row justify-center items-center gap-4">
          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 tracking-[0.1em] uppercase font-bold">
            &copy; 2026 DAEKAN INC. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
