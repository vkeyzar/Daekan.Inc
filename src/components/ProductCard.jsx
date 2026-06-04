import React, { useState, useEffect } from 'react';
import Countdown from 'react-countdown';

const ProductCard = ({ product, onOpenModal, isAnyModalOpen }) => {
  const productName = product.name || product.title || 'UNKNOWN GEAR';
  const isComingSoon = !product.price || product.price === 0;
  const isSale = product.original_price && Number(product.original_price) > Number(product.price);
  const isClosed = product.is_open === false;

  const [isSaleExpired, setIsSaleExpired] = useState(false);

  useEffect(() => {
    if (product.sale_end_date) {
      const timeLeft = new Date(product.sale_end_date).getTime() - Date.now();
      if (timeLeft <= 0) setIsSaleExpired(true);
      else setIsSaleExpired(false);
    } else {
      setIsSaleExpired(false);
    }
  }, [product.sale_end_date]);

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const showSaleBadge = isSale && !isComingSoon && !isSaleExpired && !isClosed;

  return (
    <div 
      onClick={() => onOpenModal(product)}
      // ✅ FIX SIZE: Dibatasi max-w-[260px] & mx-auto biar anteng di grid
      className={`group relative bg-white/80 backdrop-blur-sm border border-vtuber-blue/20 rounded-3xl p-4 cursor-pointer transition-all duration-300 w-full max-w-[260px] mx-auto aspect-square flex flex-col overflow-hidden
        ${!isAnyModalOpen ? 'hover:shadow-[0_10px_30px_rgba(225,174,207,0.3)] hover:z-[999] hover:border-vtuber-pink' : 'z-10'} 
        ${isClosed ? 'opacity-80' : ''}`}
    >
      
      {isClosed && (
        <div className="absolute inset-0 bg-black/50 z-[1002] flex items-center justify-center backdrop-blur-[1px]">
          <span className="bg-black text-white px-4 py-1.5 font-black text-sm tracking-[0.2em] uppercase -rotate-12 border border-white/20 shadow-xl">
            SOLD OUT
          </span>
        </div>
      )}

      {showSaleBadge && (
        <div className="absolute top-0 left-0 bg-gradient-to-br from-vtuber-pink to-vtuber-blue text-white px-4 py-2 rounded-br-2xl z-[1001] shadow-[0_5px_15px_rgba(225,174,207,0.4)] flex flex-col items-center justify-center">
          <span className="text-xs md:text-sm font-black tracking-tighter leading-none italic">
            SALE
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0 relative flex items-center justify-center mb-3">
        <img 
          src={product.image_url || product.image} 
          alt={productName} 
          className={`w-full h-full object-contain drop-shadow-sm transition-transform duration-500 relative z-50 
            ${isClosed ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
        />
      </div>

      <div className="shrink-0 text-center transition-all duration-500 flex flex-col justify-end">
        {/* ✅ FIX TEXT: line-clamp-2 */}
        <h3 className="text-xs md:text-[13px] font-black text-zinc-800 mb-1 italic uppercase tracking-[0.1em] line-clamp-2 px-1 leading-tight" title={productName}>
          {productName}
        </h3>
        
        <div className="flex flex-col justify-center items-center gap-0.5 mt-auto">
          {isComingSoon ? (
            <p className="text-vtuber-purple font-black text-xs md:text-sm italic tracking-tighter uppercase">Coming Soon</p>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              {isSale && !isSaleExpired && !isClosed && (
                <p className="text-[10px] text-vtuber-pink line-through font-bold opacity-80">
                  {formatIDR(product.original_price)}
                </p>
              )}
              <p className={`font-black text-sm md:text-base ${isClosed ? 'text-zinc-500' : 'text-vtuber-cyan'}`}>
                {formatIDR(product.price)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard