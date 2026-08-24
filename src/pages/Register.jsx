import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

// ✅ Sanitasi HTML untuk mencegah XSS — wajib sebelum inject string ke customHtml Swal
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

// Daftar kriteria password beserta regex pengecekannya
const REQUIREMENTS = [
  { key: 'hasUpper',   label: 'Huruf Besar (A–Z)',       test: (p) => /[A-Z]/.test(p) },
  { key: 'hasLower',   label: 'Huruf Kecil (a–z)',        test: (p) => /[a-z]/.test(p) },
  { key: 'hasNumber',  label: 'Angka (0–9)',               test: (p) => /[0-9]/.test(p) },
  { key: 'hasSpecial', label: 'Simbol Spesial (!@#$ dll)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

const Register = () => {
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [showChecker, setShowChecker] = useState(false)
  const [pwChecks,    setPwChecks]    = useState({
    hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false,
  })

  // ✅ Handler password — React menangani rendering secara aman (tidak ada innerHTML user-input)
  const handlePasswordChange = (e) => {
    const val = e.target.value
    setPassword(val)
    setPwChecks({
      hasUpper:   /[A-Z]/.test(val),
      hasLower:   /[a-z]/.test(val),
      hasNumber:  /[0-9]/.test(val),
      hasSpecial: /[^A-Za-z0-9]/.test(val),
    })
  }

  const allPassed = REQUIREMENTS.every((r) => pwChecks[r.key])

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) throw error

      Swal.fire({
        title: 'REGISTRASI BERHASIL',
        text: 'Cek email Anda untuk konfirmasi.',
        icon: 'success',
        buttonsStyling: false,
        customClass: {
          popup:         'bg-white border-4 border-black rounded-none p-6 shadow-2xl',
          title:         'font-black italic tracking-wider text-2xl text-black uppercase',
          confirmButton: 'rounded-none bg-vtuber-cyan text-black font-bold px-8 py-3 tracking-widest uppercase border-2 border-black mt-4 cursor-pointer',
        }
      })
    } catch (error) {
      let errorMsg = error.message
      let customHtml = null

      if (errorMsg.includes('Password should contain at least one character of each')) {
        // ✅ List di-center: container text-center + ul inline-block text-left
        customHtml = `
          <div class="border-l-4 border-vtuber-cyan pl-4 mt-4 bg-gray-50 py-4 text-center">
            <p class="font-black italic uppercase tracking-wider text-base mb-1 text-black">
              Password Terlalu Lemah!
            </p>
            <p class="text-sm mb-3 text-gray-500">
              Wajib mengandung kombinasi berikut:
            </p>
            <ul class="list-none p-0 m-0 inline-block text-left text-sm text-gray-900">
              <li class="mb-2"><span class="text-vtuber-cyan mr-2 text-base">■</span><strong class="font-black text-black">HURUF BESAR</strong> (A-Z)</li>
              <li class="mb-2"><span class="text-vtuber-cyan mr-2 text-base">■</span><strong class="font-black text-black">HURUF KECIL</strong> (a-z)</li>
              <li class="mb-2"><span class="text-vtuber-cyan mr-2 text-base">■</span><strong class="font-black text-black">ANGKA</strong> (0-9)</li>
              <li class="mb-0"><span class="text-vtuber-cyan mr-2 text-base">■</span><strong class="font-black text-black">SIMBOL SPESIAL</strong> (!@#$ dll)</li>
            </ul>
          </div>
        `
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'Email ini sudah terdaftar. Silakan login.'
      }

      // ✅ escapeHtml() mencegah errorMsg dari server digunakan untuk inject script ke Swal
      Swal.fire({
        title: 'REGISTRASI GAGAL',
        html: customHtml || `<div class="text-center text-sm text-black font-semibold mt-2">${escapeHtml(errorMsg)}</div>`,
        icon: 'error',
        buttonsStyling: false,
        customClass: {
          popup:         'bg-white border-4 border-black rounded-none p-6 shadow-2xl',
          title:         'font-black italic tracking-wider text-2xl text-black uppercase',
          htmlContainer: 'text-sm',
          confirmButton: 'rounded-none bg-vtuber-cyan text-black font-bold px-8 py-3 tracking-widest uppercase border-2 border-black mt-4 cursor-pointer',
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden text-black p-6 md:p-12">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-vtuber-pink/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-vtuber-cyan/20 rounded-full blur-[100px] pointer-events-none"></div>

      <form onSubmit={handleRegister} className="relative z-10 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-vtuber-blue/20 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black mb-2 italic uppercase tracking-tighter drop-shadow-sm">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-vtuber-cyan to-vtuber-blue pr-1">JOIN DAEKAN</span>
          <span className="font-light ml-0.5 text-vtuber-pink">INC.</span>
        </h2>
        <p className="text-vtuber-purple text-[10px] md:text-xs uppercase tracking-[0.2em] mb-8 font-bold">Create your daekan account</p>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-vtuber-purple ml-1">Email Address</label>
            <input
              type="email"
              placeholder="daekan@inc.com"
              required
              autoComplete="email"
              className="w-full p-4 bg-white border border-vtuber-blue/30 rounded-2xl focus:outline-none focus:border-vtuber-cyan transition-all text-vtuber-purple"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password + Real-time Strength Checker */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-vtuber-purple ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full p-4 bg-white border border-vtuber-blue/30 rounded-2xl focus:outline-none focus:border-vtuber-cyan transition-all text-vtuber-purple"
              onChange={handlePasswordChange}
              onFocus={() => setShowChecker(true)}
            />

            {/* ✅ Checker muncul saat input password difokus, terupdate tiap keystroke */}
            {showChecker && (
              <div className="mt-3 border-l-4 border-vtuber-cyan bg-gray-50 px-4 py-3 rounded-r-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-black mb-2.5">
                  Kriteria Password:
                </p>
                <ul className="space-y-1.5">
                  {REQUIREMENTS.map((req) => {
                    const passed = pwChecks[req.key]
                    return (
                      <li key={req.key} className="flex items-center gap-2.5 text-xs">
                        <span className={`text-base font-bold leading-none transition-all duration-200 ${passed ? 'text-vtuber-cyan' : 'text-gray-300'}`}>
                          {passed ? '■' : '□'}
                        </span>
                        <span className={`font-semibold transition-colors duration-200 ${passed ? 'text-black' : 'text-gray-400'}`}>
                          {req.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                {allPassed && (
                  <p className="mt-2.5 text-[10px] font-black uppercase tracking-wider text-vtuber-cyan animate-pop-up">
                    ✓ Password Kuat! Siap didaftarkan.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-gradient-to-r from-vtuber-cyan to-vtuber-blue text-white font-black py-4 rounded-2xl mt-8 hover:from-vtuber-pink hover:to-vtuber-purple transition-all shadow-[0_10px_20px_rgba(164,229,250,0.4)] tracking-widest disabled:opacity-50"
        >
          {loading ? 'PROCESSING...' : 'REGISTER ACCOUNT'}
        </button>

        <p className="mt-8 text-vtuber-purple text-[11px] text-center uppercase tracking-widest font-bold">
          Already a member?{' '}
          <Link to="/login" className="text-vtuber-pink font-black hover:underline underline-offset-4">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register