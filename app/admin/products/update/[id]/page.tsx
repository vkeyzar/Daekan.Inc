"use client";

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Swal from 'sweetalert2'

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const UpdateProduct = ({ isOpen, onClose, productData, refreshData, categories = [] }: { isOpen?: boolean; onClose?: any; productData?: any; refreshData?: any; categories?: any[] }) => {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [product, setProduct] = useState<any>({
    name: '', price: '', original_price: '', description: '', label: '',
    sale_end_date: '', category_id: '', product_line: 'DAEKAN MERCH', category: '', is_open: true, has_size: true
  })

  const [stocks, setStocks] = useState<any[]>(DEFAULT_SIZES.map(size => ({ size, stock_physical: '', stock_reserved: 0 })))

  useEffect(() => {
    if (productData) {
      setProduct({
        ...productData,
        sale_end_date: productData.sale_end_date ? productData.sale_end_date.substring(0, 16) : '',
        category_id: productData.category_id || '',
        product_line: productData.product_line || 'DAEKAN MERCH',
        category: productData.category || '',
        has_size: productData.has_size !== undefined ? productData.has_size : true
      })

      if (productData.label === 'LIMITED GEAR') {
        const fetchStocks = async () => {
          const { data } = await supabase.from('product_stocks').select('*').eq('product_id', productData.id);
          if (data && data.length > 0) {
            if (productData.has_size) {
               setStocks(data.map((d: any) => ({ size: d.size, stock_physical: d.stock_physical, stock_reserved: d.stock_reserved })));
            } else {
               setStocks([{ size: '-', stock_physical: data[0].stock_physical, stock_reserved: data[0].stock_reserved }]);
            }
          } else {
            setStocks(productData.has_size ? DEFAULT_SIZES.map(size => ({ size, stock_physical: '', stock_reserved: 0 })) : [{ size: '-', stock_physical: '', stock_reserved: 0 }]);
          }
        };
        fetchStocks();
      }
    }
  }, [productData])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product.name || !product.price || !product.category_id || !product.category) {
      return Swal.fire({ title: 'PERHATIAN', text: 'Mohon lengkapi Nama, Harga, Genre, dan Jenis Barang.', icon: 'warning', confirmButtonColor: '#000' })
    }

    setLoading(true)

    try {
      let publicImageUrl = product.image_url 
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop() || 'png'
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        publicImageUrl = data.publicUrl
      }

      const { product_stocks, id, created_at, ...cleanProductPayload } = product;

      const { error: updateError } = await supabase.from('products').update({ 
          ...cleanProductPayload,
          image_url: publicImageUrl,
          price: parseFloat(cleanProductPayload.price) || 0,
          original_price: cleanProductPayload.original_price ? parseFloat(cleanProductPayload.original_price) : null,
          sale_end_date: cleanProductPayload.sale_end_date ? `${cleanProductPayload.sale_end_date}:00+07:00` : null
        }).eq('id', product.id)

      if (updateError) throw updateError

      if (product.label === 'LIMITED GEAR') {
        const stockPayload = product.has_size 
          ? stocks.filter(s => s.size && s.size.trim() !== '' && s.stock_physical !== '').map(s => ({
              product_id: product.id, 
              size: s.size.toUpperCase().trim(), 
              stock_physical: parseInt(s.stock_physical) || 0, 
              stock_reserved: parseInt(s.stock_reserved) || 0
            }))
          : [{ 
              product_id: product.id, 
              size: '-', 
              stock_physical: parseInt(stocks[0]?.stock_physical) || 0, 
              stock_reserved: parseInt(stocks[0]?.stock_reserved) || 0 
            }];
        
        if (stockPayload.length > 0) {
          // ✅ FIX SPASI ONCONFLICT DAN TAMBAH ERROR THROW
          const { error: stockError } = await supabase.from('product_stocks').upsert(stockPayload, { onConflict: 'product_id,size' });
          if (stockError) throw new Error("Gagal update stok: " + stockError.message);
        }
      }

      Swal.fire({ title: 'PEMBARUAN BERHASIL', text: 'Data produk & stok telah diperbarui.', icon: 'success', confirmButtonColor: '#000' })

      onClose()
      refreshData()
    } catch (error: any) {
      Swal.fire({ title: 'GAGAL MEMPROSES DATA', text: error.message, icon: 'error', confirmButtonColor: '#000' })
    } finally { setLoading(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-start justify-center p-4 overflow-y-auto pt-10 pb-20">
      <div className="bg-white text-black p-8 md:p-12 rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto mt-10 mb-10">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8">
          Update Gear <span className="text-zinc-400">"{product.name}"</span>
        </h2>
        
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Product Name</label>
              <input type="text" value={product.name} className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors" onChange={(e) => setProduct({...product, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Final Price (IDR)</label>
                <input type="number" value={product.price} className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black transition-colors" onChange={(e) => setProduct({...product, price: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-black tracking-widest text-red-400 uppercase">Original Price (Coret)</label>
                <input type="number" value={product.original_price || ''} className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black transition-colors" onChange={(e) => setProduct({...product, original_price: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Description</label>
              <textarea value={product.description || ''} className="w-full border-b border-zinc-200 py-2 outline-none font-bold h-20 resize-none focus:border-black transition-colors" onChange={(e) => setProduct({...product, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Genre (Category)</label>
                <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors bg-white cursor-pointer" value={product.category_id} onChange={(e) => setProduct({...product, category_id: e.target.value})} required>
                  <option value="">Pilih Genre</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Product Line</label>
                <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors bg-white cursor-pointer" value={product.product_line} onChange={(e) => setProduct({...product, product_line: e.target.value})}>
                  <option value="DAEKAN MERCH">DAEKAN MERCH</option>
                  <option value="DAEKAN COLLAB">DAEKAN COLLAB</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Jenis Barang</label>
                <input type="text" value={product.category} placeholder="E.G. T-SHIRT / DESKMAT" className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors" onChange={(e) => setProduct({...product, category: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Product Label</label>
                <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors bg-white cursor-pointer" value={product.label || ''} onChange={(e) => setProduct({...product, label: e.target.value})}>
                  <option value="">NORMAL STOCK</option>
                  <option value="LIMITED GEAR">LIMITED GEAR (TRACK STOCK)</option>
                  <option value="PRE-ORDER">PRE-ORDER (OPEN / CLOSE)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer">
                <input type="checkbox" checked={product.is_open} onChange={(e) => setProduct({...product, is_open: e.target.checked})} />
                Available to Order
              </label>
              {product.label === 'LIMITED GEAR' && (
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer">
                  <input type="checkbox" checked={product.has_size} onChange={(e) => setProduct({...product, has_size: e.target.checked})} />
                  Has Sizes
                </label>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-2">Change Image (Optional)</label>
              <div className="flex items-center gap-4">
                <img src={imageFile ? URL.createObjectURL(imageFile) : product.image_url} alt="product" className="w-20 h-20 object-contain border border-zinc-200 rounded-xl p-2 bg-zinc-50" />
                <input type="file" accept="image/*" onChange={(e: any) => setImageFile(e.target.files[0])} className="text-xs font-bold" />
              </div>
            </div>

            {product.label === 'LIMITED GEAR' && (
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
                <p className="text-xs font-black uppercase tracking-wider text-black">Update Stock Inventory</p>
                {product.has_size ? (
                  <div className="grid grid-cols-5 gap-2">
                    {stocks.map((s, idx) => (
                      <div key={s.size} className="text-center">
                        <span className="text-[10px] font-black">{s.size}</span>
                        <input type="number" placeholder="0" className="w-full border border-zinc-200 p-2 text-center rounded-lg text-xs font-bold outline-none focus:border-black" value={s.stock_physical} onChange={(e) => {
                          const newStocks = [...stocks];
                          newStocks[idx].stock_physical = e.target.value;
                          setStocks(newStocks);
                        }} />
                        <span className="text-[8px] text-zinc-400 block mt-1 font-mono">Res: {s.stock_reserved}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Total Stock</label>
                    <input type="number" placeholder="0" className="w-full border border-zinc-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-black" value={stocks[0]?.stock_physical || ''} onChange={(e) => {
                      setStocks([{ size: '-', stock_physical: e.target.value, stock_reserved: stocks[0]?.stock_reserved || 0 }]);
                    }} />
                    <span className="text-[10px] text-zinc-400 block mt-1 font-mono">Reserved: {stocks[0]?.stock_reserved || 0}</span>
                  </div>
                )}
              </div>
            )}

            {product.label === 'PRE-ORDER' && (
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-black">Batas Akhir Pre-Order</p>
                <input type="datetime-local" className="w-full border border-zinc-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-black bg-white" value={product.sale_end_date} onChange={(e) => setProduct({...product, sale_end_date: e.target.value})} />
              </div>
            )}

            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-zinc-100">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-zinc-200 font-bold uppercase text-xs hover:bg-zinc-100 transition-colors">Batal</button>
              <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl bg-black text-white font-bold uppercase text-xs hover:bg-zinc-800 transition-colors disabled:opacity-50">
                {loading ? 'Menyimpan...' : 'Perbarui Produk'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateProduct

export default UpdateProduct