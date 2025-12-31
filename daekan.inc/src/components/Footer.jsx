import React from 'react'
import { FaInstagram, FaTiktok, FaYoutube, FaEnvelope, FaWhatsapp } from 'react-icons/fa'

const Footer = () => {
  return (
        <footer className="bg-white pt-20 pb-10 border-t border-zinc-100">
        <div className="max-w-screen-xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                
                {/* KOLOM 1: DESKRIPSI (Gedhe & Rapi) */}
                <div className="md:col-span-6 lg:col-span-5">
                    <div className="font-black text-2xl tracking-tighter italic mb-6">
                        DAEKAN<span className="font-light">INC.</span>
                    </div>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-md text-justify">
                        At its core, we believe that true design shouldn't just look good, it should be 'Daekan.' 
                        Borrowed from local philosophy of being instinctively helpful and versatile, 
                        our products are crafted to adapt to your every need.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold tracking-widest text-green-500 uppercase">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Open for Partnership
                    </div>
                </div>

                {/* KOLOM 2: CONTACT & SOCIALS */}
                <div className="flex flex-col items-start md:items-end text-left md:text-right">
                    <h4 className="font-bold text-sm uppercase tracking-[0.2em] mb-6 text-zinc-400">Socials</h4>
                    <div className="flex gap-5 mb-8">
                        <FaInstagram size={20} className="hover:text-zinc-400 cursor-pointer transition-colors" />
                        <FaTiktok size={20} className="hover:text-zinc-400 cursor-pointer transition-colors" />
                        <FaYoutube size={20} className="hover:text-zinc-400 cursor-pointer transition-colors" />
                    </div>
                    <div className="text-sm text-zinc-500 space-y-1">
                        <p className="font-medium">daekan.inc@gmail.com</p>
                        <p>+62 8966-6939-4557</p>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR: COPYRIGHT & LEGAL */}
            <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] text-zinc-400 tracking-[0.1em] uppercase">
                    &copy; 2025 DAEKAN INC. All Rights Reserved.
                </p>
                <div className="flex gap-8 text-[10px] text-zinc-400 tracking-[0.1em] uppercase font-bold">
                    <a href="#" className="hover:text-zinc-800">Privacy Policy</a>
                    <a href="#" className="hover:text-zinc-800">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
  )
}

export default Footer