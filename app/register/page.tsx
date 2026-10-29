'use client';

import React, { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Navbar from '@/components/Navbar';

const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const INJECTION_PATTERN =
  /(<[^>]*>|javascript:|data:text\/html|vbscript:|on\w+\s*=|(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|DECLARE|TRUNCATE)\b\s+)|(--|\/\*|\*\/|;\s*(DROP|SELECT|INSERT|UPDATE|DELETE))|(['"`]\s*(OR|AND)\s*['"`\d]+=\s*['"`\d]+)|[\x00-\x08\x0B\x0C\x0E-\x1F\x7F])/i;

const sanitizeEmailInput = (value: string) =>
  value.replace(/[\x00-\x1F\x7F<>'"`;\\]/g, '').trim();

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
];

const RegisterForm = () => {
  const searchParams = useSearchParams();
  const rawRedirect =
    searchParams.get('redirect') ||
    searchParams.get('callbackUrl') ||
    searchParams.get('returnTo') ||
    '';
  const redirectTo =
    rawRedirect.startsWith('/') &&
    !rawRedirect.startsWith('//') &&
    !rawRedirect.startsWith('/\\') &&
    !/[\x00-\x1F\x7F<>'"`]/.test(rawRedirect)
      ? rawRedirect
      : '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChecker, setShowChecker] = useState(false);
  const [pwChecks, setPwChecks] = useState<PwChecks>({
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setPwChecks({
      hasUpper:   /[A-Z]/.test(val),
      hasLower:   /[a-z]/.test(val),
      hasNumber:  /[0-9]/.test(val),
      hasSpecial: /[^A-Za-z0-9]/.test(val),
    });
  };

  const allPassed = REQUIREMENTS.every((r) => pwChecks[r.key]);

  const handleRegister = async (e: React.FormEvent) => {
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
        text: 'Masukkan alamat email yang benar (contoh: daekan@inc.com).',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    if (password.length < 8 || !allPassed) {
      Swal.fire({
        title: 'PASSWORD TERLALU LEMAH',
        text: 'Password minimal 8 karakter dan wajib mengandung Huruf Besar (A-Z), Huruf Kecil (a-z), Angka (0-9), serta Simbol Spesial (!@#$ dll).',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      Swal.fire({
        title: 'REGISTRASI BERHASIL',
        text: 'Cek email Anda untuk konfirmasi akun.',
        icon: 'success',
        confirmButtonColor: '#000000',
      });
    } catch (error: any) {
      let errorMsg = 'Terjadi kesalahan saat mendaftarkan akun.';
      const rawMessage = String(error?.message || '');

      if (rawMessage.includes('Password should contain at least one character of each')) {
        errorMsg =
          'Password wajib mengandung kombinasi Huruf Besar (A-Z), Huruf Kecil (a-z), Angka (0-9), dan Simbol Spesial (!@#$ dll).';
      } else if (rawMessage.includes('User already registered')) {
        errorMsg = 'Email ini sudah terdaftar. Silakan login.';
      } else if (rawMessage.includes('Password should be at least')) {
        errorMsg = 'Ukuran password terlalu pendek. Gunakan minimal 8 karakter.';
      } else if (rawMessage.includes('Unable to validate email address')) {
        errorMsg = 'Format alamat email tidak dapat divalidasi.';
      } else if (rawMessage) {
        errorMsg = rawMessage;
      }

      Swal.fire({
        title: 'REGISTRASI GAGAL',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#000000',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12">
        <form
          onSubmit={handleRegister}
          noValidate
          autoComplete="on"
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
              <label
                htmlFor="register-email"
                className="block text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2"
              >
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                value={email}
                maxLength={254}
                placeholder="daekan@inc.com"
                required
                autoComplete="email"
                inputMode="email"
                className="w-full p-3.5 bg-white dark:bg-black border border-black dark:border-white focus:outline-none text-xs sm:text-sm font-medium text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  maxLength={128}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full p-3.5 pr-11 bg-white dark:bg-black border border-black dark:border-white focus:outline-none text-xs sm:text-sm font-medium text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all"
                  onChange={handlePasswordChange}
                  onFocus={() => setShowChecker(true)}
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

              {showChecker && (
                <div className="mt-3 border-l-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2">
                    Kriteria Password:
                  </p>
                  <ul className="space-y-1.5">
                    {REQUIREMENTS.map((req) => {
                      const passed = pwChecks[req.key];
                      return (
                        <li key={req.key} className="flex items-center gap-2 text-xs">
                          <span
                            className={`text-sm font-bold leading-none transition-all duration-200 ${
                              passed ? 'text-black dark:text-white' : 'text-zinc-400'
                            }`}
                          >
                            {passed ? '■' : '□'}
                          </span>
                          <span
                            className={`font-semibold transition-colors duration-200 ${
                              passed ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
                            }`}
                          >
                            {req.label}
                          </span>
                        </li>
                      );
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
            type="submit"
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
  );
};

const Register = () => {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
};

export default Register;
