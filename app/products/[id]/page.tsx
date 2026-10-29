'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import useCartStore from '@/lib/store/useCartStore';
import type { ProductData, SizeOption } from '@/lib/types';

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveImageIndex(0);
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

  const scrollToMobileSlide = (index: number) => {
    setActiveImageIndex(index);
    if (mobileCarouselRef.current) {
      const slideWidth = mobileCarouselRef.current.clientWidth;
      mobileCarouselRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth',
      });
    }
  };

  const handleMobileScroll = () => {
    if (!mobileCarouselRef.current) return;
    const { scrollLeft, clientWidth } = mobileCarouselRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== activeImageIndex) {
        setActiveImageIndex(newIndex);
      }
    }
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
            className="inline-flex items-center gap-2 px-4 py-2 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold text-sm uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft size={12} /> BACK
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const productName = product.name || (product as any).title || 'UNKNOWN GEAR';
  const images: string[] = Array.isArray(product.image_url)
    ? (product.image_url as string[]).filter(Boolean)
    : (product.image_url || (product as any).image ? [((product.image_url as unknown as string) || (product as any).image)] : []);
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

  const imageDropShadowClass =
    '[filter:drop-shadow(0_10px_24px_rgba(0,0,0,0.22))] dark:[filter:drop-shadow(0_0_4px_rgba(255,255,255,0.85))_drop-shadow(0_0_16px_rgba(125,211,252,0.75))_drop-shadow(0_0_32px_rgba(167,139,250,0.5))]';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-3 pb-16 md:pt-5 md:pb-24">
        {/* Back Button - Subtle, compact, dengan jarak vertikal rapat ke kontainer produk */}
        <div className="mb-3 md:mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Kembali ke halaman sebelumnya"
            className="group inline-flex items-center gap-2 px-3 py-1.5 border border-black/15 dark:border-white/20 bg-transparent text-zinc-700 dark:text-zinc-300 font-semibold text-sm tracking-wide hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white active:scale-[0.98] transition-all cursor-pointer"
          >
            <FaArrowLeft size={12} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Layout E-commerce Premium: Mobile 1 kolom, Desktop 2 kolom utama */}
        <div className="w-full flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-14 xl:gap-16 items-start">
          {/* KOLOM KIRI: Image Gallery */}
          <div className="w-full md:w-[56%] lg:w-[60%]">
            {/* MOBILE VIEW: Horizontal Swipe Carousel */}
            <div className="md:hidden relative w-full">
              <div className="relative w-full bg-zinc-50/70 dark:bg-zinc-950/70 border border-black/10 dark:border-white/15 overflow-hidden">
                {isSale && !isComingSoon && !isUnavailable && (
                  <div className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black px-3 py-1 z-20">
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                      SALE
                    </span>
                  </div>
                )}

                {product.label && (
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-black dark:text-white border border-black/15 dark:border-white/20 px-3 py-1 z-20">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                      {product.label}
                    </span>
                  </div>
                )}

                {images.length > 0 ? (
                  <div
                    ref={mobileCarouselRef}
                    onScroll={handleMobileScroll}
                    className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="w-full shrink-0 snap-center aspect-square flex items-center justify-center p-6 sm:p-10"
                      >
                        <img
                          src={img}
                          alt={`${productName} - Foto ${idx + 1}`}
                          className={`w-full h-full object-contain select-none ${imageDropShadowClass}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center text-zinc-400 font-black text-sm tracking-widest uppercase">
                    NO IMAGE
                  </div>
                )}

                {isUnavailable && !isComingSoon && (
                  <span className="absolute bottom-0 left-0 z-20 bg-white border border-black text-black text-xs font-bold uppercase tracking-wider px-2.5 py-1">
                    Sold Out
                  </span>
                )}

                {/* Navigasi Panah Mobile jika gambar > 1 */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        scrollToMobileSlide(activeImageIndex > 0 ? activeImageIndex - 1 : images.length - 1)
                      }
                      aria-label="Foto sebelumnya"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white/85 dark:bg-black/85 border border-black/15 dark:border-white/20 text-black dark:text-white active:scale-95 transition"
                    >
                      <FaChevronLeft size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        scrollToMobileSlide(activeImageIndex < images.length - 1 ? activeImageIndex + 1 : 0)
                      }
                      aria-label="Foto berikutnya"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white/85 dark:bg-black/85 border border-black/15 dark:border-white/20 text-black dark:text-white active:scale-95 transition"
                    >
                      <FaChevronRight size={12} />
                    </button>
                  </>
                )}
              </div>

              {/* Indikator Titik / Dots Carousel Mobile */}
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToMobileSlide(idx)}
                      aria-label={`Lihat foto ${idx + 1}`}
                      className={`h-1.5 transition-all duration-300 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'w-6 bg-black dark:bg-white'
                          : 'w-1.5 bg-black/25 dark:bg-white/25'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* DESKTOP VIEW: Vertical Stack (Seluruh foto produk bersusun ke bawah dengan ukuran besar tanpa terpotong) */}
            <div className="hidden md:flex md:flex-col md:gap-6">
              {images.length > 0 ? (
                images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-full bg-zinc-50/70 dark:bg-zinc-950/70 border border-black/10 dark:border-white/15 flex items-center justify-center p-8 lg:p-12 overflow-hidden"
                  >
                    {idx === 0 && isSale && !isComingSoon && !isUnavailable && (
                      <div className="absolute top-4 left-4 bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 z-10">
                        <span className="text-[11px] font-black tracking-[0.2em] uppercase">
                          SALE
                        </span>
                      </div>
                    )}

                    {idx === 0 && product.label && (
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-black dark:text-white border border-black/15 dark:border-white/20 px-3.5 py-1.5 z-10">
                        <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
                          {product.label}
                        </span>
                      </div>
                    )}

                    <img
                      src={img}
                      alt={`${productName} - Foto ${idx + 1}`}
                      className={`w-full h-auto max-h-[720px] object-contain transition-transform duration-500 ${imageDropShadowClass}`}
                    />

                    {idx === 0 && isUnavailable && !isComingSoon && (
                      <span className="absolute bottom-0 left-0 z-10 bg-white border border-black text-black text-xs font-bold uppercase tracking-wider px-2.5 py-1">
                        Sold Out
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="w-full aspect-[4/3] bg-zinc-50/70 dark:bg-zinc-950/70 border border-black/10 dark:border-white/15 flex items-center justify-center text-zinc-400 font-black text-sm tracking-widest uppercase">
                  NO IMAGE
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: Product Info (Sticky pada Desktop) */}
          <div className="w-full md:w-[44%] lg:w-[40%] sticky top-24 flex flex-col justify-between">
            <div>
              {product.category && (
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-2">
                  {product.category}
                </p>
              )}

              {/* Nama Produk */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-black dark:text-white leading-[1.12] mb-3.5">
                {productName}
              </h1>

              {/* Harga */}
              <div className="flex items-baseline gap-3.5 mb-6 flex-wrap pb-5 border-b border-black/10 dark:border-white/15">
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

              {/* Varian / Pilihan Ukuran */}
              {hasSize && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
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
                          className={`min-h-[46px] py-2.5 border text-center font-bold text-xs sm:text-sm tracking-wider transition-all cursor-pointer ${
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

              {/* Tombol Add to Cart & Buy Now */}
              <div className="flex flex-col gap-3 mb-7">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isUnavailable}
                  className="w-full min-h-[52px] py-3.5 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-black text-xs sm:text-sm tracking-[0.22em] uppercase hover:opacity-85 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUnavailable ? 'Unavailable / Sold Out' : 'Add To Cart'}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isUnavailable}
                  className="w-full min-h-[52px] py-3.5 border border-black/25 dark:border-white/25 bg-transparent text-black dark:text-white font-black text-xs sm:text-sm tracking-[0.22em] uppercase hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUnavailable ? 'Sold Out' : 'Buy Now'}
                </button>
              </div>

              {/* Deskripsi Produk */}
              {product.description && (
                <div className="border-t border-black/10 dark:border-white/15 pt-5">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white mb-3">
                    Deskripsi Produk
                  </h2>
                  <div className="text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
