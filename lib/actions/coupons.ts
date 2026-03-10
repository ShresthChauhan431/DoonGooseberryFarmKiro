'use server';

import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import type { ActionResult } from '@/lib/types';

export type { ActionResult };

export interface ValidatedCoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
}

/**
 * Validate a coupon code
 * Checks if coupon exists, not expired, not exceeded max uses, and meets minimum order value
 */
export async function validateCoupon(
  code: string,
  orderSubtotal: number
): Promise<ActionResult<ValidatedCoupon>> {
  try {
    // Validate user is authenticated
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    // Validate inputs
    if (!code || code.trim() === '') {
      return { success: false, message: 'Please enter a coupon code' };
    }

    if (orderSubtotal <= 0) {
      return { success: false, message: 'Invalid order amount' };
    }

    // Find coupon by code (case-insensitive)
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase()))
      .limit(1);

    // Check if coupon exists
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code' };
    }

    // Check if coupon has expired
    const now = new Date();
    if (coupon.expiresAt < now) {
      return { success: false, message: 'This coupon has expired' };
    }

    // Check if coupon has exceeded max uses
    if (coupon.currentUses >= coupon.maxUses) {
      return {
        success: false,
        message: 'This coupon has reached its usage limit',
      };
    }

    // Check if order meets minimum value
    if (orderSubtotal < coupon.minOrderValue) {
      return {
        success: false,
        message: `Minimum order value of ₹${(coupon.minOrderValue / 100).toFixed(2)} required for this coupon`,
      };
    }

    // Coupon is valid
    const validatedCoupon: ValidatedCoupon = {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
    };

    return {
      success: true,
      data: validatedCoupon,
      message: 'Coupon applied successfully',
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return {
      success: false,
      message: 'Failed to validate coupon. Please try again.',
    };
  }
}

/**
 * Increment coupon usage count
 * Called after successful order creation
 */
export async function incrementCouponUsage(couponCode: string): Promise<void> {
  try {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, couponCode.toUpperCase()))
      .limit(1);

    if (coupon) {
      await db
        .update(coupons)
        .set({
          currentUses: coupon.currentUses + 1,
        })
        .where(eq(coupons.code, couponCode.toUpperCase()));
    }
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    // Don't throw error, just log it
  }
}

/**
 * Create a new coupon (Admin only)
 */
export async function createCoupon(data: {
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  expiresAt: Date;
}): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    // Check if coupon code already exists
    const [existing] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, data.code.toUpperCase()))
      .limit(1);

    if (existing) {
      return { success: false, message: 'Coupon code already exists' };
    }

    await db.insert(coupons).values({
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderValue: data.minOrderValue,
      maxUses: data.maxUses,
      currentUses: 0,
      expiresAt: data.expiresAt,
    });

    return { success: true, message: 'Coupon created successfully' };
  } catch (error) {
    console.error('Error creating coupon:', error);
    return { success: false, message: 'Failed to create coupon' };
  }
}

/**
 * Update an existing coupon (Admin only)
 */
export async function updateCoupon(
  id: string,
  data: {
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    minOrderValue: number;
    maxUses: number;
    expiresAt: Date;
  }
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    await db
      .update(coupons)
      .set({
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt,
      })
      .where(eq(coupons.id, id));

    return { success: true, message: 'Coupon updated successfully' };
  } catch (error) {
    console.error('Error updating coupon:', error);
    return { success: false, message: 'Failed to update coupon' };
  }
}

/**
 * Delete a coupon (Admin only)
 */
export async function deleteCoupon(id: string): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    await db.delete(coupons).where(eq(coupons.id, id));

    return { success: true, message: 'Coupon deleted successfully' };
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return { success: false, message: 'Failed to delete coupon' };
  }
}
