'use client'
import React, { useState, useMemo, useEffect, useRef } from 'react'
import ProductCard from './ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { FaFilter, FaSortAmountDown, FaChevronDown, FaCheck } from 'react-icons/fa'
import { useSearchParams } from 'next/navigation'

type DropdownOption = { value: string; label: string }

export type ProductGridMode = 'all' | 'collabs' | 'merch'

interface ProductGridProps {
  products: any[]
  categories: any[]
  mode?: ProductGridMode
  title?: string
  onOpenModal?: (product: any) => void
  selectedProduct?: any
}

const Dropdown = ({ value, onChange, options, icon, label, className = '' }: { value: string; onChange: (v: string) => void; options: DropdownOption[]; icon: React.ReactNode; label: string; className?: string }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('keydown', key)
    }
  }, [])

  const current = options.find(o => String(o.value) === String(value))

  return (
    <div ref={ref} className={`relative ${open ? 'z-40' : 'z-20'} ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 min-h-[46px] px-3.5 sm:px-4 bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white text-[11px] md:text-xs font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 active:bg-zinc-100 dark:active:bg-zinc-800 focus:outline-none"
      >
        <span className="shrink-0 opacity-80">{icon}</span>
        <span className="flex-1 text-left truncate">{current?.label ?? label}</span>
        <FaChevronDown size={10} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 sm:right-auto sm:min-w-full top-full mt-1.5 max-h-64 overflow-y-auto bg-white dark:bg-zinc-950 border border-black dark:border-white shadow-xl dark:shadow-[0_8px_30px_rgba(255,255,255,0.08)] py-1"
          >
            {options.map(opt => {
              const active = String(opt.value) === String(value)
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false) }}
                    className={`w-full flex items-center justify-between gap-6 min-h-[44px] px-4 py-2.5 text-left whitespace-nowrap text-[11px] md:text-xs font-bold tracking-[0.15em] uppercase cursor-pointer transition-colors ${active ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  >
                    {opt.label}
                    {active && <FaCheck size={10} />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

const DEFAULT_TITLES: Record<ProductGridMode, string> = {
  all: 'ALL PRODUCTS',
  collabs: 'VTUBER COLLABS',
  merch: 'DAEKAN MERCH',
}

const ProductGrid = ({ products, categories, mode = 'all', title }: ProductGridProps) => {
  const searchParams = useSearchParams()

  const [selectedGenre, setSelectedGenre] = useState(searchParams?.get('genre') || 'ALL')
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('type') || 'ALL')
  const [sortBy, setSortBy] = useState('newest')

  const showFilters = mode === 'all' || mode === 'merch'
  const headingTitle = title || DEFAULT_TITLES[mode]

  useEffect(() => {
    const genre = searchParams?.get('genre')
    const type = searchParams?.get('type')

    if (genre) setSelectedGenre(genre)
    else setSelectedGenre('ALL')

    if (type) setSelectedCategory(type)
    else setSelectedCategory('ALL')
  }, [searchParams])

  const fadeUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } }

  const lineFilteredProducts = useMemo(() => {
    if (mode === 'all') return products
    return products.filter((p) => {
      const line = (p.product_line || '').toUpperCase()
      const isCollab = line.includes('COLLAB')
      return mode === 'collabs' ? isCollab : !isCollab
    })
  }, [products, mode])

  const processedProducts = useMemo(() => {
    let result = [...lineFilteredProducts]

    if (showFilters) {
      if (selectedGenre !== 'ALL') {
        result = result.filter(p => String(p.category_id) === String(selectedGenre))
      }
      if (selectedCategory !== 'ALL') {
        result = result.filter(p => (p.category || '').toUpperCase() === selectedCategory)
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'sale-first') return Number(b.original_price > b.price) - Number(a.original_price > a.price)
      if (sortBy === 'newest') return b.id - a.id
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'az') return (a.name || a.title || '').localeCompare(b.name || b.title || '')
      return 0
    })

    return result
  }, [lineFilteredProducts, showFilters, selectedGenre, selectedCategory, sortBy])

  const availableCategories = useMemo(() => {
    if (mode === 'all') return categories
    const categoryIds = new Set(lineFilteredProducts.map((p: any) => String(p.category_id)).filter(Boolean))
    const filtered = categories.filter((cat: any) => categoryIds.has(String(cat.id)))
    return filtered.length > 0 ? filtered : categories
  }, [categories, lineFilteredProducts, mode])

  const itemTypes = useMemo(() => {
    const uniqueTypes = new Set<string>(
      lineFilteredProducts.map((p: any) => (p.category || '').toUpperCase()).filter(Boolean)
    )
    return ['ALL', ...Array.from(uniqueTypes)]
  }, [lineFilteredProducts])

  return (
    <div className="w-full bg-white dark:bg-black text-black dark:text-white pb-20 px-0 relative z-10 font-sans">

      <div className="flex flex-col items-center mb-8 sm:mb-12 pt-2 sm:pt-4 px-4 sm:px-6 md:px-10">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-center text-black dark:text-white">
          {headingTitle}
        </h1>
      </div>

      <div className="w-full">
        {showFilters && (
          <div className="mx-3 sm:mx-6 md:mx-10 flex flex-col md:flex-row justify-end items-stretch md:items-center gap-2.5 sm:gap-3 mb-6 md:mb-8 pb-1">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap w-full md:w-auto gap-2.5 sm:gap-3 md:gap-4 sm:justify-end">
              <Dropdown
                label="Genre"
                value={selectedGenre}
                onChange={setSelectedGenre}
                icon={<FaFilter size={11} />}
                className="sm:min-w-[170px]"
                options={[
                  { value: 'ALL', label: 'ALL GENRES' },
                  ...availableCategories.map((cat: any) => ({ value: String(cat.id), label: String(cat.name) }))
                ]}
              />
              <Dropdown
                label="Kategori"
                value={selectedCategory}
                onChange={setSelectedCategory}
                icon={<FaFilter size={11} />}
                className="sm:min-w-[150px]"
                options={itemTypes.map(t => ({ value: t, label: t }))}
              />
              <Dropdown
                label="Sorting"
                value={sortBy}
                onChange={setSortBy}
                icon={<FaSortAmountDown size={11} />}
                className="col-span-2 sm:col-span-1 sm:min-w-[180px]"
                options={[
                  { value: 'newest', label: 'TERBARU' },
                  { value: 'price-low', label: 'HARGA TERENDAH' },
                  { value: 'price-high', label: 'HARGA TERTINGGI' }
                ]}
              />
            </div>
          </div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-0 w-full pl-px pt-px overflow-hidden"
        >
          <AnimatePresence>
            {processedProducts.length > 0 ? (
              processedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="-ml-px -mt-px relative hover:z-10"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full w-full py-20 text-center">
                <p className="font-bold text-xs tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400">
                  No gear found in this section.
                </p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductGrid
