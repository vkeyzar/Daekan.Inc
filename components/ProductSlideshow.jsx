import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa' 

const slides = [
  { id: 1, image: 'https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Mockup_1.webp' },
  { id: 2, image: 'https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/rn_image_picker_lib_temp_3851da7a-95bf-4441-b1c3-e31bceef27d0.jpg' },
  { id: 3, image: 'https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/1773920723485.webp' },
  { id: 4, image: 'https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/1773920712410.webp' },
]

const ImagePreviewModal = ({ isOpen, imageSrc, onClose }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        key="image-preview-modal-portal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-md z-[999999] flex items-center justify-center p-4 md:p-8 pointer-events-auto"
        onClick={onClose} 
      >
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="fixed top-6 right-6 md:top-10 md:right-10 p-3 md:p-4 rounded-full bg-white/10 hover:bg-vtuber-pink text-white backdrop-blur-md transition-all z-[1000000] shadow-xl"
          aria-label="Close Preview"
        >
          <FaTimes size={20} />
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-7xl w-full h-full flex justify-center items-center z-[999999]"
          onClick={(e) => e.stopPropagation()} 
        >
          <img src={imageSrc} alt="Full Preview" className="w-full h-auto max-h-[90vh] object-contain drop-shadow-[0_0_30px_rgba(164,229,250,0.3)] rounded-xl" />
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

const ProductSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedImageForPreview, setSelectedImageForPreview] = useState(null)

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 5000) 
    return () => clearInterval(timer) 
  }, [])

  const nextSlide = (e) => { e.stopPropagation(); setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length); }
  const prevSlide = (e) => { e.stopPropagation(); setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length); }

  if (slides.length === 0) return null;

  return (
    <>
      <div className="w-full pt-12 pb-16 relative z-10">
        
        {/* ✅ HEADER SECTION FULL JEKETEK (JETTO KAWAII) */}
        <div className="text-center mb-10">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 drop-shadow-sm">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-2">FEATURED</span> 
                <span className="text-vtuber-pink">MERCH</span>
            </h2>
            <p className="text-vtuber-purple tracking-widest text-sm uppercase font-bold drop-shadow-sm">
                Exclusive closer look. Click image to expand.
            </p>
        </div>

        <div 
          className="relative w-full h-[45vh] md:h-[65vh] bg-transparent overflow-hidden cursor-pointer group rounded-3xl md:rounded-none max-w-screen-2xl mx-auto md:max-w-none"
          onClick={() => setSelectedImageForPreview(slides[currentIndex].image)}
        >
          <AnimatePresence>
            <motion.img
              key={currentIndex}
              src={slides[currentIndex].image}
              alt="Featured Gear Preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-vtuber-pink/10 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10 mix-blend-overlay"></div>

          <button onClick={prevSlide} className="absolute top-1/2 left-3 md:left-10 z-20 -translate-y-1/2 p-2.5 md:p-4 rounded-full bg-white/20 hover:bg-vtuber-cyan text-white hover:text-white backdrop-blur-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-[0_0_15px_rgba(164,229,250,0.5)] border border-white/30">
            <FaChevronLeft size={18} className="md:w-5 md:h-5" />
          </button>
          
          <button onClick={nextSlide} className="absolute top-1/2 right-3 md:right-10 z-20 -translate-y-1/2 p-2.5 md:p-4 rounded-full bg-white/20 hover:bg-vtuber-cyan text-white hover:text-white backdrop-blur-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-[0_0_15px_rgba(164,229,250,0.5)] border border-white/30">
            <FaChevronRight size={18} className="md:w-5 md:h-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 shadow-md border border-white/40
                  ${currentIndex === index ? 'bg-vtuber-pink scale-150 border-vtuber-pink shadow-[0_0_10px_rgba(225,174,207,1)]' : 'bg-white/40 hover:bg-vtuber-cyan'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <ImagePreviewModal isOpen={selectedImageForPreview !== null} imageSrc={selectedImageForPreview} onClose={() => setSelectedImageForPreview(null)} />
    </>
  )
}

export default ProductSlideshow