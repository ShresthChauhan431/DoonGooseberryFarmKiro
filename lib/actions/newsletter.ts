'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { subscribers } from '@/lib/db/schema';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function subscribeNewsletter(formData: FormData) {
  try {
    // Validate email
    const email = formData.get('email') as string;
    const result = emailSchema.safeParse({ email });

    if (!result.success) {
      return {
        success: false,
        message: result.error.issues[0].message,
      };
    }

    // Check if email already exists
    const existing = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, result.data.email))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        message: 'This email is already subscribed to our newsletter',
      };
    }

    // Insert new subscriber
    await db.insert(subscribers).values({
      email: result.data.email,
    });

    return {
      success: true,
      message: 'Thank you for subscribing to our newsletter!',
    };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return {
      success: false,
      message: 'An error occurred. Please try again later.',
    };
  }
}
