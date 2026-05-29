import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaArrowLeft, FaRulerCombined } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient' 

const SizeChart = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Membaca parameter kategori dari URL
  const category = searchParams.get('cat') || 'MERCH'
  const isCollab = category.toUpperCase() === 'COLLAB'

  // Membuat URL publik secara otomatis dari Supabase Storage Bucket 'asset'
  const merchImageUrl = supabase.storage.from('asset').getPublicUrl('size_chart_merch.png').data.publicUrl
  const collabImageUrl = supabase.storage.from('asset').getPublicUrl('size_chart_collab.png').data.publicUrl

  const imageUrl = isCollab ? collabImageUrl : merchImageUrl
  const pageTitle = isCollab ? 'PANDUAN UKURAN KOLABORASI' : 'PANDUAN UKURAN DAEKAN' 

  return (
    // Lapisan z-[999] untuk memastikan Navbar tertutup seutuhnya
    <div className="min-h-[100dvh] relative z-[999] bg-white text-black py-6 px-5 md:py-10 md:px-12 font-sans flex flex-col items-center justify-center overflow-hidden">
      <div className="max-w-3xl w-full flex flex-col h-full justify-center">
        
        {/* HEADER */}
        <div className="mb-4 md:mb-6 shrink-0">
          <button 
            onClick={() => navigate('/')} // ✅ Mengarahkan pengguna langsung kembali ke halaman utama
            className="flex items-center gap-2 font-bold uppercase text-[10px] md:text-xs tracking-widest hover:text-zinc-500 transition-colors mb-4 md:mb-6"
          >
            <FaArrowLeft /> KEMBALI KE BERANDA
          </button>
          
          <div className="flex items-center gap-3 border-b-2 border-black pb-3 md:pb-4">
            <FaRulerCombined className="text-2xl md:text-4xl text-black" />
            <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">{pageTitle}</h1>
          </div>
        </div>

        {/* IMAGE RENDERER */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full flex justify-center items-center rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-200 bg-white" // ✅ Mengubah background penampung menjadi putih bersih
        >
          <img 
            src={imageUrl} 
            alt={`Size Chart - ${pageTitle}`} 
            className="w-full h-full max-h-[50vh] md:max-h-[55vh] object-contain p-2 md:p-4"
            onError={(e) => {
              // Menampilkan informasi formal jika gambar gagal dimuat dari server
              e.target.src = 'https://placehold.co/1080x1080/ffffff/000000?text=PANDUAN+UKURAN+TIDAK+DITEMUKAN'
            }}
          />
        </motion.div>

        {/* INFORMASI / DISCLAIMER FORMAL */}
        <div className="mt-4 md:mt-6 p-4 md:p-6 bg-black text-white rounded-xl md:rounded-2xl shrink-0 shadow-lg shadow-black/10">
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mb-1.5 md:mb-2">Informasi Tambahan</p>
          <p className="text-[10px] md:text-sm font-medium leading-relaxed text-zinc-300">
            Silakan ambil pakaian favorit Anda, lakukan pengukuran secara mandiri, dan sesuaikan dengan detail spesifikasi pada gambar di atas. Toleransi ukuran jahitan produksi berkisar antara 1 hingga 2 sentimeter dari standar yang tertera.
          </p>
        </div>

      </div>
    </div>
  )
}

export default SizeChart