import { eq } from 'drizzle-orm';
import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import { db } from '@/lib/db';
import { categories, products } from '@/lib/db/schema';
import { getProducts, getRelatedProducts } from '../products';

describe('Product Queries', () => {
  /**
   * Feature: doon-farm-ecommerce, Property 17: Category Filter Consistency
   * For any category filter applied, all returned products shall belong to the
   * specified category, and the filtered count shall be less than or equal to
   * the total product count.
   * Validates: Requirements 6.3
   */
  test('Property 17: Category filter consistency', async () => {
    // First, get all available categories from the database
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      })
      .from(categories);

    // Skip test if no categories exist
    if (allCategories.length === 0) {
      console.warn('No categories found in database, skipping test');
      return;
    }

    // Get total product count (active products only)
    const totalProducts = await getProducts({ isActive: true });
    const totalCount = totalProducts.length;

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...allCategories.map((cat) => cat.slug)),
        async (categorySlug) => {
          // Get products filtered by category
          const filteredProducts = await getProducts({
            category: categorySlug,
            isActive: true,
          });

          // Get the category ID for this slug
          const category = allCategories.find((cat) => cat.slug === categorySlug);
          if (!category) return false;

          // Property 1: All filtered products must belong to the specified category
          const allBelongToCategory = filteredProducts.every(
            (product) => product.categoryId === category.id
          );

          // Property 2: Filtered count must be <= total count
          const countIsValid = filteredProducts.length <= totalCount;

          return allBelongToCategory && countIsValid;
        }
      ),
      { numRuns: 20 } // Run 20 times with different category selections
    );
  });

  /**
   * Additional unit test: Verify category filter returns only matching products
   */
  test('Category filter returns only products from specified category', async () => {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      })
      .from(categories);

    if (allCategories.length === 0) {
      console.warn('No categories found in database, skipping test');
      return;
    }

    // Test with the first category
    const testCategory = allCategories[0];
    const filteredProducts = await getProducts({
      category: testCategory.slug,
      isActive: true,
    });

    // All products should have the same categoryId
    for (const product of filteredProducts) {
      expect(product.categoryId).toBe(testCategory.id);
    }
  });

  /**
   * Additional unit test: Verify filtered count is never greater than total
   */
  test('Filtered product count never exceeds total product count', async () => {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      })
      .from(categories);

    if (allCategories.length === 0) {
      console.warn('No categories found in database, skipping test');
      return;
    }

    const totalProducts = await getProducts({ isActive: true });
    const totalCount = totalProducts.length;

    // Test each category
    for (const category of allCategories) {
      const filteredProducts = await getProducts({
        category: category.slug,
        isActive: true,
      });

      expect(filteredProducts.length).toBeLessThanOrEqual(totalCount);
    }
  });

  /**
   * Additional unit test: Verify non-existent category returns empty results
   */
  test('Non-existent category slug returns empty results', async () => {
    const filteredProducts = await getProducts({
      category: 'non-existent-category-slug-12345',
      isActive: true,
    });

    expect(filteredProducts).toHaveLength(0);
  });

  /**
   * Feature: doon-farm-ecommerce, Property 18: Price Range Filter Consistency
   * For any price range filter (priceMin, priceMax) applied to the product list,
   * all returned products shall have prices within the specified range (inclusive),
   * and the count of filtered products shall be less than or equal to the total
   * product count.
   * Validates: Requirements 6.7
   */
  test('Property 18: Price range filter consistency', async () => {
    // Get total product count (active products only)
    const totalProducts = await getProducts({ isActive: true });
    const totalCount = totalProducts.length;

    // Skip test if no products exist
    if (totalCount === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    // Get the min and max prices from existing products to generate realistic ranges
    const prices = totalProducts.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    await fc.assert(
      fc.asyncProperty(
        // Generate random price ranges within the actual product price range
        fc.integer({ min: minPrice, max: maxPrice }),
        fc.integer({ min: minPrice, max: maxPrice }),
        async (price1, price2) => {
          // Ensure priceMin <= priceMax
          const priceMin = Math.min(price1, price2);
          const priceMax = Math.max(price1, price2);

          // Get products filtered by price range
          const filteredProducts = await getProducts({
            priceMin,
            priceMax,
            isActive: true,
          });

          // Property 1: All filtered products must have prices within the range (inclusive)
          const allWithinRange = filteredProducts.every(
            (product) => product.price >= priceMin && product.price <= priceMax
          );

          // Property 2: Filtered count must be <= total count
          const countIsValid = filteredProducts.length <= totalCount;

          return allWithinRange && countIsValid;
        }
      ),
      { numRuns: 50 } // Run 50 times with different price ranges
    );
  });

  /**
   * Additional unit test: Verify price range filter with only priceMin
   */
  test('Price filter with only priceMin returns products >= priceMin', async () => {
    const allProducts = await getProducts({ isActive: true });

    if (allProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    const prices = allProducts.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const testPriceMin = Math.floor((minPrice + maxPrice) / 2);

    const filteredProducts = await getProducts({
      priceMin: testPriceMin,
      isActive: true,
    });

    // All products should have price >= priceMin
    for (const product of filteredProducts) {
      expect(product.price).toBeGreaterThanOrEqual(testPriceMin);
    }
  });

  /**
   * Additional unit test: Verify price range filter with only priceMax
   */
  test('Price filter with only priceMax returns products <= priceMax', async () => {
    const allProducts = await getProducts({ isActive: true });

    if (allProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    const prices = allProducts.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const testPriceMax = Math.floor((minPrice + maxPrice) / 2);

    const filteredProducts = await getProducts({
      priceMax: testPriceMax,
      isActive: true,
    });

    // All products should have price <= priceMax
    for (const product of filteredProducts) {
      expect(product.price).toBeLessThanOrEqual(testPriceMax);
    }
  });

  /**
   * Additional unit test: Verify price range filter with both priceMin and priceMax
   */
  test('Price filter with both priceMin and priceMax returns products within range', async () => {
    const allProducts = await getProducts({ isActive: true });

    if (allProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    const prices = allProducts.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const testPriceMin = minPrice + Math.floor(range * 0.25);
    const testPriceMax = minPrice + Math.floor(range * 0.75);

    const filteredProducts = await getProducts({
      priceMin: testPriceMin,
      priceMax: testPriceMax,
      isActive: true,
    });

    // All products should have price within the range
    for (const product of filteredProducts) {
      expect(product.price).toBeGreaterThanOrEqual(testPriceMin);
      expect(product.price).toBeLessThanOrEqual(testPriceMax);
    }
  });

  /**
   * Additional unit test: Verify filtered count never exceeds total count
   */
  test('Price filtered product count never exceeds total product count', async () => {
    const allProducts = await getProducts({ isActive: true });
    const totalCount = allProducts.length;

    if (totalCount === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    const prices = allProducts.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Test with various price ranges
    const testRanges = [
      { priceMin: minPrice, priceMax: maxPrice },
      { priceMin: minPrice },
      { priceMax: maxPrice },
      { priceMin: Math.floor((minPrice + maxPrice) / 2), priceMax: maxPrice },
    ];

    for (const range of testRanges) {
      const filteredProducts = await getProducts({
        ...range,
        isActive: true,
      });

      expect(filteredProducts.length).toBeLessThanOrEqual(totalCount);
    }
  });

  /**
   * Feature: doon-farm-ecommerce, Property 20: Related Products Filtering
   * For any product, the related products list shall only include products from
   * the same category, shall exclude the current product, and shall contain at
   * most 4 products.
   * Validates: Requirements 38.2, 38.3
   */
  test('Property 20: Related products filtering', async () => {
    // Get all active products from the database
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        categoryId: products.categoryId,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.isActive, true));

    // Skip test if no products exist
    if (allProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        // Select a random product from the database
        fc.constantFrom(...allProducts),
        async (currentProduct) => {
          // Get related products for this product
          const relatedProducts = await getRelatedProducts(
            currentProduct.id,
            currentProduct.categoryId,
            4
          );

          // Property 1: All related products must be from the same category (Requirement 38.2)
          const allFromSameCategory = relatedProducts.every(
            (product) => product.categoryId === currentProduct.categoryId
          );

          // Property 2: Current product must be excluded from related products (Requirement 38.3)
          const currentProductExcluded = !relatedProducts.some(
            (product) => product.id === currentProduct.id
          );

          // Property 3: Count must be <= 4
          const countIsValid = relatedProducts.length <= 4;

          return allFromSameCategory && currentProductExcluded && countIsValid;
        }
      ),
      { numRuns: 30 } // Run 30 times with different product selections
    );
  });

  /**
   * Additional unit test: Verify related products are from same category
   */
  test('Related products are from the same category', async () => {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        categoryId: products.categoryId,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.isActive, true));

    if (allProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    // Test with the first product
    const testProduct = allProducts[0];
    const relatedProducts = await getRelatedProducts(testProduct.id, testProduct.categoryId, 4);

    // All related products should have the same categoryId
    for (const product of relatedProducts) {
      expect(product.categoryId).toBe(testProduct.categoryId);
    }
  });

  /**
   * Additional unit test: Verify current product is excluded from related products
   */
  test('Current product is excluded from related products', async () => {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        categoryId: products.categoryId,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.isActive, true));

    if (allProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    // Test with the first product
    const testProduct = allProducts[0];
    const relatedProducts = await getRelatedProducts(testProduct.id, testProduct.categoryId, 4);

    // Current product should not be in the related products list
    const currentProductInList = relatedProducts.some((product) => product.id === testProduct.id);
    expect(currentProductInList).toBe(false);
  });

  /**
   * Additional unit test: Verify related products count is at most 4
   */
  test('Related products count is at most 4', async () => {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        categoryId: products.categoryId,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.isActive, true));

    if (allProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    // Test with multiple products
    for (const testProduct of allProducts.slice(0, 5)) {
      const relatedProducts = await getRelatedProducts(testProduct.id, testProduct.categoryId, 4);

      expect(relatedProducts.length).toBeLessThanOrEqual(4);
    }
  });

  /**
   * Additional unit test: Verify related products are only active products
   */
  test('Related products are only active products', async () => {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        categoryId: products.categoryId,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.isActive, true));

    if (allProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    // Test with the first product
    const testProduct = allProducts[0];
    const relatedProducts = await getRelatedProducts(testProduct.id, testProduct.categoryId, 4);

    // All related products should be active
    for (const product of relatedProducts) {
      expect(product.isActive).toBe(true);
    }
  });

  /**
   * Feature: doon-farm-ecommerce, Property 19: Search Active Products Only
   * For any search query, all returned products shall have isActive = true,
   * ensuring that inactive products are never shown in search results.
   * Validates: Requirements 8.7
   */
  test('Property 19: Search active products only', async () => {
    // Get all active products to extract search terms
    const allActiveProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.isActive, true));

    // Skip test if no products exist
    if (allActiveProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    // Extract words from product names and descriptions to use as search terms
    const searchTerms = new Set<string>();
    for (const product of allActiveProducts) {
      // Extract words from name
      const nameWords = product.name.toLowerCase().split(/\s+/);
      nameWords.forEach((word) => {
        if (word.length >= 3) searchTerms.add(word);
      });

      // Extract some words from description
      const descWords = product.description.toLowerCase().split(/\s+/).slice(0, 10);
      descWords.forEach((word) => {
        if (word.length >= 4) searchTerms.add(word);
      });
    }

    const searchTermsArray = Array.from(searchTerms).slice(0, 20); // Limit to 20 terms

    if (searchTermsArray.length === 0) {
      console.warn('No search terms extracted, skipping test');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        // Generate random search queries from actual product data
        fc.constantFrom(...searchTermsArray),
        async (searchQuery) => {
          // Get products using search filter
          const searchResults = await getProducts({
            search: searchQuery,
            isActive: true, // This is the default, but we're explicit here
          });

          // Property: All search results must have isActive = true
          const allActive = searchResults.every((product) => product.isActive === true);

          return allActive;
        }
      ),
      { numRuns: 30 } // Run 30 times with different search queries
    );
  });

  /**
   * Additional unit test: Verify search with isActive=true returns only active products
   */
  test('Search with isActive=true returns only active products', async () => {
    const allActiveProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.isActive, true));

    if (allActiveProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    // Extract a search term from the first product
    const firstProduct = allActiveProducts[0];
    const searchTerm = firstProduct.name.split(/\s+/)[0].toLowerCase();

    const searchResults = await getProducts({
      search: searchTerm,
      isActive: true,
    });

    // All results should have isActive = true
    for (const product of searchResults) {
      expect(product.isActive).toBe(true);
    }
  });

  /**
   * Additional unit test: Verify default search behavior filters active products
   */
  test('Search without explicit isActive parameter defaults to active products only', async () => {
    const allActiveProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.isActive, true));

    if (allActiveProducts.length === 0) {
      console.warn('No products found in database, skipping test');
      return;
    }

    // Extract a search term from the first product
    const firstProduct = allActiveProducts[0];
    const searchTerm = firstProduct.name.split(/\s+/)[0].toLowerCase();

    // Call getProducts with search but without explicit isActive parameter
    const searchResults = await getProducts({
      search: searchTerm,
      // isActive defaults to true
    });

    // All results should have isActive = true
    for (const product of searchResults) {
      expect(product.isActive).toBe(true);
    }
  });

  /**
   * Additional unit test: Verify inactive products are excluded from search
   */
  test('Inactive products are excluded from search results', async () => {
    // First, check if there are any inactive products
    const inactiveProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.isActive, false));

    if (inactiveProducts.length === 0) {
      console.warn('No inactive products found in database, skipping test');
      return;
    }

    // Extract a search term from an inactive product
    const inactiveProduct = inactiveProducts[0];
    const searchTerm = inactiveProduct.name.split(/\s+/)[0].toLowerCase();

    // Search with isActive=true (default behavior)
    const searchResults = await getProducts({
      search: searchTerm,
      isActive: true,
    });

    // The inactive product should NOT be in the results
    const inactiveProductInResults = searchResults.some(
      (product) => product.id === inactiveProduct.id
    );
    expect(inactiveProductInResults).toBe(false);

    // All results should be active
    for (const product of searchResults) {
      expect(product.isActive).toBe(true);
    }
  });
});
