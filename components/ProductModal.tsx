'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Sesuaikan import ini jika lokasi store Anda berbeda
// import { useCartStore } from '@/store/useCartStore';

// 1. Definisikan tipe untuk properti produk
export interface ProductData {
  id: string | number;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
}

// 2. Definisikan tipe untuk opsi ukuran dan stok
export interface SizeOption {
  size: string;
  stock_physical: number;
  stock_reserved: number;
}

// 3. Definisikan tipe untuk props komponen
interface ProductModalProps {
  product: ProductData;
  close: () => void;
}

export default function ProductModal({ product, close }: ProductModalProps) {
  const router = useRouter();
  
  // 4. Berikan tipe eksplisit pada useState untuk menghindari error 'never'
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // Simulasi fetch data ukuran (Ganti dengan logika fetch API Anda)
  useEffect(() => {
    // Contoh data statis sementara agar tidak error
    const mockSizes: SizeOption[] = [
      { size: 'S', stock_physical: 10, stock_reserved: 2 },
      { size: 'M', stock_physical: 5, stock_reserved: 0 },
      { size: 'L', stock_physical: 0, stock_reserved: 0 }, // Out of stock
    ];
    setSizes(mockSizes);
  }, [product.id]);

  // 5. Beri tipe 'number' pada parameter price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // 6. Ganti 'navigate' bawaan React Router dengan 'router.push' Next.js
  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Pilih ukuran terlebih dahulu!');
      return;
    }
    
    // Di Next.js App Router, Anda tidak bisa mengirim { state: ... } lewat route.
    // Simpan data ke Context / Zustand (useCartStore), lalu pindah halaman:
    // useCartStore.getState().addToCart({ ...product, size: selectedSize });
    
    router.push('/checkout');
    close();
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Pilih ukuran terlebih dahulu!');
      return;
    }
    // Logika masukkan ke keranjang di sini
    alert(`${product.name} (Ukuran ${selectedSize}) masuk keranjang!`);
    close();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Tombol Close */}
        <button 
          onClick={close}
          className="absolute top-4 right-4 z-10 p-2 bg-white/50 dark:bg-black/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Sisi Kiri: Gambar Produk */}
          <div className="w-full md:w-1/2 bg-gray-100 dark:bg-zinc-800">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover aspect-square md:aspect-auto"
              />
            ) : (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center text-gray-400">
                NO IMAGE
              </div>
            )}
          </div>

          {/* Sisi Kanan: Detail Produk */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white mb-2">
                {product.name}
              </h2>
              <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-6">
                {formatPrice(product.price)}
              </p>

              {/* Pemilihan Ukuran */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3 text-black dark:text-white">
                  Pilih Ukuran
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((s) => {
                    const availableStock = s.stock_physical - s.stock_reserved;
                    const isOutOfStock = availableStock <= 0;
                    
                    return (
                      <button
                        key={s.size}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(s.size)}
                        className={`py-2 border text-center font-bold transition-all
                          ${isOutOfStock ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-zinc-700 cursor-not-allowed line-through' : 
                            selectedSize === s.size 
                              ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                              : 'border-gray-300 dark:border-gray-600 text-black dark:text-white hover:border-black dark:hover:border-white'
                          }
                        `}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Aksi Tombol */}
            <div className="flex flex-col space-y-2 mt-4">
              <button 
                onClick={handleAddToCart}
                className="w-full py-3 border-2 border-black dark:border-white text-black dark:text-white font-bold tracking-widest uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                Add To Cart
              </button>
              <button 
                onClick={handleBuyNow}
                className="w-full py-3 bg-blue-500 text-white font-bold tracking-widest uppercase hover:bg-blue-600 transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}