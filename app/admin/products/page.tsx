'use client';

import React from 'react'
import { supabase } from '@/lib/supabaseClient'
import Swal from 'sweetalert2'

const ProductList = ({ products = [], refreshData, onOpenEdit }: any) => {

  const handleDelete = async (id: any, name: any) => {
    const confirm = await Swal.fire({
      title: `Hapus ${name}?`,
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'YA, HAPUS!',
      cancelButtonText: 'BATAL',
    });

    if (confirm.isConfirmed) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        Swal.fire({ title: 'DELETED!', text: 'Produk berhasil dihapus dari inventori.', icon: 'success', confirmButtonColor: '#000' });
        refreshData();
      } catch (error: any) {
        Swal.fire('ERROR!', error.message, 'error');
      }
    }
  };

  const formatIDR = (price: any) => {
    if (price === null || price === undefined || price === "") return "0";
    return Number(price).toLocaleString('id-ID');
  };

  return (
    <div className="overflow-x-auto border-2 border-black dark:border-white bg-white dark:bg-zinc-950 p-4 sm:p-6">
      <table className="w-full text-left border-collapse min-w-[850px]">
        <thead>
          <tr className="text-xs sm:text-sm font-black tracking-[0.15em] text-zinc-600 dark:text-zinc-400 uppercase border-b-2 border-black dark:border-white">
            <th className="pb-4 font-black">Product Details</th>
            <th className="pb-4 font-black text-center">Pricing</th>
            <th className="pb-4 font-black text-center">Category / Label</th>
            <th className="pb-4 font-black text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {products.map((item: any) => (
            <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all duration-200">
              <td className="py-6 flex items-center gap-5">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white p-2 flex items-center justify-center shrink-0">
                  <img src={item.image_url || 'https://via.placeholder.com/150'} className="max-w-full max-h-full object-contain" alt={item.name} />
                </div>
                <div>
                  <p className="font-black text-base md:text-lg uppercase tracking-tight leading-none mb-2 text-black dark:text-white">
                    {item.name}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase w-max tracking-widest underline underline-offset-2">
                      {item.category || 'GEAR'}
                    </span>

                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.label === 'LIMITED GEAR' ? (
                        item.product_stocks && item.product_stocks.length > 0 ? (
                          item.product_stocks.map((stockItem: any, idx: number) => {
                            const sisaStok = stockItem.stock_physical - stockItem.stock_reserved;
                            return (
                              <span
                                key={idx}
                                className={`text-xs font-mono font-bold px-2.5 py-0.5 border ${
                                  sisaStok > 0
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border-zinc-300 dark:border-zinc-700'
                                    : 'bg-red-50 text-red-600 border-red-300'
                                }`}
                              >
                                {stockItem.size}: {sisaStok}
                              </span>
                            )
                          })
                        ) : (
                          <span className="text-xs font-bold text-red-600 uppercase tracking-tight bg-red-50 px-2.5 py-0.5 border border-red-200">
                            STOK BELUM DIATUR
                          </span>
                        )
                      ) : (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase">
                          REF: DKN-{String(item.id).padStart(3, '0')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              <td className="py-6 text-center">
                <p className="text-base md:text-lg font-black tracking-tight text-black dark:text-white">
                  IDR {formatIDR(item.price)}
                </p>
                {item.original_price && (
                  <p className="text-xs text-red-500 line-through font-bold">
                    IDR {formatIDR(item.original_price)}
                  </p>
                )}
              </td>

              <td className="py-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={`text-xs font-black px-4 py-1.5 tracking-widest uppercase border ${
                      item.label
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {item.label || 'NORMAL STOCK'}
                  </span>
                </div>
              </td>

              <td className="py-6 text-right">
                <div className="flex justify-end gap-5">
                  <button
                    onClick={() => onOpenEdit(item)}
                    className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:underline cursor-pointer"
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
