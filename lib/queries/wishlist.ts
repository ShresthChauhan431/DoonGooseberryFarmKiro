import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, products, wishlist } from '@/lib/db/schema';

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: string[];
    category: {
      name: string;
      slug: string;
    } | null;
  };
  createdAt: Date;
}

/**
 * Get all wishlist items for a user
 */
export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  const items = await db
    .select({
      id: wishlist.id,
      productId: wishlist.productId,
      createdAt: wishlist.createdAt,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        stock: products.stock,
        images: products.images,
      },
      category: {
        name: categories.name,
        slug: categories.slug,
      },
    })
    .from(wishlist)
    .innerJoin(products, eq(wishlist.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(wishlist.userId, userId))
    .orderBy(wishlist.createdAt);

  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      stock: item.product.stock,
      images: item.product.images,
      category: item.category,
    },
    createdAt: item.createdAt,
  }));
}
