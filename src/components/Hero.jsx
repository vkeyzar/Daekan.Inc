import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Hero = () => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col justify-center items-center px-6 relative overflow-hidden font-sans">

      {/* Brutalist horizontal rule top */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-black dark:bg-white" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center z-10 w-full max-w-7xl"
      >
        {/* EYEBROW */}
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-6 md:mb-8 text-black dark:text-white">
          Official Store — Est. 2024
        </p>

        {/* GIANT DAEKAN */}
        <h1 className="font-black uppercase leading-none tracking-tighter text-[18vw] md:text-[14vw] lg:text-[12vw] text-black dark:text-white select-none">
          DAEKAN
        </h1>

        {/* SUBTITLE LINE */}
        <div className="flex items-center justify-center gap-4 my-6 md:my-8">
          <div className="h-[1px] flex-1 bg-black dark:bg-white opacity-30 max-w-[200px]" />
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-black dark:text-white">
            Design That Adapts
          </p>
          <div className="h-[1px] flex-1 bg-black dark:bg-white opacity-30 max-w-[200px]" />
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <a
            href="#new-arrivals"
            className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-black text-xs tracking-[0.25em] uppercase border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all duration-300"
          >
            SHOP NOW
          </a>
          <Link
            to="/products"
            className="px-10 py-4 bg-transparent text-black dark:text-white font-black text-xs tracking-[0.25em] uppercase border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
          >
            VIEW ALL
          </Link>
        </div>
      </motion.div>

      {/* Bottom ticker line */}
      <div className="absolute bottom-8 left-0 w-full overflow-hidden">
        <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-center text-black dark:text-white opacity-30">
          DAEKAN INC. — OFFICIAL MERCHANDISE — VTUBER COLLABS — LIMITED DROPS
        </p>
      </div>

      {/* Brutalist horizontal rule bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black dark:bg-white opacity-20" />
    </div>
  )
}

export default Hero
