import { ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth/session';
import { calculateCartTotals, getCart } from '@/lib/queries/cart';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shopping Cart | Doon Gooseberry Farm',
  description: 'Review your cart and proceed to checkout',
};

export default async function CartPage() {
  // Get user session or session ID
  const session = await getSession();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  // Get cart data
  const cart = await getCart(session?.user?.id, sessionId);

  // If cart is empty or doesn't exist
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totals = calculateCartTotals(cart.items);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Cart Items ({cart.items.length})</h2>

            <div className="divide-y">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Continue Shopping Link */}
            <div className="mt-6 pt-6 border-t">
              <Button variant="outline" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <CartSummary totals={totals} showCheckoutButton={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
