import React from 'react'
import { supabase } from '../lib/supabaseClient'
import Swal from 'sweetalert2'

const CreatorList = ({ creators, refreshData, onOpenEditCreator }) => {
  
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Hapus ${name}?`,
      text: "Data creator ini bakal hilang dari roster.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Hapus'
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase.from('creators').delete().eq('id', id);
      if (!error) {
        Swal.fire('Deleted!', 'Creator berhasil dihapus.', 'success');
        refreshData();
      }
    }
  };

  // Helper untuk ambil semua link sosmed dari JSON
  const parseSocials = (socialsData) => {
    try {
      return typeof socialsData === 'string' ? JSON.parse(socialsData) : socialsData;
    } catch (e) {
      return {};
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1100px]">
        <thead>
          <tr className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase border-b border-zinc-100">
            <th className="pb-6 font-black">Creator Profile</th>
            <th className="pb-6 font-black">Role</th>
            <th className="pb-6 font-black">Bio</th>
            <th className="pb-6 font-black text-center">Connected Socials</th>
            <th className="pb-6 font-black text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {creators.map((talent, index) => {
            const socials = parseSocials(talent.socials);
            
            return (
              <tr key={talent.id} className="group hover:bg-zinc-50/80 transition-all duration-300">
                
                {/* PROFILE */}
                <td className="py-8 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={talent.image || 'https://via.placeholder.com/150'} 
                      className="w-full h-full object-cover" 
                      alt={talent.name}
                    />
                  </div>
                  <div>
                    <p className="font-black text-lg uppercase tracking-tight leading-none mb-2">{talent.name}</p>
                    <p className="text-xs text-zinc-400 font-mono">#{String(talent.id).padStart(3, '0')}</p>
                  </div>
                </td>

                {/* ROLE */}
                <td className="py-8">
                  <span className="text-xs font-black bg-zinc-900 text-white px-3 py-1 rounded-md uppercase tracking-widest">
                    {talent.role || 'TALENT'}
                  </span>
                </td>

                {/* BIO */}
                <td className="py-8 max-w-xs">
                  <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 italic">
                    {talent.bio || 'No bio available.'}
                  </p>
                </td>

                {/* SOCIALS - SEMUA PLATFORM */}
                <td className="py-8">
                  <div className="flex flex-wrap justify-center gap-2 max-w-[200px] mx-auto">
                    {socials?.youtube && (
                      <a href={socials.youtube} target="_blank" rel="noreferrer" title="YouTube"
                         className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-lg hover:scale-110 transition-all">
                        <span className="text-xs font-black italic">YT</span>
                      </a>
                    )}
                    {socials?.instagram && (
                      <a href={socials.instagram} target="_blank" rel="noreferrer" title="Instagram"
                         className="w-8 h-8 flex items-center justify-center bg-zinc-900 text-white rounded-lg hover:scale-110 transition-all">
                        <span className="text-xs font-black italic">IG</span>
                      </a>
                    )}
                    {socials?.tiktok && (
                      <a href={socials.tiktok} target="_blank" rel="noreferrer" title="TikTok"
                         className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-lg hover:scale-110 transition-all border border-zinc-700">
                        <span className="text-xs font-black italic">TK</span>
                      </a>
                    )}
                    {socials?.twitter && (
                      <a href={socials.twitter} target="_blank" rel="noreferrer" title="X (Twitter)"
                         className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-black rounded-lg hover:scale-110 transition-all border border-zinc-200">
                        <span className="text-xs font-black italic uppercase">X</span>
                      </a>
                    )}
                    {socials?.twitch && (
                      <a href={socials.twitch} target="_blank" rel="noreferrer" title="Twitch"
                         className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:scale-110 transition-all">
                        <span className="text-xs font-black italic uppercase">TW</span>
                      </a>
                    )}
                  </div>
                </td>

                {/* ACTIONS */}
                <td className="py-8 text-right">
                  <div className="flex justify-end gap-5">
                    <button onClick={() => onOpenEditCreator(talent)} className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(talent.id, talent.name)} className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-700">
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}

export default CreatorList