'use client';

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import Navbar from '@/components/Navbar'
import CreateProduct from './products/create/page'
import ProductList from './products/page'
import UpdateProduct from './products/update/[id]/page'
import CreatorList from './creators/page'
import CreateCreator from './creators/create/page'
import UpdateCreator from './creators/update/[id]/page'
import TransactionList from './transactions/page'

const AdminDashboard = () => {
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)

  const [products, setProducts] = useState<any[]>([])
  const [creators, setCreators] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  const router = useRouter()

  const [activeTab, setActiveTab] = useState('products')
  const [isAdding, setIsAdding] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const [isEditingCreator, setIsEditingCreator] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState<any>(null)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [isProcessingCat, setIsProcessingCat] = useState(false)

  const fetchAllData = async () => {
    setLoading(true)
    const [prodResponse, creatorResponse, transResponse, catResponse] = await Promise.all([
      supabase.from('products').select('*, product_stocks(*)').order('created_at', { ascending: false }),
      supabase.from('creators').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('created_at', { ascending: true })
    ])

    if (!prodResponse.error) setProducts(prodResponse.data || [])
    if (!creatorResponse.error) setCreators(creatorResponse.data || [])
    if (!transResponse.error) setTransactions(transResponse.data || [])
    if (!catResponse.error) setCategories(catResponse.data || [])
    setLoading(false)
  }

  const handleOpenEdit = (product: any) => {
    setSelectedProduct(product)
    setIsEditing(true)
  }

  const handleOpenEditCreator = (creator: any) => {
    setSelectedCreator(creator)
    setIsEditingCreator(true)
  }

  const handleAddCategory = async (e: React.FormEvent) => {
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

  const handleDeleteCategory = async (id: any) => {
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
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') {
        router.push('/');
      } else {
        setAdminEmail(user.email || '');
        fetchAllData();
      }
    }
    checkAdmin()
  }, [router])

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative font-sans">
      <Navbar />
      <div className="max-w-[90rem] mx-auto p-4 sm:p-8 pt-10 pb-20">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 border-b-2 border-black dark:border-white pb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none text-black dark:text-white">
              ADMIN <span className="font-light text-zinc-500 dark:text-zinc-400">CONTROL</span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm tracking-[0.25em] font-bold mt-3 uppercase break-all">
              Privileged Access: {adminEmail}
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-xs sm:text-sm font-black border-2 border-black dark:border-white px-6 sm:px-8 py-3.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-widest shrink-0 cursor-pointer"
          >
            Back to Site
          </button>
        </div>

        {/* --- GRID MENU / STATS --- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
          <div
            onClick={() => setActiveTab('products')}
            className={`group p-5 sm:p-6 lg:p-8 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              activeTab === 'products'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                : 'bg-white dark:bg-zinc-950 border-black dark:border-white text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <h3 className={`${activeTab === 'products' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'} text-xs font-black uppercase tracking-widest mb-4`}>
              Live Products
            </h3>
            <p className="text-3xl sm:text-4xl font-black">{products.length.toString().padStart(2, '0')}</p>
          </div>

          <div
            onClick={() => setActiveTab('creators')}
            className={`group p-5 sm:p-6 lg:p-8 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              activeTab === 'creators'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                : 'bg-white dark:bg-zinc-950 border-black dark:border-white text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <h3 className={`${activeTab === 'creators' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'} text-xs font-black uppercase tracking-widest mb-4`}>
              Active Talent
            </h3>
            <p className="text-3xl sm:text-4xl font-black">{creators.length.toString().padStart(2, '0')}</p>
          </div>

          <div
            onClick={() => setActiveTab('transactions')}
            className={`group p-5 sm:p-6 lg:p-8 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              activeTab === 'transactions'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                : 'bg-white dark:bg-zinc-950 border-black dark:border-white text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <h3 className={`${activeTab === 'transactions' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'} text-xs font-black uppercase tracking-widest mb-4`}>
              Orders / Sales
            </h3>
            <p className="text-3xl sm:text-4xl font-black">{transactions.length.toString().padStart(2, '0')}</p>
          </div>

          <div
            onClick={() => setActiveTab('categories')}
            className={`group p-5 sm:p-6 lg:p-8 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              activeTab === 'categories'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                : 'bg-white dark:bg-zinc-950 border-black dark:border-white text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <h3 className={`${activeTab === 'categories' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'} text-xs font-black uppercase tracking-widest mb-4`}>
              Genres
            </h3>
            <p className="text-3xl sm:text-4xl font-black">{categories.length.toString().padStart(2, '0')}</p>
          </div>

          <div
            onClick={() => {
              if (activeTab === 'products' || activeTab === 'creators') setIsAdding(true)
            }}
            className={`col-span-2 md:col-span-1 p-5 sm:p-6 lg:p-8 border-2 border-black dark:border-white flex flex-col justify-between transition-all ${
              activeTab === 'transactions' || activeTab === 'categories'
                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed opacity-60'
                : 'bg-black text-white dark:bg-white dark:text-black cursor-pointer hover:opacity-85'
            }`}
          >
            <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Action</h3>
            <p className="text-lg lg:text-xl font-black mt-4 leading-tight uppercase">
              {activeTab === 'products' ? 'Add Gear +' : activeTab === 'creators' ? 'Add Talent +' : 'NO ACTION'}
            </p>
          </div>
        </div>

        {/* --- SECTION DINAMIS --- */}
        <div className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-black uppercase mb-8 tracking-tighter text-black dark:text-white">
            {activeTab === 'products' ? 'Inventory' : activeTab === 'creators' ? 'Talent Roster' : activeTab === 'transactions' ? 'Sales Tracker' : 'Genre Management'}
          </h2>

          {loading ? (
            <div className="text-center py-20 text-zinc-500 dark:text-zinc-400 animate-pulse font-black uppercase tracking-widest text-sm">
              Loading Data...
            </div>
          ) : activeTab === 'products' ? (
            <ProductList products={products} refreshData={fetchAllData} onOpenEdit={handleOpenEdit} />
          ) : activeTab === 'creators' ? (
            <CreatorList creators={creators} refreshData={fetchAllData} onOpenEditCreator={handleOpenEditCreator} />
          ) : activeTab === 'transactions' ? (
            <TransactionList transactions={transactions} refreshData={fetchAllData} />
          ) : (
            <div className="bg-white dark:bg-zinc-950 p-6 sm:p-10 border-2 border-black dark:border-white">
              <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4 mb-10 border-b-2 border-black dark:border-white pb-8">
                <input
                  type="text"
                  placeholder="Genre Name (e.g. Frieren)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white px-5 py-4 outline-none font-bold uppercase text-sm sm:text-base transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isProcessingCat}
                  className="bg-black dark:bg-white text-white dark:text-black px-10 py-4 font-black text-xs sm:text-sm uppercase tracking-widest hover:opacity-80 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {isProcessingCat ? 'PROCESSING...' : 'ADD GENRE +'}
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="bg-zinc-50 dark:bg-zinc-900 p-6 border-2 border-black dark:border-white flex justify-between items-center">
                    <div>
                      <p className="font-black uppercase tracking-widest text-sm sm:text-base text-black dark:text-white">{cat.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1">/{cat.slug}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:underline transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest col-span-full">
                    No genres found.
                  </p>
                )}
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
