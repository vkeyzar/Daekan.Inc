'use client';

import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaArrowLeft, FaRulerCombined } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'

const SizeChartContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('cat') || 'MERCH'
  const isCollab = category.toUpperCase() === 'COLLAB'

  const merchImageUrl = supabase.storage.from('asset').getPublicUrl('size_chart_merch.png').data.publicUrl
  const collabImageUrl = supabase.storage.from('asset').getPublicUrl('size_chart_collab.png').data.publicUrl

  const imageUrl = isCollab ? collabImageUrl : merchImageUrl
  const pageTitle = isCollab ? 'PANDUAN UKURAN KOLABORASI' : 'PANDUAN UKURAN DAEKAN'

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />
      <div className="flex-1 py-10 px-5 md:px-12 flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full flex flex-col justify-center">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 font-black uppercase text-xs sm:text-sm tracking-widest text-black dark:text-white hover:opacity-60 transition-opacity mb-6 cursor-pointer"
            >
              <FaArrowLeft /> BACK
            </button>

            <div className="flex items-center gap-3 border-b-2 border-black dark:border-white pb-4">
              <FaRulerCombined className="text-2xl md:text-3xl text-black dark:text-white" />
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none text-black dark:text-white">
                {pageTitle}
              </h1>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex justify-center items-center border-2 border-black dark:border-white bg-white p-4"
          >
            <img
              src={imageUrl}
              alt={`Size Chart - ${pageTitle}`}
              className="w-full h-full max-h-[55vh] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/1080x1080/ffffff/000000?text=PANDUAN+UKURAN+TIDAK+DITEMUKAN'
              }}
            />
          </motion.div>

          <div className="mt-6 p-6 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">
              Informasi Tambahan
            </p>
            <p className="text-xs sm:text-sm md:text-base font-medium leading-relaxed">
              Silakan ambil pakaian favorit Anda, lakukan pengukuran secara mandiri, dan sesuaikan dengan detail spesifikasi pada gambar di atas. Toleransi ukuran jahitan produksi berkisar antara 1 hingga 2 sentimeter dari standar yang tertera.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const SizeChart = () => {
  return (
    <Suspense fallback={null}>
      <SizeChartContent />
    </Suspense>
  )
}

export default SizeChart
