'use client';

import React, { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
// import ReviewSection from '@/components/ReviewSection' // moved to /reviews
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const Home = () => {
  const [session, setSession] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [latestProducts, setLatestProducts] = useState<any[]>([])

  const collabScrollRef = useRef<HTMLDivElement>(null)
  const genreScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => setSession(session))

    const fetchData = async () => {
      const [prodRes, catRes, latestRes] = await Promise.all([
        supabase.from('products').select('*, product_stocks(*)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('created_at', { ascending: false }),
        // Fallback default: 3 newest products (until a "new arrivals" category exists)
        supabase.from('products').select('*, product_stocks(*)').order('created_at', { ascending: false }).limit(3)
      ])

      if (latestRes.data) setLatestProducts(latestRes.data)
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

  const latestCategory = categories.find((c: any) => products.some((p: any) => p.category_id === c.id))

  const formatIDR = (price: number | string) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price))

  const getProductImage = (prod: any) => {
    if (!prod) return '';
    if (Array.isArray(prod.image_url)) return prod.image_url[0] || '';
    return prod.image_url || prod.image || '';
  }

  const remainingCategories = categories.filter((cat: any) => cat.id !== latestCategory?.id);
  const dbCategoryCards = remainingCategories.map((cat: any) => {
    const catProds = products.filter((p: any) => p.category_id === cat.id);
    if (catProds.length === 0) return null;
    const randomProd = catProds[Math.floor(Math.random() * catProds.length)];
    const targetTab = (randomProd.product_line || '').toUpperCase().includes('COLLAB') ? 'collab' : 'merch';
    return { id: cat.id, name: cat.name, image: getProductImage(randomProd), isGenre: true, targetTab }
  }).filter(Boolean);

  const uniqueProductTypes = [...new Set(products.map((p: any) => (p.category || '').toUpperCase()).filter(Boolean))];
  const itemTypeCards = uniqueProductTypes.map((type: any) => {
    const typeProds = products.filter((p: any) => (p.category || '').toUpperCase() === type);
    if (typeProds.length === 0) return null;
    const randomProd = typeProds[Math.floor(Math.random() * typeProds.length)];
    const targetTab = (randomProd.product_line || '').toUpperCase().includes('COLLAB') ? 'collab' : 'merch';
    return { id: type, name: type, image: getProductImage(randomProd), isGenre: false, targetTab }
  }).filter(Boolean);

  const allCollectionCards = [...dbCategoryCards, ...itemTypeCards];

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">

      <div className="relative z-10">
        <Navbar />
        <section id="home"><Hero /></section>

        <section id="new-arrivals" className="py-24 w-full">

          <div className="text-center mb-12 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white">
              Latest Drop Just In
            </h2>
            <p className="font-bold tracking-[0.25em] text-[11px] md:text-xs mt-2 uppercase text-zinc-600 dark:text-zinc-400">
              Official Latest Release
            </p>
          </div>

          {latestProducts.length > 0 ? (
            <div
              className={`flex overflow-x-auto snap-x snap-mandatory gap-0 pl-px pt-px pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:grid ${
                latestProducts.length === 1
                  ? 'md:grid-cols-1'
                  : latestProducts.length === 2
                    ? 'md:grid-cols-2'
                    : 'md:grid-cols-3'
              } md:gap-0 md:overflow-hidden`}
            >
              {latestProducts.map((p: any) => {
                const name = p.name || p.title || 'UNKNOWN GEAR'
                const isComingSoon = !p.price || Number(p.price) <= 0
                const isSale = Boolean(p.original_price) && Number(p.original_price) > Number(p.price)
                const isPreOrderExpired =
                  p.label === 'PRE-ORDER' &&
                  Boolean(p.sale_end_date) &&
                  new Date(p.sale_end_date).getTime() <= Date.now()
                const isLimitedOutOfStock =
                  p.label === 'LIMITED GEAR' &&
                  Array.isArray(p.product_stocks) &&
                  (p.product_stocks.length === 0 ||
                    p.product_stocks.every((s: any) => Number(s.stock_physical) - Number(s.stock_reserved) <= 0))
                const isOutOfStock =
                  (p.stock !== undefined && p.stock !== null && Number(p.stock) <= 0) ||
                  isLimitedOutOfStock ||
                  (Array.isArray(p.product_stocks) &&
                    p.product_stocks.length > 0 &&
                    p.product_stocks.every((s: any) => Number(s.stock_physical) - Number(s.stock_reserved) <= 0))
                const soldOut = p.is_open === false || isPreOrderExpired || isOutOfStock
                const showSaleBadge = isSale && !isComingSoon && !soldOut
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className={`group cursor-pointer shrink-0 ${
                      latestProducts.length === 1 ? 'w-full' : 'w-[78%] sm:w-[60%]'
                    } md:w-auto -ml-px -mt-px snap-start relative hover:z-10 border border-black dark:border-white bg-white dark:bg-black overflow-hidden transition-all duration-300`}
                  >
                    {showSaleBadge && (
                      <div className="absolute top-0 left-0 bg-black dark:bg-white text-white dark:text-black px-3.5 py-1.5 md:px-5 md:py-2.5 z-[9] flex flex-col items-center justify-center">
                        <span className="text-xs md:text-base font-black tracking-widest leading-none uppercase">
                          SALE
                        </span>
                      </div>
                    )}
                    <div className="relative aspect-square overflow-hidden border-b border-black dark:border-white">
                      <img
                        src={getProductImage(p) || 'https://via.placeholder.com/300?text=No+Image'}
                        alt={name}
                        className="w-full h-full object-contain p-4 transition-transform duration-500 relative z-[5] group-hover:scale-105 [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.35))] dark:[filter:drop-shadow(0_0_3px_rgba(255,255,255,0.9))_drop-shadow(0_0_12px_rgba(125,211,252,0.9))_drop-shadow(0_0_28px_rgba(125,211,252,0.7))_drop-shadow(0_0_48px_rgba(167,139,250,0.6))]"
                      />
                      {soldOut && !isComingSoon && (
                        <span className="absolute bottom-0 left-0 z-10 bg-white border border-black text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-1 leading-none">
                          Sold Out
                        </span>
                      )}
                    </div>
                    <div className="p-3 md:p-4 text-left">
                      <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.1em] line-clamp-2 leading-tight text-black dark:text-white" title={name}>
                        {name}
                      </h3>
                      {isComingSoon ? (
                        <p className="mt-1 text-xs md:text-sm font-bold text-zinc-600 dark:text-zinc-400">Coming Soon</p>
                      ) : (
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          {isSale && !soldOut && (
                            <p className="text-[11px] md:text-xs text-zinc-500 dark:text-zinc-400 line-through font-bold">
                              {formatIDR(p.original_price)}
                            </p>
                          )}
                          <p className="text-xs md:text-sm font-bold text-zinc-600 dark:text-zinc-400">
                            {formatIDR(p.price)}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-center w-full font-bold text-xs tracking-[0.2em] text-zinc-500 dark:text-zinc-400">NO NEW GEAR FOUND.</p>
          )}

          <div className="flex justify-center mt-10">
            <Link
              href="/products"
              className="inline-block bg-black text-white rounded-none px-10 py-3 text-xs font-black uppercase tracking-[0.2em] border border-black dark:border-white hover:opacity-80 transition-opacity"
            >
              View all
            </Link>
          </div>

          {/* HIDDEN TEMPORARILY: More Daekan Goods
          <div className="flex justify-between items-end mt-24 mb-8 border-b border-black dark:border-white pb-4 px-2">
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white tracking-tighter">More Daekan Goods</h3>
            <Link href="/products" className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white hover:opacity-60 transition-all shrink-0">
              View All Products &rarr;
            </Link>
          </div>

          <div className="relative group/slider">
            <button onClick={() => scroll(genreScrollRef, 'left')} className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black p-3 border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black opacity-0 group-hover/slider:opacity-100 transition-all hidden md:block cursor-pointer">
              <FaChevronLeft size={14} />
            </button>

            <div ref={genreScrollRef} className="flex overflow-x-auto gap-6 snap-x pb-8 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {allCollectionCards.length > 0 ? (
                allCollectionCards.map((collection: any) => (
                  <Link
                    key={collection.id}
                    href={`/products?${collection.isGenre ? 'genre' : 'type'}=${encodeURIComponent(String(collection.id))}`}
                    className="group relative w-[200px] md:w-[240px] shrink-0 aspect-square overflow-hidden border border-black dark:border-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 block bg-white dark:bg-black"
                  >
                    <img
                      src={collection.image}
                      className="w-full h-full object-contain p-4 relative z-10 transition-transform duration-500 group-hover:scale-110"
                      alt={collection.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent z-20 flex items-end p-6">
                      <div>
                        <p className="text-zinc-200 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Explore Collection</p>
                        <h3 className="text-white font-black uppercase tracking-widest text-base md:text-lg leading-tight group-hover:opacity-80 transition-all">
                          {collection.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center w-full font-bold text-xs tracking-[0.2em] text-zinc-500 dark:text-zinc-400">NO COLLECTIONS FOUND.</p>
              )}
            </div>

            <button onClick={() => scroll(genreScrollRef, 'right')} className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black p-3 border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black opacity-0 group-hover/slider:opacity-100 transition-all hidden md:block cursor-pointer">
              <FaChevronRight size={14} />
            </button>
          </div>
          */}
        </section>

        {/* HIDDEN: Customer reviews moved to /reviews
        <ReviewSection session={session} />
        */}
      </div>

      <div className="relative z-10"><Footer /></div>
    </div>
  )
}

export default Home
