'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { generateSlug } from '@/lib/utils/slug';
import {
  formatValidationErrors,
  type ProductInput,
  productSchema,
  validateDataSafe,
} from '@/lib/utils/validation';

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Create a new product (admin only)
 */
export async function createProduct(data: ProductInput): Promise<ActionResult> {
  try {
    // Require admin authentication
    await requireAdmin();

    // Validate input with Zod schema
    const validation = validateDataSafe(productSchema, data);
    if (!validation.success) {
      return {
        success: false,
        message: formatValidationErrors(validation.error)[0] || 'Invalid product data',
      };
    }

    const validated = validation.data;

    // Generate slug if not provided
    let slug = validated.slug;
    if (!slug) {
      slug = generateSlug(validated.name);
    }

    // Check slug uniqueness
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (existingProduct.length > 0) {
      return {
        success: false,
        message: 'A product with this slug already exists',
      };
    }

    // Create product
    const [product] = await db
      .insert(products)
      .values({
        name: validated.name,
        slug,
        description: validated.description,
        price: validated.price,
        categoryId: validated.categoryId,
        stock: validated.stock,
        images: validated.images,
        isActive: validated.isActive,
      })
      .returning();

    // Revalidate shop pages
    revalidatePath('/shop');
    revalidatePath('/admin/products');

    return {
      success: true,
      data: { productId: product.id },
      message: 'Product created successfully',
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      message: 'Failed to create product',
    };
  }
}

/**
 * Update an existing product (admin only)
 */
export async function updateProduct(id: string, data: ProductInput): Promise<ActionResult> {
  try {
    // Require admin authentication
    await requireAdmin();

    // Validate input with Zod schema
    const validation = validateDataSafe(productSchema, data);
    if (!validation.success) {
      return {
        success: false,
        message: formatValidationErrors(validation.error)[0] || 'Invalid product data',
      };
    }

    const validated = validation.data;

    // Get existing product
    const [existingProduct] = await db.select().from(products).where(eq(products.id, id)).limit(1);

    if (!existingProduct) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    // Check slug uniqueness if slug changed
    if (validated.slug !== existingProduct.slug) {
      const slugExists = await db
        .select()
        .from(products)
        .where(and(eq(products.slug, validated.slug), sql`${products.id} != ${id}`))
        .limit(1);

      if (slugExists.length > 0) {
        return {
          success: false,
          message: 'A product with this slug already exists',
        };
      }
    }

    // Update product
    await db
      .update(products)
      .set({
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        price: validated.price,
        categoryId: validated.categoryId,
        stock: validated.stock,
        images: validated.images,
        isActive: validated.isActive,
      })
      .where(eq(products.id, id));

    // Revalidate shop pages
    revalidatePath('/shop');
    revalidatePath(`/shop/${validated.slug}`);
    revalidatePath(`/shop/${existingProduct.slug}`);
    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product updated successfully',
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      message: 'Failed to update product',
    };
  }
}

/**
 * Delete a product (soft delete - set isActive to false)
 */
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    // Require admin authentication
    await requireAdmin();

    // Get existing product
    const [existingProduct] = await db.select().from(products).where(eq(products.id, id)).limit(1);

    if (!existingProduct) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    // Soft delete - set isActive to false
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));

    // Revalidate shop pages
    revalidatePath('/shop');
    revalidatePath(`/shop/${existingProduct.slug}`);
    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      message: 'Failed to delete product',
    };
  }
}
