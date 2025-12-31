import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaTimes, FaYoutube, FaTiktok, FaTwitch, FaInstagram } from 'react-icons/fa'
import { FaXTwitter } from "react-icons/fa6"

const CreatorModal = ({ creator, close }) => {
  const [currentVideoId, setCurrentVideoId] = useState(creator.youtubeId)

  useEffect(() => {
    // Kunci scroll body utama pas modal kebuka
    document.body.style.overflow = 'hidden'

    const fetchLatestVideo = async () => {
      if (!creator.channelId) return
      try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${creator.channelId}`
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&t=${Date.now()}`
        const res = await fetch(apiUrl)
        const data = await res.json()
        if (data.status === 'ok' && data.items && data.items.length > 0) {
          const item = data.items[0]
          let videoId = ""
          if (item.guid) videoId = item.guid.split(':').pop()
          if (videoId) setCurrentVideoId(videoId)
        } 
      } catch (error) {}
    }
    fetchLatestVideo()
    return () => { document.body.style.overflow = 'unset' }
  }, [creator])

  if (!creator) return null

  return (
    // WRAPPER UTAMA: Fixed memenuhi layar, Z-Index paling atas
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center sm:p-4">
      
      {/* OVERLAY GELAP */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={close}></div>

      {/* MODAL BOX */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        // FIX: w-full h-full di HP (Fullscreen), tapi max-w 100vw biar gak melar
        className="relative bg-zinc-900 text-white w-full h-full md:h-[90vh] md:w-[90vw] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-[100vw]"
      >
        
        {/* TOMBOL CLOSE (FIXED POSITION) */}
        {/* Posisinya Absolute terhadap Modal, bukan Layar. Top/Right aman */}
        <button 
            onClick={close} 
            className="absolute top-4 right-4 z-[50] bg-white text-black p-2 rounded-full hover:bg-gray-200 shadow-lg cursor-pointer"
        >
          <FaTimes size={20} />
        </button>

        {/* CONTAINER SCROLLABLE */}
        <div className="overflow-y-auto overflow-x-hidden h-full w-full pb-20">
            
            {/* --- HEADER SECTION --- */}
            {/* FIX: overflow-hidden DISINI KUNCINYA. Biar gambar background gak bikin melar */}
            <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden shrink-0">
                
                {/* 1. FOTO KREATOR */}
                <img 
                    // ⚠️ GANTI LINK INI DENGAN GAMBAR TEKS MILKY ASLI LO
                    src={creator.image}
                    alt={creator.name}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[120%] h-auto opacity-20 md:opacity-10 z-10 pointer-events-none mix-blend-screen object-contain"
                />
                
                {/* 2. GAMBAR TEKS "MILKY" */}
                {/* FIX: Object-contain di HP biar gak kepotong jelek, w-full biar gak offside */}
                {/* Gak jadi */}

                {/* 3. GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent z-20"></div>
                
                {/* 4. TEKS NAMA */}
                <div className="absolute bottom-0 left-0 p-5 md:p-10 w-full z-30">
                    <p className="text-yellow-400 font-bold tracking-widest text-xs md:text-sm mb-2">{creator.role}</p>
                    {/* FIX: Text Mobile max 5xl biar gak nabrak */}
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase shadow-black drop-shadow-lg leading-none break-words pr-4">
                        {creator.name}
                    </h2>
                </div>
            </div>

            {/* --- CONTENT GRID --- */}
            <div className="px-5 py-6 md:px-10 md:py-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-30">
                
                {/* KOLOM KIRI (SOCIALS) - Order Bawah di HP */}
                <div className="md:col-span-1 order-2 md:order-1">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">SOCIALS</h3>
                    <div className="flex flex-wrap gap-4">
                        {creator.socials.youtube && (<a href={creator.socials.youtube} target="_blank" rel="noreferrer"><FaYoutube size={28} className="hover:text-red-600 transition-colors" /></a>)}
                        {creator.socials.instagram && (<a href={creator.socials.instagram} target="_blank" rel="noreferrer"><FaInstagram size={28} className="hover:text-pink-500 transition-colors" /></a>)}
                        {creator.socials.tiktok && (<a href={creator.socials.tiktok} target="_blank" rel="noreferrer"><FaTiktok size={28} className="hover:text-gray-400 transition-colors" /></a>)}
                        {creator.socials.twitch && (<a href={creator.socials.twitch} target="_blank" rel="noreferrer"><FaTwitch size={28} className="hover:text-purple-500 transition-colors" /></a>)}
                        {creator.socials.twitter && (<a href={creator.socials.twitter} target="_blank" rel="noreferrer"><FaXTwitter size={28} className="hover:text-gray-400 transition-colors" /></a>)}
                    </div>
                    <div className="mt-6 text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                        {creator.bio}
                    </div>
                </div>

                {/* KOLOM KANAN (VIDEO & GEAR) - Order Atas di HP */}
                <div className="md:col-span-2 space-y-8 order-1 md:order-2">
                    
                    {/* Video Player */}
                    <div className="bg-black p-4 rounded-3xl border border-zinc-800">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 bg-red-600 rounded-full block"></span> 
                            LATEST CONTENT
                        </h3>
                        <div className="w-full aspect-video bg-zinc-800 rounded-xl overflow-hidden shadow-lg">
                           <iframe 
                             className="w-full h-full"
                             src={`https://www.youtube.com/embed/${currentVideoId}`} 
                             title="YouTube video player" 
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowFullScreen
                             style={{ border: 'none' }} 
                           ></iframe>
                        </div>
                    </div>

                    {/* Gear List */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">GEAR USED</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {creator.gear && creator.gear.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-white transition-colors">
                                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-400 text-sm">{index + 1}</div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.type}</p>
                                        <p className="font-bold text-base">{item.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CreatorModal