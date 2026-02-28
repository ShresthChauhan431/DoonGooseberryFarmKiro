import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getSession } from '@/lib/auth/session';
import { getCartItemCount } from '@/lib/queries/cart';

/**
 * Cart badge component that displays cart item count
 * Queries database to get current cart count
 */
export async function CartBadge() {
  const session = await getSession();
  const userId = session?.user?.id;

  // For guest users, we'll need to handle session-based carts
  // For now, we'll show 0 for guests until cart actions are implemented
  const count = userId ? await getCartItemCount(userId) : 0;

  return (
    <Link href="/cart" className="relative" aria-label={`Shopping cart with ${count} items`}>
      <ShoppingCart className="h-6 w-6" aria-hidden="true" />
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          aria-label={`${count} items in cart`}
        >
          {count}
        </Badge>
      )}
      {count === 0 && (
        <Badge
          variant="secondary"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          aria-label="Cart is empty"
        >
          0
        </Badge>
      )}
    </Link>
  );
}
