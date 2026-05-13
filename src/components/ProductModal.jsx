import React, { useState, useEffect } from 'react'
import { FaInstagram } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";
import Countdown from 'react-countdown';
import { useNavigate } from 'react-router-dom'; // ✅ IMPORT useNavigate

const ProductModal = ({ product, close }) => {
  const navigate = useNavigate(); // ✅ PANGGIL HOOK-NYA

  // AMANIN NAMA PRODUK
  const productName = product.name || product.title || 'UNKNOWN GEAR';

  const isComingSoon = !product.price || product.price === 0;
  const isSale = product.original_price && Number(product.original_price) > Number(product.price);
  const isClosed = product.is_open === false;

  const [isSaleExpired, setIsSaleExpired] = useState(false);

  // FIX BUG TIMER EXPIRATION DI MODAL
  useEffect(() => {
    if (product.sale_end_date) {
      const timeLeft = new Date(product.sale_end_date).getTime() - Date.now();
      if (timeLeft <= 0) {
        setIsSaleExpired(true);
      } else {
        setIsSaleExpired(false);
      }
    } else {
      setIsSaleExpired(false);
    }
  }, [product.sale_end_date]);

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
    }).format(price);
  };

  const showSaleBadge = isSale && !isComingSoon && !isSaleExpired && !isClosed;

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm"
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

            {/* IMAGE SECTION */}
            <div className="w-full md:w-[60%] bg-zinc-100 flex items-center justify-center relative h-64 md:h-[85vh] shrink-0">
               {isClosed && (
                 <div className="absolute inset-0 bg-black/40 z-[5] flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-black text-white px-6 py-2 font-black text-2xl tracking-[0.2em] uppercase -rotate-12 border border-white/20 shadow-2xl">
                      SOLD OUT
                    </span>
                 </div>
               )}

                {showSaleBadge && (
                  <div className="absolute top-0 left-0 bg-red-600 text-white px-6 py-4 rounded-br-2xl shadow-[0_10px_30px_rgba(220,38,38,0.4)] z-10 flex flex-col items-center">
                    <p className="text-[20px] font-black uppercase tracking-[0.2em] leading-none mb-1">
                      {product.sale_end_date ? "LIMITED SALE" : "SPECIAL PRICE"}
                    </p>
                    {product.sale_end_date && (
                      <div className="font-mono text-[18px] font-black tabular-nums tracking-tighter">
                        <Countdown 
                          date={new Date(product.sale_end_date)} 
                          onComplete={() => setIsSaleExpired(true)}
                        />
                      </div>
                    )}
                  </div>
                )}
               <img 
                  src={product.image_url || product.image} 
                  alt={productName} 
                  className={`w-full h-full object-contain p-4 transition-all duration-300 ${isClosed ? 'grayscale opacity-60' : ''}`} 
                />
            </div>

            {/* CONTENT SECTION */}
            <div className="w-full md:w-[40%] p-6 md:p-10 flex flex-col justify-start bg-white overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
                <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2 shrink-0 ${isClosed ? 'text-zinc-400' : 'text-black'}`}>
                  {productName}
                </h2>
                
                <div className="flex items-baseline gap-3 mb-6 shrink-0">
                  {isComingSoon ? (
                    <p className="text-3xl text-gray-400 font-black italic tracking-tighter">COMING SOON</p>
                  ) : (
                    <>
                      <p className={`text-3xl font-black ${isClosed ? 'text-zinc-400' : 'text-gray-900'}`}>
                        {formatIDR(product.price)}
                      </p>
                      {showSaleBadge && (
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

                <div className="flex flex-col gap-2 md:gap-3 mt-auto shrink-0">
                  {/* --- LOGIC TOMBOL BARU --- */}
                  {isClosed ? (
                    <button 
                      disabled
                      className="flex items-center justify-center gap-3 w-full bg-zinc-200 text-zinc-500 py-4 rounded-lg font-black uppercase text-xs md:text-sm tracking-[0.2em] cursor-not-allowed border border-zinc-300"
                    >
                      <IoClose className="w-5 h-5"/> CLOSE ORDER
                    </button>
                  ) : isComingSoon ? (
                    <button 
                      disabled
                      className="flex items-center justify-center gap-3 w-full bg-zinc-900 text-white py-4 rounded-lg font-black uppercase text-xs md:text-sm tracking-[0.2em] cursor-not-allowed shadow-xl border border-white/10"
                    >
                      COMING SOON
                    </button>
                  ) : (
                    // ✅ TOMBOL BUY NOW YANG BARU
                    <button 
                      onClick={() => {
                        close(); // Tutup modal dulu biar gak nyangkut
                        navigate('/checkout', { state: { product: product } });
                      }}
                      className="w-full py-5 bg-black text-white font-black italic uppercase text-sm tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl rounded-lg"
                    >
                      BUY NOW
                    </button>
                  )}
                </div>
            </div>
        </motion.div>
    </motion.div>
  )
}

export default ProductModal