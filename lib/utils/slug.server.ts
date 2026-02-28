import 'server-only';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';

/**
 * Ensure slug is unique by appending a number if necessary
 * This function queries the database and must only be used server-side.
 * @param slug - Base slug to check
 * @param excludeId - Product ID to exclude from uniqueness check (for updates)
 * @returns Unique slug
 */
export async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    // Check if slug exists
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, uniqueSlug))
      .limit(1);

    // If no existing product found, or the existing one is the one we're updating
    if (existing.length === 0 || (excludeId && existing[0].id === excludeId)) {
      return uniqueSlug;
    }

    // Slug exists, try with a number suffix
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
}
