import React from 'react'
import ProductCard from './ProductCard'
import { motion } from 'framer-motion'

const ProductGrid = ({ products, onOpenModal, selectedProduct }) => {
  const fadeUp = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="w-full bg-white text-black pt-32 pb-20 px-4 md:px-10">
      
      {/* HEADER*/}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }} 
        transition={{ duration: 0.8 }}
        variants={fadeUp}
        className="text-center mb-16"
      >
        <h2 className="text-5xl md:text-6xl font-black uppercase text-black tracking-tighter mb-4">
          OFFICIAL <span className="text-gray-400">MERCH</span>
        </h2>
        <p className="text-gray-500 tracking-widest text-sm uppercase">
          Shapes Idea Into Your Personality.
        </p>
      </motion.div>

      {/* GRID PRODUK*/}
        <div className="flex justify-center w-full">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            variants={fadeUp}
            className="flex flex-wrap justify-center gap-10 mx-auto w-full max-w-7xl"
          >
            {products.map((product) => (
              <div key={product.id} className="flex-none"> {/* Bungkus dikit biar ukurannya stabil */}
                <ProductCard 
                  product={product} 
                  onOpenModal={onOpenModal}
                  isAnyModalOpen={selectedProduct !== null} 
                />
              </div>
            ))}
          </motion.div>
        </div>
    </div>
  )
}

export default ProductGrid