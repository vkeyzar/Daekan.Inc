import React from 'react'
import { supabase } from '../lib/supabaseClient'
import Swal from 'sweetalert2'

const ProductList = ({ products, refreshData, onOpenEdit }) => {
  
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Hapus ${name}?`,
      text: "Data yang dihapus nggak bisa balik lagi, Bro!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'YA, MUSNAHKAN!',
      cancelButtonText: 'GAK JADI',
      background: '#ffffff',
      color: '#000000'
    });

    if (confirm.isConfirmed) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        Swal.fire({ title: 'DELETED!', text: 'Produk berhasil dihapus dari inventori.', icon: 'success', confirmButtonColor: '#000' });
        refreshData(); 
      } catch (error) {
        Swal.fire('ERROR!', error.message, 'error');
      }
    }
  };

  const formatIDR = (price) => {
    if (price === null || price === undefined || price === "") return "0";
    return Number(price).toLocaleString('id-ID');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase border-b border-zinc-100">
            <th className="pb-6 font-black">Product Details</th>
            <th className="pb-6 font-black text-center">Pricing</th>
            <th className="pb-6 font-black text-center">Category / Label</th>
            <th className="pb-6 font-black text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {products.map((item, index) => (
            <tr key={item.id} className="group hover:bg-zinc-50/50 transition-all duration-300">
              
              <td className="py-8 flex items-center gap-6">
                <div className="relative group-hover:rotate-3 transition-transform duration-500">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 p-2 flex items-center justify-center">
                    <img src={item.image_url || 'https://via.placeholder.com/150'} className="max-w-full max-h-full object-contain" alt={item.name} />
                  </div>
                </div>
                <div>
                  <p className="font-black text-base md:text-lg uppercase tracking-tight leading-none mb-2 italic">{item.name}</p>
                  <div className="flex flex-col gap-2">
                     <span className="text-[9px] font-black text-zinc-400 uppercase w-max tracking-widest underline decoration-zinc-200 underline-offset-2">
                        {item.category || 'GEAR'}
                     </span>
                     
                     {/* ✅ FIX TAMPILAN STOK: Nampilin list size & sisa stok kalau dia LIMITED GEAR */}
                     <div className="flex flex-wrap gap-1 mt-1">
                        {item.label === 'LIMITED GEAR' ? (
                          item.product_stocks && item.product_stocks.length > 0 ? (
                            item.product_stocks.map((stockItem, idx) => {
                              const sisaStok = stockItem.stock_physical - stockItem.stock_reserved;
                              return (
                                <span key={idx} className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${sisaStok > 0 ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                                  {stockItem.size}: {sisaStok}
                                </span>
                              )
                            })
                          ) : (
                            <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter bg-red-50 px-2 py-0.5 rounded">STOK BELUM DIATUR</span>
                          )
                        ) : (
                          <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-tighter">
                            REF: DKN-{String(item.id).padStart(3, '0')}
                          </p>
                        )}
                     </div>

                  </div>
                </div>
              </td>

              <td className="py-8 text-center">
                <p className="text-base md:text-lg font-black tracking-tighter">IDR {formatIDR(item.price)}</p>
                {item.original_price && (
                    <p className="text-[10px] text-red-500 line-through font-bold opacity-50">
                        IDR {formatIDR(item.original_price)}
                    </p>
                )}
              </td>

              <td className="py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-sm border ${item.label ? 'bg-black text-white border-black' : 'bg-white text-zinc-300 border-zinc-100'}`}>
                    {item.label || 'NORMAL STOCK'}
                    </span>
                </div>
              </td>

              <td className="py-8 text-right">
                <div className="flex justify-end gap-6">
                  <button onClick={() => onOpenEdit(item)} className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-all">Edit</button>
                  <button onClick={() => handleDelete(item.id, item.name)} className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-700 hover:scale-110 transition-all">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductList