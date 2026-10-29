'use client';

import React, { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import Navbar from '@/components/Navbar'

const escapeHtml = (str: any) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

interface PwChecks {
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

interface Requirement {
  key: keyof PwChecks;
  label: string;
  test: (p: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  { key: 'hasUpper',   label: 'Huruf Besar (A–Z)',       test: (p: string) => /[A-Z]/.test(p) },
  { key: 'hasLower',   label: 'Huruf Kecil (a–z)',        test: (p: string) => /[a-z]/.test(p) },
  { key: 'hasNumber',  label: 'Angka (0–9)',               test: (p: string) => /[0-9]/.test(p) },
  { key: 'hasSpecial', label: 'Simbol Spesial (!@#$ dll)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

const RegisterForm = () => {
  const searchParams = useSearchParams()
  const rawRedirect =
    searchParams.get('redirect') ||
    searchParams.get('callbackUrl') ||
    searchParams.get('returnTo') ||
    ''
  const redirectTo =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : ''

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [showChecker, setShowChecker] = useState(false)
  const [pwChecks,    setPwChecks]    = useState<PwChecks>({
    hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false,
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })

      if (error) throw error

      Swal.fire({
        title: 'REGISTRASI BERHASIL',
        text: 'Cek email Anda untuk konfirmasi.',
        icon: 'success',
        buttonsStyling: false,
        customClass: {
          popup:         'bg-white border-4 border-black rounded-none p-6 shadow-2xl',
          title:         'font-black italic tracking-wider text-2xl text-black uppercase',
          confirmButton: 'rounded-none bg-black text-white font-bold px-8 py-3 tracking-widest uppercase border-2 border-black mt-4 cursor-pointer',
        }
      })
    } catch (error: any) {
      let errorMsg = error.message
      let customHtml = null

      if (errorMsg.includes('Password should contain at least one character of each')) {
        customHtml = `
          <div class="border-l-4 border-black pl-4 mt-4 bg-gray-50 py-4 text-center">
            <p class="font-black italic uppercase tracking-wider text-base mb-1 text-black">
              Password Terlalu Lemah!
            </p>
            <p class="text-sm mb-3 text-gray-500">
              Wajib mengandung kombinasi berikut:
            </p>
            <ul class="list-none p-0 m-0 inline-block text-left text-sm text-gray-900">
              <li class="mb-2"><span class="text-black mr-2 text-base">■</span><strong class="font-black text-black">HURUF BESAR</strong> (A-Z)</li>
              <li class="mb-2"><span class="text-black mr-2 text-base">■</span><strong class="font-black text-black">HURUF KECIL</strong> (a-z)</li>
              <li class="mb-2"><span class="text-black mr-2 text-base">■</span><strong class="font-black text-black">ANGKA</strong> (0-9)</li>
              <li class="mb-0"><span class="text-black mr-2 text-base">■</span><strong class="font-black text-black">SIMBOL SPESIAL</strong> (!@#$ dll)</li>
            </ul>
          </div>
        `
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'Email ini sudah terdaftar. Silakan login.'
      }

      Swal.fire({
        title: 'REGISTRASI GAGAL',
        html: customHtml || `<div class="text-center text-sm text-black font-semibold mt-2">${escapeHtml(errorMsg)}</div>`,
        icon: 'error',
        buttonsStyling: false,
        customClass: {
          popup:         'bg-white border-4 border-black rounded-none p-6 shadow-2xl',
          title:         'font-black italic tracking-wider text-2xl text-black uppercase',
          htmlContainer: 'text-sm',
          confirmButton: 'rounded-none bg-black text-white font-bold px-8 py-3 tracking-widest uppercase border-2 border-black mt-4 cursor-pointer',
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12">
        <form
          onSubmit={handleRegister}
          className="relative z-10 bg-white dark:bg-black p-8 sm:p-10 border border-black dark:border-white w-full max-w-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        >
          <h2 className="text-3xl font-black mb-1.5 uppercase tracking-tighter text-black dark:text-white">
            JOIN DAEKAN <span className="font-light text-zinc-500 dark:text-zinc-400">INC.</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-[0.25em] mb-8 font-bold">
            Create your daekan account
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="daekan@inc.com"
                required
                autoComplete="email"
                className="w-full p-3.5 bg-white dark:bg-black border border-black dark:border-white focus:outline-none text-xs sm:text-sm font-medium text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="w-full p-3.5 bg-white dark:bg-black border border-black dark:border-white focus:outline-none text-xs sm:text-sm font-medium text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all"
                onChange={handlePasswordChange}
                onFocus={() => setShowChecker(true)}
              />

              {showChecker && (
                <div className="mt-3 border-l-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2">
                    Kriteria Password:
                  </p>
                  <ul className="space-y-1.5">
                    {REQUIREMENTS.map((req) => {
                      const passed = pwChecks[req.key]
                      return (
                        <li key={req.key} className="flex items-center gap-2 text-xs">
                          <span className={`text-sm font-bold leading-none transition-all duration-200 ${passed ? 'text-black dark:text-white' : 'text-zinc-400'}`}>
                            {passed ? '■' : '□'}
                          </span>
                          <span className={`font-semibold transition-colors duration-200 ${passed ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {req.label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  {allPassed && (
                    <p className="mt-2.5 text-[11px] font-black uppercase tracking-wider text-black dark:text-white">
                      ✓ Password Kuat! Siap didaftarkan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white font-black text-xs py-4 mt-8 hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all tracking-[0.25em] uppercase disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'PROCESSING...' : 'REGISTER ACCOUNT'}
          </button>

          <p className="mt-8 text-zinc-600 dark:text-zinc-400 text-[11px] text-center uppercase tracking-[0.2em] font-bold">
            Already a member?{' '}
            <Link
              href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'}
              className="text-black dark:text-white font-black underline underline-offset-4 hover:opacity-70"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

const Register = () => {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}

export default Register
