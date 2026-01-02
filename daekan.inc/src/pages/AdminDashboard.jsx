import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2' // Pastiin udah npm install sweetalert2

const AdminDashboard = () => {
  const [adminEmail, setAdminEmail] = useState('')
  const navigate = useNavigate()

  // --- STATE MANAGEMENT ---
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null) 
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    instagram: '',
    tokopedia: '',
    shopee: '',
    category: 'Merch'
  })

  // Auth Protection Logic
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { 
        navigate('/'); 
      } else { 
        setAdminEmail(user.email); 
      }
    }
    checkAdmin()
  }, [navigate])

  // --- FUNGSI UPLOAD & SAVE ---
  const handleAddProduct = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let publicImageUrl = ''

      // 1. Proses Upload ke Storage
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        
        publicImageUrl = data.publicUrl
      }

      // 2. Simpan Data Lengkap ke Tabel Products
      const { error: insertError } = await supabase
        .from('products')
        .insert([
          { 
            name: newProduct.name, 
            price: newProduct.price,
            image_url: publicImageUrl,
            description: newProduct.description,
            instagram: newProduct.instagram,
            tokopedia: newProduct.tokopedia,
            shopee: newProduct.shopee,
            category: newProduct.category 
          }
        ])

      if (insertError) throw insertError

      // --- JIKA BERHASIL: SWEETALERT & TUTUP MODAL ---
      Swal.fire({
        title: 'SUCCESS!',
        text: 'Produk DAEKAN INC. berhasil dipajang!',
        icon: 'success',
        confirmButtonColor: '#000000',
        background: '#ffffff',
        color: '#000000'
      })

      setIsAdding(false) // Otomatis tutup modal form
      setImageFile(null) // Reset file
      setNewProduct({ name: '', price: '', description: '', instagram: '', tokopedia: '', shopee: '', category: 'Merch' }) // Reset form fields

    } catch (error) {
      // Notifikasi Error pake SweetAlert juga
      Swal.fire({
        title: 'FAILED!',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#000000'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 pt-32 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-16 border-b border-zinc-100 pb-12">
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
              ADMIN<span className="font-light text-zinc-300"> CONTROL</span>
            </h1>
            <p className="text-zinc-400 text-[10px] tracking-[0.4em] font-bold mt-4 uppercase">
              Privileged Access: {adminEmail}
            </p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="text-[10px] font-bold border border-black px-8 py-4 rounded-full hover:bg-black hover:text-white transition-all uppercase tracking-widest"
          >
            Back to Site
          </button>
        </div>

        {/* GRID MENU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-zinc-50 border border-zinc-100 p-10 rounded-[2.5rem] hover:bg-black hover:text-white transition-all duration-500 cursor-pointer">
            <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-6 group-hover:text-zinc-500">Manage Merch</h3>
            <p className="text-5xl font-black italic">12 <span className="text-xs font-light not-italic opacity-40">Items</span></p>
          </div>
          
          <div className="group bg-zinc-50 border border-zinc-100 p-10 rounded-[2.5rem] hover:bg-black hover:text-white transition-all duration-500 cursor-pointer">
            <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-6 group-hover:text-zinc-500">Total Talents</h3>
            <p className="text-5xl font-black italic">08 <span className="text-xs font-light not-italic opacity-40">People</span></p>
          </div>

          {/* TOMBOL ADD PRODUCT */}
          <div 
            onClick={() => setIsAdding(true)}
            className="bg-black text-white p-10 rounded-[2.5rem] flex flex-col justify-between hover:scale-[1.02] transition-all cursor-pointer shadow-xl shadow-black/10"
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">Master Action</h3>
            <p className="text-3xl font-black italic mt-8 leading-tight">ADD NEW<br/>PRODUCT +</p>
          </div>
        </div>
      </div>

      {/* --- MODAL FORM DUA KOLOM --- */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white text-black p-10 rounded-[3rem] w-full max-w-3xl shadow-2xl my-auto">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8 text-center md:text-left">Create New Gear</h2>
            
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* KOLOM KIRI: INFO DASAR */}
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Product Name</label>
                  <input type="text" placeholder="E.G. DAEKAN GRAPHITE PRO" className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors" 
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />
                </div>
                
                <div>
                  <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Price (IDR)</label>
                  <input type="text" placeholder="250.000" className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black transition-colors" 
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
                </div>

                <div>
                  <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Description</label>
                  <textarea placeholder="PRODUCT DETAILS..." className="w-full border-b border-zinc-200 py-2 outline-none font-bold h-20 resize-none focus:border-black transition-colors" 
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                </div>
                
                <div className="bg-zinc-50 p-4 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-black transition-colors">
                  <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase block mb-2">Product Image (Upload)</label>
                  <input type="file" accept="image/*" className="text-xs w-full cursor-pointer" 
                    onChange={(e) => setImageFile(e.target.files[0])} required />
                </div>
              </div>

              {/* KOLOM KANAN: LINKS */}
              <div className="space-y-5 bg-zinc-50 p-8 rounded-[2rem]">
                <label className="text-[10px] font-black tracking-widest text-zinc-800 uppercase block mb-2">Marketplace Links</label>
                <input type="url" placeholder="INSTAGRAM URL" className="w-full bg-transparent border-b border-zinc-300 py-2 outline-none text-sm font-medium focus:border-black transition-colors" 
                  onChange={(e) => setNewProduct({...newProduct, instagram: e.target.value})} />
                <input type="url" placeholder="TOKOPEDIA URL" className="w-full bg-transparent border-b border-zinc-300 py-2 outline-none text-sm font-medium focus:border-black transition-colors" 
                  onChange={(e) => setNewProduct({...newProduct, tokopedia: e.target.value})} />
                <input type="url" placeholder="SHOPEE URL" className="w-full bg-transparent border-b border-zinc-300 py-2 outline-none text-sm font-medium focus:border-black transition-colors" 
                  onChange={(e) => setNewProduct({...newProduct, shopee: e.target.value})} />
              </div>

              {/* FOOTER BUTTONS */}
              <div className="md:col-span-2 flex items-center gap-6 pt-6">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-black text-white py-5 rounded-2xl font-black italic uppercase tracking-widest disabled:bg-zinc-400 shadow-lg shadow-black/20 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  {loading ? 'UPLOADING...' : 'SAVE TO DATABASE'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)} 
                  className="px-6 font-bold uppercase text-zinc-400 hover:text-black transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard