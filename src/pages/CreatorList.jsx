import React from 'react'
import { supabase } from '../lib/supabaseClient'
import Swal from 'sweetalert2'

const CreatorList = ({ creators, refreshData, onOpenEditCreator }) => {
  
  // FUNGSI DELETE GACOR
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: `HAPUS ${name}?`,
      text: "Data ini bakal ilang permanen dari roster, yakin?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Merah buat delete
      cancelButtonColor: '#000',
      confirmButtonText: 'YA, HAPUS!'
    });

    if (confirm.isConfirmed) {
      // SIKAT DATABASE
      const { error } = await supabase
        .from('creators')
        .delete()
        .eq('id', id);

      if (error) {
        Swal.fire('GAGAL!', error.message, 'error');
      } else {
        Swal.fire('BERHASIL!', `${name} telah dihapus.`, 'success');
        // REFRESH DATA Dashboard (AutoSync)
        refreshData();
      }
    }
  };

  const parseSocials = (socialsData) => {
    try {
      return typeof socialsData === 'string' ? JSON.parse(socialsData) : socialsData;
    } catch (e) {
      return {};
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead>
          <tr className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase border-b border-zinc-100">
            <th className="pb-6 font-black">Creator Profile</th>
            <th className="pb-6 font-black">Role</th>
            <th className="pb-6 font-black">YouTube ID</th>
            <th className="pb-6 font-black">Video ID</th>
            <th className="pb-6 font-black text-center">Socials</th>
            <th className="pb-6 font-black text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {creators.map((talent) => {
            const socials = parseSocials(talent.socials);
            
            return (
              <tr key={talent.id} className="group hover:bg-zinc-50/80 transition-all duration-300">
                
                {/* PROFILE */}
                <td className="py-8 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={talent.image || 'https://via.placeholder.com/150'} 
                      className="w-full h-full object-cover" 
                      alt={talent.name}
                    />
                  </div>
                  <div>
                    <p className="font-black text-base uppercase tracking-tight leading-none mb-1">{talent.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">ID: {talent.id}</p>
                  </div>
                </td>

                {/* ROLE */}
                <td className="py-8">
                  <span className="text-[10px] font-black bg-zinc-900 text-white px-3 py-1 rounded-md uppercase tracking-widest">
                    {talent.role || 'TALENT'}
                  </span>
                </td>

                {/* YOUTUBE CHANNEL ID */}
                <td className="py-8">
                  <p className="text-[11px] font-mono text-zinc-500 bg-zinc-50 px-2 py-1 rounded border border-zinc-100 inline-block">
                    {talent.channel_id || '—'}
                  </p>
                </td>

                {/* YOUTUBE VIDEO ID */}
                <td className="py-8">
                  <p className="text-[11px] font-mono text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 inline-block font-bold">
                    {talent.youtube_video_id || '—'}
                  </p>
                </td>

                {/* SOCIALS */}
                <td className="py-8 text-center">
                  <div className="flex justify-center gap-2">
                    {socials?.youtube && <span className="text-[9px] font-black bg-red-600 text-white px-2 py-1 rounded">YT</span>}
                    {socials?.instagram && <span className="text-[9px] font-black bg-zinc-900 text-white px-2 py-1 rounded">IG</span>}
                    {socials?.tiktok && <span className="text-[9px] font-black bg-black text-white px-2 py-1 rounded">TK</span>}
                  </div>
                </td>

                {/* ACTIONS */}
                <td className="py-8 text-right">
                  <div className="flex justify-end gap-5">
                    <button 
                      onClick={() => onOpenEditCreator(talent)} 
                      className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(talent.id, talent.name)} 
                      className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-all"
                    >
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