'use client'
import React, { useState, useMemo, useEffect } from 'react'
import ProductCard from './ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa'
import { useSearchParams } from 'next/navigation'

const ProductGrid = ({ products, categories, onOpenModal, selectedProduct }: { products: any[]; categories: any[]; onOpenModal: (product: any) => void; selectedProduct: any }) => {
  const searchParams = useSearchParams();

  const [mainTab, setMainTab] = useState(searchParams?.get('tab') || 'collab')
  const [selectedGenre, setSelectedGenre] = useState(searchParams?.get('genre') || 'ALL')
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('type') || 'ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('sale-first')

  useEffect(() => {
    const tab = searchParams?.get('tab');
    const genre = searchParams?.get('genre');
    const type = searchParams?.get('type');

    if (tab) setMainTab(tab);
    if (genre) setSelectedGenre(genre); else setSelectedGenre('ALL');
    if (type) setSelectedCategory(type); else setSelectedCategory('ALL');
  }, [searchParams]);

  const fadeUp = { hidden: { opacity: 0, y: 100 }, visible: { opacity: 1, y: 0 } }

  const handleTabChange = (tab: string) => {
    setMainTab(tab)
    setSelectedGenre('ALL')
    setSelectedCategory('ALL')
    setSearchTerm('')
  }

  const processedProducts = useMemo(() => {
    let result = [...products]

    result = result.filter(p => {
      const line = (p.product_line || '').toUpperCase()
      const isCollab = line.includes('COLLAB')
      return mainTab === 'collab' ? isCollab : !isCollab
    })

    if (searchTerm) result = result.filter(p => (p.name || p.title || '').toLowerCase().includes(searchTerm.toLowerCase()))
    if (selectedGenre !== 'ALL') result = result.filter(p => String(p.category_id) === String(selectedGenre))
    if (selectedCategory !== 'ALL') result = result.filter(p => (p.category || '').toUpperCase() === selectedCategory)

    result.sort((a, b) => {
      if (sortBy === 'sale-first') return Number(b.original_price > b.price) - Number(a.original_price > a.price);
      if (sortBy === 'newest') return b.id - a.id
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'az') return (a.name || a.title || '').localeCompare(b.name || b.title || '')
      return 0
    })

    return result
  }, [products, mainTab, searchTerm, selectedGenre, selectedCategory, sortBy])

  const itemTypes = useMemo(() => {
    const filteredByTab = products.filter((p: any) => {
      const line = (p.product_line || '').toUpperCase()
      const isCollab = line.includes('COLLAB')
      return mainTab === 'collab' ? isCollab : !isCollab
    })
    const uniqueTypes = new Set<string>(filteredByTab.map((p: any) => (p.category || '').toUpperCase()).filter(Boolean))
    return ['ALL', ...Array.from(uniqueTypes)]
  }, [products, mainTab])

  return (
    <div className="w-full bg-white dark:bg-black text-black dark:text-white pb-20 px-4 md:px-10 relative z-10 font-sans">

      <div className="flex flex-col items-center mb-14 pt-4">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-10 text-center text-black dark:text-white">
          OUR PRODUCTS
        </h2>

        <div className="flex border border-black dark:border-white overflow-x-auto max-w-full">
          <button
            onClick={() => handleTabChange('collab')}
            className={`px-6 md:px-10 py-3 font-black text-[11px] md:text-xs tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap cursor-pointer ${mainTab === 'collab' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
          >
            VTUBER COLLABS
          </button>
          <button
            onClick={() => handleTabChange('merch')}
            className={`px-6 md:px-10 py-3 font-black text-[11px] md:text-xs tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap border-l border-black dark:border-white cursor-pointer ${mainTab === 'merch' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
          >
            DAEKAN MERCH
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 pb-6 border-b border-black dark:border-white">

          <div className="relative w-full md:w-1/4 z-20 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white" size={12} />
            <input
              type="text"
              placeholder="SEARCH..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-black border border-black dark:border-white pl-10 pr-4 py-3 text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase focus:outline-none transition-all text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap w-full md:w-auto gap-3 md:gap-4 z-20 justify-center">

            <div className="relative w-full sm:w-auto group">
              <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black dark:text-white" size={11} />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-black border border-black dark:border-white pl-9 pr-8 py-3 text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase focus:outline-none transition-all text-black dark:text-white cursor-pointer"
              >
                <option value="ALL">ALL GENRES</option>
                {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="relative w-full sm:w-auto group">
              <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black dark:text-white" size={11} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-black border border-black dark:border-white pl-9 pr-8 py-3 text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase focus:outline-none transition-all text-black dark:text-white cursor-pointer"
              >
                {itemTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="relative col-span-2 sm:w-auto group">
              <FaSortAmountDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black dark:text-white" size={11} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-black border border-black dark:border-white pl-9 pr-8 py-3 text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase focus:outline-none transition-all text-black dark:text-white cursor-pointer"
              >
                <option value="sale-first">SALE FIRST</option>
                <option value="newest">NEWEST</option>
                <option value="az">A - Z</option>
                <option value="price-low">LOW - HIGH</option>
                <option value="price-high">HIGH - LOW</option>
              </select>
            </div>

          </div>
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.8, delay: 0.2 }} variants={fadeUp} className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 w-full">
          <AnimatePresence>
            {processedProducts.length > 0 ? (
              processedProducts.map((product) => (
                <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex-none">
                  <ProductCard product={product} onOpenModal={onOpenModal} isAnyModalOpen={selectedProduct !== null} />
                </motion.div>
              ))
            ) : (
              <div className="w-full py-20 text-center">
                <p className="font-bold text-xs tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400">No gear found in this section.</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductGrid
