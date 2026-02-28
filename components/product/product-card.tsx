'use client';

import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addToCart } from '@/lib/actions/cart';
import { getProductImageBlurDataURL } from '@/lib/utils/image';
import { formatPrice } from '@/lib/utils/price';
import { WishlistButton } from './wishlist-button';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface ProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  userId?: string; // Add userId prop
}

export function ProductCard({ product, isInWishlist = false, userId }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();

    setIsLoading(true);

    try {
      // Get session ID (only used if not logged in)
      const sessionId = userId ? undefined : getSessionId();

      const result = await addToCart(
        product.id,
        1, // Default quantity of 1 from product card
        userId,
        sessionId
      );

      if (result.success) {
        toast({
          title: 'Added to cart',
          description: `${product.name} added to your cart`,
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to add to cart',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/shop/${product.slug}`}>
        <div className="relative aspect-square">
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={getProductImageBlurDataURL()}
          />

          {/* Wishlist button */}
          <div className="absolute top-2 left-2 z-10">
            <WishlistButton
              productId={product.id}
              initialIsInWishlist={isInWishlist}
              className="bg-white shadow-md"
            />
          </div>

          {/* Stock badges */}
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}
          {isLowStock && (
            <Badge variant="secondary" className="absolute top-2 right-2 bg-yellow-500 text-white">
              Low Stock
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/shop/${product.slug}`}>
          {/* Category badge */}
          {product.category && (
            <Badge variant="outline" className="mb-2">
              {product.category.name}
            </Badge>
          )}

          {/* Product name */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary">
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" disabled={isOutOfStock || isLoading} onClick={handleAddToCart}>
          {isLoading ? (
            <>Adding...</>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to get session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  // Check cookie first
  const cookieMatch = document.cookie.match(/cart_session_id=([^;]+)/);
  if (cookieMatch) {
    return cookieMatch[1];
  }

  // Check localStorage
  let sessionId = localStorage.getItem('cart_session_id');
  if (sessionId) {
    return sessionId;
  }

  // This shouldn't happen as CartSessionInit should have created it
  // But create one as fallback
  sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('cart_session_id', sessionId);
  document.cookie = `cart_session_id=${sessionId}; path=/; max-age=2592000`;

  return sessionId;
}
