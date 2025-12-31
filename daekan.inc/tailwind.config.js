/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- TAMBAHIN DARI SINI ---
      keyframes: {
        'pop-up': {
          '0%': { opacity: '0', transform: 'scale(0.95)' }, // Mulai: agak transparan & kecil
          '100%': { opacity: '1', transform: 'scale(1)' },   // Selesai: jelas & ukuran normal
        }
      },
      animation: {
        // Kita namain animasinya 'pop-up', durasi 0.3 detik, jalannya mulus (ease-out)
        'pop-up': 'pop-up 0.3s ease-out forwards',
      }
      // --- SAMPAI SINI ---
    },
  },
  plugins: [],
}