'use client';

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReviewSection from '@/components/ReviewSection'
import { supabase } from '@/lib/supabaseClient'

export default function ReviewsPage() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="flex-1">
        <ReviewSection session={session} />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}
