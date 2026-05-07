import React, { useState, useMemo } from 'react'
import ProductCard from './ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa'

const ProductGrid = ({ products, onOpenModal, selectedProduct }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState('sale-first') // Default sort

  const fadeUp = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0 }
  }

  // --- AMBIL KATEGORI DINAMIS ---
  const categories = useMemo(() => {
    const uniqueCats = new Set(products.map(p => p.category || p.label).filter(Boolean))
    return ['ALL', ...Array.from(uniqueCats)]
  }, [products])

  // --- LOGIC FILTER & SORT ---
  const processedProducts = useMemo(() => {
    let result = [...products]

    // 1. Filter by Search
    if (searchTerm) {
      result = result.filter(p => 
        (p.name || p.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 2. Filter by Category
    if (selectedCategory !== 'ALL') {
      result = result.filter(p => (p.category || p.label) === selectedCategory)
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === 'sale-first') {
        const aIsSale = a.original_price && a.original_price > a.price;
        const bIsSale = b.original_price && b.original_price > b.price;
        return bIsSale - aIsSale; // Sale di atas
      }
      if (sortBy === 'newest') return b.id - a.id
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'az') return (a.name || a.title || '').localeCompare(b.name || b.title || '')
      return 0
    })

    return result
  }, [products, searchTerm, selectedCategory, sortBy])

  return (
    <div className="w-full bg-transparent text-black pt-32 pb-20 px-4 md:px-10 relative z-10">
      
      {/* HEADER */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }} 
        transition={{ duration: 0.8 }}
        variants={fadeUp}
        className="text-center mb-16"
      >
        <h2 className="text-5xl md:text-6xl font-black uppercase text-black tracking-tighter mb-4 drop-shadow-sm">
          OFFICIAL <span className="text-gray-400">MERCH</span>
        </h2>
        <p className="text-gray-500 tracking-widest text-sm uppercase font-medium">
          Shapes Idea Into Your Personality.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto w-full">
        {/* --- CONTROL PANEL: SEARCH, FILTER, SORT --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 pb-6 border-b border-zinc-200">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3 z-20">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="SEARCH GEAR..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-sm border border-zinc-200 pl-12 pr-4 py-3 rounded-xl text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex w-full md:w-auto gap-4 z-20">
            {/* Filter Kategori */}
            <div className="relative w-1/2 md:w-auto">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={12} />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-zinc-200 pl-10 pr-10 py-3 rounded-xl text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-black cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-1/2 md:w-auto">
              <FaSortAmountDown className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={12} />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-zinc-200 pl-10 pr-10 py-3 rounded-xl text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="sale-first">SALE FIRST</option>
                <option value="newest">NEWEST</option>
                <option value="az">A - Z</option>
                <option value="price-low">PRICE: LOW - HIGH</option>
                <option value="price-high">PRICE: HIGH - LOW</option>
              </select>
            </div>
          </div>
        </div>

        {/* GRID PRODUK */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          variants={fadeUp}
          className="flex flex-wrap justify-center gap-10 w-full"
        >
          <AnimatePresence>
            {processedProducts.length > 0 ? (
              processedProducts.map((product) => (
                <motion.div 
                  key={product.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-none"
                >
                  <ProductCard 
                    product={product} 
                    onOpenModal={onOpenModal}
                    isAnyModalOpen={selectedProduct !== null} 
                  />
                </motion.div>
              ))
            ) : (
              <div className="w-full py-20 text-center">
                <p className="text-zinc-400 font-bold tracking-widest uppercase">No gear found matching your criteria.</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductGrid