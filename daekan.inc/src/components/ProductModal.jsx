import React from 'react'
// Pindahin import Icon ke sini karena cuma dipake di sini
import { FaInstagram } from "react-icons/fa";
import { SiShopee, SiGoogleforms } from "react-icons/si";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";

// Kita butuh data 'product' buat ditampilin, dan fungsi 'close' buat nutup
const ProductModal = ({ product, close }) => {

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} // Pas tutup, dia fading out
        className="fixed inset-0 z-[99999] flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm"
        onClick={close}
        >
          
          {/* Ubah max-w-5xl jadi max-w-6xl biar makin LEBAR */}
          <motion.div 
            // HAPUS class 'animate-pop-bounce' dari Tailwind tadi! Kita ganti pake ini:
            initial={{ scale: 0.5, opacity: 0 }} // Awal: kecil banget
            animate={{ scale: 1, opacity: 1 }}   // Masuk: ukuran normal
            exit={{ scale: 0.5, opacity: 0 }}    // Keluar: mengecil lagi
            
            // KUNCI MEMBALNYA DI SINI 👇
            transition={{ type: "spring", damping: 20, stiffness: 300 }} 
            
            className="bg-white rounded-xl max-w-7xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:h-auto"
            onClick={(e) => e.stopPropagation()}
            >
            
            {/* Tombol Close (X) */}
            <button 
              onClick={close}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500 hover:text-black z-50 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md"
            >
                <IoClose className="w-6 h-6" />
            </button>

            {/* --- BAGIAN KIRI: GAMBAR (60% Lebar) --- */}
            {/* Kita hapus padding (p-8) dan ganti background jadi warna soft */}
            <div className="w-full md:w-[60%] bg-gray-50 flex items-center justify-center relative h-64 md:h-auto shrink-0">
               <img 
                  src={product.image_url} 
                  alt={product.name} 
                  // object-contain biar gambar utuh, h-full biar menuhin tinggi
                  className="w-full h-full object-contain p-4" 
                />
            </div>

            {/* --- BAGIAN KANAN: DETAIL (40% Lebar) --- */}
            <div className="w-full md:w-[40%] p-6 md:p-10 flex flex-col justify-start md:justify-center bg-white overflow-y-auto">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">{product.name}</h2>
                <p className="text-2xl text-gray-900 font-bold mb-6">IDR {product.price}</p>
                
                <div className="text-sm text-gray-600 mb-8 border-t border-b py-4">
                  {/* Kita pake white-space-pre-line biar kalau lo enter 
                    di database, tampilannya di web juga ganti baris.
                  */}
                  <p className="whitespace-pre-line leading-relaxed">
                    {product.description || "No description available for this premium gear."}
                  </p>
                </div>

                {/* --- 3 TOMBOL DENGAN LOGO --- */}
                <div className="flex flex-col gap-2 md:gap-3">
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
                </div>
            </div>
          </motion.div>
        </motion.div>
  )
}

export default ProductModal