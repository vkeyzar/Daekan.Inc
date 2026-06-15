import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import CreateProduct from './CreateProduct'
import ProductList from './ProductList'
import UpdateProduct from './UpdateProduct'
import CreatorList from './CreatorList'
import CreateCreator from './CreateCreator'
import UpdateCreator from './UpdateCreator'
import TransactionList from './TransactionList' 

const AdminDashboard = () => {
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Data States
  const [products, setProducts] = useState([])
  const [creators, setCreators] = useState([])
  const [transactions, setTransactions] = useState([]) 
  const [categories, setCategories] = useState([]) // ✅ STATE KATEGORI BARU

  const navigate = useNavigate()

  // --- STATE NAVIGASI & MODAL ---
  const [activeTab, setActiveTab] = useState('products') 
  const [isAdding, setIsAdding] = useState(false)
  
  // State Edit Produk
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // State Edit Creator
  const [isEditingCreator, setIsEditingCreator] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState(null)

  // State Kategori Baru
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isProcessingCat, setIsProcessingCat] = useState(false)

  // --- FETCH DATA SAKTI (AUTOSYNC) ---
  const fetchAllData = async () => {
    setLoading(true)
    const [prodResponse, creatorResponse, transResponse, catResponse] = await Promise.all([
      // ✅ FIX: Ditambahin product_stocks(*) di sini nih Bro!
      supabase.from('products').select('*, product_stocks(*)').order('created_at', { ascending: false }),
      supabase.from('creators').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('created_at', { ascending: true }) 
    ])

    if (!prodResponse.error) setProducts(prodResponse.data)
    if (!creatorResponse.error) setCreators(creatorResponse.data)
    if (!transResponse.error) setTransactions(transResponse.data)
    if (!catResponse.error) setCategories(catResponse.data)
    setLoading(false)
  }

  const handleOpenEdit = (product) => {
    setSelectedProduct(product)
    setIsEditing(true)
  }
  
  const handleOpenEditCreator = (creator) => {
    setSelectedCreator(creator)
    setIsEditingCreator(true)
  }

  // ✅ FUNGSI NAMBAH KATEGORI
  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    setIsProcessingCat(true)

    const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const { error } = await supabase.from('categories').insert([{ name: newCategoryName, slug }])

    if (error) {
      Swal.fire({ title: 'GAGAL', text: error.message, icon: 'error', confirmButtonColor: '#000' })
    } else {
      Swal.fire({ title: 'BERHASIL', text: 'Genre baru telah ditambahkan.', icon: 'success', confirmButtonColor: '#000' })
      setNewCategoryName('')
      fetchAllData()
    }
    setIsProcessingCat(false)
  }

  // ✅ FUNGSI HAPUS KATEGORI
  const handleDeleteCategory = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Genre?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!'
    })

    if (result.isConfirmed) {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) {
        Swal.fire({ title: 'GAGAL', text: error.message, icon: 'error', confirmButtonColor: '#000' })
      } else {
        Swal.fire({ title: 'TERHAPUS', text: 'Genre berhasil dihapus.', icon: 'success', confirmButtonColor: '#000' })
        fetchAllData()
      }
    }
  }

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
      <div className="max-w-[90rem] mx-auto">
        
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
            className="text-xs font-bold border border-black px-8 py-4 rounded-full hover:bg-black hover:text-white transition-all uppercase tracking-widest shrink-0"
          >
            Back to Site
          </button>
        </div>

        {/* --- GRID MENU / STATS --- */}
        {/* ✅ DIJADIIN 5 KOLOM BIAR MUAT TAB GENRE */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div 
            onClick={() => setActiveTab('products')}
            className={`group p-6 lg:p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer flex flex-col justify-between ${
              activeTab === 'products' ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
            }`}
          >
            <h3 className={`${activeTab === 'products' ? 'text-zinc-500' : 'text-zinc-400'} text-[10px] font-black uppercase tracking-widest mb-4`}>Live Products</h3>
            <p className="text-4xl font-black italic">{products.length.toString().padStart(2, '0')}</p>
          </div>
          
          <div 
            onClick={() => setActiveTab('creators')}
            className={`group p-6 lg:p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer flex flex-col justify-between ${
              activeTab === 'creators' ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
            }`}
          >
            <h3 className={`${activeTab === 'creators' ? 'text-zinc-500' : 'text-zinc-400'} text-[10px] font-black uppercase tracking-widest mb-4`}>Active Talent</h3>
            <p className="text-4xl font-black italic">{creators.length.toString().padStart(2, '0')}</p>
          </div>

          <div 
            onClick={() => setActiveTab('transactions')}
            className={`group p-6 lg:p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer flex flex-col justify-between ${
              activeTab === 'transactions' ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
            }`}
          >
            <h3 className={`${activeTab === 'transactions' ? 'text-zinc-500' : 'text-zinc-400'} text-[10px] font-black uppercase tracking-widest mb-4`}>Orders / Sales</h3>
            <p className="text-4xl font-black italic">{transactions.length.toString().padStart(2, '0')}</p>
          </div>

          {/* ✅ TAB KATEGORI BARU */}
          <div 
            onClick={() => setActiveTab('categories')}
            className={`group p-6 lg:p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer flex flex-col justify-between ${
              activeTab === 'categories' ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
            }`}
          >
            <h3 className={`${activeTab === 'categories' ? 'text-zinc-500' : 'text-zinc-400'} text-[10px] font-black uppercase tracking-widest mb-4`}>Genres</h3>
            <p className="text-4xl font-black italic">{categories.length.toString().padStart(2, '0')}</p>
          </div>

          <div 
            onClick={() => {
              if(activeTab === 'products' || activeTab === 'creators') setIsAdding(true)
            }}
            className={`p-6 lg:p-8 rounded-[2rem] flex flex-col justify-between transition-all shadow-xl group ${
              activeTab === 'transactions' || activeTab === 'categories' 
                ? 'bg-zinc-200 cursor-not-allowed opacity-50' 
                : 'bg-zinc-900 text-white cursor-pointer hover:scale-[1.02] shadow-zinc-900/20'
            }`}
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">Action</h3>
            <p className="text-lg lg:text-xl font-black italic mt-6 leading-tight uppercase">
                {activeTab === 'products' ? 'Add Gear +' : activeTab === 'creators' ? 'Add Talent +' : 'NO ACTION'}
            </p>
          </div>
        </div>

        {/* --- SECTION DINAMIS --- */}
        <div className="mt-16">
            <h2 className="text-2xl font-black italic uppercase mb-8 tracking-tighter">
                {activeTab === 'products' ? 'Inventory' : activeTab === 'creators' ? 'Talent Roster' : activeTab === 'transactions' ? 'Sales Tracker' : 'Genre Management'}
            </h2>
            
            {loading ? (
              <div className="text-center py-20 text-zinc-400 animate-pulse font-black uppercase tracking-widest text-xs">Loading Data...</div>
            ) : activeTab === 'products' ? (
              <ProductList products={products} refreshData={fetchAllData} onOpenEdit={handleOpenEdit} />
            ) : activeTab === 'creators' ? (
              <CreatorList creators={creators} refreshData={fetchAllData} onOpenEditCreator={handleOpenEditCreator} />
            ) : activeTab === 'transactions' ? (
              <TransactionList transactions={transactions} refreshData={fetchAllData} />
            ) : (
              // ✅ TAMPILAN CATEGORY MANAGER
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-100 shadow-xl">
                 <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4 mb-12 border-b border-zinc-100 pb-10">
                    <input
                       type="text"
                       placeholder="Genre Name (e.g. Frieren)"
                       value={newCategoryName}
                       onChange={(e) => setNewCategoryName(e.target.value)}
                       className="flex-1 border-2 border-zinc-200 px-6 py-4 rounded-xl outline-none font-bold uppercase focus:border-black transition-colors"
                       required
                    />
                    <button type="submit" disabled={isProcessingCat} className="bg-black text-white px-10 py-4 rounded-xl font-black italic uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50 shrink-0">
                       {isProcessingCat ? 'PROCESSING...' : 'ADD GENRE +'}
                    </button>
                 </form>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(cat => (
                       <div key={cat.id} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 flex justify-between items-center group hover:border-black transition-colors">
                          <div>
                             <p className="font-black uppercase tracking-widest text-sm text-black">{cat.name}</p>
                             <p className="text-[10px] text-zinc-400 font-mono mt-1">/{cat.slug}</p>
                          </div>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors">
                             Delete
                          </button>
                       </div>
                    ))}
                    {categories.length === 0 && <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest col-span-full">No genres found.</p>}
                 </div>
              </div>
            )}
        </div>
      </div>

      {/* --- MODALS --- */}
      {isAdding && activeTab === 'products' && <CreateProduct isOpen={isAdding} onClose={() => setIsAdding(false)} refreshData={fetchAllData} categories={categories} />}
      {isAdding && activeTab === 'creators' && <CreateCreator isOpen={isAdding} onClose={() => setIsAdding(false)} refreshData={fetchAllData} />}
      <UpdateProduct isOpen={isEditing} onClose={() => { setIsEditing(false); setSelectedProduct(null); }} productData={selectedProduct} refreshData={fetchAllData} categories={categories} />
      <UpdateCreator isOpen={isEditingCreator} onClose={() => { setIsEditingCreator(false); setSelectedCreator(null); }} creatorData={selectedCreator} refreshData={fetchAllData} />
    </div>
  )
}

export default AdminDashboard