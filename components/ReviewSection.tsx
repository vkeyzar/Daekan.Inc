'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Pastikan path ini benar mengarah ke konfigurasi Supabase lo

// 1. Deklarasikan struktur data Review
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

// 2. Berikan tipe eksplisit pada props session
export default function ReviewSection({ session }: { session: any }) {
  // 3. Pasang tipe ReviewData[] ke state reviews
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Contoh fetch dari Supabase (Sesuaikan dengan nama tabel lo)
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setReviews(data as ReviewData[]);
    } catch (error: any) { // 4. Tambahkan ': any' untuk membungkam error 'unknown'
      console.error('Gagal mengambil review:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading reviews...</div>;
  }

  return (
    <section className="py-12 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <h2 className="text-2xl font-black tracking-tighter uppercase">Customer Reviews</h2>
          {session ? (
            <button className="px-4 py-2 bg-blue-500 text-white text-sm font-bold tracking-widest hover:bg-blue-600 transition-colors">
              TULIS REVIEW
            </button>
          ) : (
            <span className="text-sm font-medium text-gray-500">Login untuk menulis review</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="p-5 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900 rounded-sm">
                
                {/* Header Reviewer */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm">{review.user_name}</span>
                    {review.is_verified && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                  </div>
                  {/* Rating Bintang */}
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Judul & Komentar */}
                <h3 className="font-bold text-md mb-2">{review.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{review.comment}</p>

                {/* Optional Image */}
                {review.image_url && (
                  <div className="mt-4">
                    <img src={review.image_url} alt="Review attachment" className="w-full h-32 object-cover rounded-sm border border-gray-200 dark:border-gray-700" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic col-span-full">Belum ada review untuk produk ini.</p>
          )}
        </div>
      </div>
    </section>
  );
}