import React, { useState, useEffect } from 'react'
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";
import Countdown from 'react-countdown';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore'; 
import { supabase } from '../lib/supabaseClient'; // ✅ IMPORT SUPABASE UNTUK CEK SESSION
import Swal from 'sweetalert2'; 

const ProductModal = ({ product, close }) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const productName = product.name || product.title || 'UNKNOWN GEAR';
  const isComingSoon = !product.price || product.price === 0;
  const isSale = product.original_price && Number(product.original_price) > Number(product.price);
  const isClosed = product.is_open === false;
  const needsSize = product.has_size !== false; 

  const [isSaleExpired, setIsSaleExpired] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

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

  // ✅ FUNGSI UTK CEK APAKAH USER SUDAH LOGIN
  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Swal.fire({
        title: 'OTENTIKASI DIPERLUKAN',
        text: 'Silakan masuk ke akun Anda atau mendaftar terlebih dahulu untuk dapat melanjutkan proses pembelanjaan.',
        icon: 'warning',
        confirmButtonColor: '#000'
      });
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    // ✅ Jalankan pemeriksaan keamanan session
    const isLoggedIn = await checkUserSession();
    if (!isLoggedIn) return;

    if (needsSize && !selectedSize) {
      return Swal.fire({
        title: 'PERHATIAN',
        text: 'Mohon pilih ukuran (Size) terlebih dahulu.',
        icon: 'warning',
        confirmButtonColor: '#000'
      });
    }
    
    const finalQuantity = Math.max(1, Number(quantity) || 1);
    addToCart(product, needsSize ? selectedSize : '-', finalQuantity);
    
    Swal.fire({
      title: 'BERHASIL',
      text: 'Barang telah dimasukkan ke keranjang Anda.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
    
    close();
  };

  const handleBuyNow = async () => {
    // ✅ Jalankan pemeriksaan keamanan session
    const isLoggedIn = await checkUserSession();
    if (!isLoggedIn) return;

    if (needsSize && !selectedSize) {
      return Swal.fire({
        title: 'PERHATIAN',
        text: 'Mohon pilih ukuran (Size) terlebih dahulu sebelum membeli.',
        icon: 'warning',
        confirmButtonColor: '#000'
      });
    }

    const finalQuantity = Math.max(1, Number(quantity) || 1);
    close();
    
    const directCheckoutItem = [{
      ...product,
      size: needsSize ? selectedSize : '-',
      quantity: finalQuantity
    }];
    
    navigate('/checkout', { state: { cartItems: directCheckoutItem } });
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm"
        onClick={close}
    >
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="bg-white rounded-xl max-w-7xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:h-auto"
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={close} className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500 hover:text-black z-50 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md">
                <IoClose className="w-6 h-6" />
            </button>

            {/* IMAGE SECTION */}
            <div className="w-full md:w-[60%] bg-zinc-100 flex items-center justify-center relative h-64 md:h-[85vh] shrink-0">
               {isClosed && (
                 <div className="absolute inset-0 bg-black/40 z-[5] flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-black text-white px-6 py-2 font-black text-2xl tracking-[0.2em] uppercase -rotate-12 border border-white/20 shadow-2xl">SOLD OUT</span>
                 </div>
               )}
                {showSaleBadge && (
                  <div className="absolute top-0 left-0 bg-red-600 text-white px-6 py-4 rounded-br-2xl shadow-[0_10px_30px_rgba(220,38,38,0.4)] z-10 flex flex-col items-center">
                    <p className="text-[20px] font-black uppercase tracking-[0.2em] leading-none mb-1">{product.sale_end_date ? "LIMITED SALE" : "SPECIAL PRICE"}</p>
                    {product.sale_end_date && (
                      <div className="font-mono text-[18px] font-black tabular-nums tracking-tighter">
                        <Countdown date={new Date(product.sale_end_date)} onComplete={() => setIsSaleExpired(true)} />
                      </div>
                    )}
                  </div>
                )}
               <img src={product.image_url || product.image} alt={productName} className={`w-full h-full object-contain p-4 transition-all duration-300 ${isClosed ? 'grayscale opacity-60' : ''}`} />
            </div>

            {/* CONTENT SECTION */}
            <div className="w-full md:w-[40%] p-6 md:p-10 flex flex-col justify-start bg-white overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
                <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2 shrink-0 ${isClosed ? 'text-zinc-400' : 'text-black'}`}>{productName}</h2>
                
                <div className="flex items-baseline gap-3 mb-6 shrink-0">
                  {isComingSoon ? (
                    <p className="text-3xl text-gray-400 font-black italic tracking-tighter">COMING SOON</p>
                  ) : (
                    <>
                      <p className={`text-3xl font-black ${isClosed ? 'text-zinc-400' : 'text-gray-900'}`}>{formatIDR(product.price)}</p>
                      {showSaleBadge && <p className="text-lg text-red-500 line-through font-bold opacity-60">{formatIDR(product.original_price)}</p>}
                    </>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-6 border-t border-b py-4 shrink-0">
                  <p className="whitespace-pre-line leading-relaxed">{product.description || "No description available for this premium gear."}</p>
                </div>

                {!isClosed && !isComingSoon && (
                  <div className="space-y-4 mb-8 shrink-0">
                    {needsSize && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Pilih Ukuran</label>
                          <button type="button" onClick={() => window.open(`/size-chart?cat=${product.category || 'MERCH'}`, '_blank')} className="text-[10px] font-bold text-black uppercase underline tracking-[0.1em] hover:text-zinc-500">Panduan Ukuran</button>
                        </div>
                        <div className="flex gap-2">
                          {['M', 'L', 'XL', 'XXL'].map((sz) => (
                            <button key={sz} type="button" onClick={() => setSelectedSize(sz)} className={`flex-1 py-2 md:py-3 border-2 font-black text-xs md:text-sm transition-all rounded-xl ${selectedSize === sz ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-400 hover:border-black'}`}>{sz}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2 block">Kuantitas</label>
                      <div className="flex items-center justify-between border-2 border-zinc-200 rounded-xl overflow-hidden w-full max-w-[130px] h-12">
                        <button type="button" onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))} className="w-10 h-full flex items-center justify-center bg-zinc-50 hover:bg-zinc-200 text-zinc-600 font-black text-lg">-</button>
                        <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} onBlur={() => setQuantity(Math.max(1, Number(quantity) || 1))} className="w-12 h-full text-center font-black text-base outline-none bg-transparent" />
                        <button type="button" onClick={() => setQuantity(Number(quantity) + 1)} className="w-10 h-full flex items-center justify-center bg-zinc-50 hover:bg-zinc-200 text-zinc-600 font-black text-lg">+</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 md:gap-3 mt-auto shrink-0 border-t border-zinc-100 pt-6">
                  {isClosed ? (
                    <button disabled className="w-full bg-zinc-200 text-zinc-500 py-4 rounded-lg font-black uppercase text-xs tracking-[0.2em] cursor-not-allowed border border-zinc-300"><IoClose className="w-5 h-5 inline mr-2"/> CLOSE ORDER</button>
                  ) : isComingSoon ? (
                    <button disabled className="w-full bg-zinc-900 text-white py-4 rounded-lg font-black uppercase text-xs tracking-[0.2em] cursor-not-allowed shadow-xl">COMING SOON</button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleAddToCart} className="w-full py-4 bg-zinc-100 text-black border-2 border-zinc-200 font-black italic uppercase text-xs md:text-sm tracking-[0.1em] hover:bg-zinc-200 rounded-lg">ADD TO CART</button>
                      <button onClick={handleBuyNow} className="w-full py-4 bg-black text-white border-2 border-black font-black italic uppercase text-xs md:text-sm tracking-[0.1em] hover:bg-zinc-800 rounded-lg">BUY NOW</button>
                    </div>
                  )}
                </div>
            </div>
        </motion.div>
    </motion.div>
  )
}

export default ProductModal