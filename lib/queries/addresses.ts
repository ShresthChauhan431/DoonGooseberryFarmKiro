import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { addresses } from '@/lib/db/schema';

export interface Address {
  id: string;
  userId: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

/**
 * Get all addresses for a user
 */
export async function getUserAddresses(userId: string): Promise<Address[]> {
  return await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(addresses.isDefault);
}

/**
 * Get default address for a user
 */
export async function getDefaultAddress(userId: string): Promise<Address | null> {
  const [address] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)))
    .limit(1);

  return address || null;
}
