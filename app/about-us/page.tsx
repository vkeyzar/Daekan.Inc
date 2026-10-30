'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutUsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />

      <main className="flex-1 w-full px-5 sm:px-8 md:px-12 pt-8 pb-16 sm:pt-12 sm:pb-20 flex items-center justify-center">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-3xl mx-auto text-center"
        >
          {/* Judul Utama */}
          <h1 className="text-3xl sm:text-5xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white mb-2 sm:mb-3">
            ABOUT US
          </h1>

          {/* Logo Daekan: Rapat & Presisi Tanpa Spasi Berlebihan */}
          <div className="flex justify-center items-center my-1 sm:my-1 md:my-1">
            <img
              src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Daekan_New_Logo_Black33.33x_copy2.png"
              alt="Daekan Inc."
              className="dark:hidden w-full max-w-[240px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[480px] h-auto object-contain transition-transform duration-300 hover:scale-105"
            />
            <img
              src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Daekan_New_Logo_White_Copy33.33x2.png"
              alt="Daekan Inc."
              className="hidden dark:block w-full max-w-[240px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[480px] h-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Bagian 1: Designed to be Willing. */}
          <section className="mt-4 sm:mt-6 space-y-4 sm:space-y-5 mb-10 sm:mb-14">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black dark:text-white">
              Designed to be Willing.
            </h2>

            <p className="text-sm sm:text-base md:text-[17px] leading-relaxed sm:leading-[1.8] text-zinc-800 dark:text-zinc-200">
              It all started in late 2025. Amid the noise of uncertainty and the lingering question of where the
              future was leading us, a group of young friends gathered for late night conversations on
              Discord. What began as candid chats, shared anxieties, and creative sparks eventually grew
              into <strong className="font-bold text-black dark:text-white">daekan.inc</strong>.
            </p>

            <p className="text-sm sm:text-base md:text-[17px] leading-relaxed sm:leading-[1.8] text-zinc-800 dark:text-zinc-200">
              The name <strong className="font-bold text-black dark:text-white">daekan.inc</strong> is rooted in the Sundanese word &ldquo;<em className="italic">daek</em>&rdquo;, which translates to{' '}
              <strong className="font-bold text-black dark:text-white">
                a deep willingness to take action and do whatever it takes
              </strong>
              . At its core, we believe that true design shouldn&apos;t just look good, it should be &apos;Daekan.&apos; Borrowed from the local philosophy of being
              instinctively helpful and versatile, our products are crafted to adapt to your every need.
            </p>
          </section>

          {/* Bagian 2: Where Anime Culture Meets Minimalist Aesthetics */}
          <section className="space-y-4 sm:space-y-5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black dark:text-white">
              Where Anime Culture Meets Minimalist Aesthetics
            </h2>

            <p className="text-sm sm:text-base md:text-[17px] leading-relaxed sm:leading-[1.8] text-zinc-800 dark:text-zinc-200">
              We bridge our passion for anime culture with a clean, subtle, and minimalist design language.
              We believe anime-inspired apparel doesn&rsquo;t always need to be loud. Through sharp typography,
              refined silhouettes, and balanced aesthetics, every piece we craft is made to seamlessly
              integrate into your daily wardrobe.
            </p>

            <p className="text-sm sm:text-base md:text-[17px] leading-relaxed sm:leading-[1.8] text-zinc-800 dark:text-zinc-200">
              We are more than just a brand, we are a platform for those who keep moving forward.
            </p>

            <p className="pt-2 text-base sm:text-lg md:text-xl font-bold text-black dark:text-white">
              Will you step forward with us?
            </p>
          </section>
        </motion.article>
      </main>

      <Footer />
    </div>
  );
}
