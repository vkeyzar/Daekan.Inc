import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Swal from 'sweetalert2'

const CreateProduct = ({ isOpen, onClose, refreshData }) => {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null) // State untuk Live Preview
  
  const [product, setProduct] = useState({
    name: '',
    price: '',
    original_price: '',
    description: '',
    label: '',
    instagram: '',
    tokopedia: '',
    shopee: '',
    gform: '',
    sale_end_date: '',
    category: 'Merch'
  })

  // Handler Ganti Gambar + Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let publicImageUrl = ''

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        
        publicImageUrl = data.publicUrl
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert([
          { 
            ...product,
            image_url: publicImageUrl,
            price: parseFloat(product.price) || 0,
            original_price: product.original_price ? parseFloat(product.original_price) : null,
            sale_end_date: product.sale_end_date ? `${product.sale_end_date}:00+07:00` : null
          }
        ])

      if (insertError) throw insertError

      Swal.fire({
        title: 'SUCCESS!',
        text: 'Produk baru sudah live!',
        icon: 'success',
        confirmButtonColor: '#000'
      })

      // Reset states
      setPreviewUrl(null)
      setImageFile(null)
      onClose() 
      refreshData() 
    } catch (error) {
      Swal.fire({ title: 'FAILED!', text: error.message, icon: 'error' })
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
          
          {/* KOLOM KIRI: IMAGE & CORE INFO */}
          <div className="space-y-6">
            {/* AREA DRAG & DROP / PREVIEW */}
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
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    required 
                />
            </div>

            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Product Name</label>
              <input type="text" placeholder="DAEKAN PRO" className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors" 
                onChange={(e) => setProduct({...product, name: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Price (IDR)</label>
                <input type="number" placeholder="250000" className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black transition-colors" 
                  onChange={(e) => setProduct({...product, price: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-black tracking-widest text-red-400 uppercase">Original Price (Coret)</label>
                <input type="number" placeholder="300000" className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black transition-colors" 
                  onChange={(e) => setProduct({...product, original_price: e.target.value})} />
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: LINKS, DATE & DESC */}
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Description</label>
              <textarea placeholder="Product details..." className="w-full border-b border-zinc-200 py-2 outline-none font-bold h-24 resize-none focus:border-black transition-colors" 
                onChange={(e) => setProduct({...product, description: e.target.value})} />
            </div>

            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Label (Status)</label>
              <select className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black bg-transparent"
                onChange={(e) => setProduct({...product, label: e.target.value})}>
                <option value="">Normal</option>
                <option value="COMING SOON">COMING SOON</option>
                <option value="PRE-ORDER">PRE-ORDER</option>
                <option value="LIMITED GEAR">LIMITED GEAR</option>
              </select>
            </div>

            <div className="bg-zinc-50 p-6 rounded-[1.5rem] space-y-4">
               <label className="text-xs font-black tracking-widest text-zinc-800 uppercase block">Marketplace & Forms</label>
               <input type="url" placeholder="SHOPEE LINK" className="w-full bg-transparent border-b border-zinc-200 py-1 text-sm outline-none focus:border-black" 
                onChange={(e) => setProduct({...product, shopee: e.target.value})} />
               <input type="url" placeholder="TOKOPEDIA LINK" className="w-full bg-transparent border-b border-zinc-200 py-1 text-sm outline-none focus:border-black" 
                onChange={(e) => setProduct({...product, tokopedia: e.target.value})} />
               <input type="url" placeholder="G-FORM LINK (FOR MANUAL)" className="w-full bg-transparent border-b border-zinc-200 py-1 text-sm outline-none focus:border-black text-purple-600" 
                onChange={(e) => setProduct({...product, gform: e.target.value})} />
               <input type="url" placeholder="INSTAGRAM LINK" className="w-full bg-transparent border-b border-zinc-200 py-1 text-sm outline-none focus:border-black text-zinc-600" 
                onChange={(e) => setProduct({...product, instagram: e.target.value})} />
            </div>

            <div>
                <label className="text-xs font-black tracking-widest text-red-600 uppercase">Flash Sale End Date (WIB)</label>
                <input type="datetime-local" className="w-full border-b border-zinc-200 py-2 outline-none font-mono text-sm focus:border-red-600 transition-colors" 
                    onChange={(e) => setProduct({...product, sale_end_date: e.target.value})} />
                <p className="text-[9px] text-zinc-400 mt-1 italic leading-none">*Format otomatis WIB (UTC+7)</p>
            </div>
          </div>

          {/* FOOTER ACTION */}
          <div className="md:col-span-2 flex items-center gap-6 mt-6 pt-6 border-t border-zinc-100">
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-5 rounded-2xl font-black italic uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/10">
              {loading ? 'PROCESSING...' : 'UPLOAD TO INVENTORY'}
            </button>
            <button type="button" onClick={onClose} className="px-6 font-bold uppercase text-zinc-400 hover:text-black transition-colors tracking-widest text-xs">
                Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProduct