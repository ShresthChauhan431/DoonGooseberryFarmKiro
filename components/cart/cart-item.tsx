'use client';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useOptimistic, useState } from 'react';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { Button } from '@/components/ui/button';
import { removeFromCart, updateCartQuantity } from '@/lib/actions/cart';
import type { CartItem as CartItemType } from '@/lib/utils/cart';
import { formatPrice } from '@/lib/utils/price';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
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
    if (!confirm('Remove this item from your cart?')) {
      return;
    }

    setIsUpdating(true);
    const result = await removeFromCart(item.id);

    if (!result.success) {
      alert(result.message || 'Failed to remove item');
      setIsUpdating(false);
    }
  };

  const itemSubtotal = item.product.price * optimisticQuantity;

  return (
    <div
      className={`flex gap-4 py-4 border-b ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Product Image */}
      <Link
        href={`/shop/${item.product.slug}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border"
      >
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div className="flex-1">
            <Link href={`/shop/${item.product.slug}`} className="font-medium hover:underline">
              {item.product.name}
            </Link>
            {item.product.category && (
              <p className="text-sm text-muted-foreground mt-1">{item.product.category.name}</p>
            )}
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isUpdating}
            aria-label="Remove item"
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Quantity and Price */}
        <div className="flex items-end justify-between mt-2">
          <QuantitySelector
            quantity={optimisticQuantity}
            onQuantityChange={handleQuantityChange}
            max={item.product.stock}
            min={0}
          />

          <div className="text-right">
            <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)} each</p>
            <p className="font-semibold">{formatPrice(itemSubtotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
