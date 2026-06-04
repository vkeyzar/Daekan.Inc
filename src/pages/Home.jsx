import React, { useState, useEffect, useMemo, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import ReviewSection from '../components/ReviewSection' 
import SquareProductCard from '../components/SquareProductCard' 
import ProductModal from '../components/ProductModal'
import { useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa' 
import { AnimatePresence } from 'framer-motion'

const Home = () => {
  const [session, setSession] = useState(null) 
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([]) 
  const [selectedProduct, setSelectedProduct] = useState(null)
  const location = useLocation()

  const collabScrollRef = useRef(null)
  const genreScrollRef = useRef(null) 

  const particles = useMemo(() => [...Array(25)].map((_, i) => ({ id: i, left: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 12 + 8}s`, animationDelay: `-${Math.random() * 20}s`, opacity: Math.random() * 0.4 + 0.6, scale: Math.random() * 0.4 + 0.5 })), [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    
    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('created_at', { ascending: false })
      ])
      
      if(prodRes.data) setProducts(prodRes.data)
      if(catRes.data) setCategories(catRes.data)
    }
    fetchData()

    return () => subscription.unsubscribe()
  }, []) 

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 300) 
    }
  }, [location]) 

  const scroll = (ref, direction) => {
    if(ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' })
    }
  }

  // ==========================================
  // 🧠 LOGIC 1: NEW ARRIVALS 
  // ==========================================
  const latestCategory = categories.find(c => products.some(p => p.category_id === c.id))
  const highlightProducts = latestCategory ? products.filter(p => p.category_id === latestCategory.id) : []

  // ==========================================
  // 🧠 LOGIC 2: GENRE CARDS & DETEKSI TAB
  // ==========================================
  const remainingCategories = categories.filter(cat => cat.id !== latestCategory?.id);
  const dbCategoryCards = remainingCategories.map(cat => {
      const catProds = products.filter(p => p.category_id === cat.id);
      if (catProds.length === 0) return null; 
      const randomProd = catProds[Math.floor(Math.random() * catProds.length)];
      // ✅ Cek dia masuk Collab atau Merch buat dikirim ke URL
      const targetTab = (randomProd.product_line || '').toUpperCase().includes('COLLAB') ? 'collab' : 'merch';
      return { id: cat.id, name: cat.name, image: randomProd.image_url, isGenre: true, targetTab }
  }).filter(Boolean);

  const uniqueProductTypes = [...new Set(products.map(p => (p.category || '').toUpperCase()).filter(Boolean))];
  const itemTypeCards = uniqueProductTypes.map(type => {
      const typeProds = products.filter(p => (p.category || '').toUpperCase() === type);
      if (typeProds.length === 0) return null;
      const randomProd = typeProds[Math.floor(Math.random() * typeProds.length)];
      // ✅ Sama, cek tab nya
      const targetTab = (randomProd.product_line || '').toUpperCase().includes('COLLAB') ? 'collab' : 'merch';
      return { id: type, name: type, image: randomProd.image_url, isGenre: false, targetTab }
  }).filter(Boolean);

  const allCollectionCards = [...dbCategoryCards, ...itemTypeCards];

  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      <style>{`@keyframes fall-and-sway { 0% { transform: translateY(-10vh) translateX(-20px) rotate(0deg) scale(var(--scale)); opacity: 0; } 10% { opacity: var(--opacity); } 90% { opacity: var(--opacity); } 100% { transform: translateY(110vh) translateX(30px) rotate(360deg) scale(var(--scale)); opacity: 0; } } .animate-snow { position: absolute; top: 0; animation: fall-and-sway linear infinite; }`}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[0]">
        {particles.map((p) => <img key={p.id} src="https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Paw.png" className="animate-snow w-6 md:w-10" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, '--opacity': p.opacity, '--scale': p.scale, filter: 'drop-shadow(0 0 4px rgba(225,174,207,1)) drop-shadow(0 0 10px rgba(225,174,207,0.8))' }} alt="Paw" />)}
      </div>

      <div className="relative z-10">
        <Navbar />
        <section id="home"><Hero /></section>
        
        <section id="new-arrivals" className="py-24 px-4 md:px-10 max-w-[1400px] mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-sm">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-2">NEW ARRIVALS:</span> 
              <span className="text-vtuber-pink">{latestCategory ? latestCategory.name : 'DAEKAN GEAR'}</span>
            </h2>
            <p className="text-vtuber-purple font-bold tracking-widest text-xs mt-2 uppercase">Official Latest Release</p>
          </div>

          <div className="relative group/slider">
            <div ref={collabScrollRef} className="flex justify-center overflow-x-auto gap-6 snap-x pb-8 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {highlightProducts.length > 0 ? (
                highlightProducts.map(p => <SquareProductCard key={p.id} product={p} onOpenModal={setSelectedProduct} />)
              ) : (
                <p className="text-center w-full text-vtuber-pink font-bold text-sm tracking-widest">NO NEW GEAR FOUND.</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-end mt-24 mb-8 border-b border-vtuber-blue/10 pb-4 px-2">
            <h3 className="text-xl md:text-2xl font-black uppercase text-vtuber-purple tracking-tighter">More Daekan Goods</h3>
            <Link to="/products" className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-vtuber-cyan hover:text-vtuber-pink transition-colors shrink-0">
              View All Products &rarr;
            </Link>
          </div>

          <div className="relative group/slider">
             <button onClick={() => scroll(genreScrollRef, 'left')} className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-vtuber-blue/20 text-vtuber-purple hover:text-vtuber-cyan opacity-0 group-hover/slider:opacity-100 transition-opacity hidden md:block">
              <FaChevronLeft size={16} />
            </button>

            <div ref={genreScrollRef} className="flex overflow-x-auto gap-6 snap-x pb-8 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {allCollectionCards.length > 0 ? (
                allCollectionCards.map(collection => (
                  <Link 
                    key={collection.id} 
                    // ✅ PENGIRIMAN PARAMETER URL (Tab + Genre / Type)
                    to={`/products?tab=${collection.targetTab}&${collection.isGenre ? 'genre' : 'type'}=${collection.id}`} 
                    className="group relative w-[200px] md:w-[240px] shrink-0 aspect-square rounded-[2rem] overflow-hidden border border-vtuber-blue/20 hover:border-vtuber-pink shadow-lg transition-all duration-300 block bg-white"
                  >
                    <img 
                      src={collection.image} 
                      className="w-full h-full object-contain p-4 relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-md" 
                      alt={collection.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20 flex items-end p-6">
                      <div>
                        <p className="text-vtuber-cyan text-[10px] font-bold tracking-[0.2em] uppercase mb-1 drop-shadow-sm">Explore Collection</p>
                        <h3 className="text-white font-black italic uppercase tracking-widest text-lg md:text-xl drop-shadow-md group-hover:text-vtuber-pink transition-colors leading-tight">
                          {collection.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center w-full text-vtuber-pink font-bold text-sm tracking-widest">NO COLLECTIONS FOUND.</p>
              )}
            </div>

            <button onClick={() => scroll(genreScrollRef, 'right')} className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-vtuber-blue/20 text-vtuber-purple hover:text-vtuber-cyan opacity-0 group-hover/slider:opacity-100 transition-opacity hidden md:block">
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