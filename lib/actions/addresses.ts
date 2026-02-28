'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { addresses } from '@/lib/db/schema';

import { formatValidationErrors } from '@/lib/utils/validation';

const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

type AddressInput = z.infer<typeof addressSchema>;

interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Create a new address
 */
export async function createAddress(data: AddressInput): Promise<ActionResult> {
  try {
    // Validate input
    const validated = addressSchema.parse(data);

    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    // Create address
    await db.insert(addresses).values({
      userId: session.user.id,
      name: validated.name,
      addressLine1: validated.addressLine1,
      addressLine2: validated.addressLine2 || null,
      city: validated.city,
      state: validated.state,
      pincode: validated.pincode,
      phone: validated.phone,
      isDefault: false,
    });

    revalidatePath('/account/addresses');
    return { success: true };
  } catch (error) {
    console.error('Create address error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: formatValidationErrors(error)[0] };
    }
    return { success: false, message: 'Failed to create address' };
  }
}

/**
 * Update an existing address
 */
export async function updateAddress(addressId: string, data: AddressInput): Promise<ActionResult> {
  try {
    // Validate input
    const validated = addressSchema.parse(data);

    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    // Update address (only if it belongs to the user)
    const result = await db
      .update(addresses)
      .set({
        name: validated.name,
        addressLine1: validated.addressLine1,
        addressLine2: validated.addressLine2 || null,
        city: validated.city,
        state: validated.state,
        pincode: validated.pincode,
        phone: validated.phone,
      })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, session.user.id)));

    revalidatePath('/account/addresses');
    return { success: true };
  } catch (error) {
    console.error('Update address error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: formatValidationErrors(error)[0] };
    }
    return { success: false, message: 'Failed to update address' };
  }
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId: string): Promise<ActionResult> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    // Delete address (only if it belongs to the user)
    await db
      .delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, session.user.id)));

    revalidatePath('/account/addresses');
    return { success: true };
  } catch (error) {
    console.error('Delete address error:', error);
    return { success: false, message: 'Failed to delete address' };
  }
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(addressId: string): Promise<ActionResult> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    // Start transaction: unset all defaults, then set the new one
    await db.transaction(async (tx) => {
      // Unset all defaults for this user
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, session.user.id));

      // Set the new default
      await tx
        .update(addresses)
        .set({ isDefault: true })
        .where(and(eq(addresses.id, addressId), eq(addresses.userId, session.user.id)));
    });

    revalidatePath('/account/addresses');
    return { success: true };
  } catch (error) {
    console.error('Set default address error:', error);
    return { success: false, message: 'Failed to set default address' };
  }
}
