'use client';
import React from 'react'
import { FaInstagram, FaEnvelope, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from "react-icons/fa6"
import { useTheme } from '../lib/ThemeContext'

const Footer = () => {
  const { theme } = useTheme()

  return (
    <footer className="bg-white dark:bg-black pt-16 md:pt-20 pb-10 border-t border-black dark:border-white relative z-10 font-sans text-black dark:text-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">

          {/* Left column: Logo & description */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="mb-7">
              <img
                src={
                  theme === 'dark'
                    ? 'https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Daekan_New_Logo_White_Copy33.33x2.png'
                    : 'https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Daekan_New_Logo_Black33.33x_copy2.png'
                }
                alt="Daekan Inc."
                className="h-12 md:h-14 w-auto object-contain scale-[1.35] origin-left"
              />
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm md:text-[15px] leading-relaxed max-w-md text-justify">
              At its core, we believe that true design shouldn&apos;t just look good, it should be &apos;Daekan.&apos;
              Borrowed from local philosophy of being instinctively helpful and versatile,
              our products are crafted to adapt to your every need.
            </p>
          </div>

          {/* Right column: Socials, Contact, Partnership */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right">

            {/* Socials */}
            <div className="mb-8 flex flex-col md:items-end">
              <h4 className="font-bold text-[13px] md:text-sm uppercase tracking-[0.2em] mb-4 text-black dark:text-white">Socials</h4>
              <div className="flex gap-5 text-black dark:text-white">
                <a href="https://instagram.com/daekan.inc" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 hover:-translate-y-1 transition-all duration-300">
                  <FaInstagram size={21} className="cursor-pointer" />
                </a>
                <a href="https://x.com/DaekanInc" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 hover:-translate-y-1 transition-all duration-300">
                  <FaXTwitter size={21} className="cursor-pointer" />
                </a>
              </div>
            </div>

            {/* Contact Us */}
            <div className="flex flex-col md:items-end">
              <h4 className="font-bold text-[13px] md:text-sm uppercase tracking-[0.2em] mb-4 text-black dark:text-white">Contact Us</h4>
              <div className="flex gap-5 mb-6 text-black dark:text-white">
                <a href="mailto:daekan.inc@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 hover:-translate-y-1 transition-all duration-300">
                  <FaEnvelope size={21} className="cursor-pointer" />
                </a>
                <a href="https://wa.me/+6285695999703" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 hover:-translate-y-1 transition-all duration-300">
                  <FaWhatsapp size={21} className="cursor-pointer" />
                </a>
              </div>
              <a href="/terms-of-service" className="hover:opacity-60 transition-all text-[13px] md:text-sm font-black uppercase tracking-[0.15em] mb-4 text-black dark:text-white">
                Terms &amp; Conditions
              </a>

              {/* Open for Partnership */}
              <div className="flex items-center gap-2 text-xs md:text-[13px] font-bold tracking-[0.2em] text-black dark:text-white uppercase mt-2">
                <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></span>
                Open for Partnership
              </div>
            </div>

          </div>
        </div>

        <div className="pt-8 border-t border-black dark:border-white flex md:flex-row justify-center items-center gap-4">
          <p className="text-xs md:text-[13px] text-zinc-600 dark:text-zinc-400 tracking-[0.2em] uppercase font-bold text-center">
            &copy; 2026 DAEKAN INC. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
