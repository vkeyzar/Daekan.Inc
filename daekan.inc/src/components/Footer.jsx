import React from 'react'
import { FaInstagram, FaTiktok, FaYoutube, FaEnvelope, FaWhatsapp } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-white text-zinc-900 py-12 border-t border-gray-200 mt-auto">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                
                {/* KOLOM KIRI: BRANDING & DESKRIPSI */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">DAEKAN INC.</h2>
                    <p className="text-zinc-500 max-w-md leading-relaxed">
                        We are a creative management agency dedicated to empowering the next generation of digital talents. 
                        Connecting creators with brands, and building sustainable careers in the entertainment industry.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        OPEN FOR PARTNERSHIP
                    </div>
                </div>

                {/* KOLOM KANAN: CONNECT */}
                <div className="md:flex md:flex-col md:items-end space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Socials</h3>
                    
                    {/* Social Icons (Hitam, Hover jadi Warna Brand) */}
                    <div className="flex gap-6">
                        <a href="https://instagram.com/daekan.inc" target="_blank" rel="noreferrer" className="hover:text-pink-600 transition-transform hover:-translate-y-1">
                            <FaInstagram size={28} />
                        </a>
                        <a href="https://tiktok.com/@daekaninc" target="_blank" rel="noreferrer" className="hover:text-black transition-transform hover:-translate-y-1">
                            <FaTiktok size={28} />
                        </a>
                        <a href="https://youtube.com/@daekaninc" target="_blank" rel="noreferrer" className="hover:text-red-600 transition-transform hover:-translate-y-1">
                            <FaYoutube size={28} />
                        </a>
                    </div>

                    {/* Contact Links */}
                    <div className="flex flex-col md:items-end gap-2 text-zinc-500 text-sm">
                        <a href="mailto:business@daekan.com" className="flex items-center gap-2 hover:text-black transition-colors">
                            <FaEnvelope /> business@daekan.com
                        </a>
                        <a href="#" className="flex items-center gap-2 hover:text-black transition-colors">
                            <FaWhatsapp /> +62 812-3456-7890
                        </a>
                    </div>
                </div>

            </div>

            {/* COPYRIGHT & LINKS */}
            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-400 uppercase tracking-widest">
                <p>&copy; 2025 DAEKAN INC. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
                </div>
            </div>

        </div>
    </footer>
  )
}

export default Footer