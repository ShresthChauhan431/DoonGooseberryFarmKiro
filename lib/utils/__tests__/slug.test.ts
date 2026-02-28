import { eq } from 'drizzle-orm';
import fc from 'fast-check';
import { afterAll, afterEach, describe, expect, test } from 'vitest';
import { db } from '@/lib/db';
import { categories, products } from '@/lib/db/schema';
import { generateSlug } from '../slug';
import { ensureUniqueSlug } from '../slug.server';

describe('Slug Utilities', () => {
  // Clean up test data after each test
  afterEach(async () => {
    // Delete test products (those with slugs starting with 'test-')
    await db.delete(products).where(eq(products.slug, 'test-product'));
    await db.delete(products).where(eq(products.slug, 'test-product-1'));
    await db.delete(products).where(eq(products.slug, 'test-product-2'));
  });

  // Close database connection after all tests
  afterAll(async () => {
    // Give time for cleanup operations to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  /**
   * Feature: doon-farm-ecommerce, Property 2: Slug Uniqueness
   * For any two products in the database, their slug values shall be different.
   * When attempting to create or update a product with a slug that already exists,
   * the operation shall fail with an error or generate a unique slug.
   * **Validates: Requirements 2.5**
   */
  test('Property 2: Slug uniqueness enforcement', async () => {
    // Get a category for testing
    const [category] = await db.select({ id: categories.id }).from(categories).limit(1);

    if (!category) {
      throw new Error('No categories found. Run seed script first.');
    }

    // Create a test product with a known slug
    const baseSlug = 'test-product';
    const [product1] = await db
      .insert(products)
      .values({
        name: 'Test Product 1',
        slug: baseSlug,
        description: 'Test description',
        price: 10000,
        categoryId: category.id,
        stock: 10,
        images: ['/test.jpg'],
        isActive: true,
      })
      .returning();

    // Verify the first product was created
    expect(product1.slug).toBe(baseSlug);

    // Try to create another product with the same base slug
    // ensureUniqueSlug should generate a unique slug
    const uniqueSlug = await ensureUniqueSlug(baseSlug);
    expect(uniqueSlug).not.toBe(baseSlug);
    expect(uniqueSlug).toBe('test-product-1');

    // Create the second product with the unique slug
    const [product2] = await db
      .insert(products)
      .values({
        name: 'Test Product 2',
        slug: uniqueSlug,
        description: 'Test description',
        price: 10000,
        categoryId: category.id,
        stock: 10,
        images: ['/test.jpg'],
        isActive: true,
      })
      .returning();

    expect(product2.slug).toBe(uniqueSlug);

    // Verify both products exist with different slugs
    const allTestProducts = await db
      .select()
      .from(products)
      .where(eq(products.name, 'Test Product 1'))
      .union(db.select().from(products).where(eq(products.name, 'Test Product 2')));

    expect(allTestProducts).toHaveLength(2);
    expect(allTestProducts[0].slug).not.toBe(allTestProducts[1].slug);

    // Clean up
    await db.delete(products).where(eq(products.id, product1.id));
    await db.delete(products).where(eq(products.id, product2.id));
  });

  /**
   * Property-based test: ensureUniqueSlug always generates unique slugs
   * **Validates: Requirements 2.5**
   */
  test('Property 2: ensureUniqueSlug generates unique slugs for duplicate attempts', async () => {
    // Get a category for testing
    const [category] = await db.select({ id: categories.id }).from(categories).limit(1);

    if (!category) {
      throw new Error('No categories found. Run seed script first.');
    }

    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .map(generateSlug)
          .filter((s) => s.length > 0),
        async (baseSlug) => {
          const testSlug = `pbt-${baseSlug}`;
          const createdProducts: string[] = [];

          try {
            // Create first product with the base slug
            const [product1] = await db
              .insert(products)
              .values({
                name: `PBT Product ${testSlug}`,
                slug: testSlug,
                description: 'Property-based test product',
                price: 10000,
                categoryId: category.id,
                stock: 10,
                images: ['/test.jpg'],
                isActive: true,
              })
              .returning();

            createdProducts.push(product1.id);

            // Try to ensure unique slug for the same base slug
            const uniqueSlug1 = await ensureUniqueSlug(testSlug);

            // The unique slug should be different from the base slug
            expect(uniqueSlug1).not.toBe(testSlug);
            expect(uniqueSlug1).toMatch(new RegExp(`^${testSlug}-\\d+$`));

            // Create second product with the unique slug
            const [product2] = await db
              .insert(products)
              .values({
                name: `PBT Product ${uniqueSlug1}`,
                slug: uniqueSlug1,
                description: 'Property-based test product',
                price: 10000,
                categoryId: category.id,
                stock: 10,
                images: ['/test.jpg'],
                isActive: true,
              })
              .returning();

            createdProducts.push(product2.id);

            // Try to ensure unique slug again
            const uniqueSlug2 = await ensureUniqueSlug(testSlug);

            // The second unique slug should be different from both previous slugs
            expect(uniqueSlug2).not.toBe(testSlug);
            expect(uniqueSlug2).not.toBe(uniqueSlug1);
            expect(uniqueSlug2).toMatch(new RegExp(`^${testSlug}-\\d+$`));

            // Verify all slugs are unique
            const slugs = [testSlug, uniqueSlug1, uniqueSlug2];
            const uniqueSlugs = new Set(slugs);
            expect(uniqueSlugs.size).toBe(slugs.length);

            return true;
          } finally {
            // Clean up all created products
            for (const productId of createdProducts) {
              await db.delete(products).where(eq(products.id, productId));
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: generateSlug produces valid URL-friendly slugs
   */
  test('Property: generateSlug produces valid slugs', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (text) => {
        const slug = generateSlug(text);

        // If the slug is empty (all special characters were removed), that's valid
        if (slug === '') return true;

        // Slug should only contain lowercase letters, numbers, and hyphens
        const validSlugPattern = /^[a-z0-9-]*$/;
        if (!validSlugPattern.test(slug)) return false;

        // Slug should not start or end with hyphen
        if (slug.startsWith('-') || slug.endsWith('-')) return false;

        // Slug should not have consecutive hyphens
        if (slug.includes('--')) return false;

        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Unit tests for specific examples
  describe('generateSlug', () => {
    test('converts simple text to slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    test('removes special characters', () => {
      expect(generateSlug('Hello @#$ World!')).toBe('hello-world');
    });

    test('replaces multiple spaces with single hyphen', () => {
      expect(generateSlug('Hello    World')).toBe('hello-world');
    });

    test('removes leading and trailing hyphens', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });

    test('handles already lowercase text', () => {
      expect(generateSlug('hello-world')).toBe('hello-world');
    });

    test('handles numbers', () => {
      expect(generateSlug('Product 123')).toBe('product-123');
    });

    test('handles empty string', () => {
      expect(generateSlug('')).toBe('');
    });
  });

  describe('ensureUniqueSlug', () => {
    test('returns original slug if unique', async () => {
      const uniqueSlug = await ensureUniqueSlug('non-existent-slug-12345');
      expect(uniqueSlug).toBe('non-existent-slug-12345');
    });

    test('appends number if slug exists', async () => {
      // Get a category for testing
      const [category] = await db.select({ id: categories.id }).from(categories).limit(1);

      if (!category) {
        throw new Error('No categories found. Run seed script first.');
      }

      // Create a product with a test slug
      const [product] = await db
        .insert(products)
        .values({
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test description',
          price: 10000,
          categoryId: category.id,
          stock: 10,
          images: ['/test.jpg'],
          isActive: true,
        })
        .returning();

      // Try to get a unique slug for the same base slug
      const uniqueSlug = await ensureUniqueSlug('test-product');
      expect(uniqueSlug).toBe('test-product-1');

      // Clean up
      await db.delete(products).where(eq(products.id, product.id));
    });

    test('excludes current product when updating', async () => {
      // Get a category for testing
      const [category] = await db.select({ id: categories.id }).from(categories).limit(1);

      if (!category) {
        throw new Error('No categories found. Run seed script first.');
      }

      // Create a product
      const [product] = await db
        .insert(products)
        .values({
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test description',
          price: 10000,
          categoryId: category.id,
          stock: 10,
          images: ['/test.jpg'],
          isActive: true,
        })
        .returning();

      // When updating the same product, the slug should be considered unique
      const uniqueSlug = await ensureUniqueSlug('test-product', product.id);
      expect(uniqueSlug).toBe('test-product');

      // Clean up
      await db.delete(products).where(eq(products.id, product.id));
    });
  });
});
