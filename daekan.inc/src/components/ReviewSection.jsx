import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaPlus, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ReviewFormModal from './ReviewFormModal'

const ReviewSection = ({ session }) => {
  const [reviews, setReviews] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error loading reviews:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleWriteReview = () => {
    if (!session) {
      navigate('/login')
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <section id="reviews" className="w-full bg-transparent py-24 px-4 md:px-10 relative z-10">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-black tracking-tighter mb-2">
              CUSTOMER <span className="text-gray-400">REVIEWS</span>
            </h2>
            <p className="text-zinc-500 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
              From {reviews.length} total reviews <FaCheckCircle className="text-green-500" />
            </p>
          </div>

          <button 
            onClick={handleWriteReview}
            className="flex items-center gap-2 px-8 py-4 bg-black text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-zinc-800 transition-all shadow-xl"
          >
            <FaPlus size={12} /> Write A Review
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="animate-pulse font-bold tracking-widest text-zinc-400">LOADING FEEDBACK...</p>
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto pb-10 no-scrollbar snap-x">
            {reviews.map((rev) => (
              <motion.div 
                key={rev.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="min-w-[300px] md:min-w-full bg-white/80 backdrop-blur-sm border border-zinc-100 p-5 snap-center shadow-sm"
              >
                {rev.image_url && (
                  <div className="w-full h-80 mb-5 overflow-hidden rounded-md bg-zinc-100">
                    <img src={rev.image_url} alt="Review" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                )}
                
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={14} className={i < rev.rating ? "text-black" : "text-zinc-200"} />
                  ))}
                </div>

                <p className="font-bold text-[10px] text-zinc-400 uppercase tracking-[0.2em] mb-1">
                  {rev.user_name} {rev.is_verified && <span className="text-green-500 ml-1">✓</span>}
                </p>
                <h4 className="font-black italic uppercase text-xl mb-2 tracking-tighter">{rev.title}</h4>
                <p className="text-zinc-600 text-sm leading-relaxed font-medium italic">"{rev.comment}"</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal dapet prop onSuccess buat refresh data pas abis submit */}
      <ReviewFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        session={session}
        onSuccess={fetchReviews}
      />
    </section>
  )
}

export default ReviewSection