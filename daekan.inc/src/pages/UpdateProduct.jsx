import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Swal from 'sweetalert2'

const UpdateProduct = ({ isOpen, onClose, productData, refreshData }) => {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  
  // State dibikin persis kyk CreateProduct biar konsisten
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

  // Sync data lama ke dalam form pas modal dibuka
  useEffect(() => {
    if (productData) {
      setProduct({
        ...productData,
        // Formatting date biar kebaca input datetime-local
        sale_end_date: productData.sale_end_date ? productData.sale_end_date.substring(0, 16) : ''
      })
    }
  }, [productData])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let publicImageUrl = product.image_url // Pake foto lama defaultnya

      // Proses Upload foto baru kalau ada yang dipilih
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        publicImageUrl = data.publicUrl
      }

      // Update data lengkap ke Supabase
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          ...product,
          image_url: publicImageUrl,
          price: parseFloat(product.price) || 0,
          original_price: product.original_price ? parseFloat(product.original_price) : null,
          sale_end_date: product.sale_end_date ? `${product.sale_end_date}:00+07:00` : null
        })
        .eq('id', product.id)

      if (updateError) throw updateError

      Swal.fire({ title: 'SUCCESS!', text: 'Gear updated successfully!', icon: 'success', confirmButtonColor: '#000' })
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
      <div className="bg-white text-black p-8 md:p-12 rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8">
          Update Gear <span className="text-zinc-400">"{product.name}"</span>
        </h2>
        
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          
          {/* KOLOM KIRI: CORE INFO */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Product Name</label>
              <input type="text" value={product.name} className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors" 
                onChange={(e) => setProduct({...product, name: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Final Price (IDR)</label>
                <input type="number" value={product.price} className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black transition-colors" 
                  onChange={(e) => setProduct({...product, price: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-black tracking-widest text-red-400 uppercase">Original Price (Coret)</label>
                <input type="number" value={product.original_price || ''} className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black transition-colors" 
                  onChange={(e) => setProduct({...product, original_price: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Description</label>
              <textarea value={product.description || ''} className="w-full border-b border-zinc-200 py-2 outline-none font-bold h-20 resize-none focus:border-black transition-colors" 
                onChange={(e) => setProduct({...product, description: e.target.value})} />
            </div>

            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Label (Status)</label>
              <select value={product.label || ''} className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black bg-transparent"
                onChange={(e) => setProduct({...product, label: e.target.value})}>
                <option value="">Normal</option>
                <option value="COMING SOON">COMING SOON</option>
                <option value="PRE-ORDER">PRE-ORDER</option>
                <option value="LIMITED GEAR">LIMITED GEAR</option>
              </select>
            </div>
          </div>

          {/* KOLOM KANAN: LINKS & MEDIA */}
          <div className="space-y-4">
            <div className="bg-zinc-50 p-6 rounded-[1.5rem] space-y-4 shadow-inner">
               <label className="text-xs font-black tracking-widest text-zinc-800 uppercase block">Marketplace & Forms</label>
               <input type="url" value={product.shopee || ''} placeholder="SHOPEE LINK" className="w-full bg-transparent border-b border-zinc-200 py-1 text-sm outline-none focus:border-black" 
                onChange={(e) => setProduct({...product, shopee: e.target.value})} />
               <input type="url" value={product.tokopedia || ''} placeholder="TOKOPEDIA LINK" className="w-full bg-transparent border-b border-zinc-200 py-1 text-sm outline-none focus:border-black" 
                onChange={(e) => setProduct({...product, tokopedia: e.target.value})} />
               <input type="url" value={product.gform || ''} placeholder="G-FORM LINK (FOR MANUAL)" className="w-full bg-transparent border-b border-zinc-200 py-1 text-sm outline-none focus:border-black text-purple-600 font-bold" 
                onChange={(e) => setProduct({...product, gform: e.target.value})} />
               <input type="url" value={product.instagram || ''} placeholder="INSTAGRAM LINK" className="w-full bg-transparent border-b border-zinc-200 py-1 text-sm outline-none focus:border-black text-purple-600 font-bold" 
                onChange={(e) => setProduct({...product, instagram: e.target.value})} />
            </div>

            <div>
                <label className="text-xs font-black tracking-widest text-red-600 uppercase">Flash Sale End Date (WIB)</label>
                <input type="datetime-local" value={product.sale_end_date} className="w-full border-b border-zinc-200 py-2 outline-none font-mono text-sm focus:border-red-600" 
                  onChange={(e) => setProduct({...product, sale_end_date: e.target.value})} />
            </div>

            <div className="bg-zinc-50 p-6 rounded-[1.5rem] border border-zinc-100 flex items-center gap-6">
               <img src={product.image_url} className="w-24 h-24 object-contain bg-white rounded-xl p-2 border shadow-sm" alt="Current" />
               <div className="flex-1">
                 <label className="text-xs font-black text-zinc-400 uppercase block mb-2">Change Image?</label>
                 <input type="file" accept="image/*" className="text-[10px] w-full cursor-pointer file:font-bold file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-200" 
                    onChange={(e) => setImageFile(e.target.files[0])} />
               </div>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center gap-6 mt-6">
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-5 rounded-2xl font-black italic uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl">
              {loading ? 'SAVING CHANGES...' : 'UPDATE MERCH'}
            </button>
            <button type="button" onClick={onClose} className="px-6 font-bold uppercase text-xs text-zinc-400 hover:text-black transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateProduct