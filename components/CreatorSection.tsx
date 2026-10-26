import React from 'react'

const CreatorSection = ({ creators, onOpenModal }) => { 
  return (
    // --- KUNCI FIX: bg-white diganti jadi bg-transparent, ditambah relative z-10 ---
    <div name="talents" className="w-full bg-transparent text-black pt-32 pb-20 px-4 md:px-10 relative z-10">
      <div className="max-w-screen-2xl mx-auto flex flex-col justify-center h-full">
        
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black uppercase text-black tracking-tighter mb-4 drop-shadow-sm">
            OUR <span className="text-gray-400">TALENTS</span>
          </h2>
          <p className="text-gray-500 tracking-widest text-sm uppercase">
            MEET THE ICONS OF DAEKAN INC.
          </p>
        </div>

        {/* Grid Kreator */}
        <div className="flex flex-wrap justify-center gap-8 px-12 sm:px-0">
          
          {creators && creators.map((creator) => (
            <div 
              key={creator.id} 
              onClick={() => onOpenModal(creator)} 
              // Kartu kreatornya tetep solid (bg-gray-100) biar fotonya dapet kontras
              className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer bg-gray-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-300 border border-white/50"
            >
              <div className="w-full h-[400px] overflow-hidden">
                <img 
                  src={creator.image} 
                  alt={creator.name} 
                  className="w-full h-full object-cover duration-500 group-hover:scale-110"
                />
              </div>
              
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-full group-hover:translate-y-0 duration-300">
                <p className="text-xs font-bold text-yellow-400 tracking-widest mb-1">{creator.role}</p>
                <h3 className="text-xl font-black uppercase italic text-white">{creator.name}</h3>
                <p className="text-xs text-gray-300 mt-2">Click to view profile</p>
              </div>

              <div className="absolute bottom-4 left-4 group-hover:opacity-0 duration-300">
                  <h3 className="text-lg font-black uppercase text-white drop-shadow-md bg-black/30 px-3 py-1 rounded backdrop-blur-md border border-white/10">
                    {creator.name}
                  </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CreatorSection