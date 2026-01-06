import React from 'react'
import { FaInstagram } from "react-icons/fa";
import { SiShopee, SiGoogleforms } from "react-icons/si";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";

const ProductModal = ({ product, close }) => {
  // --- BAGIAN TAMBAHAN 1: Cek apakah ada link yang tersedia ---
  const hasAnyLink = product.instagram || product.tokopedia || product.shopee || product.gform;

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm"
        onClick={close}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            
            className="bg-white rounded-xl max-w-7xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:h-auto"
            onClick={(e) => e.stopPropagation()}
            >
            
            <button 
              onClick={close}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500 hover:text-black z-50 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md"
            >
                <IoClose className="w-6 h-6" />
            </button>

            <div className="w-full md:w-[60%] bg-gray-50 flex items-center justify-center relative h-64 md:h-auto shrink-0">
               <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-4" 
                />
            </div>

            <div className="w-full md:w-[40%] p-6 md:p-10 flex flex-col justify-start md:justify-center bg-white overflow-y-auto">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">{product.name}</h2>
                <p className="text-2xl text-gray-900 font-bold mb-6">IDR {product.price}</p>
                
                <div className="text-sm text-gray-600 mb-8 border-t border-b py-4">
                  <p className="whitespace-pre-line leading-relaxed">
                    {product.description || "No description available for this premium gear."}
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:gap-3">
                  {/* --- BAGIAN TAMBAHAN 2: Logic Conditional Rendering --- */}
                  {hasAnyLink ? (
                    <>
                      {product.instagram && (
                        <a href={product.instagram} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold uppercase text-xs md:text-sm tracking-widest hover:opacity-90 transition shadow-md">
                          <FaInstagram className="w-5 h-5"/> Order via Instagram
                        </a>
                      )}
                      {product.tokopedia && (
                        <a href={product.tokopedia} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full bg-[#42b549] text-white py-3 rounded-lg font-bold uppercase text-xs md:text-sm tracking-widest hover:bg-[#36963c] transition shadow-md">
                          <RiShoppingBag4Fill className="w-5 h-5"/> Order via Tokopedia
                        </a>
                      )}
                      {product.shopee && (
                        <a href={product.shopee} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full bg-[#ee4d2d] text-white py-3 rounded-lg font-bold uppercase text-xs md:text-sm tracking-widest hover:bg-[#d73f1f] transition shadow-md">
                          <SiShopee className="w-5 h-5"/> Order via Shopee
                        </a>
                      )}
                      {product.gform && (
                        <a href={product.gform} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full bg-[#7248B9] text-white py-3 rounded-lg font-bold uppercase text-xs md:text-sm tracking-widest hover:bg-[#d73f1f] transition shadow-md">
                          <SiGoogleforms className="w-5 h-5"/> Order via Google Form
                        </a>
                      )}
                    </>
                  ) : (
                    /* TOMBOL REDIRECT INSTAGRAM KALO NULL SEMUA */
                    <a 
                      href="https://www.instagram.com/daekan.inc" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center justify-center gap-3 w-full bg-zinc-900 text-white py-4 rounded-lg font-black uppercase text-xs md:text-sm tracking-[0.2em] hover:bg-black transition shadow-xl border border-white/10"
                    >
                      <FaInstagram className="w-5 h-5 text-pink-500"/> COMING SOON — FOLLOW US
                    </a>
                  )}
                </div>
            </div>
          </motion.div>
        </motion.div>
  )
}

export default ProductModal