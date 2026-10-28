'use client';
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const Hero = () => {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white dark:bg-black text-black dark:text-white flex flex-col justify-center items-center px-6 py-16 relative overflow-hidden font-sans">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center z-10 w-full max-w-7xl"
      >
        {/* EYEBROW */}
        <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.4em] mb-6 md:mb-8 text-black dark:text-white">
          Official Store — Est. 2025
        </p>

        {/* GIANT DAEKAN */}
        <h1 className="font-black uppercase leading-none tracking-tighter text-[18vw] md:text-[14vw] lg:text-[12vw] text-black dark:text-white select-none">
          DAEKAN
        </h1>

        {/* SUBTITLE LINE */}
        <div className="flex items-center justify-center gap-4 my-6 md:my-8">
          <div className="h-[1px] flex-1 bg-black dark:bg-white opacity-30 max-w-[120px] sm:max-w-[200px]" />
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-black dark:text-white">
            Designed to be Willing
          </p>
          <div className="h-[1px] flex-1 bg-black dark:bg-white opacity-30 max-w-[120px] sm:max-w-[200px]" />
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 max-w-xs sm:max-w-none mx-auto">
          <a
            href="#new-arrivals"
            className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-black text-[11px] md:text-xs tracking-[0.25em] uppercase border border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all duration-300"
          >
            SHOP NOW
          </a>
          <Link
            href="/products"
            className="px-10 py-4 bg-transparent text-black dark:text-white font-black text-[11px] md:text-xs tracking-[0.25em] uppercase border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
          >
            VIEW ALL
          </Link>
        </div>
      </motion.div>

      {/* Bottom ticker line */}
      <div className="absolute bottom-6 left-0 w-full px-4 overflow-hidden">
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.35em] sm:tracking-[0.5em] text-center text-zinc-500 dark:text-zinc-400">
          DAEKAN INC. — OFFICIAL MERCHANDISE — LIMITED DROPS
        </p>
      </div>

      {/* Brutalist horizontal rule bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black dark:bg-white opacity-20" />
    </div>
  )
}

export default Hero
