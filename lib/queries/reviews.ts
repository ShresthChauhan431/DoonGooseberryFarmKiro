import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { reviews, users } from '@/lib/db/schema';

/**
 * Get reviews for a product with user information
 */
export async function getProductReviews(productId: string) {
  return await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      user: {
        id: users.id,
        name: users.name,
      },
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

/**
 * Get review statistics for a product
 */
export async function getProductReviewStats(productId: string) {
  const result = await db
    .select({
      averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      totalReviews: sql<number>`COUNT(*)`,
      rating5: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 5 THEN 1 END)`,
      rating4: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 4 THEN 1 END)`,
      rating3: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 3 THEN 1 END)`,
      rating2: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 2 THEN 1 END)`,
      rating1: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 1 THEN 1 END)`,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId));

  const stats = result[0] || {
    averageRating: 0,
    totalReviews: 0,
    rating5: 0,
    rating4: 0,
    rating3: 0,
    rating2: 0,
    rating1: 0,
  };

  // Ensure all values are numbers (SQL aggregates may return strings)
  return {
    averageRating: Number(stats.averageRating) || 0,
    totalReviews: Number(stats.totalReviews) || 0,
    rating5: Number(stats.rating5) || 0,
    rating4: Number(stats.rating4) || 0,
    rating3: Number(stats.rating3) || 0,
    rating2: Number(stats.rating2) || 0,
    rating1: Number(stats.rating1) || 0,
  };
}

/**
 * Check if user has purchased a product (verified purchase)
 */
export async function hasVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ${userId}
        AND oi.product_id = ${productId}
        AND o.status IN ('DELIVERED', 'SHIPPED', 'PROCESSING')
    ) as has_purchase
  `);

  return (result[0] as any)?.has_purchase || false;
}

/**
 * Check if user has already reviewed a product
 */
export async function hasUserReviewed(userId: string, productId: string): Promise<boolean> {
  const result = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(sql`${reviews.userId} = ${userId} AND ${reviews.productId} = ${productId}`)
    .limit(1);

  return result.length > 0;
}
