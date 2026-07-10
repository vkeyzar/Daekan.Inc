import React from 'react'
import { FaInstagram, FaEnvelope, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from "react-icons/fa6"

const Footer = () => {
  return (
    <footer className="bg-transparent pt-20 pb-10 border-t border-zinc-200/50 relative z-10">
        <div className="max-w-screen-xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                
                {/* KOLOM KIRI: LOGO & DESKRIPSI */}
                <div className="md:col-span-6 lg:col-span-5">
                    
                    {/* ✅ LOGO FOOTER BARU PAKE ASET */}
                    <div className="mb-6">
                        <img 
                          src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/daekan%20new%20logo.png" 
                          alt="Daekan Inc." 
                          className="h-8 md:h-10 object-contain drop-shadow-sm"
                        />
                    </div>
                    
                    <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-md text-justify">
                        At its core, we believe that true design shouldn't just look good, it should be 'Daekan.' 
                        Borrowed from local philosophy of being instinctively helpful and versatile, 
                        our products are crafted to adapt to your every need.
                    </p>
                </div>

                {/* KOLOM KANAN: SOCIALS, CONTACT US, & PARTNERSHIP */}
                <div className="flex flex-col items-start md:items-end text-left md:text-right">
                    
                    {/* SOCIALS */}
                    <div className="mb-8 flex flex-col md:items-end">
                        <h4 className="font-bold text-sm uppercase tracking-[0.2em] mb-4 text-vtuber-purple">Socials</h4>
                        <div className="flex gap-5 text-zinc-400">
                            <a href="https://instagram.com/daekan.inc" target="_blank" rel="noopener noreferrer" className="hover:text-vtuber-pink hover:-translate-y-1 transition-all duration-300">
                                <FaInstagram size={20} className="cursor-pointer" />
                            </a>
                            <a href="https://x.com/DaekanInc" target="_blank" rel="noopener noreferrer" className="hover:text-vtuber-pink hover:-translate-y-1 transition-all duration-300">
                                <FaXTwitter size={20} className="cursor-pointer" />
                            </a>
                        </div>
                    </div>

                    {/* CONTACT US */}
                    <div className="flex flex-col md:items-end">
                        <h4 className="font-black text-sm uppercase tracking-[0.1em] mb-4 text-zinc-400">Contact Us</h4>
                        <div className="flex gap-5 mb-6 text-zinc-400">
                            <a href="mailto:daekan.inc@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-vtuber-pink hover:-translate-y-1 transition-all duration-300">
                                <FaEnvelope size={20} className="cursor-pointer" />
                            </a>
                            <a href="https://wa.me/+6285695999703" target="_blank" rel="noopener noreferrer" className="hover:text-vtuber-pink hover:-translate-y-1 transition-all duration-300">
                                <FaWhatsapp size={20} className="cursor-pointer" />
                            </a>                    
                        </div>
                        <a href="/terms" className="hover:text-vtuber-cyan transition-colors text-sm font-black uppercase tracking-[0.1em] mb-4 text-zinc-400">Terms & Conditions</a>

                        {/* ✅ OPEN FOR PARTNERSHIP PINDAH KE SINI */}
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-vtuber-blue uppercase">
                            <span className="w-2 h-2 bg-vtuber-pink rounded-full animate-pulse shadow-[0_0_8px_rgba(225,174,207,0.8)]"></span>
                            Open for Partnership
                        </div>
                    </div>

                </div>
            </div>

            <div className="pt-8 border-t border-zinc-200/50 flex md:flex-row justify-center items-center gap-4">
                <p className="text-[10px] text-zinc-400 tracking-[0.1em] uppercase font-bold">
                    &copy; 2026 DAEKAN INC. All Rights Reserved.
                </p>
            </div>
        </div>
    </footer>
  )
}

export default Footer