import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { FaFileExcel, FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const TransactionList = ({ transactions, refreshData }) => {
  const [confirmModal, setConfirmModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null) // State buat modal delete
  const [isUpdating, setIsUpdating] = useState(false)

  // --- LOGIC GANTI STATUS ---
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

  // --- LOGIC HAPUS ORDER AND RUN ---
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

  // --- LOGIC EXPORT TO CSV ---
  const handleExportCSV = () => {
    if (transactions.length === 0) return alert("Belum ada data transaksi!")

    const headers = ['Date', 'Order ID', 'Full Name', 'WhatsApp', 'Address', 'Province', 'Product', 'Qty', 'Total Price', 'Status']
    const csvRows = [headers.join(',')] 
    
    transactions.forEach(trx => {
      const date = new Date(trx.created_at).toLocaleDateString('id-ID')
      const address = `"${(trx.address || '').replace(/"/g, '""')}"` 
      const product = `"${trx.product_name || ''}"`
      const phone = `="` + trx.whatsapp + `"` 

      const row = [
        date,
        trx.id,
        `"${trx.full_name}"`,
        phone, 
        address,
        trx.province,
        product,
        trx.quantity,
        trx.total_price,
        trx.status
      ]
      csvRows.push(row.join(','))
    })

    const BOM = "\uFEFF"; 
    const csvContent = BOM + csvRows.join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Daekan_Sales_Report_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!transactions || transactions.length === 0) {
    return <div className="p-10 text-center border-2 border-dashed border-zinc-200 rounded-3xl font-bold uppercase tracking-widest text-zinc-400 text-xs">No transactions found.</div>
  }

  return (
    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden relative">
      <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
        <h3 className="font-black italic uppercase text-lg">Order Records</h3>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-black/20"
        >
          <FaFileExcel size={16} /> EXPORT EXCEL
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              <th className="p-4 pl-6">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Product</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((trx) => (
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
                <td className="p-4 font-bold text-xs uppercase">{trx.product_name}</td>
                <td className="p-4 font-black">{trx.quantity}</td>
                <td className="p-4 font-black italic">Rp {(trx.total_price || 0).toLocaleString('id-ID')}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${trx.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {trx.status}
                  </span>
                </td>
                <td className="p-4 pr-6 flex justify-center gap-2">
                  <button 
                    onClick={() => handleToggleClick(trx.id, trx.status)}
                    className="inline-flex items-center justify-center p-3 rounded-xl bg-zinc-100 hover:bg-black hover:text-white transition-all text-zinc-400 hover:shadow-lg"
                    title="Toggle Status"
                  >
                    <FaCheckCircle size={16} />
                  </button>
                  {/* TOMBOL DELETE BARU */}
                  <button 
                    onClick={() => handleDeleteClick(trx.id)}
                    className="inline-flex items-center justify-center p-3 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white transition-all text-red-400 hover:shadow-lg"
                    title="Delete Transaction"
                  >
                    <FaTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL KONFIRMASI STATUS --- */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 ${confirmModal.newStatus === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <FaExclamationTriangle className="text-zinc-300 text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Change Status?</h2>
              <p className="text-sm font-medium text-zinc-500 mb-8">
                Mark order as <span className={`font-black ${confirmModal.newStatus === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>{confirmModal.newStatus.toUpperCase()}</span>?
              </p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmModal(null)} disabled={isUpdating} className="w-1/2 bg-zinc-100 text-zinc-600 py-4 font-black italic uppercase text-xs tracking-[0.2em] hover:bg-zinc-200 transition-all rounded-xl">CANCEL</button>
                <button onClick={executeUpdateStatus} disabled={isUpdating} className={`w-1/2 text-white py-4 font-black italic uppercase text-xs tracking-[0.2em] transition-all rounded-xl shadow-lg ${confirmModal.newStatus === 'verified' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                  {isUpdating ? "WAIT..." : "CONFIRM"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL KONFIRMASI DELETE --- */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
              <FaTrash className="text-red-100 text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-red-600">Delete Order?</h2>
              <p className="text-sm font-medium text-zinc-500 mb-8">
                This action cannot be undone. The transaction data will be permanently removed.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteModal(null)} disabled={isUpdating} className="w-1/2 bg-zinc-100 text-zinc-600 py-4 font-black italic uppercase text-xs tracking-[0.2em] hover:bg-zinc-200 transition-all rounded-xl">CANCEL</button>
                <button onClick={executeDelete} disabled={isUpdating} className="w-1/2 bg-red-600 text-white py-4 font-black italic uppercase text-xs tracking-[0.2em] hover:bg-red-700 transition-all rounded-xl shadow-lg shadow-red-600/20">
                  {isUpdating ? "WAIT..." : "DELETE"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default TransactionList