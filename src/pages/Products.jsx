import React, { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductGrid from '../components/ProductGrid'
import ProductModal from '../components/ProductModal'
import { AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([]) // ✅ State buat nyimpen genre
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const particles = useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 12 + 8}s`,
      animationDelay: `-${Math.random() * 20}s`,
      opacity: Math.random() * 0.4 + 0.6,
      scale: Math.random() * 0.4 + 0.5,
    }))
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // ✅ Fetch products sama categories barengan
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: true }),
        supabase.from('categories').select('*')
      ])
      
      if (!prodRes.error) setProducts(prodRes.data)
      if (!catRes.error) setCategories(catRes.data)
      setLoading(false)
    }
    fetchData()
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="relative min-h-screen bg-white text-gray-900 flex flex-col">
      <style>{`@keyframes fall-and-sway { 0% { transform: translateY(-10vh) translateX(-20px) rotate(0deg) scale(var(--scale)); opacity: 0; } 10% { opacity: var(--opacity); } 90% { opacity: var(--opacity); } 100% { transform: translateY(110vh) translateX(30px) rotate(360deg) scale(var(--scale)); opacity: 0; } } .animate-snow { position: absolute; top: 0; animation: fall-and-sway linear infinite; }`}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[0]">
        {particles.map((p) => (
          <img key={p.id} src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Paw.png" className="animate-snow w-6 md:w-10" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, '--opacity': p.opacity, '--scale': p.scale, filter: 'drop-shadow(0 0 4px rgba(225,174,207,1)) drop-shadow(0 0 10px rgba(225,174,207,0.8))' }} alt="Falling Paw" />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24">
          {loading ? (
            <div className="flex justify-center items-center h-[50vh]">
              <p className="animate-pulse font-bold tracking-widest text-vtuber-purple uppercase">Loading Gear...</p>
            </div>
          ) : (
            // ✅ Oper state categories ke ProductGrid
            <ProductGrid products={products} categories={categories} onOpenModal={setSelectedProduct} selectedProduct={selectedProduct} />
          )}
        </div>
        <Footer />
      </div>

      <AnimatePresence>
        {selectedProduct && <ProductModal product={selectedProduct} close={() => setSelectedProduct(null)} />}
      </AnimatePresence>
    </div>
  )
}

export default Products