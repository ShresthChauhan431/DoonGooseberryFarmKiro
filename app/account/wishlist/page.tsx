import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { WishlistButton } from '@/components/product/wishlist-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/session';
import { getUserWishlist } from '@/lib/queries/wishlist';
import { getProductImageBlurDataURL } from '@/lib/utils/image';
import { formatPrice } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WishlistPage() {
  const session = await requireAuth();
  const wishlistItems = await getUserWishlist(session.user.id);

  if (wishlistItems.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Wishlist</h2>
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Save items you love to your wishlist and come back to them later.
            </p>
            <Button asChild>
              <Link href="/shop">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Wishlist</h2>
        <p className="text-muted-foreground">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => {
          const isOutOfStock = item.product.stock === 0;
          const isLowStock = item.product.stock > 0 && item.product.stock < 10;

          return (
            <Card key={item.id} className="overflow-hidden">
              <Link href={`/shop/${item.product.slug}`}>
                <div className="relative aspect-square">
                  <Image
                    src={item.product.images[0] || '/placeholder.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL={getProductImageBlurDataURL()}
                  />

                  {/* Remove from wishlist button */}
                  <div className="absolute top-2 left-2 z-10">
                    <WishlistButton
                      productId={item.productId}
                      initialIsInWishlist={true}
                      isAuthenticated={true}
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
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 bg-yellow-500 text-white"
                    >
                      Low Stock
                    </Badge>
                  )}
                </div>
              </Link>

              <CardContent className="p-4 space-y-3">
                <Link href={`/shop/${item.product.slug}`}>
                  {/* Category badge */}
                  {item.product.category && (
                    <Badge variant="outline" className="mb-2">
                      {item.product.category.name}
                    </Badge>
                  )}

                  {/* Product name */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary">
                    {item.product.name}
                  </h3>

                  {/* Price */}
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(item.product.price)}
                  </p>
                </Link>

                {/* Add to Cart button */}
                <Button className="w-full" disabled={isOutOfStock} asChild={!isOutOfStock}>
                  {isOutOfStock ? (
                    <span>Out of Stock</span>
                  ) : (
                    <Link href={`/shop/${item.product.slug}`}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
