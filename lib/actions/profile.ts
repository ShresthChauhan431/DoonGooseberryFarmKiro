'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

import { formatValidationErrors } from '@/lib/utils/validation';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
});

interface ActionResult {
  success: boolean;
  message?: string;
}

/**
 * Update user profile (name only)
 */
export async function updateProfile(data: { name: string }): Promise<ActionResult> {
  try {
    // Validate input
    const validated = profileSchema.parse(data);

    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    // Update user name
    await db.update(users).set({ name: validated.name }).where(eq(users.id, session.user.id));

    revalidatePath('/account/profile');
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: formatValidationErrors(error)[0] };
    }
    return { success: false, message: 'Failed to update profile' };
  }
}
