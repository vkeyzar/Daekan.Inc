import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Swal from 'sweetalert2'

const UpdateCreator = ({ isOpen, onClose, creatorData, refreshData }) => {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  
  const [creator, setCreator] = useState({
    id: '',
    name: '',
    role: '',
    bio: '',
    channel_id: '',
    youtube_video_id: '',
    image: ''
  })

  const [socials, setSocials] = useState({
    youtube: '', instagram: '', tiktok: '', twitter: '', twitch: ''
  })

  // --- PRE-FILL DATA LAMA (SINKRON DENGAN CSV/DB) ---
  useEffect(() => {
    if (creatorData) {
      setCreator({
        id: creatorData.id,
        name: creatorData.name || '',
        role: creatorData.role || '',
        bio: creatorData.bio || '',
        channel_id: creatorData.channel_id || '',
        youtube_video_id: creatorData.youtube_video_id || '',
        image: creatorData.image || ''
      })
      
      // Parsing JSON Socials
      const parsedSocials = typeof creatorData.socials === 'string' 
        ? JSON.parse(creatorData.socials) 
        : creatorData.socials;
      
      setSocials({
        youtube: parsedSocials?.youtube || '',
        instagram: parsedSocials?.instagram || '',
        tiktok: parsedSocials?.tiktok || '',
        twitter: parsedSocials?.twitter || '',
        twitch: parsedSocials?.twitch || ''
      })

      setPreviewUrl(creatorData.image)
    }
  }, [creatorData])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalImageUrl = creator.image

      // Logic Upload kalau ada foto baru
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `talent-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('creator-image')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('creator-image').getPublicUrl(fileName)
        finalImageUrl = data.publicUrl
      }

      // UPDATE SEMUA KOLOM TERMASUK YT IDS
      const { error } = await supabase
        .from('creators')
        .update({ 
          name: creator.name,
          role: creator.role,
          bio: creator.bio,
          channel_id: creator.channel_id,
          youtube_video_id: creator.youtube_video_id,
          image: finalImageUrl,
          socials: socials
        })
        .eq('id', creator.id)

      if (error) throw error

      Swal.fire('UPDATED!', 'Data Talent berhasil diperbarui!', 'success')
      onClose()
      refreshData()
    } catch (error) {
      Swal.fire('ERROR!', error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-black p-8 md:p-12 rounded-[3rem] w-full max-w-5xl shadow-2xl my-auto">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">Edit Talent</h2>
            <p className="text-zinc-400 text-xs font-bold tracking-[0.3em] uppercase mt-2">ID: {creator.id} — Managing: {creator.name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-300 hover:text-black transition-colors text-2xl font-light">✕</button>
        </div>
        
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* KOLOM KIRI: VISUAL & IDS */}
          <div className="space-y-8">
            <div className="group relative w-full h-64 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200 overflow-hidden flex items-center justify-center hover:border-black transition-all">
              <img src={previewUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="preview" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <p className="text-white text-xs font-black uppercase tracking-[0.3em]">Change Talent Photo</p>
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-1">Full Name</label>
                <input type="text" value={creator.name} className="w-full border-b-2 border-zinc-100 py-2 outline-none font-bold uppercase focus:border-black text-base" 
                  onChange={(e) => setCreator({...creator, name: e.target.value})} required />
              </div>

              {/* YT IDS SECTION */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-1">Channel ID</label>
                  <input type="text" value={creator.channel_id} placeholder="UC..." className="w-full border-b border-zinc-100 py-2 outline-none font-mono text-[11px] focus:border-black" 
                    onChange={(e) => setCreator({...creator, channel_id: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-1">Video ID</label>
                  <input type="text" value={creator.youtube_video_id} placeholder="Video ID" className="w-full border-b border-zinc-100 py-2 outline-none font-mono text-[11px] focus:border-black" 
                    onChange={(e) => setCreator({...creator, youtube_video_id: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: ROLE, BIO & SOCIALS */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
               <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-1">Role / Profession</label>
                <input type="text" value={creator.role} className="w-full border-b-2 border-zinc-100 py-2 outline-none font-bold uppercase focus:border-black text-sm" 
                  onChange={(e) => setCreator({...creator, role: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-1">Short Bio</label>
                <textarea value={creator.bio} className="w-full border-2 border-zinc-50 p-4 rounded-2xl outline-none font-medium h-24 resize-none focus:border-black text-sm italic bg-zinc-50/50" 
                  onChange={(e) => setCreator({...creator, bio: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-2">Social Connections</label>
              <div className="grid grid-cols-1 gap-3 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                {Object.keys(socials).map((plat) => (
                  <div key={plat} className="flex items-center gap-4">
                    <span className="text-[11px] font-black text-zinc-400 w-16 uppercase">{plat}</span>
                    <input 
                      type="text" 
                      value={socials[plat]}
                      placeholder={`Link ${plat}`}
                      className="flex-1 bg-transparent border-b border-zinc-200 py-1 text-[11px] outline-none focus:border-black" 
                      onChange={(e) => setSocials({...socials, [plat]: e.target.value})}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-6 rounded-2xl font-black italic uppercase tracking-[0.2em] hover:scale-[1.01] transition-all shadow-2xl active:scale-95 disabled:bg-zinc-300">
              {loading ? 'SAVING DATA...' : 'UPDATE ROSTER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateCreator