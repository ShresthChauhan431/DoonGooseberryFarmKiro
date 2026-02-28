import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { CartTotals } from '@/lib/queries/cart';
import { formatPrice } from '@/lib/utils/price';

interface CartSummaryProps {
  totals: CartTotals;
  showCheckoutButton?: boolean;
}

export function CartSummary({ totals, showCheckoutButton = true }: CartSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(totals.subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {totals.shipping === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              formatPrice(totals.shipping)
            )}
          </span>
        </div>

        {/* Free shipping message */}
        {totals.subtotal < 50000 && (
          <p className="text-sm text-muted-foreground">
            Add {formatPrice(50000 - totals.subtotal)} more for free shipping
          </p>
        )}

        {/* Discount (if applicable) */}
        {totals.discount > 0 && (
          <div className="flex justify-between text-base text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(totals.discount)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(totals.total)}</span>
          </div>
        </div>
      </CardContent>

      {showCheckoutButton && (
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href="/checkout">Continue to Checkout</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
