import React from 'react'
import ProductCard from './ProductCard' // <--- Panggil si kartu tadi
import { motion } from 'framer-motion'

const ProductGrid = ({ products, onOpenModal }) => {
  
  // Settingan Animasi: Mulai dari bawah (y: 100) dan Transparan (opacity: 0)
  const fadeUp = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 pb-20 overflow-hidden">
      
      {/* HEADER: KITA UMPETIN DULU */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        // 👇 MAGIC-NYA DISINI: 'amount: 0.5' 
        // Artinya: Tunggu sampe 50% elemen ini masuk layar, baru animasi jalan.
        viewport={{ once: true, amount: 0.5 }} 
        transition={{ duration: 0.8 }}
        variants={fadeUp}
        className="text-center mb-16"
      >
        <h2 className="text-5xl md:text-6xl font-black uppercase text-black tracking-tighter mb-4">
          OFFICIAL <span className="text-gray-400">MERCH</span>
        </h2>
        <p className="text-gray-500 tracking-widest text-sm uppercase">
          PREMIUM GEAR USED BY OUR CREATORS.
        </p>
      </motion.div>

      {/* GRID PRODUK: Muncul belakangan (Delay 0.2 detik) */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
      >
        {products.map((product) => (
          <div 
            key={product.id}
            onClick={() => onOpenModal(product)}
            className="bg-white rounded-xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            
            <div className="h-64 overflow-hidden relative bg-gray-100">
               <img 
                 src={product.image} 
                 alt={product.name} 
                 className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
               />
               <div className="absolute top-4 right-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {product.category}
               </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-black mb-2 italic uppercase">{product.name}</h3>
              <div className="flex justify-between items-center">
                 <p className="text-gray-500 text-sm">Limited Edition</p>
                 <p className="text-black font-bold text-lg">{product.price}</p>
              </div>
            </div>

          </div>
        ))}
      </motion.div>

    </div>
  )
}

export default ProductGrid