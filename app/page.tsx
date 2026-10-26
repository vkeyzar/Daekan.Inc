"use client";

import React, { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import ReviewSection from '@/components/ReviewSection'
import SquareProductCard from '@/components/SquareProductCard'
import ProductModal from '@/components/ProductModal'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { AnimatePresence } from 'framer-motion'

const Home = () => {
  const [session, setSession] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const collabScrollRef = useRef<HTMLDivElement>(null)
  const genreScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => setSession(session))

    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('created_at', { ascending: false })
      ])

      if (prodRes.data) setProducts(prodRes.data)
      if (catRes.data) setCategories(catRes.data)
    }
    fetchData()

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 300)
    }
  }, [])

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' })
    }
  }

  // ==========================================
  // LOGIC 1: NEW ARRIVALS
  // ==========================================
  const latestCategory = categories.find((c: any) => products.some((p: any) => p.category_id === c.id))
  const highlightProducts = latestCategory ? products.filter((p: any) => p.category_id === latestCategory.id) : []

  // ==========================================
  // LOGIC 2: GENRE CARDS & DETEKSI TAB
  // ==========================================
  const remainingCategories = categories.filter((cat: any) => cat.id !== latestCategory?.id);
  const dbCategoryCards = remainingCategories.map((cat: any) => {
    const catProds = products.filter((p: any) => p.category_id === cat.id);
    if (catProds.length === 0) return null;
    const randomProd = catProds[Math.floor(Math.random() * catProds.length)];
    const targetTab = (randomProd.product_line || '').toUpperCase().includes('COLLAB') ? 'collab' : 'merch';
    return { id: cat.id, name: cat.name, image: randomProd.image_url, isGenre: true, targetTab }
  }).filter(Boolean);

  const uniqueProductTypes = [...new Set(products.map((p: any) => (p.category || '').toUpperCase()).filter(Boolean))];
  const itemTypeCards = uniqueProductTypes.map((type: any) => {
    const typeProds = products.filter((p: any) => (p.category || '').toUpperCase() === type);
    if (typeProds.length === 0) return null;
    const randomProd = typeProds[Math.floor(Math.random() * typeProds.length)];
    const targetTab = (randomProd.product_line || '').toUpperCase().includes('COLLAB') ? 'collab' : 'merch';
    return { id: type, name: type, image: randomProd.image_url, isGenre: false, targetTab }
  }).filter(Boolean);

  const allCollectionCards = [...dbCategoryCards, ...itemTypeCards];

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">

      <div className="relative z-10">
        <Navbar />
        <section id="home"><Hero /></section>

        <section id="new-arrivals" className="py-24 px-4 md:px-10 max-w-[1400px] mx-auto">

          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white">
              NEW ARRIVALS:{' '}
              <span className="text-black dark:text-white">{latestCategory ? latestCategory.name : 'DAEKAN GEAR'}</span>
            </h2>
            <p className="font-bold tracking-widest text-xs mt-2 uppercase text-zinc-600 dark:text-zinc-400">Official Latest Release</p>
          </div>

          <div className="relative group/slider">
            <div ref={collabScrollRef} className="flex overflow-x-auto gap-6 snap-x pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {highlightProducts.length > 0 ? (
                highlightProducts.map((p: any) => <SquareProductCard key={p.id} product={p} onOpenModal={setSelectedProduct} />)
              ) : (
                <p className="text-center w-full font-bold text-sm tracking-widest text-zinc-500 dark:text-zinc-400">NO NEW GEAR FOUND.</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-end mt-24 mb-8 border-b border-black dark:border-white pb-4 px-2">
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white tracking-tighter">More Daekan Goods</h3>
            <Link href="/products" className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-black dark:text-white hover:opacity-60 transition-all shrink-0">
              View All Products &rarr;
            </Link>
          </div>

          <div className="relative group/slider">
            <button onClick={() => scroll(genreScrollRef, 'left')} className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black p-3 border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black opacity-0 group-hover/slider:opacity-100 transition-all hidden md:block">
              <FaChevronLeft size={16} />
            </button>

            <div ref={genreScrollRef} className="flex overflow-x-auto gap-6 snap-x pb-8 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {allCollectionCards.length > 0 ? (
                allCollectionCards.map((collection: any) => (
                  <Link
                    key={collection.id}
                    href={`/products?tab=${collection.targetTab}&${collection.isGenre ? 'genre' : 'type'}=${collection.id}`}
                    className="group relative w-[200px] md:w-[240px] shrink-0 aspect-square overflow-hidden border border-black dark:border-white hover:border-black dark:hover:border-white transition-all duration-300 block bg-white dark:bg-black"
                  >
                    <img
                      src={collection.image}
                      className="w-full h-full object-contain p-4 relative z-10 transition-transform duration-500 group-hover:scale-110"
                      alt={collection.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20 flex items-end p-6">
                      <div>
                        <p className="text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Explore Collection</p>
                        <h3 className="text-white font-black uppercase tracking-widest text-lg md:text-xl leading-tight group-hover:opacity-80 transition-all">
                          {collection.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center w-full font-bold text-sm tracking-widest text-zinc-500 dark:text-zinc-400">NO COLLECTIONS FOUND.</p>
              )}
            </div>

            <button onClick={() => scroll(genreScrollRef, 'right')} className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black p-3 border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black opacity-0 group-hover/slider:opacity-100 transition-all hidden md:block">
              <FaChevronRight size={16} />
            </button>
          </div>
        </section>

        <ReviewSection session={session} />
      </div>

      <AnimatePresence>
        {selectedProduct && <ProductModal product={selectedProduct} close={() => setSelectedProduct(null)} />}
      </AnimatePresence>

      <div className="relative z-10"><Footer /></div>
    </div>
  )
}

export default Home
