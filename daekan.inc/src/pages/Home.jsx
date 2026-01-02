import React, { useState, useEffect } from 'react'
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
  }, []) // Hanya jalan sekali pas mount

  useEffect(() => {
    // Scroll logic jalan setiap kali URL hash berubah
    if (!loading && location.hash) {
      const id = location.hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 300) // Delay agak lama dikit biar komponen Creator/Shop beneran muncul
      }
    }
  }, [location, loading]) // Re-run pas pindah halaman ATAU loading selesai

  return (
    <div className="min-h-screen bg-white text-gray-900">
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

      <Footer />
    </div>
  )
}

export default Home // 👈 Tadi lo tulis 'export default App', ini yang bikin error