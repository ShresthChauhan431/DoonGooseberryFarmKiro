'use server';

import { and, eq, gt } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { checkoutSessions } from '@/lib/db/schema';
import type { ActionResult } from '@/lib/types';

/** Shape of the address stored in a checkout session */
export interface CheckoutAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

/** Shape of the coupon stored in a checkout session */
export interface CheckoutCoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
}

/** Default session TTL: 2 hours */
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

/**
 * Save (upsert) the checkout address for the current user.
 * Creates a new checkout session row if none exists, otherwise updates it.
 */
export async function saveCheckoutAddress(address: CheckoutAddress): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    const userId = session.user.id;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

    // Look for an existing non-expired checkout session for this user
    const [existing] = await db
      .select({ id: checkoutSessions.id })
      .from(checkoutSessions)
      .where(and(eq(checkoutSessions.userId, userId), gt(checkoutSessions.expiresAt, now)))
      .limit(1);

    if (existing) {
      await db
        .update(checkoutSessions)
        .set({
          addressData: address,
          updatedAt: now,
          expiresAt,
        })
        .where(eq(checkoutSessions.id, existing.id));
    } else {
      // Clean up any stale sessions for this user before inserting
      await db.delete(checkoutSessions).where(eq(checkoutSessions.userId, userId));

      await db.insert(checkoutSessions).values({
        userId,
        addressData: address,
        appliedCoupon: null,
        createdAt: now,
        updatedAt: now,
        expiresAt,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving checkout address:', error);
    return { success: false, message: 'Failed to save checkout address' };
  }
}

/**
 * Save (upsert) the applied coupon for the current user's checkout session.
 * The checkout session must already exist (address saved first).
 */
export async function saveCheckoutCoupon(coupon: CheckoutCoupon | null): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    const userId = session.user.id;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

    const [existing] = await db
      .select({ id: checkoutSessions.id })
      .from(checkoutSessions)
      .where(and(eq(checkoutSessions.userId, userId), gt(checkoutSessions.expiresAt, now)))
      .limit(1);

    if (!existing) {
      return {
        success: false,
        message: 'No active checkout session. Please enter your address first.',
      };
    }

    await db
      .update(checkoutSessions)
      .set({
        appliedCoupon: coupon,
        updatedAt: now,
        expiresAt,
      })
      .where(eq(checkoutSessions.id, existing.id));

    return { success: true };
  } catch (error) {
    console.error('Error saving checkout coupon:', error);
    return { success: false, message: 'Failed to save coupon' };
  }
}

/**
 * Clear the checkout session for the current user.
 * Called after a successful order is placed or when the user abandons checkout.
 */
export async function clearCheckoutSession(): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    await db.delete(checkoutSessions).where(eq(checkoutSessions.userId, session.user.id));

    return { success: true };
  } catch (error) {
    console.error('Error clearing checkout session:', error);
    return { success: false, message: 'Failed to clear checkout session' };
  }
}
