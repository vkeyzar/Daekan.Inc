'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ProductData } from '@/lib/types';

export type { ProductData };

interface SquareProductCardProps {
  product: ProductData;
  onOpenModal?: (product: ProductData) => void;
}

export default function SquareProductCard({ product }: SquareProductCardProps) {
  const productName = product.name || (product as any).title || 'UNKNOWN GEAR';
  const isComingSoon = !product.price || product.price === 0;
  const isSale = product.original_price && Number(product.original_price) > Number(product.price);
  const isClosed = product.is_open === false;

  const [isSaleExpired, setIsSaleExpired] = useState(false);

  useEffect(() => {
    if (product.sale_end_date) {
      const timeLeft = new Date(product.sale_end_date).getTime() - Date.now();
      setIsSaleExpired(timeLeft <= 0);
    } else {
      setIsSaleExpired(false);
    }
  }, [product.sale_end_date]);

  const formatIDR = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const showSaleBadge = isSale && !isComingSoon && !isSaleExpired && !isClosed;

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group relative bg-white dark:bg-black border border-black dark:border-white p-4 cursor-pointer transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] w-[200px] md:w-[240px] shrink-0 aspect-square flex flex-col overflow-hidden font-sans ${isClosed ? 'opacity-80' : ''}`}
    >
      {isClosed && (
        <div className="absolute inset-0 bg-black/50 z-[10] flex items-center justify-center backdrop-blur-[1px]">
          <span className="bg-black text-white px-4 py-1.5 font-black text-xs tracking-[0.2em] uppercase -rotate-12 border border-white/20">
            SOLD OUT
          </span>
        </div>
      )}

      {showSaleBadge && (
        <div className="absolute top-0 left-0 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 z-[5] flex flex-col items-center">
          <span className="text-[11px] font-black tracking-widest uppercase leading-none">SALE</span>
        </div>
      )}

      <div className="flex-1 min-h-0 relative flex items-center justify-center mb-3">
        {(() => {
          const mainImage = (Array.isArray(product.image_url) ? product.image_url[0] : (product.image_url as unknown as string)) || (product as any).image;
          return (
            <img
              src={mainImage || 'https://via.placeholder.com/300?text=No+Image'}
              alt={productName}
              className={`w-full h-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105 ${isClosed ? 'grayscale opacity-60' : ''}`}
            />
          );
        })()}
      </div>

      <div className="shrink-0 text-center transition-all duration-500 flex flex-col justify-end">
        <h3 className="text-xs md:text-[13px] font-black text-black dark:text-white uppercase tracking-[0.12em] line-clamp-2 px-1 mb-1 leading-tight" title={productName}>
          {productName}
        </h3>

        <div className="flex flex-col justify-center items-center gap-0.5 mt-auto">
          {isComingSoon ? (
            <p className="text-black dark:text-white font-black text-xs uppercase tracking-tighter">Coming Soon</p>
          ) : (
            <div className="flex items-center gap-2 justify-center flex-wrap">
              {isSale && !isSaleExpired && !isClosed && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-through font-bold">
                  {formatIDR(product.original_price!)}
                </p>
              )}
              <p className={`font-black text-xs md:text-sm ${isClosed ? 'text-zinc-500' : 'text-black dark:text-white'}`}>
                {formatIDR(product.price)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
