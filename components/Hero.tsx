'use client';

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const TOTAL_SLIDES = 2

const HERO_BUTTON_CLASS =
  'font-sans inline-flex items-center justify-center bg-white px-8 py-3 text-base font-medium text-black sm:px-10 sm:py-4 sm:text-lg md:px-8 md:py-3 md:text-lg transition-colors duration-300 hover:bg-slate-200 whitespace-nowrap'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES)
    }, 5000)

    return () => clearInterval(timer)
  }, [currentSlide])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES)
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-slate-800 group">
      {/* Slider Track */}
      <div
        className="flex w-full min-h-screen transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {/* Slide 1: Daekan Mandiri */}
        <div className="relative w-full min-w-full shrink-0 min-h-screen overflow-hidden bg-slate-800">
          <Image
            src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/poster_web.webp"
            alt="DAEKANINC hero"
            fill
            priority
            className="object-cover"
          />

          {/* Overlay adaptif tema */}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 transition-colors duration-500 ease-in-out" />

          {/* Konten */}
          <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center font-[Helvetica,'Helvetica_Neue',Arial,sans-serif]">
            <h1 className="whitespace-nowrap text-[clamp(2rem,11vw,3.5rem)] italic tracking-wider text-white sm:text-6xl md:text-8xl lg:text-9xl">
              <span className="font-bold">DAEKAN</span>
              <span className="font-normal">INC</span>
            </h1>
            <p className="mt-4 text-sm tracking-wide text-white sm:text-base md:text-lg">
              Designed to be willing.
            </p>

            <Link
              href="/products"
              className={`${HERO_BUTTON_CLASS} mt-24 sm:mt-32 md:mt-43`}
            >
              Shop Collection
            </Link>
          </div>
        </div>

        {/* Slide 2: Vtuber Collab */}
        <div
          className="relative w-full min-w-full shrink-0 min-h-screen bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/web_vera_homepage.png')",
          }}
        >
          <Link
            href="/products/collabs"
            className={`${HERO_BUTTON_CLASS} absolute top-[73.5%] left-[79.6%] -translate-x-1/2 -translate-y-1/2 z-10`}
          >
            PRE-ORDER NOW
          </Link>
        </div>
      </div>

      {/* Navigasi Panah Kiri */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black text-white p-3 md:p-4 border border-white/40 transition-all duration-300 cursor-pointer"
      >
        <FaChevronLeft size={16} />
      </button>

      {/* Navigasi Panah Kanan */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black text-white p-3 md:p-4 border border-white/40 transition-all duration-300 cursor-pointer"
      >
        <FaChevronRight size={16} />
      </button>

      {/* Dots Navigasi Bawah */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 transition-all duration-300 cursor-pointer ${
              currentSlide === idx
                ? 'w-8 bg-white'
                : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default Hero
