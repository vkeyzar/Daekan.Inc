'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import useCartStore from '@/lib/store/useCartStore';
import type { CartItem } from '@/lib/types';

export type { CartItem };

interface SidebarCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarCart({ isOpen, onClose }: SidebarCartProps) {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayItems = hasHydrated ? items : [];
  const totalItems = displayItems.reduce((acc, item) => acc + item.quantity, 0);
  const total = displayItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    onClose();

    if (!session) {
      router.push('/login?redirect=/checkout');
      return;
    }

    router.push('/checkout');
  };

  return (
    <>
      {/* Backdrop Overlay - Klik area di luar sidebar untuk menutup */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Sidebar Cart - Menyisakan sedikit background di layar HP agar overlay mudah di-tap */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className={`fixed top-0 right-0 h-dvh w-[88vw] max-w-[380px] sm:w-[420px] sm:max-w-none bg-white dark:bg-black text-black dark:text-white border-l-2 border-black dark:border-white shadow-2xl z-[111] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:p-6 border-b-2 border-black dark:border-white shrink-0">
          <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-widest text-black dark:text-white truncate">
            Shopping Cart ({totalItems})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Keranjang"
            className="w-10 h-10 flex items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List Produk di Keranjang */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-6">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400 text-center px-4">
              <svg className="w-14 h-14 sm:w-16 sm:h-16 mb-4 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider">Keranjang masih kosong</p>
            </div>
          ) : (
            displayItems.map((item, index) => (
              <div key={`${item.id}-${item.size}-${index}`} className="flex gap-3 sm:gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 sm:pb-6 last:border-b-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-50 dark:bg-zinc-900 border border-black dark:border-white overflow-hidden flex-shrink-0 p-1.5 sm:p-2">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs text-zinc-400 font-bold">NO IMG</div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-xs sm:text-sm md:text-base uppercase text-black dark:text-white line-clamp-2 leading-snug">{item.name}</h4>
                    {item.size && item.size !== '-' && (
                      <p className="text-[11px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-0.5">Size: {item.size}</p>
                    )}
                    <p className="text-xs sm:text-sm md:text-base font-black text-black dark:text-white mt-1">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3">
                    <div className="flex items-center border-2 border-black dark:border-white">
                      <button
                        type="button"
                        aria-label="Kurangi jumlah"
                        onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-black dark:text-white font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2.5 sm:px-3 text-xs sm:text-sm font-black text-black dark:text-white select-none">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Tambah jumlah"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-black dark:text-white font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.size)}
                      className="py-1 px-1.5 text-[11px] sm:text-xs uppercase font-black text-red-600 dark:text-red-400 hover:underline tracking-wider transition-colors cursor-pointer"
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
        {displayItems.length > 0 && (
          <div className="p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] border-t-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-950 shrink-0">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <span className="font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm md:text-base">Total</span>
              <span className="font-black text-lg sm:text-xl md:text-2xl text-black dark:text-white">{formatPrice(total)}</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3.5 sm:py-4 bg-black text-white dark:bg-white dark:text-black font-black text-xs sm:text-sm uppercase tracking-[0.2em] hover:opacity-80 active:scale-[0.99] transition-all cursor-pointer"
            >
              Checkout Now
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
