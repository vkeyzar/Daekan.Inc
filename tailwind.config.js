/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ✅ 1. DAFTARIN PALET WARNA VTUBER
      colors: {
        vtuber: {
          pink: '#e1aecf',
          cyan: '#a4e5fa',
          blue: '#77cbf0',
          purple: '#99c2ea',
        }
      },
      keyframes: {
        'pop-up': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // ✅ 2. ANIMASI NGAMBANG BUAT STIKER POJOKAN
        'float-slow': { 
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      animation: {
        'pop-up': 'pop-up 0.3s ease-out forwards',
        'float-slow': 'float-slow 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}