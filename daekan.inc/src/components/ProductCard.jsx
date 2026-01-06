import React from 'react'

const ProductCard = ({ product, onOpenModal, isAnyModalOpen }) => {
  return (
    <div 
      onClick={() => onOpenModal(product)}
      className={`group relative bg-white border border-zinc-100 rounded-2xl p-4 cursor-pointer transition-all duration-500 
        ${!isAnyModalOpen ? 'hover:shadow-2xl hover:z-[50]' : ''} 
        w-full max-w-[350px] mx-auto`}
    >
      {/* Container Gambar: Tinggi disesuaikan buat mobile (h-[160px]) dan desktop (md:h-[200px]) */}
      <div className="relative h-[160px] md:h-[200px] flex items-center justify-center">
        <img 
          src={product.image_url} 
          alt={product.name} 
          /* KUNCI: Di mobile scale-nya kecil aja (1.1), di desktop baru hajar (md:scale-[1.6]) */
          className="h-full w-auto object-contain drop-shadow-md transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
                     group-hover:scale-[1.1] md:group-hover:scale-[1.6] group-hover:drop-shadow-2xl"
        />
      </div>

      {/* Info Produk: Text-size disesuaikan biar gak numpuk di HP */}
      <div className="mt-6 pb-2 text-center transition-all duration-500 group-hover:opacity-30">
        <h3 className="text-sm md:text-xl font-bold text-zinc-800 mb-2 italic uppercase tracking-[0.1em] md:tracking-[0.2em] leading-tight">
          {product.name}
        </h3>
        
        {/* Layout Flex: Di HP mending col/row yang rapi biar harga gak kepotong */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-2 md:mt-4 px-1 md:px-2 gap-1">
          <p className="text-[10px] md:text-xs text-zinc-400 uppercase font-medium">
            {product.label || 'Limited'}
          </p>
          <p className="text-black font-black text-sm md:text-lg">
            IDR {(product.price)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductCard