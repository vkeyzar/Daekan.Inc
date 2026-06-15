import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { FaFileExcel, FaCheckCircle, FaExclamationTriangle, FaTrash, FaFilter, FaChevronDown, FaBoxOpen, FaEnvelope } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

const TransactionList = ({ transactions, refreshData }) => {
  const [confirmModal, setConfirmModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [filterMethod, setFilterMethod] = useState('ALL') 
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filterOptions = [
    { value: 'ALL', label: 'ALL METHODS' },
    { value: 'SHIPMENT', label: 'SHIPMENT ONLY' },
    { value: 'COD', label: 'COD ONLY' }
  ]

  const STATUS_FLOW = ['pending', 'invoiced', 'paid', 'production', 'sending', 'success']

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return 'bg-zinc-100 text-zinc-600 border-zinc-200'
      case 'invoiced': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'paid': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'production': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'sending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'success': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200'
    }
  }

  const handleNextStepClick = (id, currentStatus, user_id) => {
    const normalizedStatus = currentStatus === 'verified' ? 'paid' : currentStatus;
    const currentIndex = STATUS_FLOW.indexOf(normalizedStatus);
    
    if (currentIndex < STATUS_FLOW.length - 1) {
      const newStatus = STATUS_FLOW[currentIndex + 1];
      setConfirmModal({ id, currentStatus: normalizedStatus, newStatus, user_id });
    }
  }

  const executeUpdateStatus = async () => {
    if (!confirmModal) return
    setIsUpdating(true)
    const { id, newStatus, user_id } = confirmModal

    try {
      if (newStatus === 'invoiced' || newStatus === 'paid') {
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('email').eq('id', user_id).single()
        if (profileError || !profileData?.email) throw new Error('Gagal menemukan email pembeli.')

        const userEmail = profileData.email
        const transactionToApprove = transactions.find(t => t.id === id)

        const apiEndpoint = newStatus === 'invoiced' ? '/api/send-payment-details' : '/api/send-invoice'

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, transaction: transactionToApprove }),
        })

        if (!response.ok) console.warn(`Gagal mengirim email untuk status ${newStatus}, tapi status database tetap diupdate.`)
      }

      const now = new Date().toISOString();
      let updatePayload = { status: newStatus };

      if (newStatus === 'paid') updatePayload.paid_at = now;
      if (newStatus === 'production') updatePayload.production_at = now;
      if (newStatus === 'sending') updatePayload.shipped_at = now;
      if (newStatus === 'success') updatePayload.success_at = now;

      const { error } = await supabase.from('transactions').update(updatePayload).eq('id', id)
      if (error) throw error

      setConfirmModal(null)

      setTimeout(() => {
        Swal.fire({
          title: newStatus === 'invoiced' ? 'EMAIL REKENING TERKIRIM!' : 'STATUS NAIK TAHAP!',
          text: newStatus === 'invoiced' ? `Email instruksi bayar dikirim, status jadi MENUNGGU PEMBAYARAN.` : `Status pesanan berhasil diubah menjadi ${newStatus.toUpperCase()}.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        refreshData()
      }, 300)

    } catch (error) {
      setConfirmModal(null)
      setTimeout(() => {
        Swal.fire({ title: 'GAGAL PROSES', text: error.message, icon: 'error', confirmButtonColor: '#000' })
      }, 300)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteClick = (id) => { setDeleteModal({ id }) }

  // ✅ FIX: Fungsi Delete sekarang ngebalikin stok (Rollback) kalau order dicancel
  const executeDelete = async () => {
    if (!deleteModal) return
    setIsUpdating(true)

    try {
      const trxToDelete = transactions.find(t => t.id === deleteModal.id);

      // 1. Balikin stok dulu kalau ada barang LIMITED GEAR
      if (trxToDelete && trxToDelete.items) {
        for (const item of trxToDelete.items) {
          if (item.label === 'LIMITED GEAR') {
            const itemSize = item.size || '-';
            
            // Cek stok reserved yang sekarang
            const { data: stockData } = await supabase
              .from('product_stocks')
              .select('stock_reserved')
              .eq('product_id', item.id)
              .eq('size', itemSize)
              .single();

            // Kalau ketemu, kurangi reserved-nya biar stok aslinya nongol lagi di web
            if (stockData) {
              const newReserved = Math.max(0, stockData.stock_reserved - item.quantity);
              await supabase
                .from('product_stocks')
                .update({ stock_reserved: newReserved })
                .eq('product_id', item.id)
                .eq('size', itemSize);
            }
          }
        }
      }

      // 2. Habis stok aman, baru hapus datanya dari tabel transaksi
      const { error } = await supabase.from('transactions').delete().eq('id', deleteModal.id)
      
      if (error) throw error;
      
      refreshData(); 
      setDeleteModal(null);
      Swal.fire({ title: 'ORDER DIBATALKAN', text: 'Data dihapus dan stok barang berhasil dikembalikan ke etalase.', icon: 'success', timer: 2000, showConfirmButton: false });

    } catch (error) {
      Swal.fire({ title: 'GAGAL MENGHAPUS', text: error.message, icon: 'error' });
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredTransactions = transactions.filter(trx => {
    if (filterMethod === 'ALL') return true
    return (trx.delivery_method || 'SHIPMENT').toUpperCase() === filterMethod.toUpperCase()
  })

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return alert("Tidak ada data untuk di-export!")
    const headers = ['Date', 'Order ID', 'Full Name', 'WhatsApp', 'Address', 'Province', 'Delivery Method', 'Product', 'Qty', 'Total Price', 'Status']
    const csvRows = [headers.join(',')] 
    
    filteredTransactions.forEach(trx => {
      const date = new Date(trx.created_at).toLocaleDateString('id-ID')
      const address = `"${(trx.address || '').replace(/"/g, '""')}"` 
      
      const productText = trx.items && trx.items.length > 0 
        ? trx.items.map(i => `${i.name} [Size: ${i.size || '-'}] (Qty: ${i.quantity})`).join(' || ') 
        : trx.product_name || ''
        
      const product = `"${productText}"`
      const totalQty = trx.items && trx.items.length > 0 ? trx.items.reduce((acc, curr) => acc + curr.quantity, 0) : trx.quantity || 1
      const phone = `="` + trx.whatsapp + `"` 
      const devMethod = trx.delivery_method || 'SHIPMENT'
      const row = [date, trx.id, `"${trx.full_name}"`, phone, address, trx.province, devMethod, product, totalQty, trx.total_price, trx.status]
      csvRows.push(row.join(','))
    })

    const BOM = "\uFEFF"; 
    const csvContent = BOM + csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Daekan_${filterMethod}_Report_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden relative">
      <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50">
        <div>
          <h3 className="font-black italic uppercase text-lg leading-tight">Order Records</h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Showing {filteredTransactions.length} orders</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto relative">
          <div className="relative">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-3 bg-white border border-zinc-200 px-5 py-3.5 rounded-xl shadow-sm text-xs font-black uppercase tracking-wider cursor-pointer hover:border-black transition-colors">
              <FaFilter className="text-zinc-400" />
              {filterOptions.find(opt => opt.value === filterMethod)?.label}
              <FaChevronDown className={`text-zinc-400 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute z-50 top-full mt-3 right-0 sm:left-0 w-48 bg-white border border-zinc-100 rounded-2xl shadow-2xl overflow-hidden py-2">
                  {filterOptions.map((opt) => (
                    <div key={opt.value} onClick={() => { setFilterMethod(opt.value); setIsFilterOpen(false); }} className={`px-5 py-3 text-xs font-black uppercase cursor-pointer transition-colors ${filterMethod === opt.value ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:bg-zinc-50 hover:text-black'}`}>
                      {opt.label}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-xl font-black uppercase text-xs tracking-[0.15em] hover:bg-zinc-800 transition-all shadow-md">
            <FaFileExcel size={14} /> EXPORT EXCEL
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="p-20 text-center font-bold uppercase tracking-widest text-zinc-400 text-xs">No orders match this filter.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Method</th>
                <th className="p-4">Product</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                  <td className="p-4 pl-6 text-xs text-zinc-500 font-medium">
                    {new Date(trx.created_at).toLocaleDateString('id-ID', {day: 'numeric', month:'short'})}
                  </td>
                  <td className="p-4">
                    <p className="font-black uppercase">{trx.full_name}</p>
                    <a href={`https://wa.me/${(trx.whatsapp || '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-[10px] text-green-600 font-bold tracking-widest hover:underline">
                      {trx.whatsapp}
                    </a>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded border ${(trx.delivery_method || 'SHIPMENT') === 'COD' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {trx.delivery_method || 'SHIPMENT'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-xs uppercase max-w-[250px]">
                    {trx.items && trx.items.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {trx.items.map((i, idx) => (
                          <div key={idx} className="flex flex-col leading-tight pb-1 border-b border-zinc-100 last:border-0 last:pb-0">
                            <span className="truncate" title={i.name}>{i.name}</span>
                            <span className="text-[9px] text-zinc-400 tracking-widest mt-0.5">
                              SIZE: <span className="text-blue-500">{i.size || '-'}</span> | QTY: <span className="text-blue-500">{i.quantity}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="truncate block" title={trx.product_name}>{trx.product_name}</span>
                    )}
                  </td>
                  <td className="p-4 font-black">
                    {trx.items && trx.items.length > 0 ? trx.items.reduce((acc, curr) => acc + curr.quantity, 0) : trx.quantity}
                  </td>
                  <td className="p-4 font-black italic">Rp {(trx.total_price || 0).toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${getStatusBadge(trx.status)}`}>
                      {trx.status === 'invoiced' ? 'WAITING PAYMENT' : (trx.status === 'verified' ? 'PAID' : trx.status)}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-center flex justify-center gap-2 mt-1.5">
                    {trx.status !== 'success' ? (
                      <button onClick={() => handleNextStepClick(trx.id, trx.status, trx.user_id)} className="inline-flex items-center justify-center p-3 rounded-xl bg-zinc-100 hover:bg-black hover:text-white transition-all text-zinc-500 shadow-sm" title="Move to Next Step">
                        <FaCheckCircle size={14} />
                      </button>
                    ) : (
                      <div className="inline-flex items-center justify-center p-3 rounded-xl bg-green-50 text-green-500 cursor-default" title="Order Completed">
                        <FaCheckCircle size={14} />
                      </div>
                    )}
                    <button onClick={() => handleDeleteClick(trx.id)} className="inline-flex items-center justify-center p-3 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white transition-all text-red-400" title="Delete Data">
                      <FaTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {confirmModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 bg-black`}></div>
              {confirmModal.newStatus === 'success' ? <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" /> : <FaBoxOpen className="text-zinc-300 text-5xl mx-auto mb-4" />}
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Update Status?</h2>
              
              <div className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed">
                {confirmModal.newStatus === 'invoiced' && <p>Mark order as <span className="font-black text-yellow-600">WAITING PAYMENT</span>. System will auto-send email with <span className="font-bold underline">Bank Account info</span>.</p>}
                {confirmModal.newStatus === 'paid' && <p>Mark order as <span className="font-black text-blue-600">PAID</span>. Payment verified.</p>}
                {confirmModal.newStatus === 'production' && <p>Mark order as <span className="font-black text-purple-600">IN PRODUCTION</span>. Start preparing the items.</p>}
                {confirmModal.newStatus === 'sending' && <p>Mark order as <span className="font-black text-orange-600">SENDING</span>. Confirm that the package is out for delivery.</p>}
                {confirmModal.newStatus === 'success' && <p>Mark order as <span className="font-black text-green-600">SUCCESS</span>. Transaction will be fully completed.</p>}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setConfirmModal(null)} disabled={isUpdating} className="w-1/2 bg-zinc-100 text-zinc-600 py-4 font-black italic uppercase text-xs tracking-[0.2em] rounded-xl">CANCEL</button>
                <button onClick={executeUpdateStatus} disabled={isUpdating} className="w-1/2 bg-black text-white hover:bg-zinc-800 py-4 font-black italic uppercase text-xs tracking-[0.2em] rounded-xl shadow-lg">
                  {isUpdating ? "WAIT..." : "CONFIRM"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
               <FaTrash className="text-red-100 text-5xl mx-auto mb-4" />
               <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-red-600">Cancel Order?</h2>
               <p className="text-sm font-medium text-zinc-500 mb-8">Data akan dihapus dan stok barang (LIMITED GEAR) akan dikembalikan ke etalase secara otomatis.</p>
               <div className="flex gap-4">
                 <button onClick={() => setDeleteModal(null)} disabled={isUpdating} className="w-1/2 bg-zinc-100 text-zinc-600 py-4 font-black italic uppercase text-xs tracking-[0.2em] rounded-xl">BACK</button>
                 <button onClick={executeDelete} disabled={isUpdating} className="w-1/2 bg-red-600 text-white py-4 font-black italic uppercase text-xs tracking-[0.2em] rounded-xl shadow-lg shadow-red-600/20">{isUpdating ? "WAIT..." : "DELETE & RESTORE"}</button>
               </div>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TransactionList