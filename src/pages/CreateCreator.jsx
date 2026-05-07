import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Swal from 'sweetalert2'

const CreateCreator = ({ isOpen, onClose, refreshData }) => {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null) 
  
  const [creator, setCreator] = useState({
    name: '', 
    role: 'CONTENT CREATOR', 
    bio: '', 
    channel_id: '', // Kolom baru sesuai CSV
    youtube_video_id: '', // Kolom baru sesuai CSV
  })

  const [socials, setSocials] = useState({
    youtube: '', instagram: '', tiktok: '', twitter: '', twitch: ''
  })

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleAddCreator = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let publicImageUrl = ''

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `talent-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('creator-image')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('creator-image').getPublicUrl(fileName)
        publicImageUrl = data.publicUrl
      }

      // INSERT SEMUA DATA TERMASUK YT IDS
      const { error } = await supabase
        .from('creators')
        .insert([{ 
          ...creator,
          image: publicImageUrl,
          socials: socials,
          gear: [] 
        }])

      if (error) throw error

      Swal.fire('SUCCESS!', 'Talent baru berhasil Onboard!', 'success')
      setPreviewUrl(null)
      setImageFile(null)
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
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">New Talent</h2>
            <p className="text-zinc-400 text-xs font-bold tracking-[0.3em] uppercase mt-2">Elite Roster Registration</p>
          </div>
          <button onClick={onClose} className="text-zinc-300 hover:text-black transition-colors text-2xl font-light">✕</button>
        </div>
        
        <form onSubmit={handleAddCreator} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* KIRI: CORE, IMAGE & YOUTUBE IDS */}
          <div className="space-y-8">
            {/* AREA UPLOAD PREVIEW */}
            <div className="group relative w-full h-64 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200 overflow-hidden flex items-center justify-center hover:border-black transition-all">
              {previewUrl ? (
                <>
                  <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-black uppercase tracking-widest">Change Photo</p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">Drag or Click to Upload</p>
                  <p className="text-zinc-300 text-[9px] uppercase italic leading-none">Recommended: 1080x1080px (WEBP)</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" required />
            </div>

            <div className="space-y-4">
                <div>
                  <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-1">Full Name</label>
                  <input type="text" placeholder="E.G. THEADRIED" className="w-full border-b-2 border-zinc-100 py-2 outline-none font-bold uppercase focus:border-black text-base transition-colors" 
                    onChange={(e) => setCreator({...creator, name: e.target.value})} required />
                </div>
                <div>
                  <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-1">Professional Role</label>
                  <input type="text" placeholder="CONTENT CREATOR" className="w-full border-b-2 border-zinc-100 py-2 outline-none font-bold uppercase focus:border-black text-sm" 
                    onChange={(e) => setCreator({...creator, role: e.target.value})} />
                </div>

                {/* --- YOUTUBE IDS (Sesuai Database lo) --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-1">YT Channel ID</label>
                        <input type="text" placeholder="UC..." className="w-full border-b-2 border-zinc-100 py-2 outline-none font-mono text-xs focus:border-black" 
                            onChange={(e) => setCreator({...creator, channel_id: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-1">Video Preview ID</label>
                        <input type="text" placeholder="Video ID" className="w-full border-b-2 border-zinc-100 py-2 outline-none font-mono text-xs focus:border-black" 
                            onChange={(e) => setCreator({...creator, youtube_video_id: e.target.value})} />
                    </div>
                </div>
            </div>
          </div>

          {/* KANAN: BIO & SOCIALS */}
          <div className="space-y-8">
            <div>
              <label className="text-xs font-black tracking-widest text-zinc-400 uppercase block mb-2">Short Bio</label>
              <textarea placeholder="Tell the world about this talent..." className="w-full border-2 border-zinc-50 p-5 rounded-[1.5rem] outline-none font-medium h-32 resize-none focus:border-black text-sm italic bg-zinc-50/50" 
                onChange={(e) => setCreator({...creator, bio: e.target.value})} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b pb-2">Social Connections</h3>
              {['youtube', 'instagram', 'tiktok', 'twitter', 'twitch'].map((plat) => (
                <div key={plat} className="flex items-center gap-4">
                  <span className="text-[11px] font-black text-zinc-400 w-16 uppercase">{plat}</span>
                  <input 
                    type="text" 
                    placeholder={`https://${plat}.com/...`}
                    className="flex-1 bg-transparent border-b border-zinc-100 py-1 text-xs outline-none focus:border-black font-medium" 
                    onChange={(e) => setSocials({...socials, [plat]: e.target.value})}
                  />
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-6 rounded-2xl font-black italic uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-2xl disabled:bg-zinc-300">
              {loading ? 'PROCESSING...' : 'ACTIVATE TALENT +'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCreator