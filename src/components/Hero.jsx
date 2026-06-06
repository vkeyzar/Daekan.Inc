import React from 'react'
import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div name="home" className="w-full h-screen bg-transparent text-black flex flex-col justify-center items-center px-4 relative overflow-hidden"> 

      {/* JETTO BACKGROUND */}
      <img 
        src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Freebies_Sticker.png" 
        className="absolute top-1/2 -translate-y-1/2 -left-40 md:-left-20 h-[110vh] md:h-[130vh] w-auto max-w-none opacity-50 pointer-events-none z-[1]"
        alt="VTuber Jetto Background"
      />

      {/* ✅ KONTEN KANAN: Ditambahin pt-12 md:pt-16 biar agak turun ke bawah */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 relative flex flex-col items-center justify-center w-full md:w-[55%] lg:w-[45%] ml-auto md:pr-12 lg:pr-24 pt-12 md:pt-16"
      >
        
        {/* ✅ LOGO CLICKABLE & KASIH JARAK EKSTRA (mb-12) */}
        <Link to="/" className="w-full flex justify-center mb-12 cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
          <img 
            src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Logo_Daekan_X_Jetto.png" 
            alt="Daekan x Jetto" 
            className="w-full max-w-[350px] md:max-w-[450px] lg:max-w-[500px] object-contain drop-shadow-[0_15px_30px_rgba(225,174,207,0.4)]"
          />
        </Link>

        {/* TOMBOL BUY NOW */}
        <div className="flex justify-center w-full px-4 md:px-0">
            <a 
              href="#new-arrivals" 
              className="group px-10 py-4 md:py-5 bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white font-black text-sm md:text-base tracking-[0.2em] hover:from-vtuber-pink hover:to-vtuber-purple transition-all duration-500 flex items-center justify-center gap-3 rounded-full shadow-[0_10px_30px_rgba(164,229,250,0.5)] hover:shadow-[0_10px_40px_rgba(225,174,207,0.8)] border-2 border-white/50 hover:scale-105"
            >
              BUY NOW
              <FaArrowRight className="group-hover:translate-x-1 duration-200"/>
            </a>
        </div>
      </motion.div>
    </div>
  )
}

export default Hero