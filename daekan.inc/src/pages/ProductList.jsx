import React from 'react'
import { supabase } from '../lib/supabaseClient'
import Swal from 'sweetalert2'

// --- Tambahin onOpenEdit di Destructuring Props ---
const ProductList = ({ products, refreshData, onOpenEdit }) => {
  
  // FUNGSI DELETE (Langsung di sini biar sat-set)
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Hapus ${name}?`,
      text: "Data yang dihapus nggak bisa balik lagi, Bro!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000', // Hitam biar senada brand lo
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

        Swal.fire({
          title: 'DELETED!',
          text: 'Produk berhasil dihapus dari inventori.',
          icon: 'success',
          confirmButtonColor: '#000'
        });
        
        refreshData(); // Refresh list biar lsg ilang tanpa reload
      } catch (error) {
        Swal.fire('ERROR!', error.message, 'error');
      }
    }
  };

  const formatIDR = (price) => {
    if (price === null || price === undefined) return "0";
    return Number(price).toLocaleString('id-ID');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase border-b border-zinc-100">
            <th className="pb-6 font-black">Product</th>
            <th className="pb-6 font-black text-center">Price Details</th>
            <th className="pb-6 font-black text-center">Label / Status</th>
            <th className="pb-6 font-black text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {products.map((item, index) => (
            <tr key={item.id} className="group hover:bg-zinc-50/50 transition-all duration-300">
              {/* KOLOM PRODUK */}
              <td className="py-8 flex items-center gap-6">
                <div className="relative group-hover:rotate-3 transition-transform duration-500">
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/150'} 
                    className="w-16 h-16 object-contain rounded-xl bg-zinc-100 p-2 shadow-sm border border-zinc-200" 
                    alt={item.name}
                  />
                </div>
                <div>
                  <p className="font-black text-base md:text-lg uppercase tracking-tight leading-none mb-2">{item.name}</p>
                  <p className="text-xs text-zinc-400 font-mono uppercase tracking-tighter italic">
                    REF: DKN-{String(item.id).substring(0, 5)} / NO: {index + 1}
                  </p>
                </div>
              </td>

              {/* KOLOM HARGA */}
              <td className="py-8 text-center">
                <p className="text-base md:text-lg font-black tracking-tighter">IDR {formatIDR(item.price)}</p>
                {item.original_price && (
                    <p className="text-xs text-red-500 line-through font-bold opacity-60">
                        IDR {formatIDR(item.original_price)}
                    </p>
                )}
              </td>

              {/* KOLOM LABEL */}
              <td className="py-8 text-center">
                <span className={`text-[11px] font-black px-4 py-2 rounded-lg tracking-widest uppercase shadow-sm ${item.label ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                  {item.label || 'NORMAL STOCK'}
                </span>
              </td>

              {/* KOLOM ACTION */}
              <td className="py-8 text-right">
                <div className="flex justify-end gap-6">
                  {/* REDIRECT KE UPDATE MODAL */}
                  <button 
                    onClick={() => onOpenEdit(item)} 
                    className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black hover:underline transition-all underline-offset-4"
                  >
                    Edit
                  </button>

                  {/* ACTION DELETE */}
                  <button 
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                  >
                    Delete
                  </button>
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