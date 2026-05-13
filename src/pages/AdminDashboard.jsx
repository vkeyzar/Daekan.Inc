import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import CreateProduct from './CreateProduct'
import ProductList from './ProductList'
import UpdateProduct from './UpdateProduct'
import CreatorList from './CreatorList'
import CreateCreator from './CreateCreator'
import UpdateCreator from './UpdateCreator'
import TransactionList from './TransactionList' // ✅ IMPORT COMPONENT BARU

const AdminDashboard = () => {
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [creators, setCreators] = useState([])
  const [transactions, setTransactions] = useState([]) // ✅ STATE TRANSAKSI
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

  // --- FETCH DATA SAKTI (AUTOSYNC) ---
  const fetchAllData = async () => {
    setLoading(true)
    const [prodResponse, creatorResponse, transResponse] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('creators').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }) // ✅ FETCH TRANSAKSI
    ])

    if (!prodResponse.error) setProducts(prodResponse.data)
    if (!creatorResponse.error) setCreators(creatorResponse.data)
    if (!transResponse.error) setTransactions(transResponse.data)
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
      <div className="max-w-7xl mx-auto">
        
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div 
            onClick={() => setActiveTab('products')}
            className={`group p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer ${
              activeTab === 'products' ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
            }`}
          >
            <h3 className={`${activeTab === 'products' ? 'text-zinc-500' : 'text-zinc-400'} text-[10px] font-black uppercase tracking-widest mb-4`}>Live Products</h3>
            <p className="text-4xl font-black italic">{products.length.toString().padStart(2, '0')}</p>
          </div>
          
          <div 
            onClick={() => setActiveTab('creators')}
            className={`group p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer ${
              activeTab === 'creators' ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
            }`}
          >
            <h3 className={`${activeTab === 'creators' ? 'text-zinc-500' : 'text-zinc-400'} text-[10px] font-black uppercase tracking-widest mb-4`}>Active Talent</h3>
            <p className="text-4xl font-black italic">{creators.length.toString().padStart(2, '0')}</p>
          </div>

          {/* ✅ KOTAK TRANSAKSI BARU */}
          <div 
            onClick={() => setActiveTab('transactions')}
            className={`group p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer ${
              activeTab === 'transactions' ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
            }`}
          >
            <h3 className={`${activeTab === 'transactions' ? 'text-zinc-500' : 'text-zinc-400'} text-[10px] font-black uppercase tracking-widest mb-4`}>Orders / Sales</h3>
            <p className="text-4xl font-black italic">{transactions.length.toString().padStart(2, '0')}</p>
          </div>

          {/* TOMBOL ADD NYA MENYESUAIKAN TAB */}
          <div 
            onClick={() => {
              if(activeTab === 'products' || activeTab === 'creators') setIsAdding(true)
            }}
            className={`p-8 rounded-[2rem] flex flex-col justify-between transition-all shadow-xl group ${activeTab === 'transactions' ? 'bg-zinc-200 cursor-not-allowed opacity-50' : 'bg-zinc-900 text-white cursor-pointer hover:scale-[1.02] shadow-zinc-900/20'}`}
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">Action</h3>
            <p className="text-xl font-black italic mt-6 leading-tight uppercase">
                {activeTab === 'products' ? 'Add Gear +' : activeTab === 'creators' ? 'Add Talent +' : 'NO ACTION'}
            </p>
          </div>
        </div>

        {/* --- SECTION DINAMIS --- */}
        <div className="mt-16">
            <h2 className="text-2xl font-black italic uppercase mb-8 tracking-tighter">
                {activeTab === 'products' ? 'Inventory' : activeTab === 'creators' ? 'Talent Roster' : 'Sales Tracker'}
            </h2>
            
            {loading ? (
              <div className="text-center py-20 text-zinc-400 animate-pulse font-black uppercase tracking-widest text-xs">Loading Data...</div>
            ) : activeTab === 'products' ? (
              <ProductList products={products} refreshData={fetchAllData} onOpenEdit={handleOpenEdit} />
            ) : activeTab === 'creators' ? (
              <CreatorList creators={creators} refreshData={fetchAllData} onOpenEditCreator={handleOpenEditCreator} />
            ) : (
              // ✅ TAMPILIN KOMPONEN TRANSAKSI
              <TransactionList transactions={transactions} refreshData={fetchAllData} />
            )}
        </div>
      </div>

      {/* --- MODALS --- */}
      {isAdding && activeTab === 'products' && <CreateProduct isOpen={isAdding} onClose={() => setIsAdding(false)} refreshData={fetchAllData} />}
      {isAdding && activeTab === 'creators' && <CreateCreator isOpen={isAdding} onClose={() => setIsAdding(false)} refreshData={fetchAllData} />}
      <UpdateProduct isOpen={isEditing} onClose={() => { setIsEditing(false); setSelectedProduct(null); }} productData={selectedProduct} refreshData={fetchAllData} />
      <UpdateCreator isOpen={isEditingCreator} onClose={() => { setIsEditingCreator(false); setSelectedCreator(null); }} creatorData={selectedCreator} refreshData={fetchAllData} />
    </div>
  )
}

export default AdminDashboard