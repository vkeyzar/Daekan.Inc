import React, { useState, useMemo } from 'react'
import ProductCard from './ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa'

const ProductGrid = ({ products, onOpenModal, selectedProduct }) => {
  const [mainTab, setMainTab] = useState('collab') 
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState('sale-first')

  const fadeUp = { hidden: { opacity: 0, y: 100 }, visible: { opacity: 1, y: 0 } }

  // ✅ LOGIC FILTERING TINGKAT TINGGI DENGAN DATABASE BARU
  const processedProducts = useMemo(() => {
    let result = [...products]

    // 1. Filter TABS (Berdasarkan kolom product_line)
    result = result.filter(p => {
      const line = (p.product_line || '').toUpperCase()
      const isCollab = line.includes('COLLAB')
      return mainTab === 'collab' ? isCollab : !isCollab
    })

    // 2. Search Text
    if (searchTerm) result = result.filter(p => (p.name || p.title || '').toLowerCase().includes(searchTerm.toLowerCase()))
    
    // 3. Filter Jenis Barang (Berdasarkan kolom category: T-shirt, Deskmat, dll)
    if (selectedCategory !== 'ALL') result = result.filter(p => (p.category || '').toUpperCase() === selectedCategory)

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'sale-first') return (b.original_price > b.price) - (a.original_price > a.price); 
      if (sortBy === 'newest') return b.id - a.id
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'az') return (a.name || a.title || '').localeCompare(b.name || b.title || '')
      return 0
    })

    return result
  }, [products, mainTab, searchTerm, selectedCategory, sortBy])

  // ✅ UPDATE KATEGORI DINAMIS (Munculin Jenis Barang: T-Shirt, Deskmat, dll)
  const categories = useMemo(() => {
    const filteredByTab = products.filter(p => {
      const line = (p.product_line || '').toUpperCase()
      const isCollab = line.includes('COLLAB')
      return mainTab === 'collab' ? isCollab : !isCollab
    })
    const uniqueCats = new Set(filteredByTab.map(p => (p.category || '').toUpperCase()).filter(Boolean))
    return ['ALL', ...Array.from(uniqueCats)]
  }, [products, mainTab])

  // RESET KATEGORI & SEARCH KALAU PINDAH TAB
  React.useEffect(() => { setSelectedCategory('ALL'); setSearchTerm(''); }, [mainTab])

  return (
    <div className="w-full bg-transparent text-black pb-20 px-4 md:px-10 relative z-10">
      
      <div className="flex flex-col items-center mb-16 pt-8">
        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-10 drop-shadow-sm text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-2">OUR</span>
          <span className="text-vtuber-pink">PRODUCTS</span>
        </h2>
        
        {/* TABS COLLAB VS MERCH */}
        <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-full border border-vtuber-blue/20 shadow-[0_10px_30px_rgba(164,229,250,0.15)] overflow-x-auto max-w-full">
          <button 
            onClick={() => setMainTab('collab')}
            className={`px-6 md:px-10 py-3 rounded-full font-black text-[10px] md:text-sm tracking-[0.2em] uppercase transition-all duration-500 whitespace-nowrap ${mainTab === 'collab' ? 'bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white shadow-[0_5px_15px_rgba(164,229,250,0.5)]' : 'text-vtuber-purple hover:text-vtuber-cyan'}`}
          >
            DAEKAN X ASUKA JETTO
          </button>
          <button 
            onClick={() => setMainTab('merch')}
            className={`px-6 md:px-10 py-3 rounded-full font-black text-[10px] md:text-sm tracking-[0.2em] uppercase transition-all duration-500 whitespace-nowrap ${mainTab === 'merch' ? 'bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white shadow-[0_5px_15px_rgba(164,229,250,0.5)]' : 'text-vtuber-purple hover:text-vtuber-cyan'}`}
          >
            DAEKAN MERCH
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        {/* CONTROL PANEL FILTER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 pb-6 border-b border-vtuber-pink/20">
          <div className="relative w-full md:w-1/3 z-20 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-vtuber-purple group-focus-within:text-vtuber-cyan transition-colors" />
            <input type="text" placeholder="SEARCH GEAR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/60 backdrop-blur-md border border-vtuber-blue/30 pl-12 pr-4 py-3 rounded-2xl text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-vtuber-cyan focus:shadow-[0_0_15px_rgba(164,229,250,0.4)] transition-all text-vtuber-purple placeholder:text-vtuber-purple/50" />
          </div>
          <div className="flex w-full md:w-auto gap-4 z-20">
            <div className="relative w-1/2 md:w-auto group">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-vtuber-purple group-hover:text-vtuber-cyan transition-colors" size={12} />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full appearance-none bg-white/60 backdrop-blur-md border border-vtuber-blue/30 pl-10 pr-10 py-3 rounded-2xl text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-vtuber-cyan focus:shadow-[0_0_15px_rgba(164,229,250,0.4)] hover:border-vtuber-cyan transition-all text-vtuber-purple cursor-pointer">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="relative w-1/2 md:w-auto group">
              <FaSortAmountDown className="absolute left-4 top-1/2 -translate-y-1/2 text-vtuber-purple group-hover:text-vtuber-cyan transition-colors" size={12} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full appearance-none bg-white/60 backdrop-blur-md border border-vtuber-blue/30 pl-10 pr-10 py-3 rounded-2xl text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-vtuber-cyan focus:shadow-[0_0_15px_rgba(164,229,250,0.4)] hover:border-vtuber-cyan transition-all text-vtuber-purple cursor-pointer">
                <option value="sale-first">SALE FIRST</option><option value="newest">NEWEST</option><option value="az">A - Z</option><option value="price-low">LOW - HIGH</option><option value="price-high">HIGH - LOW</option>
              </select>
            </div>
          </div>
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.8, delay: 0.2 }} variants={fadeUp} className="flex flex-wrap justify-center gap-10 w-full">
          <AnimatePresence>
            {processedProducts.length > 0 ? (
              processedProducts.map((product) => (
                <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex-none">
                  <ProductCard product={product} onOpenModal={onOpenModal} isAnyModalOpen={selectedProduct !== null} />
                </motion.div>
              ))
            ) : (
              <div className="w-full py-20 text-center"><p className="text-vtuber-pink font-bold tracking-widest uppercase">No gear found in this section.</p></div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductGrid