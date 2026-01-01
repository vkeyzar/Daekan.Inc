import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './components/Hero'
import ProductGrid from './components/ProductGrid'
import CreatorSection from './components/CreatorSection'
import ProductModal from './components/ProductModal'
import CreatorModal from './components/CreatorModal'
import { AnimatePresence } from 'framer-motion'
import { supabase } from './lib/supabaseClient';


const App = () => {
  // variabel nyimpen data
  const [products, setProducts] = useState([])
  const [creators, setCreators] = useState([]) // 👈 State baru buat Talent
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCreator, setSelectedCreator] = useState(null) // 👈 Buat Modal Talent
  const [loading, setLoading] = useState(true) 

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('creators') // 👈 Sesuaikan sama nama tabel di Supabase lo
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      if (data) setCreators(data)
    } catch (error) {
      console.error('Error fetching creators:', error.message)
    }
  }

  useEffect(() => {
    // Jalankan dua-duanya pas web dibuka
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchProducts(), fetchCreators()])
      setLoading(false)
    }
    loadData()
  }, [])

  // 2. Fungsi sakti buat ambil data dari database
  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Ambil semua kolom dari tabel 'products'
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true }) // Biar urutannya konsisten

      if (error) throw error
      if (data) setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // 3. Jalankan fungsi fetch pas web pertama kali dibuka
  useEffect(() => {
    fetchProducts()
  }, [])
  

  // Data Produk

  return (
    <div className="min-h-screen bg-white text-gray-900">
      
      {/* Navbar */}
      <Navbar />

      {/* Hero Section (Tulisan Gede di Tengah) */}
      <section id="home">
        <Hero />
        </section>
      
      {/* SECTION 2: TALENTS (Kasih ID 'talents') */}
      <section id="talents">
        {!loading && (
          <CreatorSection 
            creators={creators} 
            onOpenModal={setSelectedCreator} 
          />
        )}
      </section>

      {/* Product Grid (Tempat Pajang Barang) */}
      <section id="shop">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="animate-pulse font-bold tracking-widest text-zinc-400">LOADING GEAR...</p>
          </div>
        ) : (
          <ProductGrid 
            products={products} 
            onOpenModal={setSelectedProduct}
            selectedProduct={selectedProduct} 
          />
        )}
      </section>

      {/* --- MODAL POPUP UPDATE --- */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal 
            key="modal-produk"   // <--- WAJIB: Kasih 'key' biar dia dikenali
            product={selectedProduct} 
            close={() => setSelectedProduct(null)} 
          />
        )}
        {selectedCreator && (
           <CreatorModal
           key="modal-creator"   // <--- WAJIB: Kasih 'key' biar dia dikenali
           creator={selectedCreator} 
           close={() => setSelectedCreator(null)} 
           />
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App