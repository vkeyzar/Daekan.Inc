'use client';

import React from 'react'
import { supabase } from '@/lib/supabaseClient'
import Swal from 'sweetalert2'

const CreatorList = ({ creators = [], refreshData, onOpenEditCreator }: any) => {

  const handleDelete = async (id: any, name: any) => {
    const confirm = await Swal.fire({
      title: `HAPUS ${name}?`,
      text: "Data ini akan hilang permanen dari roster, yakin?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#000',
      confirmButtonText: 'YA, HAPUS!'
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase
        .from('creators')
        .delete()
        .eq('id', id);

      if (error) {
        Swal.fire('GAGAL!', error.message, 'error');
      } else {
        Swal.fire('BERHASIL!', `${name} telah dihapus.`, 'success');
        refreshData();
      }
    }
  };

  const parseSocials = (socialsData: any) => {
    try {
      return typeof socialsData === 'string' ? JSON.parse(socialsData) : socialsData;
    } catch {
      return {};
    }
  };

  return (
    <div className="overflow-x-auto border-2 border-black dark:border-white bg-white dark:bg-zinc-950 p-4 sm:p-6">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="text-xs sm:text-sm font-black tracking-[0.15em] text-zinc-600 dark:text-zinc-400 uppercase border-b-2 border-black dark:border-white">
            <th className="pb-4 font-black">Creator Profile</th>
            <th className="pb-4 font-black">Role</th>
            <th className="pb-4 font-black">YouTube ID</th>
            <th className="pb-4 font-black">Video ID</th>
            <th className="pb-4 font-black text-center">Socials</th>
            <th className="pb-4 font-black text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {creators.map((talent: any) => {
            const socials = parseSocials(talent.socials);

            return (
              <tr key={talent.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all duration-200">
                <td className="py-6 flex items-center gap-5">
                  <div className="w-16 h-16 overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white shrink-0">
                    <img
                      src={talent.image || 'https://via.placeholder.com/150'}
                      className="w-full h-full object-cover"
                      alt={talent.name}
                    />
                  </div>
                  <div>
                    <p className="font-black text-base uppercase tracking-tight leading-none mb-1 text-black dark:text-white">{talent.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">ID: {talent.id}</p>
                  </div>
                </td>

                <td className="py-6">
                  <span className="text-xs font-black bg-black text-white dark:bg-white dark:text-black px-3 py-1 uppercase tracking-widest">
                    {talent.role || 'TALENT'}
                  </span>
                </td>

                <td className="py-6">
                  <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 border border-zinc-300 dark:border-zinc-700 inline-block">
                    {talent.channel_id || '—'}
                  </p>
                </td>

                <td className="py-6">
                  <p className="text-xs font-mono text-red-600 bg-red-50 px-2.5 py-1 border border-red-200 inline-block font-bold">
                    {talent.youtube_video_id || '—'}
                  </p>
                </td>

                <td className="py-6 text-center">
                  <div className="flex justify-center gap-2">
                    {socials?.youtube && <span className="text-xs font-black bg-red-600 text-white px-2 py-1">YT</span>}
                    {socials?.instagram && <span className="text-xs font-black bg-zinc-900 text-white px-2 py-1">IG</span>}
                    {socials?.tiktok && <span className="text-xs font-black bg-black text-white px-2 py-1">TK</span>}
                  </div>
                </td>

                <td className="py-6 text-right">
                  <div className="flex justify-end gap-5">
                    <button
                      onClick={() => onOpenEditCreator(talent)}
                      className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(talent.id, talent.name)}
                      className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:underline cursor-pointer"
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
