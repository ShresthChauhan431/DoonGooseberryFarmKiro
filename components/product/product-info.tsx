'use client';

import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addToCart } from '@/lib/actions/cart';
import { formatPrice } from '@/lib/utils/price';
import { QuantitySelector } from './quantity-selector';
import { WishlistButton } from './wishlist-button';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: {
    name: string;
    slug: string;
  } | null;
}

interface ProductInfoProps {
  product: Product;
  isInWishlist?: boolean;
  userId?: string; // Add userId prop
}

export function ProductInfo({ product, isInWishlist = false, userId }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  const handleAddToCart = async () => {
    setIsLoading(true);

    try {
      // Get session ID (only used if not logged in)
      const sessionId = userId ? undefined : getSessionId();

      console.log('Adding to cart:', { productId: product.id, quantity, userId, sessionId });

      const result = await addToCart(product.id, quantity, userId, sessionId);

      console.log('Add to cart result:', result);

      if (result.success) {
        toast({
          title: 'Added to cart',
          description: `${quantity} × ${product.name} added to your cart`,
        });
        router.refresh();
      } else {
        console.error('Failed to add to cart:', result.message);
        toast({
          title: 'Error',
          description: result.message || 'Failed to add to cart',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Exception adding to cart:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Badge */}
      {product.category && (
        <Badge variant="outline" className="text-sm">
          {product.category.name}
        </Badge>
      )}

      {/* Product Name and Wishlist */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold flex-1">{product.name}</h1>
        <WishlistButton productId={product.id} initialIsInWishlist={isInWishlist} />
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
      </div>

      {/* Stock Status */}
      <div>
        {isOutOfStock && (
          <Badge variant="destructive" className="text-sm">
            Out of Stock
          </Badge>
        )}
        {isLowStock && (
          <Badge variant="secondary" className="text-sm bg-yellow-500 text-white">
            Only {product.stock} left in stock
          </Badge>
        )}
        {!isOutOfStock && !isLowStock && (
          <Badge variant="secondary" className="text-sm bg-green-500 text-white">
            In Stock
          </Badge>
        )}
      </div>

      {/* Description */}
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
      </div>

      {/* Quantity Selector and Add to Cart */}
      {!isOutOfStock && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Quantity:</span>
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              max={product.stock}
              min={1}
            />
          </div>

          <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isLoading}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      )}

      {isOutOfStock && (
        <div className="pt-4 border-t">
          <Button size="lg" className="w-full" disabled>
            Out of Stock
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to get or create session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  // Check cookie first (for consistency with server)
  const cookieMatch = document.cookie.match(/cart_session_id=([^;]+)/);
  if (cookieMatch) {
    console.log('Found existing session ID in cookie:', cookieMatch[1]);
    return cookieMatch[1];
  }

  // Check localStorage as fallback
  let sessionId = localStorage.getItem('cart_session_id');
  if (sessionId) {
    console.log('Found existing session ID in localStorage:', sessionId);
    // Sync to cookie
    document.cookie = `cart_session_id=${sessionId}; path=/; max-age=2592000`; // 30 days
    return sessionId;
  }

  // Create new session ID
  sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log('Created new session ID:', sessionId);

  // Store in both localStorage and cookie
  localStorage.setItem('cart_session_id', sessionId);
  document.cookie = `cart_session_id=${sessionId}; path=/; max-age=2592000`; // 30 days

  return sessionId;
}
