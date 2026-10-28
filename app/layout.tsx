import "./globals.css";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/lib/ThemeContext';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DAEKAN INC.',
  description: 'Daekan Inc Official Store',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased bg-white text-black dark:bg-black dark:text-white min-h-screen selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
