import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Swal from 'sweetalert2'

const CreateProduct = ({ isOpen, onClose, refreshData, categories = [] }) => {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null) 
  
  const [product, setProduct] = useState({
    name: '',
    price: '',
    original_price: '',
    description: '',
    label: '',
    sale_end_date: '',
    category_id: '', // ✅ GENRE (Frieren, Jetto, dll)
    product_line: 'DAEKAN MERCH', // ✅ LINI PRODUK (Merch/Collab) buat Size Chart
    category: '', // ✅ JENIS BARANG (T-shirt, Deskmat) buat Filter
    is_open: true,
    has_size: true 
  })

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    
    if (!product.name || !product.price || !product.category_id || !product.category) {
      return Swal.fire({
        title: 'PERHATIAN',
        text: 'Mohon lengkapi Nama Produk, Harga, Genre, dan Jenis Barang.',
        icon: 'warning',
        confirmButtonColor: '#000'
      })
    }

    setLoading(true)

    try {
      let publicImageUrl = ''

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile)
        
        if (uploadError) throw uploadError
        
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        publicImageUrl = data.publicUrl
      }

      const { error: insertError } = await supabase.from('products').insert([
        { 
          ...product,
          image_url: publicImageUrl,
          price: parseFloat(product.price) || 0,
          original_price: product.original_price ? parseFloat(product.original_price) : null,
          sale_end_date: product.sale_end_date ? `${product.sale_end_date}:00+07:00` : null
        }
      ])

      if (insertError) throw insertError

      Swal.fire({ title: 'BERHASIL', text: 'Data produk telah disimpan.', icon: 'success', confirmButtonColor: '#000' })

      setPreviewUrl(null)
      setImageFile(null)
      setProduct({ name: '', price: '', original_price: '', description: '', label: '', sale_end_date: '', category_id: '', product_line: 'DAEKAN MERCH', category: '', is_open: true, has_size: true })
      onClose() 
      refreshData() 
      
    } catch (error) {
      Swal.fire({ title: 'GAGAL MEMPROSES DATA', text: error.message, icon: 'error', confirmButtonColor: '#000' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-black p-8 md:p-12 rounded-[2.5rem] w-full max-w-5xl shadow-2xl my-auto">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8">Create New Gear</h2>
        
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          
          <div className="space-y-6">
            <div className="group relative w-full h-72 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200 overflow-hidden flex items-center justify-center hover:border-black transition-all duration-500">
                {previewUrl ? (
                <>
                    <img src={previewUrl} className="w-full h-full object-contain p-4" alt="preview" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <p className="text-white text-xs font-black uppercase tracking-[0.3em]">Change Gear Image</p>
                    </div>
                </>
                ) : (
                <div className="text-center p-8">
                    <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">Drag or Click to Upload</p>
                    <p className="text-zinc-300 text-[10px] uppercase italic">Recommended: 1080x1080px (WEBP)</p>
                </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" required />
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
              <textarea placeholder="Product details..." className="w-full border-b border-zinc-200 py-2 outline-none font-bold h-20 resize-none focus:border-black transition-colors" onChange={(e) => setProduct({...product, description: e.target.value})} />
            </div>

            {/* ✅ ROW 1: GENRE & PRODUCT LINE */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2 block">Theme / Genre</label>
                <select 
                  className="w-full border-b-2 border-zinc-200 py-2 font-black text-black uppercase outline-none bg-transparent cursor-pointer" 
                  value={product.category_id}
                  onChange={(e) => setProduct({...product, category_id: e.target.value})}
                  required
                >
                  <option value="" disabled>-- PILIH GENRE --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2 block">Product Line</label>
                <select 
                  className="w-full border-b-2 border-zinc-200 py-2 font-black text-black uppercase outline-none bg-transparent cursor-pointer" 
                  value={product.product_line}
                  onChange={(e) => setProduct({...product, product_line: e.target.value})}
                  required
                >
                  <option value="DAEKAN MERCH">DAEKAN MERCH</option>
                  <option value="VTUBER COLLAB">VTUBER COLLAB</option>
                </select>
              </div>
            </div>

            {/* ✅ ROW 2: PRODUCT TYPE (T-shirt dll) & ITEM TYPE (Size) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2 block">Product Type (Filter)</label>
                <input 
                  type="text" 
                  placeholder="E.g. T-shirt, Deskmat" 
                  className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors" 
                  onChange={(e) => setProduct({...product, category: e.target.value})} 
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2 block">Size Requirement</label>
                <button type="button" onClick={() => setProduct({ ...product, has_size: !product.has_size })} className={`w-full py-2 rounded-lg font-black text-[10px] md:text-xs transition-all uppercase border ${product.has_size ? 'bg-black text-white border-black shadow-lg shadow-black/20' : 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:border-black hover:text-black'}`}>
                  {product.has_size ? '👕 APPAREL (NEEDS SIZE)' : '🎒 ACCESSORY (NO SIZE)'}
                </button>
              </div>
            </div>

            {/* ✅ ROW 3: STATUS */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Label</label>
                <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black bg-transparent mt-1" onChange={(e) => setProduct({...product, label: e.target.value})}>
                  <option value="">Normal</option>
                  <option value="COMING SOON">COMING SOON</option>
                  <option value="PRE-ORDER">PRE-ORDER</option>
                  <option value="LIMITED GEAR">LIMITED GEAR</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2 block">Order Status</label>
                <button type="button" onClick={() => setProduct({ ...product, is_open: !product.is_open })} className={`w-full py-2 px-2 rounded-lg font-bold tracking-widest text-[10px] transition-all uppercase border ${product.is_open ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>
                  {product.is_open ? '● OPEN' : '■ CLOSED'}
                </button>
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-red-600">Flash Sale End</label>
                <input type="datetime-local" className="w-full border-b border-zinc-200 py-2 outline-none font-mono text-[10px] focus:border-red-600 transition-colors" onChange={(e) => setProduct({...product, sale_end_date: e.target.value})} />
              </div>
            </div>

          </div>

          <div className="md:col-span-2 flex items-center gap-6 mt-6 pt-6 border-t border-zinc-100">
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-5 rounded-2xl font-black italic uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/10">
              {loading ? 'MEMPROSES DATA...' : 'UPLOAD TO INVENTORY'}
            </button>
            <button type="button" onClick={onClose} className="px-6 font-bold uppercase text-zinc-400 hover:text-black transition-colors tracking-widest text-xs">Batalkan</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProduct