'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';

interface ActionResult {
  success: boolean;
  message: string;
}

/**
 * Update or create a site setting
 */
export async function updateSetting(
  key: string,
  value: string,
  type: string = 'text',
  category: string = 'general'
): Promise<ActionResult> {
  try {
    // Check if user is admin
    const session = await getSession();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized. Admin access required.',
      };
    }

    // Check if setting exists
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);

    if (existing.length > 0) {
      // Update existing setting
      await db
        .update(siteSettings)
        .set({ value, type, category, updatedAt: new Date() })
        .where(eq(siteSettings.key, key));
    } else {
      // Create new setting
      await db.insert(siteSettings).values({
        key,
        value,
        type,
        category,
      });
    }

    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/admin/settings');

    return {
      success: true,
      message: 'Setting updated successfully',
    };
  } catch (error) {
    console.error('Error updating setting:', error);
    return {
      success: false,
      message: 'Failed to update setting',
    };
  }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(
  settings: Array<{ key: string; value: string; type?: string; category?: string }>
): Promise<ActionResult> {
  try {
    // Check if user is admin
    const session = await getSession();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized. Admin access required.',
      };
    }

    // Update each setting
    for (const setting of settings) {
      const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, setting.key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteSettings)
          .set({
            value: setting.value,
            type: setting.type || existing[0].type,
            category: setting.category || existing[0].category,
            updatedAt: new Date(),
          })
          .where(eq(siteSettings.key, setting.key));
      } else {
        await db.insert(siteSettings).values({
          key: setting.key,
          value: setting.value,
          type: setting.type || 'text',
          category: setting.category || 'general',
        });
      }
    }

    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/admin/settings');

    return {
      success: true,
      message: 'Settings updated successfully',
    };
  } catch (error) {
    console.error('Error updating settings:', error);
    return {
      success: false,
      message: 'Failed to update settings',
    };
  }
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<ActionResult> {
  try {
    // Check if user is admin
    const session = await getSession();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized. Admin access required.',
      };
    }

    await db.delete(siteSettings).where(eq(siteSettings.key, key));

    revalidatePath('/');
    revalidatePath('/admin/settings');

    return {
      success: true,
      message: 'Setting deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting setting:', error);
    return {
      success: false,
      message: 'Failed to delete setting',
    };
  }
}
