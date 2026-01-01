import React from 'react'

const ProductCard = ({ product, onOpenModal, isAnyModalOpen }) => {
  return (

    <div 
      onClick={() => onOpenModal(product)}
      /* KUNCI 1: Tambahkan group-hover:z-[999] agar selalu di depan tetangganya */
      className={`group relative bg-white border border-zinc-100 rounded-2xl p-4 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:border-transparent group-hover:z-[999]
        ${!isAnyModalOpen ? 'hover:shadow-2xl group-hover:z-[999]' : ''}`}
    >
      <div className="relative h-[200px] flex items-center justify-center">
        <img 
          src={product.image} 
          alt={product.name} 
          /* KUNCI 2: Pastikan z-index pada image juga tinggi saat hover */
          className="h-full w-auto object-contain drop-shadow-md transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
                     group-hover:scale-[1.6] group-hover:z-[1000] group-hover:drop-shadow-2xl"
        />
      </div>

      <div className="mt-8 pb-4 text-center transition-all duration-500 group-hover:opacity-30">
        <h3 className="text-xl font-bold text-black mb-2 italic uppercase tracking-[0.2em] text-zinc-800">
          {product.name}
        </h3>
        <div className="flex justify-between items-center mt-4 px-2">
            <span className="text-xs text-zinc-400 uppercase font-medium">Limited</span>
            <span className="text-black font-bold text-lg">{product.price}</span>
        </div>
      </div>
    </div>

  )
}

export default ProductCard