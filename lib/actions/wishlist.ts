'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { wishlist } from '@/lib/db/schema';

type ActionResult = {
  success: boolean;
  message: string;
  state?: 'added' | 'removed';
};

/**
 * Toggle product in wishlist
 * Adds product if not in wishlist, removes if already in wishlist
 */
export async function toggleWishlist(productId: string): Promise<ActionResult> {
  try {
    // Validate user is authenticated
    const session = await getSession();
    if (!session?.user) {
      return {
        success: false,
        message: 'You must be logged in to use the wishlist',
      };
    }

    const userId = session.user.id;

    // Check if product is already in wishlist
    const existingItem = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
      .limit(1);

    if (existingItem.length > 0) {
      // Remove from wishlist
      await db.delete(wishlist).where(eq(wishlist.id, existingItem[0].id));

      revalidatePath('/account/wishlist');

      return {
        success: true,
        message: 'Removed from wishlist',
        state: 'removed',
      };
    } else {
      // Add to wishlist
      await db.insert(wishlist).values({
        userId,
        productId,
      });

      revalidatePath('/account/wishlist');

      return {
        success: true,
        message: 'Added to wishlist',
        state: 'added',
      };
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return {
      success: false,
      message: 'Failed to update wishlist. Please try again.',
    };
  }
}

/**
 * Check if product is in user's wishlist
 */
export async function isInWishlist(productId: string): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return false;
    }

    const userId = session.user.id;

    const item = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
      .limit(1);

    return item.length > 0;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

/**
 * Merge guest wishlist (from localStorage) with user wishlist on login
 * Avoids duplicate entries
 */
export async function mergeGuestWishlist(guestProductIds: string[]): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return {
        success: false,
        message: 'You must be logged in to merge wishlist',
      };
    }

    const userId = session.user.id;

    // Get existing wishlist items
    const existingItems = await db
      .select({ productId: wishlist.productId })
      .from(wishlist)
      .where(eq(wishlist.userId, userId));

    const existingProductIds = new Set(existingItems.map((item) => item.productId));

    // Filter out products that are already in the wishlist
    const newProductIds = guestProductIds.filter((id) => !existingProductIds.has(id));

    // Insert new items
    if (newProductIds.length > 0) {
      await db.insert(wishlist).values(
        newProductIds.map((productId) => ({
          userId,
          productId,
        }))
      );
    }

    revalidatePath('/account/wishlist');

    return {
      success: true,
      message: `Merged ${newProductIds.length} items to your wishlist`,
    };
  } catch (error) {
    console.error('Error merging guest wishlist:', error);
    return {
      success: false,
      message: 'Failed to merge wishlist. Please try again.',
    };
  }
}
