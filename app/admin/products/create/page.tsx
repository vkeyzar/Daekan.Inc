'use client';

import React, { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Swal from 'sweetalert2'

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const CreateProduct = ({ isOpen, onClose, refreshData, categories = [] }: any) => {
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [product, setProduct] = useState({
    name: '', price: '', original_price: '', description: '', label: '',
    sale_end_date: '', category_id: '', product_line: 'DAEKAN MERCH', category: '', is_open: true, has_size: true 
  })

  const [stocks, setStocks] = useState(DEFAULT_SIZES.map(size => ({ size, stock_physical: '' })))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files])
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newPreviews])
    }
    // reset input value so re-selecting same file works
    if (e.target) e.target.value = ''
  }

  const handleRemoveImage = (indexToRemove: number) => {
    URL.revokeObjectURL(previewUrls[indexToRemove])
    setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove))
    setPreviewUrls(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return
    setImageFiles(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(indexToPrimary, 1)
      updated.unshift(moved)
      return updated
    })
    setPreviewUrls(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(indexToPrimary, 1)
      updated.unshift(moved)
      return updated
    })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product.name || !product.price || !product.category_id || !product.category) {
      return Swal.fire({ title: 'PERHATIAN', text: 'Mohon lengkapi Nama Produk, Harga, Genre, dan Jenis Barang.', icon: 'warning', confirmButtonColor: '#000' })
    }

    if (imageFiles.length === 0) {
      return Swal.fire({ title: 'PERHATIAN', text: 'Mohon upload minimal 1 foto produk.', icon: 'warning', confirmButtonColor: '#000' })
    }

    setLoading(true)

    try {
      const publicImageUrls: string[] = []

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const fileExt = file.name.split('.').pop() || 'png'
        const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        publicImageUrls.push(data.publicUrl)
      }

      const { data: insertedProduct, error: insertError } = await supabase.from('products').insert([
        { 
          ...product,
          image_url: publicImageUrls,
          price: parseFloat(product.price) || 0,
          original_price: product.original_price ? parseFloat(product.original_price) : null,
          sale_end_date: product.sale_end_date ? `${product.sale_end_date}:00+07:00` : null
        }
      ]).select().single()

      if (insertError) throw insertError

      if (product.label === 'LIMITED GEAR') {
        const stockPayload = product.has_size 
          ? stocks.filter(s => s.size && s.size.trim() !== '' && s.stock_physical !== '').map(s => ({
              product_id: insertedProduct.id, 
              size: s.size.toUpperCase().trim(), 
              stock_physical: parseInt(s.stock_physical) || 0, 
              stock_reserved: 0
            }))
          : [{ 
              product_id: insertedProduct.id, 
              size: '-', 
              stock_physical: parseInt(stocks[0]?.stock_physical) || 0, 
              stock_reserved: 0 
            }];
        
        if (stockPayload.length > 0) {
          const { error: stockError } = await supabase.from('product_stocks').insert(stockPayload);
          if (stockError) throw new Error("Gagal menyimpan data stok: " + stockError.message);
        }
      }

      Swal.fire({ title: 'BERHASIL', text: `Data produk & ${publicImageUrls.length} foto telah disimpan.`, icon: 'success', confirmButtonColor: '#000' })

      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setPreviewUrls([])
      setImageFiles([])
      setProduct({ name: '', price: '', original_price: '', description: '', label: '', sale_end_date: '', category_id: '', product_line: 'DAEKAN MERCH', category: '', is_open: true, has_size: true })
      setStocks(DEFAULT_SIZES.map(size => ({ size, stock_physical: '' })))
      onClose(); refreshData();
      
    } catch (error: any) {
      Swal.fire({ title: 'GAGAL MEMPROSES DATA', text: error.message, icon: 'error', confirmButtonColor: '#000' })
    } finally { setLoading(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-start justify-center p-4 overflow-y-auto pt-10 pb-20">
      <div className="bg-white dark:bg-zinc-950 text-black dark:text-white border-2 border-black dark:border-white p-6 sm:p-10 w-full max-w-5xl shadow-2xl my-auto mt-10 mb-10">
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-8">Create New Gear</h2>
        
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="space-y-6">
            {/* Multi Image Upload Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black tracking-[0.2em] uppercase text-zinc-400">
                  Product Images ({previewUrls.length} Foto)
                </label>
                {previewUrls.length > 0 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-black uppercase text-black dark:text-white underline hover:opacity-70 cursor-pointer"
                  >
                    + Tambah Foto Lain
                  </button>
                )}
              </div>

              {previewUrls.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-full h-72 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col items-center justify-center hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer p-6 text-center"
                >
                  <svg className="w-12 h-12 text-zinc-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">
                    Upload Foto Produk (Bisa Pilih Banyak)
                  </p>
                  <p className="text-zinc-400 text-[10px] uppercase">
                    Klik atau drag file gambar ke sini (Foto pertama otomatis jadi cover utama)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Primary Image Preview */}
                  <div className="relative w-full h-64 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-2 border-black dark:border-white overflow-hidden flex items-center justify-center p-4">
                    <img src={previewUrls[0]} className="w-full h-full object-contain" alt="Primary preview" />
                    <div className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1">
                      Foto Utama (Cover)
                    </div>
                  </div>

                  {/* All Thumbnails Strip with Set Primary & Delete actions */}
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {previewUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-xl border-2 overflow-hidden bg-zinc-100 dark:bg-zinc-900 group ${
                          idx === 0 ? 'border-black dark:border-white shadow-sm' : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <img src={url} alt={`preview-${idx}`} className="w-full h-full object-contain p-1" />
                        
                        <div className="absolute top-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                          #{idx + 1}
                        </div>

                        {/* Action buttons overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(idx)}
                              className="text-[9px] font-black uppercase bg-white text-black px-1.5 py-0.5 rounded shadow hover:bg-zinc-200"
                              title="Jadikan Foto Utama"
                            >
                              Utama
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-[9px] font-black uppercase bg-red-600 text-white px-1.5 py-0.5 rounded shadow hover:bg-red-700"
                            title="Hapus Foto"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add More Tile */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white flex flex-col items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="text-xl font-bold leading-none">+</span>
                      <span className="text-[9px] font-black uppercase tracking-wider mt-1">Tambah</span>
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Product Name</label>
              <input type="text" placeholder="DAEKAN PRO" className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors" onChange={(e) => setProduct({...product, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Price (IDR)</label>
                <input type="number" placeholder="250000" className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black transition-colors" onChange={(e) => setProduct({...product, price: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-red-400">Original Price (Coret)</label>
                <input type="number" placeholder="300000" className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black transition-colors" onChange={(e) => setProduct({...product, original_price: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Description</label>
              <textarea placeholder="Product description..." className="w-full border border-zinc-200 p-4 rounded-xl outline-none font-bold h-24 resize-none focus:border-black transition-colors" onChange={(e) => setProduct({...product, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Genre (Category)</label>
                <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors bg-white dark:bg-zinc-900 cursor-pointer" value={product.category_id} onChange={(e) => setProduct({...product, category_id: e.target.value})} required>
                  <option value="">Pilih Genre</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Product Line</label>
                <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors bg-white dark:bg-zinc-900 cursor-pointer" value={product.product_line} onChange={(e) => setProduct({...product, product_line: e.target.value})}>
                  <option value="DAEKAN MERCH">DAEKAN MERCH</option>
                  <option value="DAEKAN COLLAB">DAEKAN COLLAB</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Jenis Barang</label>
                <input type="text" placeholder="E.G. T-SHIRT / DESKMAT" className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors" onChange={(e) => setProduct({...product, category: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Product Label</label>
                <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors bg-white dark:bg-zinc-900 cursor-pointer" value={product.label} onChange={(e) => setProduct({...product, label: e.target.value})}>
                  <option value="">NORMAL STOCK</option>
                  <option value="LIMITED GEAR">LIMITED GEAR (TRACK STOCK)</option>
                  <option value="PRE-ORDER">PRE-ORDER (OPEN / CLOSE)</option>
                </select>
              </div>
            </div>

            {/* LOGIKA TAMBAHAN SESUAI LABEL */}
            {product.label === 'LIMITED GEAR' && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Atur Stok Fisik</p>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input type="checkbox" checked={product.has_size} onChange={(e) => setProduct({...product, has_size: e.target.checked})} />
                    Memiliki Pilihan Size
                  </label>
                </div>

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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Total Stok Keseluruhan</label>
                    <input type="number" placeholder="Contoh: 50" className="w-full border border-zinc-200 dark:border-zinc-700 p-2 rounded-lg text-xs font-bold outline-none focus:border-black dark:focus:border-white bg-white dark:bg-zinc-950" value={stocks[0]?.stock_physical || ''} onChange={(e) => {
                      setStocks([{ size: '-', stock_physical: e.target.value }]);
                    }} />
                  </div>
                )}
              </div>
            )}

            {product.label === 'PRE-ORDER' && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Batas Akhir Pre-Order</p>
                <input type="datetime-local" className="w-full border border-zinc-200 dark:border-zinc-700 p-2 rounded-lg text-xs font-bold outline-none focus:border-black dark:focus:border-white bg-white dark:bg-zinc-950" onChange={(e) => setProduct({...product, sale_end_date: e.target.value})} />
              </div>
            )}

            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold uppercase text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">Batal</button>
              <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs hover:opacity-80 transition-colors disabled:opacity-50">
                {loading ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProduct
