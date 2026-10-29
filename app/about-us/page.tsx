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

      <main className="flex-1 w-full px-5 sm:px-8 md:px-12 py-12 sm:py-16 md:py-24 flex items-center justify-center">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-3xl mx-auto text-center"
        >
          {/* Judul Utama */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-10 sm:mb-14">
            About Us
          </h1>

          {/* Bagian 1: Designed to be Willing. */}
          <section className="space-y-5 sm:space-y-6 mb-12 sm:mb-16">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black dark:text-white">
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
          <section className="space-y-5 sm:space-y-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black dark:text-white">
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

