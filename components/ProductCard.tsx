import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const ProductCard = ({ product }: { product: any; onOpenModal?: (product: any) => void; isAnyModalOpen?: boolean }) => {
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

  const formatIDR = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
  };/*  */

  const showSaleBadge = isSale && !isComingSoon && !isSaleExpired && !isClosed;

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group relative bg-white dark:bg-black border border-black dark:border-white p-2.5 sm:p-4 md:p-5 cursor-pointer transition-all duration-300 w-full aspect-square flex flex-col overflow-hidden font-sans
        ${isClosed ? 'opacity-80' : ''}`}
    >

      {isClosed && (
        <div className="absolute inset-0 bg-black/50 z-[10] flex items-center justify-center backdrop-blur-[1px]">
          <span className="bg-black text-white px-2.5 py-1 sm:px-4 sm:py-1.5 font-black text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase -rotate-12 border border-white/20 shadow-xl">
            SOLD OUT
          </span>
        </div>
      )}

      {showSaleBadge && (
        <div className="absolute top-0 left-0 bg-black dark:bg-white text-white dark:text-black px-2.5 py-1 sm:px-4 sm:py-2 md:px-5 md:py-2.5 z-[9] flex flex-col items-center justify-center">
          <span className="text-[10px] sm:text-xs md:text-base font-black tracking-widest leading-none uppercase">
            SALE
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0 relative flex items-center justify-center mb-1.5 sm:mb-3 p-1 sm:p-3 md:p-4">
        <img
          src={product.image_url || product.image}
          alt={productName}
          className={`w-full h-full object-contain transition-transform duration-500 relative z-[5]
            ${isClosed
              ? 'grayscale opacity-60 [filter:grayscale(100%)_drop-shadow(0_6px_14px_rgba(0,0,0,0.35))]'
              : 'group-hover:scale-105 [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.35))] dark:[filter:drop-shadow(0_0_3px_rgba(255,255,255,0.9))_drop-shadow(0_0_12px_rgba(125,211,252,0.9))_drop-shadow(0_0_28px_rgba(125,211,252,0.7))_drop-shadow(0_0_48px_rgba(167,139,250,0.6))]'}`}
        />
      </div>

      <div className="shrink-0 text-center transition-all duration-500 flex flex-col justify-end">
        <h3 className="text-[11px] sm:text-xs md:text-[13px] font-black text-black dark:text-white mb-0.5 sm:mb-1 uppercase tracking-[0.05em] sm:tracking-[0.12em] line-clamp-2 px-0.5 sm:px-1 leading-tight" title={productName}>
          {productName}
        </h3>

        <div className="flex flex-col justify-center items-center gap-0.5 mt-auto">
          {isComingSoon ? (
            <p className="text-black dark:text-white font-black text-[11px] sm:text-xs uppercase tracking-tighter">Coming Soon</p>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 justify-center flex-wrap">
              {isSale && !isSaleExpired && !isClosed && (
                <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 line-through font-bold">
                  {formatIDR(product.original_price)}
                </p>
              )}
              <p className={`font-black text-[11px] sm:text-xs md:text-sm ${isClosed ? 'text-zinc-500' : 'text-black dark:text-white'}`}>
                {formatIDR(product.price)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
