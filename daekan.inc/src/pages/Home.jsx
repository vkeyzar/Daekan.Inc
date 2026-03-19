import React, { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import ProductGrid from '../components/ProductGrid'
import CreatorSection from '../components/CreatorSection'
import ProductModal from '../components/ProductModal'
import CreatorModal from '../components/CreatorModal'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient';

const Home = () => {
  const [products, setProducts] = useState([])
  const [creators, setCreators] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [loading, setLoading] = useState(true) 
  const location = useLocation()

  // --- LOGIC PARTIKEL FRIEREN (SNOW/PETALS) ---
  const particles = useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 12 + 8}s`, // 8 - 20 detik
      animationDelay: `-${Math.random() * 20}s`, 
      opacity: Math.random() * 0.6 + 0.4, 
      scale: Math.random() * 0.6 + 0.4, 
    }))
  }, [])

  // 1. Fungsi Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true)
      const [prodRes, createRes] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: true }),
        supabase.from('creators').select('*').order('id', { ascending: true })
      ])

      if (prodRes.error) throw prodRes.error
      if (createRes.error) throw createRes.error

      setProducts(prodRes.data)
      setCreators(createRes.data)
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // 2. Jalankan Fetch & Scroll Logic
  useEffect(() => {
    fetchData()
  }, []) 

  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 300) 
      }
    }
  }, [location, loading]) 

  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      
      {/* --- INLINE CSS KEYFRAMES --- */}
      <style>{`
        @keyframes fall-and-sway {
          0% { transform: translateY(-10vh) translateX(-20px) rotate(0deg) scale(var(--scale)); opacity: 0; }
          10% { opacity: var(--opacity); }
          90% { opacity: var(--opacity); }
          100% { transform: translateY(110vh) translateX(30px) rotate(360deg) scale(var(--scale)); opacity: 0; }
        }
        .animate-snow {
          position: absolute;
          top: 0;
          animation: fall-and-sway linear infinite;
        }
      `}</style>

      {/* --- LAYER AMBIENCE FRIEREN (FIXED BACKGROUND) --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[0]">
        {/* Layer 1: Cinematic Bokeh Background */}
        <img 
          src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Blue_Moon_Weed_Full.webp" 
          className="absolute -top-16 -left-16 w-80 md:w-[450px] opacity-80 blur-[2px] animate-[pulse_6s_ease-in-out_infinite] drop-shadow-[0_0_15px_rgba(150,200,255,0.4)]"
          alt="Blue Moon Weed Background"
        />
        <img 
          src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Blue_Moon_Weed_Full.webp" 
          className="absolute -bottom-32 -right-20 w-96 md:w-[550px] opacity-60 blur-[4px] animate-[pulse_8s_ease-in-out_infinite] drop-shadow-[0_0_20px_rgba(150,200,255,0.3)]"
          style={{ transform: 'scaleX(-1)' }} 
          alt="Blue Moon Weed Background"
        />

        {/* Layer 2: Particle System (Falling Petals) */}
        {particles.map((p) => (
          <img
            key={p.id}
            src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Blue_Moon_Weed_1.webp"
            className="animate-snow w-6 md:w-10"
            style={{
              left: p.left,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
              '--opacity': p.opacity, 
              '--scale': p.scale,
              filter: p.scale < 0.6 ? 'blur(3px)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
            }}
            alt="Blue Moon Petal Particle"
          />
        ))}
      </div>

      {/* --- LAYER CONTENT (WEB UTAMA) --- */}
      {/* Pake relative z-10 biar semua section ada di atas bunga */}
      <div className="relative z-10">
        <Navbar />

        <section id="home">
          <Hero />
        </section>
        
        <section id="talents">
          {!loading && (
            <CreatorSection 
              creators={creators} 
              onOpenModal={setSelectedCreator} 
            />
          )}
        </section>

        <section id="shop" className="min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="animate-pulse font-bold tracking-widest text-zinc-400 uppercase">Loading Gear...</p>
            </div>
          ) : (
            <ProductGrid 
              products={products} 
              onOpenModal={setSelectedProduct}
              selectedProduct={selectedProduct} 
            />
          )}
        </section>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal 
            key="modal-produk"
            product={selectedProduct} 
            close={() => setSelectedProduct(null)} 
          />
        )}
        {selectedCreator && (
           <CreatorModal
            key="modal-creator"
            creator={selectedCreator} 
            close={() => setSelectedCreator(null)} 
           />
        )}
      </AnimatePresence>

      {/* Footer tetep di z-10 biar ga ketutup bunga */}
      <div className="relative z-10">
        <Footer />
      </div>

    </div>
  )
}

export default Home