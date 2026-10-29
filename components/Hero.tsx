import React from 'react'
import Link from 'next/link'

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-slate-800">
      {/* TODO: aktifkan saat aset foto sudah tersedia (taruh di /public/images/hero.jpg) */}
      {/* <img
        src="/images/hero.jpg"
        alt="DAEKANINC hero"
        className="absolute inset-0 h-full w-full object-cover"
      /> */}

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
          className="font-sans mt-24 bg-white px-8 py-3 text-base font-medium text-black sm:mt-32 sm:px-10 sm:py-4 sm:text-lg md:mt-40 md:px-12 md:py-5 md:text-xl transition-colors duration-300 hover:bg-slate-200"
        >
          Shop Collection
        </Link>
      </div>
    </section>
  )
}

export default Hero
