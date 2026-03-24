import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AccountMobileNav } from '@/components/account/mobile-nav';
import { WishlistButton } from '@/components/product/wishlist-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/session';
import { getUserWishlist } from '@/lib/queries/wishlist';
import { getProductImageBlurDataURL } from '@/lib/utils/image';
import { formatPrice } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const session = await requireAuth();
  const wishlistItems = await getUserWishlist(session.user.id);

  return (
    <div>
      <AccountMobileNav />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Wishlist
            </CardTitle>
            {wishlistItems.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6">
                Save items you love to your wishlist and come back to them later.
              </p>
              <Button asChild>
                <Link href="/shop">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => {
                const isOutOfStock = item.product.stock === 0;
                const isLowStock = item.product.stock > 0 && item.product.stock < 10;

                return (
                  <div
                    key={item.id}
                    className="group border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200"
                  >
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

                        <div className="absolute top-3 left-3 z-10">
                          <WishlistButton
                            productId={item.productId}
                            initialIsInWishlist={true}
                            isAuthenticated={true}
                            className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
                          />
                        </div>

                        {isOutOfStock && (
                          <Badge variant="destructive" className="absolute top-3 right-3">
                            Out of Stock
                          </Badge>
                        )}
                        {isLowStock && !isOutOfStock && (
                          <Badge
                            variant="secondary"
                            className="absolute top-3 right-3 bg-yellow-500 text-white"
                          >
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </Link>

                    <CardContent className="p-4 space-y-3">
                      <Link href={`/shop/${item.product.slug}`}>
                        {item.product.category && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {item.product.category.name}
                          </Badge>
                        )}

                        <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {item.product.name}
                        </h3>

                        <p className="text-xl font-bold text-primary">
                          {formatPrice(item.product.price)}
                        </p>
                      </Link>

                      <Button className="w-full" disabled={isOutOfStock} asChild={!isOutOfStock}>
                        {isOutOfStock ? (
                          <span className="cursor-not-allowed">Out of Stock</span>
                        ) : (
                          <Link href={`/shop/${item.product.slug}`}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                          </Link>
                        )}
                      </Button>
                    </CardContent>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
