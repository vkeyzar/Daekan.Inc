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
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error loading reviews:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [])

  const handleWriteReview = () => {
    if (!session) navigate('/login')
    else setIsModalOpen(true)
  }

  return (
    <section id="reviews" className="w-full bg-transparent py-24 px-4 md:px-10 relative z-10">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-left">
            {/* ✅ HEADER REVIEWS GRADIENT */}
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 drop-shadow-sm">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-2">CUSTOMER</span> 
              <span className="text-vtuber-pink">REVIEWS</span>
            </h2>
            <p className="text-vtuber-purple font-bold text-sm tracking-widest uppercase flex items-center gap-2 drop-shadow-sm">
              From {reviews.length} total reviews <FaCheckCircle className="text-vtuber-cyan drop-shadow-[0_0_5px_rgba(164,229,250,0.8)]" />
            </p>
          </div>

          {/* ✅ TOMBOL WRITE REVIEW GRADIENT */}
          <button 
            onClick={handleWriteReview}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white text-xs font-black tracking-[0.2em] uppercase hover:from-vtuber-pink hover:to-vtuber-purple transition-all duration-500 shadow-[0_10px_20px_rgba(164,229,250,0.4)] hover:shadow-[0_10px_30px_rgba(225,174,207,0.6)] rounded-full hover:scale-105"
          >
            <FaPlus size={12} /> Write A Review
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="animate-pulse font-bold tracking-widest text-vtuber-pink uppercase">LOADING FEEDBACK...</p>
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto pb-10 no-scrollbar snap-x">
            {reviews.map((rev) => (
              <motion.div 
                key={rev.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="min-w-[300px] md:min-w-full bg-white/80 backdrop-blur-md border border-vtuber-blue/20 p-5 snap-center shadow-lg rounded-3xl hover:border-vtuber-pink/50 transition-colors duration-500"
              >
                {rev.image_url && (
                  <div className="w-full h-80 mb-5 overflow-hidden rounded-2xl bg-vtuber-purple/10">
                    <img src={rev.image_url} alt="Review" className="w-full h-full object-cover transition-all duration-700 hover:scale-110" />
                  </div>
                )}
                
                {/* ✅ BINTANG JADI CYAN */}
                <div className="flex gap-1 mb-4 drop-shadow-sm">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={14} className={i < rev.rating ? "text-vtuber-cyan" : "text-zinc-200"} />
                  ))}
                </div>

                <p className="font-bold text-[10px] text-vtuber-purple uppercase tracking-[0.2em] mb-1">
                  {rev.user_name} {rev.is_verified && <span className="text-vtuber-cyan ml-1 drop-shadow-md">✓</span>}
                </p>
                <h4 className="font-black italic uppercase text-xl mb-2 tracking-tighter text-zinc-800">{rev.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium italic">"{rev.comment}"</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ReviewFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} session={session} onSuccess={fetchReviews} />
    </section>
  )
}

export default ReviewSection