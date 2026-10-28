'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { supabase } from '@/lib/supabaseClient';
import ReviewFormModal from './ReviewFormModal';
import { FaStar, FaPlus, FaCheckCircle } from 'react-icons/fa';

interface ReviewData {
  id: string | number;
  product_id?: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  is_verified: boolean;
  image_url?: string;
  created_at?: string;
}

export default function ReviewSection({ session }: { session: any }) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setReviews(data as ReviewData[]);
    } catch (error: any) {
      console.error('Gagal mengambil review:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = async () => {
    if (!session) {
      const result = await Swal.fire({
        title: 'OTENTIKASI DIPERLUKAN',
        text: 'Silakan masuk ke akun Anda terlebih dahulu untuk memberikan ulasan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#000000',
        cancelButtonColor: '#71717a',
        confirmButtonText: 'KE HALAMAN LOGIN',
        cancelButtonText: 'BATAL',
      });
      if (result.isConfirmed) {
        router.push('/login?returnTo=/#reviews');
      }
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <section id="reviews" className="w-full bg-white dark:bg-black text-black dark:text-white py-20 md:py-24 px-4 md:px-10 relative z-10 font-sans border-t border-black dark:border-white transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6 border-b border-black dark:border-white pb-6">
          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white">
              CUSTOMER REVIEWS
            </h2>
            <p className="font-bold text-[11px] md:text-xs tracking-[0.2em] uppercase flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              From {reviews.length} total reviews <FaCheckCircle className="text-black dark:text-white" />
            </p>
          </div>

          <button
            type="button"
            onClick={handleWriteReview}
            className="flex items-center gap-2 px-6 sm:px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black text-[11px] md:text-xs font-black tracking-[0.2em] uppercase border border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all duration-300 cursor-pointer"
          >
            <FaPlus size={11} /> Write A Review
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 font-black uppercase tracking-[0.2em] text-xs animate-pulse">
            Loading Feedback...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-5 border border-black dark:border-white bg-white dark:bg-black transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col justify-between"
                >
                  <div>
                    {review.image_url && (
                      <div className="w-full h-64 mb-5 overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white">
                        <img src={review.image_url} alt="Review attachment" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={13}
                          className={i < review.rating ? 'text-black dark:text-white' : 'text-zinc-300 dark:text-zinc-700'}
                        />
                      ))}
                    </div>

                    <p className="font-bold text-[11px] uppercase tracking-[0.2em] text-black dark:text-white mb-1">
                      {review.user_name} {review.is_verified && <span className="ml-1">✓</span>}
                    </p>
                    <h3 className="font-black uppercase text-base md:text-lg mb-2 tracking-tight text-black dark:text-white">
                      {review.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs md:text-sm leading-relaxed font-medium">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.2em] text-xs col-span-full py-10 text-center">
                Belum ada review untuk produk ini.
              </p>
            )}
          </div>
        )}
      </div>

      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        session={session}
        onSuccess={fetchReviews}
      />
    </section>
  );
}
