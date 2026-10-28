import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// createBrowserClient menyimpan sesi di cookie (bukan localStorage),
// sehingga middleware.ts bisa memverifikasi sesi di sisi server.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
