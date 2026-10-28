import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Memvalidasi apakah request ke endpoint email diizinkan:
 * 1. Menggunakan header `Authorization: Bearer SECRET_KEY` (untuk pemanggilan server/worker QStash), ATAU
 * 2. Menggunakan sesi cookie Supabase milik user dengan `role === 'admin'` (untuk aksi dari Admin Dashboard).
 */
export async function isAuthorizedEmailRequest(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  const secretKey = process.env.SECRET_KEY || process.env.INTERNAL_SECRET_KEY;

  if (secretKey && authHeader === `Bearer ${secretKey}`) {
    return true;
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    return profile?.role === 'admin';
  } catch {
    return false;
  }
}

