import React from 'react'
import Countdown from 'react-countdown';

const ProductCard = ({ product, onOpenModal, isAnyModalOpen }) => {
  const isComingSoon = !product.price || product.price === 0;
  const isSale = product.original_price && Number(product.original_price) > Number(product.price);

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div 
      onClick={() => onOpenModal(product)}
      /* Hapus overflow-hidden di sini biar gambar bisa tumpah keluar */
      className={`group relative bg-white border border-zinc-200 rounded-2xl p-4 cursor-pointer transition-all duration-500 
        ${!isAnyModalOpen ? 'hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:z-[999] hover:border-transparent' : 'z-10'} 
        w-full max-w-[350px] mx-auto`}
    >
      {/* --- UPGRADED: Badge SALE yang Lebih Gede & Gahar --- */}
      {isSale && !isComingSoon && (
        <div className="absolute -top-3 -right-3 bg-red-600 text-white px-5 py-3 rounded-2xl z-[1001] shadow-[0_15px_30px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center -rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 min-w-[100px]">
          
          {/* TULISAN SALE: Dibuat Dominan */}
          <span className="text-xl font-black tracking-tighter leading-none mb-1 italic">
            SALE
          </span>

          {/* TIMER: Dibuat Lebih Kecil & Rapi */}
          <div className="text-[10px] font-mono font-bold tabular-nums opacity-90 border-t border-white/20 pt-1 w-full text-center">
            <Countdown date={new Date(product.sale_end_date)} />
          </div>
        </div>
      )}

      {/* CONTAINER GAMBAR */}
      <div className="relative h-[160px] md:h-[200px] flex items-center justify-center">
        <img 
          src={product.image_url} 
          alt={product.name} 
          /* KUNCI: Pointer-events-none biar gak ganggu klik, scale hajar ke 1.7 atau lebih */
          className="h-full w-auto object-contain drop-shadow-md transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
                    group-hover:scale-[1.3] md:group-hover:scale-[1.8] group-hover:drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]
                    relative z-50"
        />
      </div>

      {/* INFO PRODUK */}
      <div className="mt-6 pb-2 text-center transition-all duration-500 group-hover:opacity-20">
        <h3 className="text-sm md:text-xl font-bold text-zinc-800 mb-2 italic uppercase tracking-[0.1em] md:tracking-[0.2em] leading-tight px-2">
          {product.name}
        </h3>
        
        <div className="flex flex-col justify-center items-center mt-2 md:mt-4 px-1 md:px-2 gap-0.5">
          {isComingSoon ? (
            <p className="text-zinc-400 font-black text-sm md:text-lg italic tracking-tighter uppercase">Coming Soon</p>
          ) : (
            <>
              {isSale && (
                <p className="text-[10px] md:text-xs text-red-500 line-through font-bold opacity-70">
                  {formatIDR(product.original_price)}
                </p>
              )}
              <p className="text-black font-black text-sm md:text-lg">
                {formatIDR(product.price)}
              </p>
            </>
          )}
          <p className="text-[10px] md:text-xs text-zinc-400 uppercase font-medium mt-1">
            {product.label || 'Limited Gear'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductCard