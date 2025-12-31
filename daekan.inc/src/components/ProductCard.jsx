import React from 'react'

// Kita terima 'item' (data barang) dan 'onOpen' (fungsi buat buka modal) lewat props
const ProductCard = ({ item, onOpen }) => {
  return (
    <div className="group cursor-pointer" onClick={() => onOpen(item)}>
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-lg mb-4">
        <img 
          src={item.img} 
          alt={item.name} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
        />
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-sm tracking-tight">{item.name}</h3>
          <p className="text-gray-500 text-xs">IDR {item.price}</p>
        </div>
        <button className="text-[10px] font-black border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">
          VIEW
        </button>
      </div>
    </div>
  )
}

export default ProductCard