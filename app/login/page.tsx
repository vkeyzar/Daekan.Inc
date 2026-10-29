'use client';

import React, { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import Navbar from '@/components/Navbar'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawRedirect =
    searchParams.get('redirect') ||
    searchParams.get('callbackUrl') ||
    searchParams.get('returnTo') ||
    '/'
  const redirectTo =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let message = "Terjadi kesalahan sistem.";
      if (error.message.includes("Invalid login credentials")) message = "Email atau password tidak valid.";
      Swal.fire({ title: 'AUTENTIKASI GAGAL', text: message, icon: 'error', confirmButtonColor: '#000000' });
      return;
    }

    if (data.user && data.user.confirmed_at === null) {
      Swal.fire({ title: 'AKSES DITANGGUHKAN', text: 'Silakan verifikasi email Anda.', icon: 'warning', confirmButtonColor: '#000000' });
      await supabase.auth.signOut();
      return;
    }

    if (data.session) {
      Swal.fire({ title: 'WELCOME!', text: 'Login berhasil!', icon: 'success', timer: 1200, showConfirmButton: false });
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12">
        <form
          onSubmit={handleLogin}
          className="relative z-10 bg-white dark:bg-black p-8 sm:p-10 border border-black dark:border-white w-full max-w-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        >
          <h2 className="text-3xl font-black mb-1.5 uppercase tracking-tighter text-black dark:text-white">
            DAEKAN <span className="font-light text-zinc-500 dark:text-zinc-400">LOGIN</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-[0.25em] mb-6 font-bold">
            Access your icon dashboard
          </p>

          {redirectTo !== '/' && (
            <div className="mb-6 border-l-4 border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
              Silakan masuk terlebih dahulu untuk melanjutkan ke halaman tujuan.
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@daekan.inc"
                className="w-full p-3.5 bg-white dark:bg-black border border-black dark:border-white focus:outline-none text-xs sm:text-sm font-medium text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3.5 bg-white dark:bg-black border border-black dark:border-white focus:outline-none text-xs sm:text-sm font-medium text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white font-black text-xs py-4 mt-8 hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all tracking-[0.25em] uppercase cursor-pointer"
          >
            LOG IN
          </button>

          <p className="mt-8 text-zinc-600 dark:text-zinc-400 text-[11px] text-center uppercase tracking-[0.2em] font-bold">
            Belum punya akun?{' '}
            <Link
              href={redirectTo !== '/' ? `/register?redirect=${encodeURIComponent(redirectTo)}` : '/register'}
              className="text-black dark:text-white font-black underline underline-offset-4 hover:opacity-70"
            >
              Daftar di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

const Login = () => {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

export default Login
