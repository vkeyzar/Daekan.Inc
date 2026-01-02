import React from 'react'
import ProductCard from './ProductCard' // <--- Panggil si kartu tadi
import { motion } from 'framer-motion'

const ProductGrid = ({ products, onOpenModal, selectedProduct }) => {
  
  // Settingan Animasi: Mulai dari bawah (y: 100) dan Transparan (opacity: 0)
  const fadeUp = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="w-full bg-white text-black pt-32 pb-20 px-4 md:px-10">
      
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
            <ProductCard 
              key={product.id} 
              product={product} 
              onOpenModal={onOpenModal}
              isAnyModalOpen={selectedProduct !== null} 
            />
        ))}
      </motion.div>

    </div>
  )
}

export default ProductGrid