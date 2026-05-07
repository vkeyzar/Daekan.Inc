import React from 'react'
import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'

const Hero = () => {
  return (
    <div name="home" className="w-full h-screen bg-transparent text-black flex flex-col justify-center items-center px-4 relative"> 

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
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase mb-6 drop-shadow-sm">
          <span>DAEKAN</span>
          <span className="font-light ml-0.5">INC.</span>
        </h1>
        <p className="max-w-xl mx-auto text-gray-600 text-lg md:text-xl mb-10 leading-relaxed font-medium">
           Designed to be Willing.
        </p>

        {/* Tombol CTA (Responsive flex-col to sm:flex-row) */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
            {/*}
            <a 
              href="#talents" 
              className="group px-8 py-4 bg-black text-white font-bold tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 border border-black shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
            >
              OUR TALENTS
              <FaArrowRight className="group-hover:translate-x-1 duration-200"/>
            </a>
            */}
            <a 
              href="#shop" 
              className="group px-8 py-4 bg-black backdrop-blur-md text-white font-bold tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 border border-black shadow-[0_10px_20px_rgba(0,0,0,0.05)]"
            >
              OUR PRODUCTS
              <FaArrowRight className="group-hover:translate-x-1 duration-200"/>
            </a>
        </div>
      </motion.div>
    </div>
  )
}

export default Hero