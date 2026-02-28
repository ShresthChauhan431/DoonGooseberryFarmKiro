'use client';

import { ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useOptimistic, useState } from 'react';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { removeFromCart, updateCartQuantity } from '@/lib/actions/cart';
import type { CartTotals, CartWithItems } from '@/lib/utils/cart';
import { formatPrice } from '@/lib/utils/price';

interface CartSheetProps {
  cart: CartWithItems | null;
  totals: CartTotals;
  itemCount: number;
}

export function CartSheet({ cart, totals, itemCount }: CartSheetProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative" aria-label="Open cart">
          <ShoppingBag className="h-6 w-6" />
          {mounted && (
            <>
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  suppressHydrationWarning
                >
                  {itemCount}
                </Badge>
              )}
              {itemCount === 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  suppressHydrationWarning
                >
                  0
                </Badge>
              )}
            </>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>

        {/* Cart Content */}
        {!cart || cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">Add items to get started</p>
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartSheetItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Cart Summary - Fixed at bottom */}
            <div className="border-t pt-4 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm">
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
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(50000 - totals.subtotal)} more for free shipping
                </p>
              )}

              {/* Total */}
              <div className="flex justify-between text-base font-semibold border-t pt-4">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout" onClick={() => setOpen(false)}>
                    Checkout
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                  <Link href="/cart">View Full Cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

interface CartSheetItemProps {
  item: {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      stock: number;
      images: string[];
      category: {
        id: string;
        name: string;
        slug: string;
      } | null;
    };
  };
}

function CartSheetItem({ item }: CartSheetItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(item.quantity);

  const handleQuantityChange = async (newQuantity: number) => {
    setIsUpdating(true);
    setOptimisticQuantity(newQuantity);

    const result = await updateCartQuantity(item.id, newQuantity);

    if (!result.success) {
      // Revert optimistic update on error
      setOptimisticQuantity(item.quantity);
      alert(result.message || 'Failed to update quantity');
    }

    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    const result = await removeFromCart(item.id);

    if (!result.success) {
      alert(result.message || 'Failed to remove item');
      setIsUpdating(false);
    }
  };

  const itemSubtotal = item.product.price * optimisticQuantity;

  return (
    <div className={`flex gap-3 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Product Image */}
      <Link
        href={`/shop/${item.product.slug}`}
        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border"
      >
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between gap-2">
          <Link
            href={`/shop/${item.product.slug}`}
            className="text-sm font-medium hover:underline line-clamp-2"
          >
            {item.product.name}
          </Link>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isUpdating}
            aria-label="Remove item"
            className="h-6 w-6 flex-shrink-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Price */}
        <p className="text-sm font-semibold">{formatPrice(itemSubtotal)}</p>

        {/* Quantity Selector */}
        <div className="mt-1 scale-75 origin-left">
          <QuantitySelector
            quantity={optimisticQuantity}
            onQuantityChange={handleQuantityChange}
            max={item.product.stock}
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
