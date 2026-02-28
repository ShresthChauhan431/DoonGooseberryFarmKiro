import { CartSessionInit } from '@/components/layout/cart-session-init';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { SkipNav } from '@/components/layout/skip-nav';

/**
 * Public layout wrapper for shop pages
 * Includes header and footer for all public-facing pages
 * Implements accessibility features: skip nav, semantic HTML
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CartSessionInit />
      <SkipNav />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
