import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cartItems, carts, categories, products } from '@/lib/db/schema';

// Re-export types and pure functions from shared module
export type {
  CartItem,
  CartTotals,
  CartWithItems,
  Coupon,
} from '@/lib/utils/cart';
export { calculateCartTotals } from '@/lib/utils/cart';

import type { CartWithItems } from '@/lib/utils/cart';

/**
 * Get cart item count for a user or session
 * Returns 0 if no cart exists
 */
export async function getCartItemCount(userId?: string, sessionId?: string): Promise<number> {
  if (!userId && !sessionId) {
    return 0;
  }

  const cart = await db
    .select({ id: carts.id })
    .from(carts)
    .where(userId ? eq(carts.userId, userId) : eq(carts.sessionId, sessionId as string))
    .limit(1);

  if (!cart.length) {
    return 0;
  }

  const result = await db
    .select({ count: sql<number>`cast(sum(${cartItems.quantity}) as int)` })
    .from(cartItems)
    .where(eq(cartItems.cartId, cart[0].id));

  const count = result[0]?.count || 0;

  return count;
}

/**
 * Get cart with items and product details
 * Returns null if no cart exists
 */
export async function getCart(userId?: string, sessionId?: string): Promise<CartWithItems | null> {
  if (!userId && !sessionId) {
    return null;
  }

  // Query cart by userId or sessionId
  const cartResult = await db
    .select()
    .from(carts)
    .where(userId ? eq(carts.userId, userId) : eq(carts.sessionId, sessionId as string))
    .limit(1);

  if (!cartResult.length) {
    return null;
  }

  const cart = cartResult[0];

  // Query cart items with product details
  const items = await db
    .select({
      id: cartItems.id,
      cartId: cartItems.cartId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        stock: products.stock,
        images: products.images,
      },
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(cartItems.cartId, cart.id));

  // Transform the result to match CartWithItems structure
  const cartWithItems: CartWithItems = {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    createdAt: cart.createdAt,
    items: items
      .filter((item) => item.product !== null)
      .map((item) => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product?.id as string,
          name: item.product?.name as string,
          slug: item.product?.slug as string,
          price: item.product?.price as number,
          stock: item.product?.stock as number,
          images: item.product?.images as string[],
          category: item.category,
        },
      })),
  };

  return cartWithItems;
}
