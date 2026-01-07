import React from 'react'
import { FaInstagram } from "react-icons/fa";
import { SiShopee, SiGoogleforms } from "react-icons/si";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";
import Countdown from 'react-countdown'; // --- TAMBAHAN: Library Timer ---

const ProductModal = ({ product, close }) => {
  const hasAnyLink = product.instagram || product.tokopedia || product.shopee || product.gform;

  // --- LOGIKA SALE & COMING SOON ---
  const isComingSoon = !product.price || product.price === 0;
  const isSale = product.original_price && Number(product.original_price) > Number(product.price);

  // Format IDR biar rapi
  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

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
            {/* CLOSE BUTTON */}
            <button 
              onClick={close}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500 hover:text-black z-50 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md"
            >
                <IoClose className="w-6 h-6" />
            </button>

            {/* IMAGE SECTION */}
            <div className="w-full md:w-[60%] bg-gray-50 flex items-center justify-center relative h-64 md:h-auto shrink-0">
               {/* --- UPGRADED: Badge SALE di Image --- */}
                {isSale && !isComingSoon && (
                  <div className="absolute top-0 left-0 bg-red-600 text-white px-6 py-4 rounded-br-2xl shadow-[0_10px_30px_rgba(220,38,38,0.4)] z-10 flex flex-col items-center">
                    <p className="text-[20px] font-black uppercase tracking-[0.2em] leading-none mb-1">
                      LIMITED SALE
                    </p>
                    <div className="font-mono text-[18px] font-black tabular-nums tracking-tighter">
                      <Countdown date={new Date(product.sale_end_date)} />
                    </div>
                  </div>
                )}
               <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-4" 
                />
            </div>

            {/* CONTENT SECTION */}
            <div className="w-full md:w-[40%] p-6 md:p-10 flex flex-col justify-start md:justify-center bg-white overflow-y-auto">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">{product.name}</h2>
                
                {/* --- BAGIAN HARGA (MODIFIED) --- */}
                <div className="flex items-baseline gap-3 mb-6">
                  {isComingSoon ? (
                    <p className="text-3xl text-gray-400 font-black italic tracking-tighter">COMING SOON</p>
                  ) : (
                    <>
                      <p className="text-3xl text-gray-900 font-black">{formatIDR(product.price)}</p>
                      {isSale && (
                        <p className="text-lg text-red-500 line-through font-bold opacity-60">
                          {formatIDR(product.original_price)}
                        </p>
                      )}
                    </>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-8 border-t border-b py-4">
                  <p className="whitespace-pre-line leading-relaxed">
                    {product.description || "No description available for this premium gear."}
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:gap-3">
                  {hasAnyLink && !isComingSoon ? (
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
                        <a href={product.gform} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full bg-[#7248B9] text-white py-3 rounded-lg font-bold uppercase text-xs md:text-sm tracking-widest hover:bg-[#5b3994] transition shadow-md">
                          <SiGoogleforms className="w-5 h-5"/> Order via Google Form
                        </a>
                      )}
                    </>
                  ) : (
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