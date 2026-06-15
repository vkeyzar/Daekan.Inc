import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Swal from 'sweetalert2'

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const UpdateProduct = ({ isOpen, onClose, productData, refreshData, categories = [] }) => {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  
  const [product, setProduct] = useState({
    name: '', price: '', original_price: '', description: '', label: '',
    sale_end_date: '', category_id: '', product_line: 'DAEKAN MERCH', category: '', is_open: true, has_size: true
  })

  const [stocks, setStocks] = useState(DEFAULT_SIZES.map(size => ({ size, stock_physical: '', stock_reserved: 0 })))

  useEffect(() => {
    if (productData) {
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
               setStocks(data.map(d => ({ size: d.size, stock_physical: d.stock_physical, stock_reserved: d.stock_reserved })));
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

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!product.name || !product.price || !product.category_id || !product.category) {
      return Swal.fire({ title: 'PERHATIAN', text: 'Mohon lengkapi Nama, Harga, Genre, dan Jenis Barang.', icon: 'warning', confirmButtonColor: '#000' })
    }

    setLoading(true)

    try {
      let publicImageUrl = product.image_url 
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        publicImageUrl = data.publicUrl
      }

      const { product_stocks, id, created_at, ...cleanProductPayload } = product;

      const { error: updateError } = await supabase.from('products').update({ 
          ...cleanProductPayload,
          image_url: publicImageUrl,
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
              stock_physical: parseInt(s.stock_physical) || 0, 
              stock_reserved: parseInt(s.stock_reserved) || 0
            }))
          : [{ 
              product_id: product.id, 
              size: '-', 
              stock_physical: parseInt(stocks[0]?.stock_physical) || 0, 
              stock_reserved: parseInt(stocks[0]?.stock_reserved) || 0 
            }];
        
        if (stockPayload.length > 0) {
          // ✅ FIX SPASI ONCONFLICT DAN TAMBAH ERROR THROW
          const { error: stockError } = await supabase.from('product_stocks').upsert(stockPayload, { onConflict: 'product_id,size' });
          if (stockError) throw new Error("Gagal update stok: " + stockError.message);
        }
      }

      Swal.fire({ title: 'PEMBARUAN BERHASIL', text: 'Data produk & stok telah diperbarui.', icon: 'success', confirmButtonColor: '#000' })

      onClose()
      refreshData()
    } catch (error) {
      Swal.fire({ title: 'GAGAL MEMPROSES DATA', text: error.message, icon: 'error', confirmButtonColor: '#000' })
    } finally { setLoading(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-start justify-center p-4 overflow-y-auto pt-10 pb-20">
      <div className="bg-white text-black p-8 md:p-12 rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto mt-10 mb-10">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8">
          Update Gear <span className="text-zinc-400">"{product.name}"</span>
        </h2>
        
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-2 block">Theme / Genre</label>
                <select className="w-full border-b-2 border-zinc-200 py-2 font-black text-black uppercase outline-none bg-transparent cursor-pointer" value={product.category_id} onChange={(e) => setProduct({...product, category_id: e.target.value})} required>
                  <option value="" disabled>-- PILIH GENRE --</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-2 block">Product Line</label>
                <select className="w-full border-b-2 border-zinc-200 py-2 font-black text-black uppercase outline-none bg-transparent cursor-pointer" value={product.product_line} onChange={(e) => setProduct({...product, product_line: e.target.value})} required>
                  <option value="DAEKAN MERCH">DAEKAN MERCH</option>
                  <option value="VTUBER COLLAB">VTUBER COLLAB</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-2 block">Product Type (Filter)</label>
                <input type="text" value={product.category} placeholder="E.g. T-shirt, Deskmat" className="w-full border-b border-zinc-200 py-2 outline-none font-bold uppercase focus:border-black transition-colors" onChange={(e) => setProduct({...product, category: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2 block">Size Requirement</label>
                <button type="button" onClick={() => setProduct({ ...product, has_size: !product.has_size })} className={`w-full py-2 rounded-lg font-black text-[10px] md:text-xs transition-all uppercase border ${product.has_size ? 'bg-black text-white border-black shadow-lg shadow-black/20' : 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:border-black hover:text-black'}`}>
                  {product.has_size ? '👕 APPAREL (NEEDS SIZE)' : '🎒 ACCESSORY (NO SIZE)'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase">Label (Status)</label>
                <select value={product.label || ''} className="w-full border-b border-zinc-200 py-2 outline-none font-bold focus:border-black bg-transparent mt-1 cursor-pointer" onChange={(e) => setProduct({...product, label: e.target.value})}>
                  <option value="">Normal</option>
                  <option value="COMING SOON">COMING SOON</option>
                  <option value="PRE-ORDER">PRE-ORDER</option>
                  <option value="LIMITED GEAR">LIMITED GEAR</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase mb-2 block">Order Status</label>
                <button type="button" onClick={() => setProduct({ ...product, is_open: !product.is_open })} className={`w-full py-2 px-4 rounded-lg font-bold tracking-widest text-xs transition-all uppercase border ${product.is_open ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>
                  {product.is_open ? '● OPEN ORDER' : '■ CLOSED ORDER'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
                <label className="text-xs font-black tracking-widest text-red-600 uppercase">Flash Sale End Date (WIB)</label>
                <input type="datetime-local" value={product.sale_end_date} className="w-full border-b border-zinc-200 py-2 outline-none font-mono text-sm focus:border-red-600 cursor-pointer" onChange={(e) => setProduct({...product, sale_end_date: e.target.value})} />
            </div>

            <div className="bg-zinc-50 p-6 rounded-[1.5rem] border border-zinc-100 flex items-center gap-6">
               <img src={product.image_url} className="w-24 h-24 object-contain bg-white rounded-xl p-2 border shadow-sm" alt="Current" />
               <div className="flex-1">
                 <label className="text-xs font-black text-zinc-400 uppercase block mb-2">Change Image?</label>
                 <input type="file" accept="image/*" className="text-[10px] w-full cursor-pointer file:font-bold file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-200" onChange={(e) => setImageFile(e.target.files[0])} />
               </div>
            </div>

            {product.label === 'LIMITED GEAR' && (
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                <label className="text-xs font-black tracking-widest text-zinc-800 uppercase mb-3 block">Manajemen Stok Aktual (Gudang)</label>
                {product.has_size ? (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {stocks.map((s, idx) => (
                      <div key={idx} className="flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden focus-within:border-black transition-colors shadow-sm relative group/stock">
                        <div className="bg-zinc-100 py-1 text-center border-b border-zinc-200 flex items-center justify-center relative">
                           <input type="text" value={s.size} placeholder="SIZE" onChange={e => { const newS = [...stocks]; newS[idx].size = e.target.value.toUpperCase(); setStocks(newS); }} className="bg-transparent text-center font-black text-xs uppercase tracking-widest text-zinc-800 w-full outline-none px-2" />
                           <button type="button" onClick={() => setStocks(stocks.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-100 text-red-500 w-4 h-4 rounded-full text-[8px] opacity-0 group-hover/stock:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500 hover:text-white pb-px" title="Hapus Size">&times;</button>
                        </div>
                        <input type="number" placeholder="Stok" min="0" value={s.stock_physical} onChange={e => { const newS = [...stocks]; newS[idx].stock_physical = e.target.value; setStocks(newS); }} className="w-full py-2 outline-none font-bold text-center text-sm" />
                      </div>
                    ))}
                    <button type="button" onClick={() => setStocks([...stocks, { size: '', stock_physical: '', stock_reserved: 0 }])} className="flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-zinc-300 rounded-xl hover:border-black hover:bg-zinc-100 transition-all text-zinc-400 hover:text-black min-h-[60px]">
                      <span className="text-lg font-black leading-none mb-1">+</span>
                      <span className="text-[8px] font-black uppercase tracking-widest">ADD SIZE</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center bg-white p-3 rounded-xl border border-zinc-200">
                    <span className="font-black text-xs tracking-widest uppercase text-zinc-600 w-24">NON-SIZE:</span>
                    <input type="number" placeholder="Total Stok" min="0" value={stocks[0]?.stock_physical || ''} onChange={e => setStocks([{ size: '-', stock_physical: e.target.value, stock_reserved: stocks[0]?.stock_reserved || 0 }])} className="w-full border-b border-zinc-300 bg-transparent py-1 outline-none font-bold focus:border-black text-sm" />
                  </div>
                )}
                <p className="text-[9px] font-bold text-zinc-400 uppercase mt-3">*Ubah nama size jika diperlukan (e.g. 3XL). Biarkan kosong atau klik silang untuk menghapus box.</p>
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex items-center gap-6 mt-6 border-t border-zinc-100 pt-6">
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-5 rounded-2xl font-black italic uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/10">
              {loading ? 'MENYIMPAN PERUBAHAN...' : 'UPDATE MERCH'}
            </button>
            <button type="button" onClick={onClose} className="px-6 font-bold uppercase text-xs text-zinc-400 hover:text-black transition-colors tracking-widest">
              Batalkan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateProduct