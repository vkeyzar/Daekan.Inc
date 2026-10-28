import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Gerbang server-side untuk semua route /admin/*.
// Sesi Supabase dibaca dari cookie (diset oleh createBrowserClient di lib/supabaseClient.ts).

function redirectToLogin(request: NextRequest, response: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('returnTo', request.nextUrl.pathname);
  const redirect = NextResponse.redirect(url);
  // Teruskan cookie hasil refresh token (jika ada)
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() memvalidasi token ke Supabase Auth (bukan sekadar decode cookie)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return redirectToLogin(request, response);

  // Cek role di tabel profiles (query memakai token user sehingga tunduk pada RLS)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') return redirectToLogin(request, response);

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};

