'use client';

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Swal from 'sweetalert2'

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const normalizeImages = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val.filter(Boolean)
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {}
    return [val].filter(Boolean)
  }
  return []
}

const UpdateProduct = ({ isOpen, onClose, productData, refreshData, categories = [] }: any) => {
  const [loading, setLoading] = useState(false)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [product, setProduct] = useState<any>({
    name: '', price: '', original_price: '', description: '', label: '',
    sale_end_date: '', category_id: '', product_line: 'DAEKAN MERCH', category: '', is_open: true, has_size: true
  })

  const [stocks, setStocks] = useState<any[]>(DEFAULT_SIZES.map(size => ({ size, stock_physical: '', stock_reserved: 0 })))

  useEffect(() => {
    // Revoke any pending object URLs
    newPreviews.forEach(url => URL.revokeObjectURL(url))
    setNewImageFiles([])
    setNewPreviews([])

    if (productData) {
      setExistingImages(normalizeImages(productData.image_url))
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

  const handleAddNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length > 0) {
      setNewImageFiles(prev => [...prev, ...files])
      const newUrls = files.map(file => URL.createObjectURL(file))
      setNewPreviews(prev => [...prev, ...newUrls])
    }
    if (e.target) e.target.value = ''
  }

  const handleRemoveExistingImage = (idxToRemove: number) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== idxToRemove))
  }

  const handleSetExistingPrimary = (idxToPrimary: number) => {
    if (idxToPrimary === 0) return
    setExistingImages(prev => {
      const copy = [...prev]
      const [moved] = copy.splice(idxToPrimary, 1)
      copy.unshift(moved)
      return copy
    })
  }

  const handleRemoveNewImage = (idxToRemove: number) => {
    URL.revokeObjectURL(newPreviews[idxToRemove])
    setNewImageFiles(prev => prev.filter((_, idx) => idx !== idxToRemove))
    setNewPreviews(prev => prev.filter((_, idx) => idx !== idxToRemove))
  }

  const handleSetNewAsOverallPrimary = (newIdx: number) => {
    // Moves this new file to the very front: makes it the #1 cover
    const fileToMove = newImageFiles[newIdx]
    const previewToMove = newPreviews[newIdx]

    setNewImageFiles(prev => [fileToMove, ...prev.filter((_, idx) => idx !== newIdx)])
    setNewPreviews(prev => [previewToMove, ...prev.filter((_, idx) => idx !== newIdx)])
    // To make it overall primary, also move all existing images after it upon save
    // (We also reorder preview display accordingly)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product.name || !product.price || !product.category_id || !product.category) {
      return Swal.fire({ title: 'PERHATIAN', text: 'Mohon lengkapi Nama, Harga, Genre, dan Jenis Barang.', icon: 'warning', confirmButtonColor: '#000' })
    }

    if (existingImages.length === 0 && newImageFiles.length === 0) {
      return Swal.fire({ title: 'PERHATIAN', text: 'Produk harus memiliki minimal 1 foto.', icon: 'warning', confirmButtonColor: '#000' })
    }

    setLoading(true)

    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i]
        const fileExt = file.name.split('.').pop() || 'png'
        const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        uploadedUrls.push(data.publicUrl)
      }

      const finalImageUrls: string[] = [...existingImages, ...uploadedUrls]

      const { product_stocks, id, created_at, ...cleanProductPayload } = product;

      const { error: updateError } = await supabase.from('products').update({ 
          ...cleanProductPayload,
          image_url: finalImageUrls,
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
              stock_physical: parseInt(s.stock_physical) || 0
            }))
          : [{ 
              product_id: product.id, 
              size: '-', 
              stock_physical: parseInt(stocks[0]?.stock_physical) || 0
            }];
        
        if (stockPayload.length > 0) {
          const { error: stockError } = await supabase.from('product_stocks').upsert(stockPayload, { onConflict: 'product_id,size' });
          if (stockError) throw new Error("Gagal update stok: " + stockError.message);
        }
      }

      Swal.fire({ title: 'PEMBARUAN BERHASIL', text: `Data produk & ${finalImageUrls.length} foto telah diperbarui.`, icon: 'success', confirmButtonColor: '#000' })

      newPreviews.forEach(url => URL.revokeObjectURL(url))
      setNewImageFiles([])
      setNewPreviews([])
      onClose()
      refreshData()
    } catch (error: any) {
      Swal.fire({ title: 'GAGAL MEMPROSES DATA', text: error.message, icon: 'error', confirmButtonColor: '#000' })
    } finally { setLoading(false) }
  }

  if (!isOpen) return null

  const totalImagesCount = existingImages.length + newPreviews.length
  const primaryImageSrc = existingImages[0] || newPreviews[0]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-start justify-center p-4 overflow-y-auto pt-10 pb-20">
      <div className="bg-white dark:bg-zinc-950 text-black dark:text-white border-2 border-black dark:border-white p-6 sm:p-10 w-full max-w-5xl shadow-2xl my-auto mt-10 mb-10">
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-8">
          Update Gear <span className="text-zinc-500">"{product.name}"</span>
        </h2>
        
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="space-y-6">
            {/* Multi Image Management */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black tracking-[0.2em] uppercase text-zinc-400">
                  Product Images ({totalImagesCount} Foto)
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-black uppercase text-black dark:text-white underline hover:opacity-70 cursor-pointer"
                >
                  + Tambah Foto
                </button>
              </div>

              {/* Main Primary Image Display */}
              {primaryImageSrc ? (
                <div className="relative w-full h-64 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-2 border-black dark:border-white overflow-hidden flex items-center justify-center p-4">
                  <img src={primaryImageSrc} className="w-full h-full object-contain" alt="Primary preview" />
                  <div className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1">
                    Foto Utama (Cover)
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                >
                  <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Belum ada foto</p>
                  <p className="text-zinc-400 text-[10px] uppercase">Klik untuk upload foto produk</p>
                </div>
              )}

              {/* All Images Strip: Existing + New Staged */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-1">
                {/* Existing Images */}
                {existingImages.map((url, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className={`relative aspect-square rounded-xl border-2 overflow-hidden bg-zinc-100 dark:bg-zinc-900 group ${
                      idx === 0 ? 'border-black dark:border-white shadow-sm' : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <img src={url} alt={`existing-${idx}`} className="w-full h-full object-contain p-1" />
                    
                    <div className="absolute top-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                      #{idx + 1}
                    </div>

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetExistingPrimary(idx)}
                          className="text-[9px] font-black uppercase bg-white text-black px-1.5 py-0.5 rounded shadow hover:bg-zinc-200"
                          title="Jadikan Foto Utama"
                        >
                          Utama
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="text-[9px] font-black uppercase bg-red-600 text-white px-1.5 py-0.5 rounded shadow hover:bg-red-700"
                        title="Hapus Foto"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}

                {/* New Staged Images */}
                {newPreviews.map((url, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative aspect-square rounded-xl border-2 border-emerald-500 dark:border-emerald-400 overflow-hidden bg-zinc-100 dark:bg-zinc-900 group"
                  >
                    <img src={url} alt={`new-${idx}`} className="w-full h-full object-contain p-1" />
                    
                    <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-black px-1 rounded">
                      BARU
                    </div>

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                      <button
                        type="button"
                        onClick={() => handleSetNewAsOverallPrimary(idx)}
                        className="text-[9px] font-black uppercase bg-white text-black px-1.5 py-0.5 rounded shadow hover:bg-zinc-200"
                        title="Jadikan Foto Utama Baru"
                      >
                        Utama
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="text-[9px] font-black uppercase bg-red-600 text-white px-1.5 py-0.5 rounded shadow hover:bg-red-700"
                        title="Batalkan Foto Baru"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add More Button Tile */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white flex flex-col items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-xl font-bold leading-none">+</span>
                  <span className="text-[9px] font-black uppercase tracking-wider mt-1">Tambah</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddNewImages}
                className="hidden"
              />
            </div>

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
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Genre (Category)</label>
                <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors bg-white dark:bg-zinc-900 cursor-pointer" value={product.category_id} onChange={(e) => setProduct({...product, category_id: e.target.value})} required>
                  <option value="">Pilih Genre</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Product Line</label>
                <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors bg-white dark:bg-zinc-900 cursor-pointer" value={product.product_line} onChange={(e) => setProduct({...product, product_line: e.target.value})}>
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
                <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors bg-white dark:bg-zinc-900 cursor-pointer" value={product.label || ''} onChange={(e) => setProduct({...product, label: e.target.value})}>
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

            {product.label === 'LIMITED GEAR' && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                <p className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Update Stock Inventory</p>
                {product.has_size ? (
                  <div className="grid grid-cols-5 gap-2">
                    {stocks.map((s, idx) => (
                      <div key={s.size} className="text-center">
                        <span className="text-[10px] font-black">{s.size}</span>
                        <input type="number" placeholder="0" className="w-full border border-zinc-200 dark:border-zinc-700 p-2 text-center rounded-lg text-xs font-bold outline-none focus:border-black dark:focus:border-white bg-white dark:bg-zinc-950" value={s.stock_physical} onChange={(e) => {
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
                    <input type="number" placeholder="0" className="w-full border border-zinc-200 dark:border-zinc-700 p-2 rounded-lg text-xs font-bold outline-none focus:border-black dark:focus:border-white bg-white dark:bg-zinc-950" value={stocks[0]?.stock_physical || ''} onChange={(e) => {
                      setStocks([{ size: '-', stock_physical: e.target.value, stock_reserved: stocks[0]?.stock_reserved || 0 }]);
                    }} />
                    <span className="text-[10px] text-zinc-400 block mt-1 font-mono">Reserved: {stocks[0]?.stock_reserved || 0}</span>
                  </div>
                )}
              </div>
            )}

            {product.label === 'PRE-ORDER' && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Batas Akhir Pre-Order</p>
                <input type="datetime-local" className="w-full border border-zinc-200 dark:border-zinc-700 p-2 rounded-lg text-xs font-bold outline-none focus:border-black dark:focus:border-white bg-white dark:bg-zinc-950" value={product.sale_end_date} onChange={(e) => setProduct({...product, sale_end_date: e.target.value})} />
              </div>
            )}

            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold uppercase text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">Batal</button>
              <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs hover:opacity-80 transition-colors disabled:opacity-50">
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
