import React, { useState, useEffect } from 'react'
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";
import Countdown from 'react-countdown';
import { useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../store/useCartStore'; 
import { supabase } from '../lib/supabaseClient'; 
import Swal from 'sweetalert2'; 

const ProductModal = ({ product, close }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const addToCart = useCartStore((state) => state.addToCart);

  const productName = product.name || product.title || 'UNKNOWN GEAR';
  const isComingSoon = !product.price || product.price === 0;
  const isSale = product.original_price && Number(product.original_price) > Number(product.price);
  const isClosed = product.is_open === false;
  const needsSize = product.has_size !== false; 

  const sizeChartCat = (product.product_line || '').toUpperCase().includes('COLLAB') ? 'COLLAB' : 'MERCH';

  const [isSaleExpired, setIsSaleExpired] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // ✅ STATE BARU BUAT STOK DINAMIS
  const [stockData, setStockData] = useState([]);
  const [availableQuantity, setAvailableQuantity] = useState(null);

  useEffect(() => {
    if (product.sale_end_date) {
      const timeLeft = new Date(product.sale_end_date).getTime() - Date.now();
      if (timeLeft <= 0) setIsSaleExpired(true);
      else setIsSaleExpired(false);
    } else {
      setIsSaleExpired(false);
    }
  }, [product.sale_end_date]);

  // ✅ FETCH STOK AKTUAL DARI DB (Khusus Limited Gear)
  useEffect(() => {
    if (product.label === 'LIMITED GEAR') {
      const fetchStock = async () => {
        const { data, error } = await supabase
          .from('product_stocks')
          .select('*')
          .eq('product_id', product.id);
        if (data) setStockData(data);
      };
      fetchStock();
    }
  }, [product.id, product.label]);

  // ✅ PANTAU SISA STOK BERDASARKAN SIZE YG DIPILIH
  useEffect(() => {
    if (product.label === 'LIMITED GEAR') {
      if (needsSize && selectedSize) {
        const s = stockData.find(x => x.size === selectedSize);
        if (s) {
          const avail = s.stock_physical - s.stock_reserved;
          setAvailableQuantity(avail > 0 ? avail : 0);
          if (quantity > avail) setQuantity(avail > 0 ? 1 : 0);
        }
      } else if (!needsSize) {
        const s = stockData.find(x => x.size === '-');
        if (s) {
          const avail = s.stock_physical - s.stock_reserved;
          setAvailableQuantity(avail > 0 ? avail : 0);
          if (quantity > avail) setQuantity(avail > 0 ? 1 : 0);
        }
      }
    }
  }, [selectedSize, stockData, needsSize, product.label, quantity]);

  const formatIDR = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

  const showSaleBadge = isSale && !isComingSoon && !isSaleExpired && !isClosed;
  const activePrice = selectedSize === 'XXL' ? Number(product.price) + 10000 : Number(product.price);

  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const result = await Swal.fire({
        title: 'OTENTIKASI DIPERLUKAN',
        text: 'Silakan masuk ke akun Anda atau mendaftar terlebih dahulu untuk dapat melanjutkan proses pembelanjaan.',
        icon: 'warning', showCancelButton: true, confirmButtonColor: '#77cbf0', cancelButtonColor: '#e1aecf',
        confirmButtonText: 'KE HALAMAN LOGIN', cancelButtonText: 'BATAL'
      });
      if (result.isConfirmed) { close(); navigate('/login', { state: { returnTo: '/#shop' } }); }
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    const isLoggedIn = await checkUserSession();
    if (!isLoggedIn) return;
    if (needsSize && !selectedSize) return Swal.fire({ title: 'PERHATIAN', text: 'Mohon pilih ukuran (Size) terlebih dahulu.', icon: 'warning', confirmButtonColor: '#e1aecf' });
    if (product.label === 'LIMITED GEAR' && availableQuantity === 0) return Swal.fire({ title: 'HABIS', text: 'Maaf, stok untuk ukuran ini sudah habis terjual.', icon: 'error', confirmButtonColor: '#000' });
    
    addToCart({ ...product, price: activePrice }, needsSize ? selectedSize : '-', Math.max(1, Number(quantity) || 1));
    Swal.fire({ title: 'BERHASIL', text: 'Barang telah dimasukkan ke keranjang Anda.', icon: 'success', timer: 1500, showConfirmButton: false });
    close();
  };

  const handleBuyNow = async () => {
    const isLoggedIn = await checkUserSession();
    if (!isLoggedIn) return;
    if (needsSize && !selectedSize) return Swal.fire({ title: 'PERHATIAN', text: 'Mohon pilih ukuran (Size) terlebih dahulu.', icon: 'warning', confirmButtonColor: '#e1aecf' });
    if (product.label === 'LIMITED GEAR' && availableQuantity === 0) return Swal.fire({ title: 'HABIS', text: 'Maaf, stok untuk ukuran ini sudah habis terjual.', icon: 'error', confirmButtonColor: '#000' });
    
    close();
    navigate('/checkout', { state: { cartItems: [{ ...product, price: activePrice, size: needsSize ? selectedSize : '-', quantity: Math.max(1, Number(quantity) || 1) }] } });
  };

  // Cek apakah NON-SIZE barangnya habis
  const isNonSizeSoldOut = product.label === 'LIMITED GEAR' && !needsSize && availableQuantity === 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm" onClick={close}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl max-w-7xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:h-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={close} className="absolute top-2 right-2 md:top-4 md:right-4 text-vtuber-pink hover:text-vtuber-cyan z-50 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md transition-colors"><IoClose className="w-6 h-6" /></button>

            <div className="w-full md:w-[60%] bg-vtuber-purple/5 flex items-center justify-center relative h-64 md:h-[85vh] shrink-0 border-r border-vtuber-blue/10">
               {(isClosed || isNonSizeSoldOut) && (<div className="absolute inset-0 bg-black/40 z-[5] flex items-center justify-center backdrop-blur-[2px]"><span className="bg-black text-white px-6 py-2 font-black text-2xl tracking-[0.2em] uppercase -rotate-12 border border-white/20 shadow-2xl">SOLD OUT</span></div>)}
                {showSaleBadge && (
                  <div className="absolute top-0 left-0 bg-gradient-to-br from-vtuber-pink to-vtuber-blue text-white px-6 py-4 rounded-br-3xl shadow-[0_10px_30px_rgba(225,174,207,0.5)] z-10 flex flex-col items-center">
                    <p className="text-[20px] font-black uppercase tracking-[0.2em] leading-none mb-1">{product.sale_end_date ? "LIMITED SALE" : "SPECIAL PRICE"}</p>
                    {product.sale_end_date && <div className="font-mono text-[18px] font-black tabular-nums tracking-tighter"><Countdown date={new Date(product.sale_end_date)} onComplete={() => setIsSaleExpired(true)} /></div>}
                  </div>
                )}
               <img src={product.image_url || product.image} alt={productName} className={`w-full h-full object-contain p-4 transition-all duration-300 drop-shadow-md ${(isClosed || isNonSizeSoldOut) ? 'grayscale opacity-60' : ''}`} />
            </div>

            <div className="w-full md:w-[40%] p-6 md:p-10 flex flex-col justify-start bg-white overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
                <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2 shrink-0 ${isClosed ? 'text-zinc-400' : 'text-zinc-800'}`}>{productName}</h2>
                
                <div className="flex items-center gap-3 mb-6 shrink-0 flex-wrap">
                  {isComingSoon ? (
                    <p className="text-3xl text-vtuber-purple font-black italic tracking-tighter">COMING SOON</p>
                  ) : (
                    <>
                      <p className={`text-3xl font-black transition-colors ${isClosed ? 'text-zinc-400' : 'text-vtuber-purple'}`}>{formatIDR(activePrice)}</p>
                      {selectedSize === 'XXL' && <p className="text-[10px] font-black text-black uppercase tracking-widest bg-vtuber-pink px-2.5 py-1 rounded-lg drop-shadow-sm">(+ Biaya Extra XXL)</p>}
                      {showSaleBadge && selectedSize !== 'XXL' && <p className="text-lg text-vtuber-pink line-through font-bold opacity-70">{formatIDR(product.original_price)}</p>}
                    </>
                  )}
                </div>
                
                <div className="text-sm text-black mb-6 border-t border-b border-vtuber-blue/10 py-4 shrink-0 font-medium">
                  <p className="whitespace-pre-line leading-relaxed">{product.description || "No description available for this premium gear."}</p>
                </div>

                {!isClosed && !isComingSoon && (
                  <div className="space-y-4 mb-8 shrink-0">
                    {needsSize && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple">Pilih Ukuran</label>
                          <button type="button" onClick={() => window.open(`/size-chart?cat=${sizeChartCat}`, '_blank')} className="text-[10px] font-bold text-vtuber-cyan uppercase underline tracking-[0.1em] hover:text-vtuber-pink">Panduan Ukuran</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* ✅ LOGIC RENDER SIZE (Dinamis kalau limited, Statis kalau biasa) */}
                          {product.label === 'LIMITED GEAR' ? (
                            stockData.length > 0 ? (
                              stockData.map((sz) => {
                                const avail = sz.stock_physical - sz.stock_reserved;
                                const isSoldOut = avail <= 0;
                                return (
                                  <button 
                                    key={sz.size} 
                                    disabled={isSoldOut}
                                    onClick={() => setSelectedSize(sz.size)} 
                                    className={`flex-1 min-w-[3rem] py-2 md:py-3 border-2 font-black text-xs md:text-sm transition-all rounded-xl relative ${isSoldOut ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed' : (selectedSize === sz.size ? 'border-vtuber-pink bg-vtuber-pink text-white shadow-[0_0_10px_rgba(225,174,207,0.5)]' : 'border-vtuber-blue/20 text-vtuber-purple hover:border-vtuber-cyan hover:text-vtuber-cyan')}`}
                                  >
                                    {sz.size}
                                    {sz.size === 'XXL' && !isSoldOut && <span className="absolute -top-2.5 -right-2 bg-vtuber-pink text-black font-black text-[10px] px-2 py-0.5 rounded-full drop-shadow-sm border border-black/5">+10K</span>}
                                    {isSoldOut && <span className="absolute -top-2 -right-1 bg-red-500 text-white font-black tracking-tighter text-[8px] px-1.5 py-0.5 rounded shadow-sm z-10">SOLD OUT</span>}
                                  </button>
                                );
                              })
                            ) : (
                              <p className="text-xs text-red-500 font-bold italic w-full">Stok belum diatur oleh admin.</p>
                            )
                          ) : (
                            ['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                              <button key={sz} type="button" onClick={() => setSelectedSize(sz)} className={`flex-1 min-w-[3rem] py-2 md:py-3 border-2 font-black text-xs md:text-sm transition-all rounded-xl relative ${selectedSize === sz ? 'border-vtuber-pink bg-vtuber-pink text-white shadow-[0_0_10px_rgba(225,174,207,0.5)]' : 'border-vtuber-blue/20 text-vtuber-purple hover:border-vtuber-cyan hover:text-vtuber-cyan'}`}>
                                {sz}
                                {sz === 'XXL' && <span className="absolute -top-2.5 -right-2 bg-vtuber-pink text-black font-black text-[10px] px-2 py-0.5 rounded-full drop-shadow-sm border border-black/5">+10K</span>}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold tracking-[0.2em] uppercase text-vtuber-purple block">Kuantitas</label>
                        {/* ✅ LIVE COUNTER STOK */}
                        {product.label === 'LIMITED GEAR' && availableQuantity !== null && availableQuantity > 0 && (!needsSize || selectedSize) && (
                          <span className="text-xs font-black tracking-widest text-red-600 animate-pulse bg-red-50 px-3 py-1 rounded-md border border-red-200 shadow-sm">
                            *Tersisa {availableQuantity} lagi!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-2 border-vtuber-blue/20 rounded-xl overflow-hidden w-full max-w-[130px] h-12 text-vtuber-purple">
                        <button type="button" onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))} className="w-10 h-full flex items-center justify-center hover:bg-vtuber-cyan/10 font-black text-lg transition-colors">-</button>
                        
                        {/* ✅ LIMIT INPUT KUANTITAS BERDASARKAN SISA STOK */}
                        <input 
                          type="number" 
                          min="1" 
                          value={quantity} 
                          onChange={(e) => {
                            let val = Number(e.target.value);
                            if (product.label === 'LIMITED GEAR' && availableQuantity !== null && val > availableQuantity) val = availableQuantity;
                            setQuantity(val);
                          }} 
                          onBlur={() => setQuantity(Math.max(1, Number(quantity) || 1))} 
                          className="w-12 h-full text-center font-black text-base outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        />
                        
                        <button type="button" onClick={() => {
                          if (product.label === 'LIMITED GEAR' && availableQuantity !== null) {
                            setQuantity(Math.min(availableQuantity, Number(quantity) + 1));
                          } else {
                            setQuantity(Number(quantity) + 1);
                          }
                        }} className="w-10 h-full flex items-center justify-center hover:bg-vtuber-cyan/10 font-black text-lg transition-colors">+</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 md:gap-3 mt-auto shrink-0 border-t border-vtuber-blue/10 pt-6">
                  {isClosed || isNonSizeSoldOut ? (
                    <button disabled className="w-full bg-zinc-200 text-zinc-500 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] cursor-not-allowed border border-zinc-300"><IoClose className="w-5 h-5 inline mr-2"/> {isClosed ? 'CLOSE ORDER' : 'SOLD OUT'}</button>
                  ) : isComingSoon ? (
                    <button disabled className="w-full bg-zinc-100 text-zinc-400 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] cursor-not-allowed">COMING SOON</button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleAddToCart} className="w-full py-4 bg-vtuber-cyan/10 text-vtuber-cyan border-2 border-vtuber-cyan font-black italic uppercase text-xs md:text-sm tracking-[0.1em] hover:bg-vtuber-cyan hover:text-white transition-all rounded-xl">ADD TO CART</button>
                      <button onClick={handleBuyNow} className="w-full py-4 bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white font-black italic uppercase text-xs md:text-sm tracking-[0.1em] hover:from-vtuber-pink hover:to-vtuber-purple hover:shadow-[0_5px_15px_rgba(225,174,207,0.4)] transition-all rounded-xl">BUY NOW</button>
                    </div>
                  )}
                </div>
            </div>
        </motion.div>
    </motion.div>
  )
}

export default ProductModal