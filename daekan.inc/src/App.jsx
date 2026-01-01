import React, { useState } from 'react'
import { Analytics } from "@vercel/analytics/next"
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './components/Hero'
import ProductGrid from './components/ProductGrid'
import CreatorSection from './components/CreatorSection'
import ProductModal from './components/ProductModal'
import CreatorModal from './components/CreatorModal'
import { AnimatePresence } from 'framer-motion'
import { products } from './components/data';


function App() {
  // variabel nyimpen data
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCreator, setSelectedCreator] = useState(null) 

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
        <CreatorSection
        onOpenModal={setSelectedCreator}
        />
      </section>

      {/* Product Grid (Tempat Pajang Barang) */}
      <section id="shop">
        <ProductGrid 
        products={products} 
        onOpenModal={setSelectedProduct} 
        />
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