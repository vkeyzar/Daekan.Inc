'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { supabase } from '@/lib/supabaseClient';
import useCartStore from '@/lib/store/useCartStore';
import type { ProductData, SizeOption } from '@/lib/types';

export type { ProductData, SizeOption };

interface ProductModalProps {
  product: ProductData;
  close: () => void;
}

const toCartItem = (product: ProductData, size: string) => {
  const mainImage = Array.isArray(product.image_url) ? product.image_url[0] : (product.image_url as unknown as string);
  return {
    id: product.id,
    name: product.name,
    price: size === 'XXL' ? Number(product.price) + 10000 : Number(product.price),
    image_url: mainImage,
    size,
    label: product.label,
  };
};

export default function ProductModal({ product, close }: ProductModalProps) {
  const router = useRouter();
  const hasSize = product.has_size !== false;
  const sizeChartCat = (product.product_line || '').toUpperCase().includes('COLLAB') ? 'COLLAB' : 'MERCH';

  const images: string[] = Array.isArray(product.image_url)
    ? product.image_url.filter(Boolean)
    : (product.image_url ? [product.image_url as unknown as string] : []);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(hasSize ? null : '-');

  useEffect(() => {
    setSelectedSize(hasSize ? null : '-');

    const fetchStocks = async () => {
      const { data, error } = await supabase
        .from('product_stocks')
        .select('size, stock_physical, stock_reserved')
        .eq('product_id', product.id);

      if (!error && data && data.length > 0) {
        setSizes(data as SizeOption[]);
      } else if (product.label !== 'LIMITED GEAR' && hasSize) {
        setSizes(
          ['S', 'M', 'L', 'XL', 'XXL'].map((size) => ({
            size,
            stock_physical: 999,
            stock_reserved: 0,
          }))
        );
      } else {
        setSizes([]);
      }
    };

    fetchStocks();
  }, [product.id, hasSize, product.label]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const activePrice = selectedSize === 'XXL' ? Number(product.price) + 10000 : Number(product.price);

  const nonSizeOutOfStock =
    !hasSize &&
    product.label === 'LIMITED GEAR' &&
    (sizes.length === 0 || sizes[0].stock_physical - sizes[0].stock_reserved <= 0);
  const isPreOrderExpired =
    product.label === 'PRE-ORDER' &&
    Boolean(product.sale_end_date) &&
    new Date(product.sale_end_date!).getTime() <= Date.now();
  const isUnavailable =
    product.is_open === false ||
    !product.price ||
    product.price <= 0 ||
    nonSizeOutOfStock ||
    isPreOrderExpired;

  const handleBuyNow = async () => {
    if (isUnavailable) {
      Swal.fire({
        title: 'TIDAK TERSEDIA',
        text: 'Produk ini sedang tidak tersedia untuk dipesan.',
        icon: 'error',
        confirmButtonColor: '#000000',
      });
      return;
    }
    const finalSize = hasSize ? selectedSize : '-';
    if (!finalSize) {
      Swal.fire({
        title: 'PERHATIAN',
        text: 'Mohon pilih ukuran (Size) terlebih dahulu.',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    useCartStore.getState().addItem(toCartItem(product, finalSize));

    const {
      data: { session },
    } = await supabase.auth.getSession();

    close();

    if (!session) {
      router.push('/login?redirect=/checkout');
      return;
    }

    router.push('/checkout');
  };

  const handleAddToCart = async () => {
    if (isUnavailable) {
      Swal.fire({
        title: 'TIDAK TERSEDIA',
        text: 'Produk ini sedang tidak tersedia untuk dipesan.',
        icon: 'error',
        confirmButtonColor: '#000000',
      });
      return;
    }
    const finalSize = hasSize ? selectedSize : '-';
    if (!finalSize) {
      Swal.fire({
        title: 'PERHATIAN',
        text: 'Mohon pilih ukuran (Size) terlebih dahulu.',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }
    useCartStore.getState().addItem(toCartItem(product, finalSize));
    Swal.fire({
      title: 'BERHASIL',
      text: hasSize
        ? `${product.name} (Ukuran ${finalSize}) telah dimasukkan ke keranjang Anda.`
        : `${product.name} telah dimasukkan ke keranjang Anda.`,
      icon: 'success',
      timer: 1600,
      showConfirmButton: false,
    });
    close();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={close}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Close */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          aria-label="Close Modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Sisi Kiri: Gambar Produk */}
        <div className="w-full md:w-1/2 bg-zinc-50 dark:bg-zinc-900 border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white flex flex-col items-center justify-center p-6 min-h-[260px] md:min-h-[420px]">
          {images.length > 0 ? (
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full max-h-[280px] md:max-h-[360px] object-contain"
              />
              {images.length > 1 && (
                <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-12 p-1 border-2 bg-white dark:bg-black transition-all cursor-pointer shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                          : 'border-zinc-300 dark:border-zinc-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-sm">
              NO IMAGE
            </div>
          )}
        </div>

        {/* Sisi Kanan: Detail Produk */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black dark:text-white mb-2 pr-8">
              {product.name}
            </h2>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <p className="text-xl md:text-2xl font-black text-black dark:text-white">
                {formatPrice(activePrice)}
              </p>
              {selectedSize === 'XXL' && (
                <span className="text-xs font-black uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black px-2.5 py-1">
                  +10K XXL
                </span>
              )}
              {product.original_price && Number(product.original_price) > Number(product.price) && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-through font-bold">
                  {formatPrice(Number(product.original_price))}
                </p>
              )}
            </div>

            {product.description && (
              <div className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 mb-6 border-y border-zinc-200 dark:border-zinc-800 py-4 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            )}

            {/* Pemilihan Ukuran */}
            {hasSize && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-black dark:text-white">
                    Pilih Ukuran
                  </h3>
                  <Link
                    href={`/sizechart?cat=${sizeChartCat}`}
                    className="text-xs font-black uppercase tracking-wider underline underline-offset-4 text-black dark:text-white hover:opacity-70"
                  >
                    Panduan Ukuran
                  </Link>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {sizes.map((s) => {
                    const availableStock = s.stock_physical - s.stock_reserved;
                    const isOutOfStock = availableStock <= 0;

                    return (
                      <button
                        key={s.size}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(s.size)}
                        className={`py-2.5 border-2 text-center font-black text-xs md:text-sm transition-all cursor-pointer
                          ${isOutOfStock
                            ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800 cursor-not-allowed line-through'
                            : selectedSize === s.size
                              ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                              : 'border-black/30 dark:border-white/30 text-black dark:text-white hover:border-black dark:hover:border-white'
                          }
                        `}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Aksi Tombol */}
          <div className="flex flex-col space-y-3 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={handleAddToCart}
              disabled={isUnavailable}
              className="w-full py-3.5 border-2 border-black dark:border-white text-black dark:text-white font-black text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUnavailable ? 'Unavailable / Sold Out' : 'Add To Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isUnavailable}
              className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-black text-xs md:text-sm tracking-[0.2em] uppercase hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUnavailable ? 'Sold Out' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
