import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { SlideCart } from '@/components/store/SlideCart';

export const metadata: Metadata = {
  title: "Hasti Creation | Premium Ethnic & Fashion Store",
  description: 'High-performance e-commerce store built with Next.js App Router, Tailwind CSS, and Firebase Real-time Firestore.',
  keywords: ['e-commerce', 'next.js', 'tailwind', 'firebase', 'hasti creation', 'ethnic wear', 'fashion'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <ToastProvider />
          <Header />
          <SlideCart />
          
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {children}
          </main>

          <Footer />
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
