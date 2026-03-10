import { and, eq, gt } from 'drizzle-orm';
import type { CheckoutAddress, CheckoutCoupon } from '@/lib/actions/checkout';
import { db } from '@/lib/db';
import { checkoutSessions } from '@/lib/db/schema';

export interface CheckoutSession {
  id: string;
  addressData: CheckoutAddress | null;
  appliedCoupon: CheckoutCoupon | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

/**
 * Get the active (non-expired) checkout session for a given user.
 * Returns null if no session exists or it has expired.
 *
 * This is a server-only query — call it from server components or server actions.
 */
export async function getCheckoutSession(userId: string): Promise<CheckoutSession | null> {
  const now = new Date();

  const [row] = await db
    .select({
      id: checkoutSessions.id,
      addressData: checkoutSessions.addressData,
      appliedCoupon: checkoutSessions.appliedCoupon,
      createdAt: checkoutSessions.createdAt,
      updatedAt: checkoutSessions.updatedAt,
      expiresAt: checkoutSessions.expiresAt,
    })
    .from(checkoutSessions)
    .where(and(eq(checkoutSessions.userId, userId), gt(checkoutSessions.expiresAt, now)))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    addressData: row.addressData ?? null,
    appliedCoupon: row.appliedCoupon ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    expiresAt: row.expiresAt,
  };
}
