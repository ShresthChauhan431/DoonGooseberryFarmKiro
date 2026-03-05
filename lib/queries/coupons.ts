'use server';

import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';

export async function getAllCoupons() {
  return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function getCouponById(id: string) {
  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return coupon || null;
}

export async function getCouponByCode(code: string) {
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase()))
    .limit(1);
  return coupon || null;
}
