import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaStar, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa' 
import { supabase } from '../lib/supabaseClient' 

const ReviewFormModal = ({ isOpen, onClose, session, onSuccess }) => {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  if (!isOpen) return null

  // --- FUNGSI UPLOAD FOTO KE SUPABASE STORAGE ---
  const uploadImageToSupabaseStorage = async (file) => {
    try {
      if (!file) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}_${Math.random()}.${fileExt}`;
      const filePath = `reviews/${fileName}`; 

      const { error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('review-images').getPublicUrl(filePath)
      return data.publicUrl; 

    } catch (error) {
      console.error('Error uploading image:', error.message)
      return null;
    }
  }

  // --- FUNGSI SUBMIT FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return alert("Please select a star rating first, Bro!")

    try {
      setUploading(true)
      
      const uploaded_image_url = await uploadImageToSupabaseStorage(imageFile)

      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          user_id: session.user.id, 
          user_name: session.user.user_metadata.full_name || 'Anonymous User',
          rating: rating,
          title: title.toUpperCase(), 
          comment: comment,
          image_url: uploaded_image_url, 
          is_verified: false 
        })

      if (insertError) throw insertError

      alert("Review successfully submitted! Thanks, Bro!")
      
      // Reset form setelah berhasil
      setRating(0)
      setTitle('')
      setComment('')
      setImageFile(null)
      
      onSuccess() 
      onClose() 
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999999] flex items-center justify-center p-4 pointer-events-auto"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-xl p-8 md:p-12 relative overflow-y-auto max-h-[95vh] rounded-3xl shadow-2xl shadow-black/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tombol Tutup */}
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-zinc-50 hover:bg-zinc-200 text-zinc-400 hover:text-black transition-all">
            <FaTimes size={18} />
          </button>

          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-2">Share Your Feedback</h3>
            <p className="text-zinc-400 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">Join the Daekan Experience. Batch Frieren Exclusive.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating Bintang */}
            <div className="flex flex-col items-center gap-3">
              <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">Your Rating</label>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => {
                  const ratingValue = i + 1
                  return (
                    <FaStar
                      key={i}
                      size={32}
                      className={`cursor-pointer transition-transform duration-200 ${ratingValue <= (hover || rating) ? "text-black scale-110" : "text-zinc-200"}`}
                      onClick={() => setRating(ratingValue)}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    />
                  )
                })}
              </div>
            </div>

            {/* Inputs */}
            <div>
                <input 
                required type="text" placeholder="REVIEW TITLE (E.G. AMAZING QUALITY!)" 
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full border-b-2 border-zinc-100 py-4 focus:border-black outline-none font-black text-sm uppercase placeholder:text-zinc-300 transition-colors" 
                />
            </div>
            
            <div>
                <textarea 
                required rows="3" placeholder="TELL US MORE ABOUT THE PRODUCT..." 
                value={comment} onChange={(e) => setComment(e.target.value)}
                className="w-full border-b-2 border-zinc-100 py-3 focus:border-black outline-none font-medium text-sm leading-relaxed resize-none transition-colors"
                ></textarea>
            </div>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-zinc-200 py-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-50 transition-colors group rounded-xl">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
              <FaCloudUploadAlt size={36} className={imageFile ? "text-green-500" : "text-zinc-300 group-hover:text-black transition-colors"} />
              <p className="text-[10px] md:text-xs font-bold tracking-widest text-zinc-400 uppercase text-center px-4">
                {imageFile ? imageFile.name : "Upload Product Photo"}
              </p>
            </label>

            <button 
              type="submit"
              disabled={uploading}
              className="w-full py-5 bg-black text-white font-black italic uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                    <FaSpinner className="animate-spin" /> SUBMITTING...
                </>
              ) : "SUBMIT FEEDBACK"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default ReviewFormModal