import React from 'react'
// Pindahin import Icon ke sini karena cuma dipake di sini
import { FaInstagram } from "react-icons/fa";
import { SiShopee } from "react-icons/si";
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
            
            className="bg-white rounded-xl max-w-7xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-[80vh] md:h-auto"
            onClick={(e) => e.stopPropagation()}
            >
            
            {/* Tombol Close (X) */}
            <button 
              onClick={close}
              className="absolute top-4 right-4 text-gray-500 hover:text-black z-20 bg-white/50 rounded-full p-1"
            >
                <IoClose className="w-6 h-6" />
            </button>

            {/* --- BAGIAN KIRI: GAMBAR (60% Lebar) --- */}
            {/* Kita hapus padding (p-8) dan ganti background jadi warna soft */}
            <div className="w-full md:w-[60%] bg-gray-50 flex items-center justify-center relative">
               <img 
                  src={product.image} 
                  alt={product.name} 
                  // object-contain biar gambar utuh, h-full biar menuhin tinggi
                  className="w-full h-full object-contain p-4" 
                />
            </div>

            {/* --- BAGIAN KANAN: DETAIL (40% Lebar) --- */}
            <div className="w-full md:w-[40%] p-8 md:p-10 flex flex-col justify-center bg-white overflow-y-auto">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">{product.name}</h2>
                <p className="text-2xl text-gray-900 font-bold mb-6">IDR {product.price}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-8 border-t border-b py-4">
                  <p><strong>Size:</strong> 900 x 400 x 4mm</p>
                  <p><strong>Surface:</strong> Speed & Control Hybrid</p>
                  <p><strong>Feature:</strong> Waterproof & Anti-Fray Stitching</p>
                </div>

                {/* --- 3 TOMBOL DENGAN LOGO --- */}
                <div className="flex flex-col gap-3">
                  
                  {/* 1. Instagram Button */}
                  <a 
                    href={product.instagram} target="_blank"
                    className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:opacity-90 transition shadow-md"
                  >
                    {/* Logo IG SVG */}
                    <FaInstagram className="w-5 h-5"/>
                    Order via Instagram
                  </a>

                  {/* 2. Tokopedia Button */}
                  <a 
                    href={product.tokopedia} target="_blank"
                    className="flex items-center justify-center gap-3 w-full bg-[#42b549] text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-[#36963c] transition shadow-md"
                  >
                    {/* Logo Shop SVG (Generic for Tokped) */}
                    <RiShoppingBag4Fill className="w-5 h-5" viewBox="0 0 24 24"/>
                    Order via Tokopedia
                  </a>

                  {/* 3. Shopee Button */}
                  <a 
                    href={product.shopee} target="_blank"
                    className="flex items-center justify-center gap-3 w-full bg-[#ee4d2d] text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-[#d73f1f] transition shadow-md"
                  >
                    {/* Logo Bag SVG (Generic for Shopee) */}
                    <SiShopee className="w-5 h-5" viewBox="0 0 24 24"/>
                    Order via Shopee
                  </a>
                </div>

            </div>
          </motion.div>
        </motion.div>
  )
}

export default ProductModal