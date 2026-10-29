'use client';

import React, { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Navbar from '@/components/Navbar';

const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const INJECTION_PATTERN =
  /(<[^>]*>|javascript:|data:text\/html|vbscript:|on\w+\s*=|(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|DECLARE|TRUNCATE)\b\s+)|(--|\/\*|\*\/|;\s*(DROP|SELECT|INSERT|UPDATE|DELETE))|(['"`]\s*(OR|AND)\s*['"`\d]+=\s*['"`\d]+)|[\x00-\x08\x0B\x0C\x0E-\x1F\x7F])/i;

const sanitizeEmailInput = (value: string) =>
  value.replace(/[\x00-\x1F\x7F<>'"`;\\]/g, '').trim();

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawRedirect =
    searchParams.get('redirect') ||
    searchParams.get('callbackUrl') ||
    searchParams.get('returnTo') ||
    '/';
  const redirectTo =
    rawRedirect.startsWith('/') &&
    !rawRedirect.startsWith('//') &&
    !rawRedirect.startsWith('/\\') &&
    !/[\x00-\x1F\x7F<>'"`]/.test(rawRedirect)
      ? rawRedirect
      : '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const cleanEmail = sanitizeEmailInput(email).toLowerCase();

    if (!cleanEmail || !password) {
      Swal.fire({
        title: 'INPUT TIDAK LENGKAP',
        text: 'Mohon isi alamat email dan password Anda.',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    if (
      cleanEmail.length > 254 ||
      password.length > 128 ||
      INJECTION_PATTERN.test(email) ||
      INJECTION_PATTERN.test(password)
    ) {
      Swal.fire({
        title: 'INPUT TIDAK VALID',
        text: 'Terdeteksi karakter atau pola input yang tidak diizinkan demi keamanan.',
        icon: 'error',
        confirmButtonColor: '#000000',
      });
      return;
    }

    if (!STRICT_EMAIL_REGEX.test(cleanEmail)) {
      Swal.fire({
        title: 'FORMAT EMAIL TIDAK VALID',
        text: 'Masukkan alamat email yang benar (contoh: name@daekan.inc).',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        let message = 'Terjadi kesalahan sistem.';
        if (error.message.includes('Invalid login credentials')) {
          message = 'Email atau password tidak valid.';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Silakan verifikasi email Anda terlebih dahulu.';
        } else if (error.message.includes('Too many requests')) {
          message = 'Terlalu banyak percobaan login. Silakan coba beberapa saat lagi.';
        }
        Swal.fire({
          title: 'AUTENTIKASI GAGAL',
          text: message,
          icon: 'error',
          confirmButtonColor: '#000000',
        });
        return;
      }

      if (data.user && data.user.confirmed_at === null) {
        Swal.fire({
          title: 'AKSES DITANGGUHKAN',
          text: 'Silakan verifikasi email Anda.',
          icon: 'warning',
          confirmButtonColor: '#000000',
        });
        await supabase.auth.signOut();
        return;
      }

      if (data.session) {
        Swal.fire({
          title: 'WELCOME!',
          text: 'Login berhasil!',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false,
        });
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12">
        <form
          onSubmit={handleLogin}
          noValidate
          autoComplete="on"
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
              <label
                htmlFor="login-email"
                className="block text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={email}
                maxLength={254}
                autoComplete="email"
                inputMode="email"
                placeholder="name@daekan.inc"
                className="w-full p-3.5 bg-white dark:bg-black border border-black dark:border-white focus:outline-none text-xs sm:text-sm font-medium text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  maxLength={128}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full p-3.5 pr-11 bg-white dark:bg-black border border-black dark:border-white focus:outline-none text-xs sm:text-sm font-medium text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white font-black text-xs py-4 mt-8 hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all tracking-[0.25em] uppercase disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'PROCESSING...' : 'LOG IN'}
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
  );
};

const Login = () => {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
};

export default Login;
