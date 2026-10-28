'use client';
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaStar, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabaseClient'

const ReviewFormModal = ({ isOpen, onClose, session, onSuccess }: { isOpen: boolean; onClose: () => void; session: any; onSuccess: () => void }) => {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  if (!isOpen) return null

  const uploadImageToSupabaseStorage = async (file: File | null) => {
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

    } catch (error: any) {
      console.error('Error uploading image:', error.message)
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      Swal.fire({
        title: 'PERHATIAN',
        text: 'Mohon pilih rating bintang terlebih dahulu!',
        icon: 'warning',
        confirmButtonColor: '#000000',
      })
      return
    }

    try {
      setUploading(true)
      const uploaded_image_url = await uploadImageToSupabaseStorage(imageFile)

      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          user_id: session.user.id,
          user_name: session.user.user_metadata?.full_name || 'Daekan Member',
          rating: rating,
          title: title.toUpperCase(),
          comment: comment,
          image_url: uploaded_image_url,
          is_verified: false
        })

      if (insertError) throw insertError

      Swal.fire({
        title: 'TERIMA KASIH!',
        text: 'Ulasan Anda telah berhasil dikirim.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      })

      setRating(0)
      setTitle('')
      setComment('')
      setImageFile(null)

      onSuccess()
      onClose()
    } catch (error: any) {
      Swal.fire({
        title: 'GAGAL MENGIRIM ULASAN',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#000000',
      })
    } finally {
      setUploading(false)
    }
  }

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999999] flex items-center justify-center p-4 pointer-events-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white w-full max-w-xl p-6 sm:p-10 relative overflow-y-auto max-h-[92vh] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-5 right-5 p-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer">
            <FaTimes size={18} />
          </button>

          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2">Share Your Feedback</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">Join the Daekan Experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <label className="text-xs font-black tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400">Your Rating</label>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => {
                  const ratingValue = i + 1
                  return (
                    <FaStar
                      key={i}
                      size={32}
                      className={`cursor-pointer transition-transform duration-200 ${ratingValue <= (hover || rating) ? "text-black dark:text-white scale-110" : "text-zinc-200 dark:text-zinc-800"}`}
                      onClick={() => setRating(ratingValue)}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    />
                  )
                })}
              </div>
            </div>

            <div>
              <input
                required type="text" placeholder="REVIEW TITLE (E.G. AMAZING QUALITY!)"
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-300 dark:border-zinc-700 py-3 focus:border-black dark:focus:border-white outline-none font-black text-sm sm:text-base uppercase placeholder:text-zinc-400 transition-colors"
              />
            </div>

            <div>
              <textarea
                required rows={3} placeholder="TELL US MORE ABOUT THE PRODUCT..."
                value={comment} onChange={(e) => setComment(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-300 dark:border-zinc-700 py-3 focus:border-black dark:focus:border-white outline-none font-medium text-sm sm:text-base leading-relaxed resize-none placeholder:text-zinc-400 transition-colors"
              ></textarea>
            </div>

            <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 py-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-black dark:hover:border-white transition-colors group">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              <FaCloudUploadAlt size={36} className={imageFile ? "text-green-600" : "text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors"} />
              <p className="text-xs sm:text-sm font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase text-center px-4">
                {imageFile ? imageFile.name : "Upload Product Photo"}
              </p>
            </label>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black text-xs sm:text-sm uppercase tracking-[0.2em] hover:opacity-80 transition-all flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
