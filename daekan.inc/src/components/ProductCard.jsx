import React, { useState, useEffect } from 'react';
import Countdown from 'react-countdown';

const ProductCard = ({ product, onOpenModal, isAnyModalOpen }) => {
  // AMANIN NAMA PRODUK: Cek name atau title
  const productName = product.name || product.title || 'UNKNOWN GEAR';

  const isComingSoon = !product.price || product.price === 0;
  const isSale = product.original_price && Number(product.original_price) > Number(product.price);
  const isClosed = product.is_open === false;

  const [isSaleExpired, setIsSaleExpired] = useState(false);

  // FIX BUG TIMER EXPIRATION
  useEffect(() => {
    if (product.sale_end_date) {
      const timeLeft = new Date(product.sale_end_date).getTime() - Date.now();
      if (timeLeft <= 0) {
        setIsSaleExpired(true);
      } else {
        setIsSaleExpired(false);
      }
    } else {
      // Kalo gaada sale_end_date, berarti diskon biasa (permanen selagi diset)
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
    <div 
      onClick={() => onOpenModal(product)}
      className={`group relative bg-white border border-zinc-200 rounded-2xl p-4 cursor-pointer transition-all duration-500 
        ${!isAnyModalOpen ? 'hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:z-[999] hover:border-transparent' : 'z-10'} 
        w-full max-w-[350px] mx-auto ${isClosed ? 'opacity-90' : ''}`}
    >
      
      {isClosed && (
        <div className="absolute inset-0 bg-zinc-900/60 z-[1002] flex items-center justify-center backdrop-blur-[1px] rounded-2xl">
          <span className="bg-black text-white px-6 py-2 font-black text-xl md:text-2xl tracking-[0.2em] uppercase -rotate-12 shadow-2xl border border-white/20">
            CLOSE ORDER
          </span>
        </div>
      )}

      {showSaleBadge && (
        <div className="absolute -top-3 -right-3 bg-red-600 text-white px-5 py-3 rounded-2xl z-[1001] shadow-[0_15px_30px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center -rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 min-w-[100px]">
          <span className="text-xl font-black tracking-tighter leading-none mb-1 italic">
            SALE
          </span>
          {/* BEDA TAMPILAN JIKA ADA TIMER VS TANPA TIMER */}
          {product.sale_end_date ? (
            <div className="text-[12px] font-mono font-bold tabular-nums opacity-90 border-t border-white/20 pt-1 w-full text-center">
              <Countdown 
                date={new Date(product.sale_end_date)} 
                onComplete={() => setIsSaleExpired(true)}
              />
            </div>
          ) : (
            <div className="text-[10px] font-bold opacity-90 border-t border-white/20 pt-1 w-full text-center uppercase tracking-widest">
              DISCOUNT
            </div>
          )}
        </div>
      )}

      <div className="relative h-[160px] md:h-[200px] flex items-center justify-center">
        <img 
          src={product.image_url || product.image} 
          alt={productName} 
          className={`h-full w-auto object-contain drop-shadow-md transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative z-50 
            ${isClosed ? 'grayscale opacity-50' : 'group-hover:scale-[1.3] md:group-hover:scale-[1.8] group-hover:drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]'}`}
        />
      </div>

      <div className={`mt-6 pb-2 text-center transition-all duration-500 ${isClosed ? '' : 'group-hover:opacity-20'}`}>
        <h3 className="text-sm md:text-xl font-bold text-zinc-800 mb-2 italic uppercase tracking-[0.1em] md:tracking-[0.2em] leading-tight px-2">
          {productName}
        </h3>
        
        <div className="flex flex-col justify-center items-center mt-2 md:mt-4 px-1 md:px-2 gap-0.5">
          {isComingSoon ? (
            <p className="text-zinc-400 font-black text-sm md:text-lg italic tracking-tighter uppercase">Coming Soon</p>
          ) : (
            <>
              {isSale && !isSaleExpired && !isClosed && (
                <p className="text-[10px] md:text-xs text-red-500 line-through font-bold opacity-70">
                  {formatIDR(product.original_price)}
                </p>
              )}
              <p className={`font-black text-sm md:text-lg ${isClosed ? 'text-zinc-500' : 'text-black'}`}>
                {formatIDR(product.price)}
              </p>
            </>
          )}
          <p className="text-[10px] md:text-xs text-zinc-400 uppercase font-medium mt-1">
            {product.label || product.category || 'Limited Gear'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductCard