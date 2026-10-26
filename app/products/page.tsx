'use client';

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductGrid from '@/components/ProductGrid'
import ProductModal from '@/components/ProductModal'
import { AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

const Products = () => {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: true }),
        supabase.from('categories').select('*')
      ])

      if (!prodRes.error) setProducts(prodRes.data || [])
      if (!catRes.error) setCategories(catRes.data || [])
      setLoading(false)
    }
    fetchData()
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans">

      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24">
          {loading ? (
            <div className="flex justify-center items-center h-[50vh]">
              <p className="animate-pulse font-bold tracking-widest text-black dark:text-white uppercase">Loading Gear...</p>
            </div>
          ) : (
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
