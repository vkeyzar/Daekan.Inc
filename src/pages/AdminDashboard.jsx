import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import CreateProduct from './CreateProduct'
import ProductList from './ProductList'
import UpdateProduct from './UpdateProduct'
import CreatorList from './CreatorList'
import CreateCreator from './CreateCreator'
import UpdateCreator from './UpdateCreator'

const AdminDashboard = () => {
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [creators, setCreators] = useState([])
  const navigate = useNavigate()

  // --- STATE NAVIGASI & MODAL ---
  const [activeTab, setActiveTab] = useState('products') 
  const [isAdding, setIsAdding] = useState(false)
  
  // State Edit Produk
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // State Edit Creator (DIBERESIN DI SINI)
  const [isEditingCreator, setIsEditingCreator] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState(null)

  // --- FETCH DATA SAKTI (AUTOSYNC) ---
  const fetchAllData = async () => {
    setLoading(true)
    const [prodResponse, creatorResponse] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('creators').select('*').order('created_at', { ascending: false })
    ])

    if (!prodResponse.error) setProducts(prodResponse.data)
    if (!creatorResponse.error) setCreators(creatorResponse.data)
    setLoading(false)
  }

  // Handler Edit Produk
  const handleOpenEdit = (product) => {
    setSelectedProduct(product)
    setIsEditing(true)
  }
  
  // Handler Edit Creator (FIXED)
  const handleOpenEditCreator = (creator) => {
    setSelectedCreator(creator)
    setIsEditingCreator(true)
  }

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
        fetchAllData(); 
      }
    }
    checkAdmin()
  }, [navigate])

  return (
    <div className="min-h-screen bg-white text-black p-8 pt-32 relative font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-16 border-b border-zinc-100 pb-12">
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
              ADMIN<span className="font-light text-zinc-300"> CONTROL</span>
            </h1>
            <p className="text-zinc-400 text-xs tracking-[0.4em] font-bold mt-4 uppercase">
              Privileged Access: {adminEmail}
            </p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="text-xs font-bold border border-black px-8 py-4 rounded-full hover:bg-black hover:text-white transition-all uppercase tracking-widest"
          >
            Back to Site
          </button>
        </div>

        {/* --- GRID MENU / STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            onClick={() => setActiveTab('products')}
            className={`group p-10 rounded-[2.5rem] border transition-all duration-500 cursor-pointer ${
              activeTab === 'products' ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
            }`}
          >
            <h3 className={`${activeTab === 'products' ? 'text-zinc-500' : 'text-zinc-400'} text-xs font-black uppercase tracking-widest mb-6`}>Live Products</h3>
            <p className="text-5xl font-black italic">
              {products.length.toString().padStart(2, '0')} 
              <span className="text-xs font-light not-italic opacity-40"> Items</span>
            </p>
          </div>
          
          <div 
            onClick={() => setActiveTab('creators')}
            className={`group p-10 rounded-[2.5rem] border transition-all duration-500 cursor-pointer ${
              activeTab === 'creators' ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
            }`}
          >
            <h3 className={`${activeTab === 'creators' ? 'text-zinc-500' : 'text-zinc-400'} text-xs font-black uppercase tracking-widest mb-6`}>Active Talent</h3>
            <p className="text-5xl font-black italic">
              {creators.length.toString().padStart(2, '0')} 
              <span className="text-xs font-light not-italic opacity-40"> Person</span>
            </p>
          </div>

          <div 
            onClick={() => setIsAdding(true)}
            className="bg-zinc-900 text-white p-10 rounded-[2.5rem] flex flex-col justify-between hover:scale-[1.02] transition-all cursor-pointer shadow-xl shadow-zinc-900/20 group"
          >
            <h3 className="text-xs font-black uppercase tracking-widest opacity-50">Master Action</h3>
            <p className="text-2xl font-black italic mt-8 leading-tight group-hover:translate-x-2 transition-transform uppercase">
                {activeTab === 'products' ? 'Add New Gear +' : 'Add New Talent +'}
            </p>
          </div>
        </div>

        {/* --- SECTION DINAMIS --- */}
        <div className="mt-20">
            <h2 className="text-2xl font-black italic uppercase mb-8 tracking-tighter">
                {activeTab === 'products' ? 'Recent Inventory' : 'Talent Roster'}
            </h2>
            
            {loading ? (
              <div className="text-center py-20 text-zinc-400 animate-pulse font-black uppercase tracking-widest text-xs">Loading {activeTab}...</div>
            ) : activeTab === 'products' ? (
              <ProductList products={products} refreshData={fetchAllData} onOpenEdit={handleOpenEdit} />
            ) : (
              <CreatorList 
                creators={creators} 
                refreshData={fetchAllData} 
                onOpenEditCreator={handleOpenEditCreator} // HUBUNGKAN KE HANDLER
              />
            )}
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Modal Tambah Produk */}
      {isAdding && activeTab === 'products' && (
        <CreateProduct isOpen={isAdding} onClose={() => setIsAdding(false)} refreshData={fetchAllData} />
      )}
      
      {/* 2. Modal Tambah Creator */}
      {isAdding && activeTab === 'creators' && (
        <CreateCreator isOpen={isAdding} onClose={() => setIsAdding(false)} refreshData={fetchAllData} />
      )}

      {/* 3. Modal Edit Produk */}
      <UpdateProduct 
        isOpen={isEditing} 
        onClose={() => { setIsEditing(false); setSelectedProduct(null); }} 
        productData={selectedProduct} 
        refreshData={fetchAllData} 
      />

      {/* 4. Modal Edit Creator (DIPASANG DI SINI) */}
      <UpdateCreator 
        isOpen={isEditingCreator} 
        onClose={() => { setIsEditingCreator(false); setSelectedCreator(null); }} 
        creatorData={selectedCreator} 
        refreshData={fetchAllData} 
      />
    </div>
  )
}

export default AdminDashboard