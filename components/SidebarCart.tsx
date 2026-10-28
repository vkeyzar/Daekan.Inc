'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useCartStore from '@/lib/store/useCartStore';

// 1. Definisikan tipe untuk isi keranjang
export interface CartItem {
  id: string | number;
  name: string; // atau 'title', sesuaikan dengan database Anda
  price: number;
  image_url?: string;
  size: string;
  quantity: number;
}

// 2. Definisikan tipe untuk properti Sidebar
interface SidebarCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarCart({ isOpen, onClose }: SidebarCartProps) {
  const router = useRouter();
  
  // 3. Hubungkan ke Store Anda (Hapus baris dummy jika useCartStore sudah aktif)
  // const { items, removeItem, updateQuantity } = useCartStore();
  const items: CartItem[] = []; 
  const removeItem = (id: string | number, size: string) => {}; 
  const updateQuantity = (id: string | number, size: string, qty: number) => {};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // 4. Ganti navigasi lama dengan useRouter Next.js
  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <>
      {/* Overlay Background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-900 shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-black uppercase tracking-widest text-black dark:text-white">Shopping Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List Produk di Keranjang */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="font-medium tracking-wide">Keranjang masih kosong</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4 border-b border-gray-100 dark:border-zinc-800 pb-5">
                
                {/* Gambar Produk */}
                <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-sm overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">NO IMG</div>
                  )}
                </div>

                {/* Detail Keranjang */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm uppercase text-black dark:text-white line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Size: {item.size}</p>
                    <p className="text-sm font-bold text-black dark:text-white mt-1">{formatPrice(item.price)}</p>
                  </div>

                  {/* Kuantitas & Hapus */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-bold text-black dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id, item.size)}
                      className="text-[10px] uppercase font-black text-red-500 hover:text-red-700 tracking-wider transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Keranjang */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-black">
            <div className="flex justify-between items-center mb-5">
              <span className="font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 text-sm">Total</span>
              <span className="font-black text-xl text-black dark:text-white">{formatPrice(total)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Checkout Now
            </button>
          </div>
        )}
        
      </div>
    </>
  );
}