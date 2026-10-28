'use client';

import React, { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { FaFileExcel, FaCheckCircle, FaTrash, FaFilter, FaChevronDown, FaBoxOpen, FaPen, FaTimes, FaCalendarAlt, FaChartLine } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

const TransactionList = ({ transactions = [], refreshData }: any) => {
  const [confirmModal, setConfirmModal] = useState<any>(null)
  const [deleteModal, setDeleteModal] = useState<any>(null)
  const [editResiModal, setEditResiModal] = useState<any>(null)
  const [cancelModal, setCancelModal] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const [filterMethod, setFilterMethod] = useState('ALL')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [dateFilter, setDateFilter] = useState('ALL')
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const [shippingCourier, setShippingCourier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  const methodOptions = [
    { value: 'ALL', label: 'SEMUA METODE' },
    { value: 'SHIPMENT', label: 'REGULER ONLY' },
    { value: 'COD', label: 'COD ONLY' }
  ]

  const dateOptions = [
    { value: 'ALL', label: 'ALL TIME' },
    { value: '7DAYS', label: '7 HARI TERAKHIR' },
    { value: '30DAYS', label: '30 HARI TERAKHIR' },
    { value: 'CUSTOM', label: 'CUSTOM DATE...' }
  ]

  const STATUS_FLOW = ['pending', 'invoiced', 'verified', 'production', 'sending', 'success']

  const getStatusBadge = (status: any) => {
    switch (status) {
      case 'pending': return 'bg-zinc-100 text-zinc-700 border-zinc-300'
      case 'invoiced': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'verified': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'production': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'sending': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'success': return 'bg-green-100 text-green-800 border-green-300'
      case 'canceled': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-300'
    }
  }

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    const now = new Date();
    if (dateFilter === '7DAYS') {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      result = result.filter((trx: any) => new Date(trx.created_at) >= sevenDaysAgo);
    } else if (dateFilter === '30DAYS') {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      result = result.filter((trx: any) => new Date(trx.created_at) >= thirtyDaysAgo);
    } else if (dateFilter === 'CUSTOM' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((trx: any) => {
        const trxDate = new Date(trx.created_at);
        return trxDate >= start && trxDate <= end;
      });
    }

    if (filterMethod !== 'ALL') {
      result = result.filter((trx: any) => (trx.delivery_method || 'SHIPMENT').toUpperCase() === filterMethod);
    }

    return result;
  }, [transactions, dateFilter, customStartDate, customEndDate, filterMethod]);

  const chartData = useMemo(() => {
    const validStatuses = ['verified', 'paid', 'production', 'sending', 'success'];
    const grouped: Record<string, number> = {};

    filteredTransactions.forEach((trx: any) => {
      if (validStatuses.includes(trx.status)) {
        const dateStr = new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (!grouped[dateStr]) grouped[dateStr] = 0;
        grouped[dateStr] += trx.total_price || 0;
      }
    });

    const labels = Object.keys(grouped).reverse();
    const data = labels.map(label => grouped[label]);
    const maxData = Math.max(...data, 1);

    return { labels, data, maxData };
  }, [filteredTransactions]);

  const totalRevenue = chartData.data.reduce((a, b) => a + b, 0);

  const handleNextStepClick = (id: any, currentStatus: any, user_id: any) => {
    const normalizedStatus = currentStatus === 'paid' ? 'verified' : currentStatus;
    const currentIndex = STATUS_FLOW.indexOf(normalizedStatus);
    if (currentIndex < STATUS_FLOW.length - 1) {
      const newStatus = STATUS_FLOW[currentIndex + 1];
      setShippingCourier('');
      setTrackingNumber('');
      setConfirmModal({ id, currentStatus: normalizedStatus, newStatus, user_id });
    }
  }

  const handleEditResiClick = (trx: any) => {
    setShippingCourier(trx.courier || '');
    setTrackingNumber(trx.tracking_number || '');
    setEditResiModal({ id: trx.id, user_id: trx.user_id, status: trx.status });
  }

  const handleCancelClick = (trx: any) => setCancelModal({ id: trx.id, user_id: trx.user_id })
  const handleDeleteClick = (id: any) => setDeleteModal({ id })

  const executeCancel = async () => {
    if (!cancelModal) return;
    setIsUpdating(true);
    try {
      const { id, user_id } = cancelModal;
      const trxToCancel = transactions.find((t: any) => t.id === id);

      if (trxToCancel && trxToCancel.items) {
        for (const item of trxToCancel.items) {
          if (item.label === 'LIMITED GEAR') {
            const itemSize = item.size || '-';
            const { data: stockData } = await supabase.from('product_stocks').select('stock_reserved').eq('product_id', item.id).eq('size', itemSize).single();
            if (stockData) {
              const newReserved = Math.max(0, stockData.stock_reserved - item.quantity);
              await supabase.from('product_stocks').update({ stock_reserved: newReserved }).eq('product_id', item.id).eq('size', itemSize);
            }
          }
        }
      }

      const { error } = await supabase.from('transactions').update({ status: 'canceled' }).eq('id', id);
      if (error) throw error;

      const { data: profileData } = await supabase.from('profiles').select('email').eq('id', user_id).single();
      if (profileData?.email) {
        await fetch('/api/send-status-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profileData.email, transaction: trxToCancel, status: 'canceled' }),
        });
      }

      setCancelModal(null);
      refreshData();
      Swal.fire({ title: 'PESANAN DIBATALKAN', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire({ title: 'GAGAL', text: error.message, icon: 'error' });
    } finally { setIsUpdating(false); }
  }

  const executeEditResi = async () => {
    if (!editResiModal) return;
    if (!shippingCourier.trim() || !trackingNumber.trim()) {
      return Swal.fire({
        title: 'DATA KURANG',
        text: 'Mohon lengkapi nama Kurir Pengiriman dan Nomor Resi terlebih dahulu.',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
    }
    setIsUpdating(true);
    try {
      const { id, user_id } = editResiModal;
      const { error } = await supabase.from('transactions').update({ courier: shippingCourier.toUpperCase(), tracking_number: trackingNumber }).eq('id', id);
      if (error) throw error;

      const { data: profileData } = await supabase.from('profiles').select('email').eq('id', user_id).single();
      if (profileData?.email) {
        const trx = transactions.find((t: any) => t.id === id);
        await fetch('/api/send-status-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profileData.email, transaction: trx, status: 'sending', courier: shippingCourier.toUpperCase(), tracking_number: trackingNumber, isResiUpdate: true }),
        });
      }
      setEditResiModal(null); refreshData();
      Swal.fire({ title: 'RESI DIPERBARUI', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (error: any) { Swal.fire('GAGAL', error.message, 'error'); } finally { setIsUpdating(false); }
  }

  const executeUpdateStatus = async () => {
    if (!confirmModal) return;
    const { id, newStatus, user_id } = confirmModal;
    if (newStatus === 'sending') {
      const isTrxCOD = transactions.find((t: any) => t.id === id)?.delivery_method === 'COD';
      if (!isTrxCOD && (!shippingCourier.trim() || !trackingNumber.trim())) {
        return Swal.fire({
          title: 'DATA KURANG',
          text: 'Mohon lengkapi nama Kurir Pengiriman dan Nomor Resi terlebih dahulu.',
          icon: 'warning',
          confirmButtonColor: '#000000',
        });
      }
    }
    setIsUpdating(true);
    try {
      const needsEmail = ['invoiced', 'verified', 'paid', 'production', 'sending', 'success'].includes(newStatus);
      if (needsEmail) {
        const { data: profileData } = await supabase.from('profiles').select('email').eq('id', user_id).single();
        if (profileData?.email) {
          let apiEndpoint = '/api/send-status-update';
          if (newStatus === 'invoiced') apiEndpoint = '/api/send-payment-details';
          else if (newStatus === 'paid' || newStatus === 'verified') apiEndpoint = '/api/send-invoice';

          await fetch(apiEndpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profileData.email, transaction: transactions.find((t: any) => t.id === id), status: newStatus === 'verified' ? 'paid' : newStatus, courier: shippingCourier.toUpperCase(), tracking_number: trackingNumber }),
          });
        }
      }
      const now = new Date().toISOString();
      const updatePayload: any = { status: newStatus };
      if (newStatus === 'verified' || newStatus === 'paid') updatePayload.paid_at = now;
      if (newStatus === 'production') updatePayload.production_at = now;
      if (newStatus === 'sending') { updatePayload.shipped_at = now; updatePayload.courier = shippingCourier.toUpperCase(); updatePayload.tracking_number = trackingNumber; }
      if (newStatus === 'success') updatePayload.success_at = now;

      const { error } = await supabase.from('transactions').update(updatePayload).eq('id', id);
      if (error) throw error;
      setConfirmModal(null); refreshData();
      Swal.fire({ title: 'STATUS DIPERBARUI', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (error: any) { Swal.fire('GAGAL', error.message, 'error'); } finally { setIsUpdating(false); }
  }

  const executeDelete = async () => {
    if (!deleteModal) return;
    setIsUpdating(true);
    try {
      const trxToDelete = transactions.find((t: any) => t.id === deleteModal.id);
      if (trxToDelete && trxToDelete.items && (trxToDelete.status === 'pending' || trxToDelete.status === 'invoiced')) {
        for (const item of trxToDelete.items) {
          if (item.label === 'LIMITED GEAR') {
            const itemSize = item.size || '-';
            const { data: stockData } = await supabase.from('product_stocks').select('stock_reserved').eq('product_id', item.id).eq('size', itemSize).single();
            if (stockData) {
              const newReserved = Math.max(0, stockData.stock_reserved - item.quantity);
              await supabase.from('product_stocks').update({ stock_reserved: newReserved }).eq('product_id', item.id).eq('size', itemSize);
            }
          }
        }
      }
      const { error } = await supabase.from('transactions').delete().eq('id', deleteModal.id);
      if (error) throw error;
      refreshData(); setDeleteModal(null);
      Swal.fire({ title: 'DATA DIHAPUS', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (error: any) { Swal.fire('GAGAL', error.message, 'error'); } finally { setIsUpdating(false); }
  }

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      return Swal.fire({
        title: 'TIDAK ADA DATA',
        text: 'Tidak ada data transaksi pada filter ini untuk di-export!',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
    }
    const headers = ['Date', 'Order ID', 'Full Name', 'WhatsApp', 'Address', 'Province', 'Delivery Method', 'Courier', 'Resi', 'Product', 'Qty', 'Total Price', 'Status']
    const csvRows = [headers.join(',')]
    filteredTransactions.forEach((trx: any) => {
      const date = new Date(trx.created_at).toLocaleDateString('id-ID')
      const address = `"${(trx.address || '').replace(/"/g, '""')}"`
      const productText = trx.items && trx.items.length > 0 ? trx.items.map((i: any) => `${i.name} [Size: ${i.size || '-'}] (Qty: ${i.quantity})`).join(' || ') : trx.product_name || ''
      const product = `"${productText}"`
      const totalQty = trx.items && trx.items.length > 0 ? trx.items.reduce((acc: number, curr: any) => acc + curr.quantity, 0) : trx.quantity || 1
      const phone = `="` + trx.whatsapp + `"`
      const devMethod = trx.delivery_method || 'SHIPMENT'
      const row = [date, trx.id, `"${trx.full_name}"`, phone, address, trx.province, devMethod, trx.courier || '-', trx.tracking_number || '-', product, totalQty, trx.total_price, trx.status]
      csvRows.push(row.join(','))
    })
    const BOM = "\uFEFF";
    const csvContent = BOM + csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.setAttribute('download', `Daekan_Report_${new Date().getTime()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">

      {/* GRAFIK PENJUALAN */}
      <div className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-white p-6">
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b-2 border-black dark:border-white text-black dark:text-white">
          <FaChartLine className="text-2xl" />
          <h3 className="font-black uppercase text-xl tracking-tighter">Sales Overview</h3>
          <div className="ml-auto text-right">
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Total Terbayar</p>
            <p className="text-xl sm:text-2xl font-black text-black dark:text-white">Rp {totalRevenue.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {chartData.labels.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            Belum ada data penjualan pada periode ini
          </div>
        ) : (
          <div className="h-56 flex items-end gap-2 sm:gap-4 overflow-x-auto pb-2 pt-6">
            {chartData.labels.map((label, idx) => {
              const heightPercentage = Math.max((chartData.data[idx] / chartData.maxData) * 100, 5);
              return (
                <div key={idx} className="flex flex-col justify-end items-center flex-1 min-w-[44px] h-full group relative">
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black dark:bg-white text-white dark:text-black text-xs font-bold py-1 px-2 whitespace-nowrap z-10 pointer-events-none">
                    Rp {chartData.data[idx].toLocaleString('id-ID')}
                  </div>

                  <div
                    style={{ height: `${heightPercentage}%` }}
                    className="w-full bg-black dark:bg-white transition-all duration-500 group-hover:opacity-75"
                  ></div>

                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-2 uppercase tracking-wider truncate w-full text-center">
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-white overflow-hidden relative">
        <div className="p-6 border-b-2 border-black dark:border-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-zinc-50 dark:bg-zinc-900">
          <div>
            <h3 className="font-black uppercase text-lg sm:text-xl leading-tight text-black dark:text-white">Order Records</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mt-1">
              Showing {filteredTransactions.length} orders
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto relative">
            {/* DATE FILTER */}
            <div className="relative">
              <button
                onClick={() => { setIsDateFilterOpen(!isDateFilterOpen); setIsFilterOpen(false); }}
                className="flex items-center gap-2 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white px-4 py-3 text-xs font-black uppercase tracking-wider cursor-pointer min-w-[170px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <FaCalendarAlt /> {dateOptions.find(opt => opt.value === dateFilter)?.label}
                </div>
                <FaChevronDown className={`transition-transform duration-300 ${isDateFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isDateFilterOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute z-50 top-full mt-1 left-0 w-60 bg-white dark:bg-black border-2 border-black dark:border-white shadow-2xl overflow-hidden py-1">
                    {dateOptions.map((opt) => (
                      <div key={opt.value} onClick={() => { setDateFilter(opt.value); if (opt.value !== 'CUSTOM') setIsDateFilterOpen(false); }} className={`px-5 py-3 text-xs font-black uppercase cursor-pointer transition-colors ${dateFilter === opt.value ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}>
                        {opt.label}
                      </div>
                    ))}
                    {dateFilter === 'CUSTOM' && (
                      <div className="px-4 py-3 border-t border-black dark:border-white space-y-3 bg-zinc-50 dark:bg-zinc-900">
                        <div>
                          <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase">Dari Tanggal</label>
                          <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="w-full text-xs p-2 border border-black dark:border-white bg-white dark:bg-black mt-1 outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase">Sampai Tanggal</label>
                          <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="w-full text-xs p-2 border border-black dark:border-white bg-white dark:bg-black mt-1 outline-none" />
                        </div>
                        <button onClick={() => setIsDateFilterOpen(false)} className="w-full bg-black dark:bg-white text-white dark:text-black text-xs font-black py-2.5 cursor-pointer">
                          TERAPKAN
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* METHOD FILTER */}
            <div className="relative">
              <button
                onClick={() => { setIsFilterOpen(!isFilterOpen); setIsDateFilterOpen(false); }}
                className="flex items-center gap-2 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white px-4 py-3 text-xs font-black uppercase tracking-wider cursor-pointer min-w-[160px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <FaFilter /> {methodOptions.find(opt => opt.value === filterMethod)?.label}
                </div>
                <FaChevronDown className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute z-50 top-full mt-1 right-0 w-48 bg-white dark:bg-black border-2 border-black dark:border-white shadow-2xl overflow-hidden py-1">
                    {methodOptions.map((opt) => (
                      <div key={opt.value} onClick={() => { setFilterMethod(opt.value); setIsFilterOpen(false); }} className={`px-5 py-3 text-xs font-black uppercase cursor-pointer transition-colors ${filterMethod === opt.value ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}>
                        {opt.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white px-5 py-3 font-black uppercase text-xs tracking-[0.15em] hover:opacity-80 transition-all cursor-pointer"
            >
              <FaFileExcel size={14} /> EXPORT
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-20 text-center font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-sm">
              Tidak ada data pada filter ini.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-900 text-xs font-black uppercase tracking-[0.15em] text-zinc-700 dark:text-zinc-300 border-b border-black dark:border-white">
                  <th className="p-4 pl-6">Tanggal</th>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Pengiriman</th>
                  <th className="p-4">Produk</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Nominal</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredTransactions.map((trx: any) => (
                  <tr key={trx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 pl-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-bold whitespace-nowrap">
                      {new Date(trx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <p className="font-black uppercase text-xs sm:text-sm text-black dark:text-white">{trx.full_name}</p>
                      <a href={`https://wa.me/${(trx.whatsapp || '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-xs text-green-600 dark:text-green-400 font-bold tracking-wider hover:underline block mt-0.5">
                        {trx.whatsapp}
                      </a>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider border ${(trx.delivery_method || 'SHIPMENT') === 'COD' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {trx.delivery_method || 'SHIPMENT'}
                      </span>
                      {trx.courier && trx.tracking_number && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="text-xs text-zinc-600 dark:text-zinc-300">
                            <span className="font-black">{trx.courier}</span>: {trx.tracking_number}
                          </div>
                          {(trx.status === 'sending' || trx.status === 'success') && (trx.delivery_method !== 'COD') && (
                            <button onClick={() => handleEditResiClick(trx)} className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer" title="Edit Resi">
                              <FaPen size={11} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-xs sm:text-sm uppercase min-w-[200px] max-w-[260px]">
                      {trx.items && trx.items.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {trx.items.map((i: any, idx: number) => (
                            <div key={idx} className="flex flex-col leading-tight pb-1.5 border-b border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0">
                              <span className="truncate text-black dark:text-white" title={i.name}>{i.name}</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 tracking-wider mt-0.5">
                                SIZE: <span className="text-black dark:text-white font-black">{i.size || '-'}</span> | QTY: <span className="text-black dark:text-white font-black">{i.quantity}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="truncate block text-black dark:text-white" title={trx.product_name}>{trx.product_name}</span>
                      )}
                    </td>
                    <td className="p-4 font-black text-black dark:text-white">
                      {trx.items && trx.items.length > 0 ? trx.items.reduce((acc: number, curr: any) => acc + curr.quantity, 0) : trx.quantity}
                    </td>
                    <td className="p-4 font-black whitespace-nowrap text-black dark:text-white">
                      Rp {(trx.total_price || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider border whitespace-nowrap ${getStatusBadge(trx.status)}`}>
                        {trx.status === 'invoiced' ? 'WAITING PAYMENT' : (trx.status === 'verified' ? 'PAID' : trx.status)}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-center flex justify-center gap-2 mt-1.5">
                      {trx.status !== 'success' && trx.status !== 'canceled' ? (
                        <button onClick={() => handleNextStepClick(trx.id, trx.status, trx.user_id)} className="inline-flex items-center justify-center p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-black dark:text-white border border-black dark:border-white cursor-pointer" title="Move to Next Step">
                          <FaCheckCircle size={14} />
                        </button>
                      ) : trx.status === 'success' ? (
                        <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-700 border border-green-300 cursor-default" title="Order Completed">
                          <FaCheckCircle size={14} />
                        </div>
                      ) : null}

                      {(trx.status === 'pending' || trx.status === 'invoiced') && (
                        <button onClick={() => handleCancelClick(trx)} className="inline-flex items-center justify-center p-3 bg-orange-100 hover:bg-orange-600 hover:text-white transition-all text-orange-700 border border-orange-300 cursor-pointer" title="Batalkan Pesanan">
                          <FaTimes size={14} />
                        </button>
                      )}

                      <button onClick={() => handleDeleteClick(trx.id)} className="inline-flex items-center justify-center p-3 bg-red-100 hover:bg-red-600 hover:text-white transition-all text-red-700 border border-red-300 cursor-pointer" title="Delete Permanen">
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MODALS */}
        <AnimatePresence>
          {confirmModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white w-full max-w-sm p-8 shadow-2xl text-center relative overflow-hidden">
                {confirmModal.newStatus === 'success' ? <FaCheckCircle className="text-green-600 text-5xl mx-auto mb-4" /> : <FaBoxOpen className="text-black dark:text-white text-5xl mx-auto mb-4" />}
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Konfirmasi Status</h2>

                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                  {confirmModal.newStatus === 'invoiced' && <p>Ubah ke <span className="font-black text-yellow-600">MENUNGGU PEMBAYARAN</span>.</p>}
                  {confirmModal.newStatus === 'verified' && <p>Ubah ke <span className="font-black text-blue-600">DIBAYAR</span>.</p>}
                  {confirmModal.newStatus === 'production' && <p>Ubah ke <span className="font-black text-purple-600">DALAM PRODUKSI</span>.</p>}
                  {confirmModal.newStatus === 'sending' && <p>Ubah ke <span className="font-black text-orange-600">PENGIRIMAN</span>.</p>}
                  {confirmModal.newStatus === 'success' && <p>Ubah ke <span className="font-black text-green-600">SELESAI</span>.</p>}
                </div>

                {confirmModal.newStatus === 'sending' && (
                  <div className="text-left bg-zinc-50 dark:bg-zinc-900 border border-black dark:border-white p-4 mb-6 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Kurir Pengiriman</label>
                      <input type="text" value={shippingCourier} onChange={e => setShippingCourier(e.target.value)} className="w-full bg-transparent border-b border-black dark:border-white py-1.5 outline-none text-sm font-black uppercase" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Nomor Resi</label>
                      <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="w-full bg-transparent border-b border-black dark:border-white py-1.5 outline-none text-sm font-black uppercase" />
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <button onClick={() => setConfirmModal(null)} disabled={isUpdating} className="w-1/2 border-2 border-black dark:border-white py-3.5 font-black uppercase text-xs cursor-pointer">BATAL</button>
                  <button onClick={executeUpdateStatus} disabled={isUpdating} className="w-1/2 bg-black dark:bg-white text-white dark:text-black py-3.5 font-black uppercase text-xs cursor-pointer">{isUpdating ? "PROSES..." : "KONFIRMASI"}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editResiModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white w-full max-w-sm p-8 shadow-2xl text-center relative overflow-hidden">
                <FaPen className="text-blue-600 text-4xl mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Edit Resi</h2>
                <div className="text-left bg-zinc-50 dark:bg-zinc-900 border border-black dark:border-white p-4 mb-6 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Kurir Pengiriman</label>
                    <input type="text" value={shippingCourier} onChange={e => setShippingCourier(e.target.value)} className="w-full bg-transparent border-b border-black dark:border-white py-1.5 outline-none text-sm font-black uppercase" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Nomor Resi</label>
                    <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="w-full bg-transparent border-b border-black dark:border-white py-1.5 outline-none text-sm font-black uppercase" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setEditResiModal(null)} disabled={isUpdating} className="w-1/2 border-2 border-black dark:border-white py-3.5 font-black uppercase text-xs cursor-pointer">BATAL</button>
                  <button onClick={executeEditResi} disabled={isUpdating} className="w-1/2 bg-black dark:bg-white text-white dark:text-black py-3.5 font-black uppercase text-xs cursor-pointer">{isUpdating ? "PROSES..." : "SIMPAN"}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {cancelModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white w-full max-w-sm p-8 shadow-2xl text-center relative overflow-hidden">
                <FaTimes className="text-white text-5xl mx-auto mb-4 bg-orange-500 rounded-full p-2" />
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-orange-600">Batalkan Pesanan?</h2>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-8">Stok akan dikembalikan dan email pembatalan dikirim.</p>
                <div className="flex gap-4">
                  <button onClick={() => setCancelModal(null)} disabled={isUpdating} className="w-1/2 border-2 border-black dark:border-white py-3.5 font-black uppercase text-xs cursor-pointer">KEMBALI</button>
                  <button onClick={executeCancel} disabled={isUpdating} className="w-1/2 bg-orange-600 text-white py-3.5 font-black uppercase text-xs cursor-pointer">{isUpdating ? "PROSES..." : "BATALKAN"}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white w-full max-w-sm p-8 shadow-2xl text-center relative overflow-hidden">
                <FaTrash className="text-red-600 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-red-600">Hapus Permanen?</h2>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-8">Data akan dihapus permanen. Stok akan direstorasi jika pesanan belum dibatalkan.</p>
                <div className="flex gap-4">
                  <button onClick={() => setDeleteModal(null)} disabled={isUpdating} className="w-1/2 border-2 border-black dark:border-white py-3.5 font-black uppercase text-xs cursor-pointer">KEMBALI</button>
                  <button onClick={executeDelete} disabled={isUpdating} className="w-1/2 bg-red-600 text-white py-3.5 font-black uppercase text-xs cursor-pointer">{isUpdating ? "PROSES..." : "HAPUS DATA"}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TransactionList
