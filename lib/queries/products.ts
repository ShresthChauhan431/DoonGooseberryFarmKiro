import { and, asc, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, products } from '@/lib/db/schema';

export interface ProductFilters {
  category?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest';
  priceMin?: number;
  priceMax?: number;
  search?: string;
  isActive?: boolean;
}

/**
 * Get all products with optional filters
 */
export async function getProducts(filters: ProductFilters = {}) {
  const { category, sort = 'newest', priceMin, priceMax, search, isActive = true } = filters;

  // Build where conditions
  const conditions = [];

  // Filter by active status
  conditions.push(eq(products.isActive, isActive));

  // Filter by category slug
  if (category) {
    const categoryRecords = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, category))
      .limit(1);

    if (categoryRecords.length > 0) {
      conditions.push(eq(products.categoryId, categoryRecords[0].id));
    } else {
      // Category doesn't exist, return empty results
      // We do this by adding an impossible condition
      conditions.push(sql`false`);
    }
  }

  // Filter by price range
  if (priceMin !== undefined) {
    conditions.push(gte(products.price, priceMin));
  }
  if (priceMax !== undefined) {
    conditions.push(lte(products.price, priceMax));
  }

  // Filter by search text
  if (search) {
    conditions.push(
      sql`to_tsvector('english', ${products.name} || ' ' || ${products.description}) @@ plainto_tsquery('english', ${search})`
    );
  }

  // Build query
  const query = db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      categoryId: products.categoryId,
      stock: products.stock,
      images: products.images,
      isActive: products.isActive,
      createdAt: products.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .$dynamic();

  // Apply sorting
  switch (sort) {
    case 'price-asc':
      query.orderBy(asc(products.price));
      break;
    case 'price-desc':
      query.orderBy(desc(products.price));
      break;
    case 'newest':
    default:
      query.orderBy(desc(products.createdAt));
      break;
  }

  return await query;
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string) {
  const result = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      categoryId: products.categoryId,
      stock: products.stock,
      images: products.images,
      isActive: products.isActive,
      createdAt: products.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);

  return result[0] || null;
}

/**
 * Get related products from the same category
 */
export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
  return await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      categoryId: products.categoryId,
      stock: products.stock,
      images: products.images,
      isActive: products.isActive,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.isActive, true),
        sql`${products.id} != ${productId}`
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}

/**
 * Get products by IDs
 */
export async function getProductsByIds(productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  return await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      categoryId: products.categoryId,
      stock: products.stock,
      images: products.images,
      isActive: products.isActive,
      createdAt: products.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(sql`${products.id} = ANY(${productIds})`, eq(products.isActive, true)));
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 6) {
  return await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      categoryId: products.categoryId,
      stock: products.stock,
      images: products.images,
      isActive: products.isActive,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}
