import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { FaFileExcel, FaCheckCircle, FaExclamationTriangle, FaTrash, FaFilter, FaChevronDown } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const TransactionList = ({ transactions, refreshData }) => {
  const [confirmModal, setConfirmModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [filterMethod, setFilterMethod] = useState('ALL') 
  // ✅ STATE BARU BUAT CUSTOM FILTER DROPDOWN
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filterOptions = [
    { value: 'ALL', label: 'ALL METHODS' },
    { value: 'SHIPMENT', label: 'SHIPMENT ONLY' },
    { value: 'COD', label: 'COD ONLY' }
  ]

  const handleToggleClick = (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'verified' : 'pending'
    setConfirmModal({ id, newStatus })
  }

  const executeUpdateStatus = async () => {
    if (!confirmModal) return
    setIsUpdating(true)
    const { id, newStatus } = confirmModal
    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id)
    if (!error) {
      refreshData()
      setConfirmModal(null)
    } else {
      alert("Gagal update status: " + error.message)
    }
    setIsUpdating(false)
  }

  const handleDeleteClick = (id) => {
    setDeleteModal({ id })
  }

  const executeDelete = async () => {
    if (!deleteModal) return
    setIsUpdating(true)
    const { id } = deleteModal
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) {
      refreshData()
      setDeleteModal(null)
    } else {
      alert("Gagal hapus transaksi: " + error.message)
    }
    setIsUpdating(false)
  }

  const filteredTransactions = transactions.filter(trx => {
    if (filterMethod === 'ALL') return true
    const method = trx.delivery_method || 'SHIPMENT'
    return method.toUpperCase() === filterMethod.toUpperCase()
  })

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return alert("Tidak ada data untuk di-export!")

    const headers = ['Date', 'Order ID', 'Full Name', 'WhatsApp', 'Address', 'Province', 'Delivery Method', 'Product', 'Qty', 'Total Price', 'Status']
    const csvRows = [headers.join(',')] 
    
    filteredTransactions.forEach(trx => {
      const date = new Date(trx.created_at).toLocaleDateString('id-ID')
      const address = `"${(trx.address || '').replace(/"/g, '""')}"` 
      const product = `"${trx.product_name || ''}"`
      const phone = `="` + trx.whatsapp + `"` 
      const devMethod = trx.delivery_method || 'SHIPMENT'

      const row = [
        date, trx.id, `"${trx.full_name}"`, phone, address, trx.province, devMethod, product, trx.quantity, trx.total_price, trx.status
      ]
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
      
      {/* TOOLBAR */}
      <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50">
        <div>
          <h3 className="font-black italic uppercase text-lg leading-tight">Order Records</h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Showing {filteredTransactions.length} orders</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto relative">
          
          {/* ✅ CUSTOM ELEGAN FILTER DROPDOWN */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-3 bg-white border border-zinc-200 px-5 py-3.5 rounded-xl shadow-sm text-xs font-black uppercase tracking-wider cursor-pointer hover:border-black transition-colors"
            >
              <FaFilter className="text-zinc-400" />
              {filterOptions.find(opt => opt.value === filterMethod)?.label}
              <FaChevronDown className={`text-zinc-400 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute z-50 top-full mt-3 right-0 sm:left-0 w-48 bg-white border border-zinc-100 rounded-2xl shadow-2xl overflow-hidden py-2"
                >
                  {filterOptions.map((opt) => (
                    <div 
                      key={opt.value}
                      onClick={() => { setFilterMethod(opt.value); setIsFilterOpen(false); }}
                      className={`px-5 py-3 text-xs font-black uppercase cursor-pointer transition-colors ${filterMethod === opt.value ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:bg-zinc-50 hover:text-black'}`}
                    >
                      {opt.label}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-xl font-black uppercase text-xs tracking-[0.15em] hover:bg-zinc-800 transition-all shadow-md"
          >
            <FaFileExcel size={14} /> EXPORT EXCEL
          </button>
        </div>
      </div>

      {/* TABLE */}
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
                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded border ${
                      (trx.delivery_method || 'SHIPMENT') === 'COD' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {trx.delivery_method || 'SHIPMENT'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-xs uppercase">{trx.product_name}</td>
                  <td className="p-4 font-black">{trx.quantity}</td>
                  <td className="p-4 font-black italic">Rp {(trx.total_price || 0).toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${trx.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-center flex justify-center gap-2 mt-1.5">
                    <button onClick={() => handleToggleClick(trx.id, trx.status)} className="inline-flex items-center justify-center p-3 rounded-xl bg-zinc-100 hover:bg-black hover:text-white transition-all text-zinc-400"><FaCheckCircle size={14} /></button>
                    <button onClick={() => handleDeleteClick(trx.id)} className="inline-flex items-center justify-center p-3 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white transition-all text-red-400"><FaTrash size={14} /></button>
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
              <div className={`absolute top-0 left-0 w-full h-2 ${confirmModal.newStatus === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <FaExclamationTriangle className="text-zinc-300 text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Change Status?</h2>
              <p className="text-sm font-medium text-zinc-500 mb-8">Mark order as <span className={`font-black ${confirmModal.newStatus === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>{confirmModal.newStatus.toUpperCase()}</span>?</p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmModal(null)} disabled={isUpdating} className="w-1/2 bg-zinc-100 text-zinc-600 py-4 font-black italic uppercase text-xs tracking-[0.2em] rounded-xl">CANCEL</button>
                <button onClick={executeUpdateStatus} disabled={isUpdating} className={`w-1/2 text-white py-4 font-black italic uppercase text-xs tracking-[0.2em] rounded-xl shadow-lg ${confirmModal.newStatus === 'verified' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>{isUpdating ? "WAIT..." : "CONFIRM"}</button>
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
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-red-600">Delete Order?</h2>
              <p className="text-sm font-medium text-zinc-500 mb-8">Data will be permanently removed.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteModal(null)} disabled={isUpdating} className="w-1/2 bg-zinc-100 text-zinc-600 py-4 font-black italic uppercase text-xs tracking-[0.2em] rounded-xl">CANCEL</button>
                <button onClick={executeDelete} disabled={isUpdating} className="w-1/2 bg-red-600 text-white py-4 font-black italic uppercase text-xs tracking-[0.2em] rounded-xl shadow-lg shadow-red-600/20">{isUpdating ? "WAIT..." : "DELETE"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TransactionList