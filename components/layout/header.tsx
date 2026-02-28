import { Menu } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { CartSheet } from '@/components/cart/cart-sheet';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getSession } from '@/lib/auth/session';
import { calculateCartTotals, getCart, getCartItemCount } from '@/lib/queries/cart';
import { getCategories } from '@/lib/queries/categories';
import { MobileNav } from './mobile-nav';
import { SearchInput } from './search-input';
import { UserMenu } from './user-menu';

/**
 * Header component with navigation, cart sheet, and user menu
 * Uses sticky positioning for scroll behavior
 */
export async function Header() {
  const session = await getSession();
  const categories = await getCategories();

  // Get cart data for cart sheet
  // Note: We use cookies for SSR, client components use localStorage
  // This is intentional - the cart will sync on client hydration
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('cart_session_id')?.value;

  console.log('[Header] Session ID from cookie:', sessionId);
  console.log('[Header] User ID:', session?.user?.id);

  const cart = await getCart(session?.user?.id, sessionId);
  const itemCount = await getCartItemCount(session?.user?.id, sessionId);

  console.log('[Header] Cart items count:', itemCount);
  console.log('[Header] Cart:', cart ? `${cart.items.length} items` : 'null');

  const totals = cart
    ? calculateCartTotals(cart.items)
    : { subtotal: 0, shipping: 0, discount: 0, total: 0 };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">Doon Gooseberry Farm</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/shop"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/blog"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Blog
              </Link>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Search input with keyboard shortcut */}
            <SearchInput />

            {/* Cart sheet */}
            <CartSheet cart={cart} totals={totals} itemCount={itemCount} />

            {/* User menu */}
            <div className="hidden md:flex items-center gap-2">
              {session ? (
                <UserMenu user={session.user} />
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu trigger */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <MobileNav categories={categories} session={session} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
