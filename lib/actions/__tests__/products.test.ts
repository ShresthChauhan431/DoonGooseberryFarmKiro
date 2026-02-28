/**
 * Unit tests for Products Server Actions
 * Tests createProduct, updateProduct, and deleteProduct
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createProduct, deleteProduct, updateProduct } from '../products';

// Mock dependencies
vi.mock('@/lib/auth/session', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/utils/slug', () => ({
  generateSlug: vi.fn((text) => text.toLowerCase().replace(/\s+/g, '-')),
}));

vi.mock('@/lib/utils/validation', () => ({
  productSchema: {},
  validateDataSafe: vi.fn(),
  formatValidationErrors: vi.fn((error) => ['Validation error']),
}));

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { generateSlug } from '@/lib/utils/slug';
import { validateDataSafe } from '@/lib/utils/validation';

describe('Products Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    const validProductData = {
      name: 'Mango Pickle',
      slug: 'mango-pickle',
      description: 'Delicious homemade mango pickle',
      price: 29900,
      categoryId: 'cat-123',
      stock: 50,
      images: ['https://example.com/image.jpg'],
      isActive: true,
    };

    test('should successfully create product', async () => {
      // Mock admin authentication
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      // Mock validation success
      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: validProductData,
      });

      // Mock slug uniqueness check - slug is unique
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock product creation
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'prod-123' }]),
      } as any);

      const result = await createProduct(validProductData);

      expect(result.success).toBe(true);
      expect(result.data?.productId).toBe('prod-123');
      expect(revalidatePath).toHaveBeenCalledWith('/shop');
    });

    test('should fail when user is not admin', async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error('Unauthorized'));

      const result = await createProduct(validProductData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create product');
    });

    test('should fail with validation error', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      vi.mocked(validateDataSafe).mockReturnValue({
        success: false,
        error: { issues: [{ message: 'Invalid price' }] },
      } as any);

      const result = await createProduct({ ...validProductData, price: -100 });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation error');
    });

    test('should fail when slug already exists', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: validProductData,
      });

      // Mock slug uniqueness check - slug exists
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'existing-prod', slug: 'mango-pickle' }]),
      } as any);

      const result = await createProduct(validProductData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('A product with this slug already exists');
    });

    test('should generate slug if not provided', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      const dataWithoutSlug = { ...validProductData };
      delete (dataWithoutSlug as any).slug;

      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: dataWithoutSlug,
      });

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'prod-123' }]),
      } as any);

      await createProduct(dataWithoutSlug);

      expect(generateSlug).toHaveBeenCalledWith('Mango Pickle');
    });
  });

  describe('updateProduct', () => {
    const validProductData = {
      name: 'Updated Mango Pickle',
      slug: 'updated-mango-pickle',
      description: 'Updated description',
      price: 35000,
      categoryId: 'cat-123',
      stock: 60,
      images: ['https://example.com/new-image.jpg'],
      isActive: true,
    };

    test('should successfully update product', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: validProductData,
      });

      // Mock existing product query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'prod-123',
            slug: 'old-slug',
          },
        ]),
      } as any);

      // Mock slug uniqueness check
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await updateProduct('prod-123', validProductData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product updated successfully');
      expect(revalidatePath).toHaveBeenCalledWith('/shop');
    });

    test('should fail when user is not admin', async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error('Unauthorized'));

      const result = await updateProduct('prod-123', validProductData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update product');
    });

    test('should fail when product not found', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: validProductData,
      });

      // Mock existing product query - not found
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await updateProduct('prod-999', validProductData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
    });

    test('should fail when new slug already exists', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: validProductData,
      });

      // Mock existing product query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'prod-123',
            slug: 'old-slug',
          },
        ]),
      } as any);

      // Mock slug uniqueness check - slug exists for different product
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'prod-456',
            slug: 'updated-mango-pickle',
          },
        ]),
      } as any);

      const result = await updateProduct('prod-123', validProductData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('A product with this slug already exists');
    });

    test('should allow same slug for same product', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      const dataWithSameSlug = { ...validProductData, slug: 'same-slug' };

      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: dataWithSameSlug,
      });

      // Mock existing product query - same slug
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'prod-123',
            slug: 'same-slug',
          },
        ]),
      } as any);

      // Mock update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await updateProduct('prod-123', dataWithSameSlug);

      expect(result.success).toBe(true);
    });

    test('should fail with validation error', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      vi.mocked(validateDataSafe).mockReturnValue({
        success: false,
        error: { issues: [{ message: 'Invalid data' }] },
      } as any);

      const result = await updateProduct('prod-123', validProductData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation error');
    });
  });

  describe('deleteProduct', () => {
    test('should successfully soft delete product', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      // Mock existing product query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'prod-123',
            slug: 'mango-pickle',
          },
        ]),
      } as any);

      // Mock update (soft delete)
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await deleteProduct('prod-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product deleted successfully');
      expect(revalidatePath).toHaveBeenCalledWith('/shop');
    });

    test('should fail when user is not admin', async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error('Unauthorized'));

      const result = await deleteProduct('prod-123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to delete product');
    });

    test('should fail when product not found', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      // Mock existing product query - not found
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await deleteProduct('prod-999');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
    });

    test('should set isActive to false (soft delete)', async () => {
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'prod-123',
            slug: 'mango-pickle',
            isActive: true,
          },
        ]),
      } as any);

      const mockSet = vi.fn().mockReturnThis();
      vi.mocked(db.update).mockReturnValue({
        set: mockSet,
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      await deleteProduct('prod-123');

      expect(mockSet).toHaveBeenCalledWith({ isActive: false });
    });
  });
});
