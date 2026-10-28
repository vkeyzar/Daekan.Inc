'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
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
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const result = await Swal.fire({
        title: 'OTENTIKASI DIPERLUKAN',
        text: 'Silakan masuk ke akun Anda atau mendaftar terlebih dahulu untuk dapat melanjutkan proses pembayaran.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#000000',
        cancelButtonColor: '#71717a',
        confirmButtonText: 'KE HALAMAN LOGIN',
        cancelButtonText: 'BATAL',
      });

      if (result.isConfirmed) {
        onClose();
        router.push('/login?returnTo=/checkout');
      }
      return;
    }

    onClose();
    router.push('/checkout');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-black text-black dark:text-white border-l-2 border-black dark:border-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black dark:border-white">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-black dark:text-white">
            Shopping Cart ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List Produk di Keranjang */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
              <svg className="w-16 h-16 mb-4 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-sm md:text-base font-bold uppercase tracking-wider">Keranjang masih kosong</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-900 border border-black dark:border-white overflow-hidden flex-shrink-0 p-2">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 font-bold">NO IMG</div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-sm md:text-base uppercase text-black dark:text-white line-clamp-2">{item.name}</h4>
                    <p className="text-xs md:text-sm font-bold text-zinc-600 dark:text-zinc-400 mt-1">Size: {item.size}</p>
                    <p className="text-sm md:text-base font-black text-black dark:text-white mt-1">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border-2 border-black dark:border-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 text-black dark:text-white font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-black text-black dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="px-3 py-1 text-black dark:text-white font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      className="text-xs uppercase font-black text-red-600 dark:text-red-400 hover:underline tracking-wider transition-colors cursor-pointer"
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
          <div className="p-6 border-t-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-950">
            <div className="flex justify-between items-center mb-5">
              <span className="font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 text-sm md:text-base">Total</span>
              <span className="font-black text-xl md:text-2xl text-black dark:text-white">{formatPrice(total)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:opacity-80 transition-opacity cursor-pointer"
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}
