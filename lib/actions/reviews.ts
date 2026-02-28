'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { orderItems, orders, products, reviews } from '@/lib/db/schema';

import { formatValidationErrors } from '@/lib/utils/validation';

// Validation schema for review submission
const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(500),
});

type ActionResult = {
  success: boolean;
  message: string;
  reviewId?: string;
};

/**
 * Submit a product review
 * Validates user authentication, verified purchase, and review data
 * Creates new review or updates existing review
 */
export async function submitReview(
  productId: string,
  rating: number,
  comment: string
): Promise<ActionResult> {
  try {
    // Validate user is authenticated
    const session = await getSession();
    if (!session?.user) {
      return {
        success: false,
        message: 'You must be logged in to submit a review',
      };
    }

    const userId = session.user.id;

    // Validate input data
    const validation = reviewSchema.safeParse({ productId, rating, comment });
    if (!validation.success) {
      return {
        success: false,
        message: formatValidationErrors(validation.error)[0],
      };
    }

    // Check if user has verified purchase (ordered this product)
    const verifiedPurchase = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orderItems.productId, productId),
          eq(orders.status, 'DELIVERED')
        )
      )
      .limit(1);

    if (verifiedPurchase.length === 0) {
      return {
        success: false,
        message: 'You must purchase this product before reviewing it',
      };
    }

    // Check if review already exists
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)))
      .limit(1);

    let reviewId: string;

    if (existingReview.length > 0) {
      // Update existing review
      await db
        .update(reviews)
        .set({
          rating,
          comment,
        })
        .where(eq(reviews.id, existingReview[0].id));

      reviewId = existingReview[0].id;
    } else {
      // Create new review
      const [newReview] = await db
        .insert(reviews)
        .values({
          productId,
          userId,
          rating,
          comment,
        })
        .returning({ id: reviews.id });

      reviewId = newReview.id;
    }

    // Get product slug for revalidation
    const [product] = await db
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product) {
      revalidatePath(`/shop/${product.slug}`);
    }

    return {
      success: true,
      message:
        existingReview.length > 0 ? 'Review updated successfully' : 'Review submitted successfully',
      reviewId,
    };
  } catch (error) {
    console.error('Error submitting review:', error);
    return {
      success: false,
      message: 'Failed to submit review. Please try again.',
    };
  }
}
