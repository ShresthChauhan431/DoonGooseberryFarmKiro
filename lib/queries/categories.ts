import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';

/**
 * Get all categories ordered by name
 * Used for navigation menus
 */
export async function getCategories() {
  return await db.select().from(categories).orderBy(asc(categories.name));
}
