import React from 'react'
import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'

const Hero = () => {
  return (
    <div name="home" className="w-full h-screen bg-white text-black flex flex-col justify-center items-center px-4 relative">
      
      {/* Background Element Tipis (Opsional) */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-100/50 skew-x-12 -z-10"></div>

      {/* Teks Utama */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <p className="text-xl md:text-2xl font-bold text-gray-500 tracking-[0.5em] mb-4">
          EST. 2025
        </p>
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-6">
          DAEKAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black">INC.</span>
        </h1>
        <p className="max-w-xl mx-auto text-gray-600 text-lg md:text-xl mb-10 leading-relaxed">
           Designed to be Willing.
        </p>

        {/* Tombol CTA */}
        <div className="flex justify-center gap-6">
            <a 
              href="#talents" 
              className="group px-8 py-4 bg-black text-white font-bold tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2"
            >
              OUR TALENTS
              <FaArrowRight className="group-hover:translate-x-1 duration-200"/>
            </a>
        </div>
      </motion.div>
    </div>
  )
}

export default Hero