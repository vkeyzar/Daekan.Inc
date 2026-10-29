'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { FaArrowLeft } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import useCartStore from '@/lib/store/useCartStore';
import type { ProductData, SizeOption } from '@/lib/types';

const toCartItem = (product: ProductData, size: string) => ({
  id: product.id,
  name: product.name,
  price: size === 'XXL' ? Number(product.price) + 10000 : Number(product.price),
  image_url: product.image_url,
  size,
  label: product.label,
});

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProductAndStock = async () => {
      setLoading(true);

      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (prodError || !prodData) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const fetchedProduct = prodData as ProductData;
      setProduct(fetchedProduct);

      const hasSize = fetchedProduct.has_size !== false;
      setSelectedSize(hasSize ? null : '-');

      const { data: stockData, error: stockError } = await supabase
        .from('product_stocks')
        .select('size, stock_physical, stock_reserved')
        .eq('product_id', fetchedProduct.id);

      if (!stockError && stockData && stockData.length > 0) {
        setSizes(stockData as SizeOption[]);
      } else if (fetchedProduct.label !== 'LIMITED GEAR' && hasSize) {
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

      setLoading(false);
    };

    fetchProductAndStock();
  }, [productId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <p className="animate-pulse font-black tracking-[0.2em] text-xs md:text-sm uppercase">
            Loading Gear...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center px-4 text-center gap-6">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
            Produk Tidak Ditemukan
          </h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft size={12} /> Kembali
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const productName = product.name || (product as any).title || 'UNKNOWN GEAR';
  const hasSize = product.has_size !== false;
  const sizeChartCat = (product.product_line || '').toUpperCase().includes('COLLAB') ? 'COLLAB' : 'MERCH';
  const activePrice = selectedSize === 'XXL' ? Number(product.price) + 10000 : Number(product.price);

  const isComingSoon = !product.price || product.price <= 0;
  const isSale =
    Boolean(product.original_price) && Number(product.original_price) > Number(product.price);
  const isPreOrderExpired =
    product.label === 'PRE-ORDER' &&
    Boolean(product.sale_end_date) &&
    new Date(product.sale_end_date!).getTime() <= Date.now();
  const nonSizeOutOfStock =
    !hasSize &&
    product.label === 'LIMITED GEAR' &&
    (sizes.length === 0 || sizes[0].stock_physical - sizes[0].stock_reserved <= 0);
  const isUnavailable =
    product.is_open === false ||
    isComingSoon ||
    nonSizeOutOfStock ||
    isPreOrderExpired;

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
        ? `${productName} (Ukuran ${finalSize}) telah dimasukkan ke keranjang Anda.`
        : `${productName} telah dimasukkan ke keranjang Anda.`,
      icon: 'success',
      timer: 1600,
      showConfirmButton: false,
    });
  };

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

    if (!session) {
      router.push('/login?redirect=/checkout');
      return;
    }

    router.push('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-4 pb-20 md:py-10">
        {/* Back Button - Mudah dijangkau di layar HP & tampil elegan */}
        <div className="mb-4 md:mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Kembali ke halaman sebelumnya"
            className="group inline-flex items-center gap-3 min-h-[44px] px-4 py-2 border border-black/15 dark:border-white/20 bg-transparent text-black dark:text-white font-bold text-xs uppercase tracking-[0.2em] hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-[0.98] transition-all cursor-pointer"
          >
            <FaArrowLeft size={11} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Layout Detail Produk Wide: Mobile bertumpuk (gambar penuh di atas, info di bawah), Desktop bersebelahan */}
        <div className="w-full flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 xl:gap-24 items-start">
          {/* Kolom Kiri / Atas: Gambar Produk Ukuran Besar */}
          <div className="relative w-full md:w-[54%] lg:w-[58%] aspect-square md:aspect-[4/3.6] bg-zinc-50/70 dark:bg-zinc-950/70 border border-black/10 dark:border-white/15 flex items-center justify-center p-6 sm:p-10 lg:p-16 overflow-hidden">
            {isSale && !isComingSoon && !isUnavailable && (
              <div className="absolute top-4 left-4 bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 z-10">
                <span className="text-[11px] font-black tracking-[0.2em] uppercase">
                  SALE
                </span>
              </div>
            )}

            {product.label && (
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-black dark:text-white border border-black/15 dark:border-white/20 px-3.5 py-1.5 z-10">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase">
                  {product.label}
                </span>
              </div>
            )}

            {product.image_url || (product as any).image ? (
              <img
                src={product.image_url || (product as any).image}
                alt={productName}
                className={`w-full h-full max-h-[420px] sm:max-h-[500px] lg:max-h-[600px] object-contain transition-transform duration-500 ${
                  isUnavailable
                    ? 'grayscale opacity-60 [filter:grayscale(100%)_drop-shadow(0_10px_24px_rgba(0,0,0,0.22))]'
                    : '[filter:drop-shadow(0_10px_24px_rgba(0,0,0,0.22))] dark:[filter:drop-shadow(0_0_4px_rgba(255,255,255,0.85))_drop-shadow(0_0_16px_rgba(125,211,252,0.75))_drop-shadow(0_0_32px_rgba(167,139,250,0.5))]'
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 font-black text-sm tracking-widest uppercase">
                NO IMAGE
              </div>
            )}

            {isUnavailable && !isComingSoon && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-black text-white px-5 py-2 font-black text-xs sm:text-sm tracking-[0.25em] uppercase -rotate-12 border border-white/30 shadow-xl">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>

          {/* Kolom Kanan / Bawah: Informasi Produk & Aksi */}
          <div className="w-full md:w-[46%] lg:w-[42%] flex flex-col justify-between md:py-2">
            <div>
              {product.category && (
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-2.5">
                  {product.category}
                </p>
              )}

              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-black uppercase tracking-tight text-black dark:text-white leading-[1.1] mb-4">
                {productName}
              </h1>

              {/* Harga */}
              <div className="flex items-baseline gap-3.5 mb-7 flex-wrap">
                {isComingSoon ? (
                  <p className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black dark:text-white">
                    Coming Soon
                  </p>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-black dark:text-white tracking-tight">
                      {formatPrice(activePrice)}
                    </p>
                    {selectedSize === 'XXL' && (
                      <span className="text-[11px] font-black uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5">
                        +10K XXL
                      </span>
                    )}
                    {isSale && (
                      <p className="text-sm sm:text-base text-zinc-400 dark:text-zinc-500 line-through font-semibold">
                        {formatPrice(Number(product.original_price))}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Deskripsi */}
              {product.description && (
                <div className="text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-300 mb-8 border-y border-black/10 dark:border-white/15 py-6 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              )}

              {/* Pilihan Ukuran */}
              {hasSize && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white">
                      Pilih Ukuran
                    </h2>
                    <Link
                      href={`/sizechart?cat=${sizeChartCat}`}
                      className="text-[11px] font-bold uppercase tracking-[0.15em] underline underline-offset-4 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Panduan Ukuran
                    </Link>
                  </div>

                  <div className="grid grid-cols-5 gap-2.5">
                    {sizes.map((s) => {
                      const availableStock = s.stock_physical - s.stock_reserved;
                      const isOutOfStock = availableStock <= 0;

                      return (
                        <button
                          key={s.size}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(s.size)}
                          className={`min-h-[48px] py-3 border text-center font-bold text-xs sm:text-sm tracking-wider transition-all cursor-pointer ${
                            isOutOfStock
                              ? 'bg-zinc-100/70 dark:bg-zinc-900/50 text-zinc-300 dark:text-zinc-700 border-black/5 dark:border-white/5 cursor-not-allowed line-through'
                              : selectedSize === s.size
                                ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-black'
                                : 'border-black/20 dark:border-white/20 text-black dark:text-white hover:border-black dark:hover:border-white'
                          }`}
                        >
                          {s.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Add to Cart & Buy Now (w-full agar mudah di-tap di mobile) */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isUnavailable}
                className="w-full min-h-[54px] py-4 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-black text-xs sm:text-sm tracking-[0.22em] uppercase hover:opacity-85 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUnavailable ? 'Unavailable / Sold Out' : 'Add To Cart'}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isUnavailable}
                className="w-full min-h-[54px] py-4 border border-black/25 dark:border-white/25 bg-transparent text-black dark:text-white font-black text-xs sm:text-sm tracking-[0.22em] uppercase hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUnavailable ? 'Sold Out' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
