import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  type: string;
  category: string;
  updatedAt: Date;
}

/**
 * Get all site settings
 */
export async function getAllSettings(): Promise<SiteSetting[]> {
  return await db.select().from(siteSettings);
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(category: string): Promise<SiteSetting[]> {
  return await db.select().from(siteSettings).where(eq(siteSettings.category, category));
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: string): Promise<string | null> {
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);

  return result[0]?.value || null;
}

/**
 * Get multiple settings as an object
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const settings: Record<string, string> = {};

  for (const key of keys) {
    const value = await getSetting(key);
    if (value) {
      settings[key] = value;
    }
  }

  return settings;
}

/**
 * Get homepage settings
 */
export async function getHomepageSettings() {
  const settings = await getSettingsByCategory('homepage');

  // Parse hero images from JSON
  const heroImagesValue = settings.find((s) => s.key === 'hero_images')?.value;
  let heroImages: string[];

  try {
    heroImages = heroImagesValue ? JSON.parse(heroImagesValue) : ['/images/hero-bg.jpg'];
  } catch {
    heroImages = ['/images/hero-bg.jpg'];
  }

  return {
    heroImages,
    heroTitle:
      settings.find((s) => s.key === 'hero_title')?.value ||
      'Farm-Fresh Gooseberry Products from the Himalayas',
    heroSubtitle:
      settings.find((s) => s.key === 'hero_subtitle')?.value ||
      "Discover our range of 100% natural pickles, chutneys, jams, and more from Uttarakhand's pristine valleys",
    heroButtonText: settings.find((s) => s.key === 'hero_button_text')?.value || 'Shop Now',
    heroButtonLink: settings.find((s) => s.key === 'hero_button_link')?.value || '/shop',
  };
}

/**
 * Get general site settings
 */
export async function getGeneralSettings() {
  const settings = await getSettingsByCategory('general');

  return {
    siteName: settings.find((s) => s.key === 'site_name')?.value || 'Doon Gooseberry Farm',
    siteDescription:
      settings.find((s) => s.key === 'site_description')?.value ||
      'Farm-fresh gooseberry products from Uttarakhand',
    contactEmail: settings.find((s) => s.key === 'contact_email')?.value || 'contact@doonfarm.com',
    contactPhone: settings.find((s) => s.key === 'contact_phone')?.value || '+91-XXXXXXXXXX',
    facebookUrl: settings.find((s) => s.key === 'facebook_url')?.value || '',
    instagramUrl: settings.find((s) => s.key === 'instagram_url')?.value || '',
    twitterUrl: settings.find((s) => s.key === 'twitter_url')?.value || '',
  };
}
