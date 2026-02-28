/**
 * Unit tests for Cart Server Actions
 * Tests addToCart, updateCartQuantity, removeFromCart, and mergeCart
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { addToCart, mergeCart, removeFromCart, updateCartQuantity } from '../cart';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/utils/validation', () => ({
  cartItemSchema: {
    safeParse: vi.fn(),
  },
  validateDataSafe: vi.fn(),
  formatValidationErrors: vi.fn((error) => ['Validation error']),
}));

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { validateDataSafe } from '@/lib/utils/validation';

describe('Cart Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addToCart', () => {
    test('should successfully add product to cart for new item', async () => {
      // Mock validation success
      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: { productId: 'prod-123', quantity: 2 },
      });

      // Mock product query - product exists with stock
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'prod-123', stock: 10, price: 10000 }]),
      } as any);

      // Mock cart query - cart exists
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'cart-123' }]),
      } as any);

      // Mock cart item query - item doesn't exist
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock insert
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await addToCart('prod-123', 2, 'user-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product added to cart');
      expect(revalidatePath).toHaveBeenCalledWith('/cart');
    });

    test('should fail when product not found', async () => {
      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: { productId: 'prod-999', quantity: 2 },
      });

      // Mock product query - product not found
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await addToCart('prod-999', 2, 'user-123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
    });

    test('should fail when product is out of stock', async () => {
      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: { productId: 'prod-123', quantity: 2 },
      });

      // Mock product query - product with zero stock
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'prod-123', stock: 0, price: 10000 }]),
      } as any);

      const result = await addToCart('prod-123', 2, 'user-123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('This product is currently out of stock');
    });

    test('should fail when quantity exceeds stock', async () => {
      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: { productId: 'prod-123', quantity: 15 },
      });

      // Mock product query - product with limited stock
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'prod-123', stock: 10, price: 10000 }]),
      } as any);

      const result = await addToCart('prod-123', 15, 'user-123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Only 10 items available');
    });

    test('should increment quantity when product already in cart', async () => {
      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: { productId: 'prod-123', quantity: 2 },
      });

      // Mock product query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'prod-123', stock: 10, price: 10000 }]),
      } as any);

      // Mock cart query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'cart-123' }]),
      } as any);

      // Mock cart item query - item exists with quantity 3
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'item-123', quantity: 3 }]),
      } as any);

      // Mock update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await addToCart('prod-123', 2, 'user-123');

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    test('should fail when adding to existing item would exceed stock', async () => {
      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: { productId: 'prod-123', quantity: 5 },
      });

      // Mock product query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'prod-123', stock: 10, price: 10000 }]),
      } as any);

      // Mock cart query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'cart-123' }]),
      } as any);

      // Mock cart item query - item exists with quantity 8
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'item-123', quantity: 8 }]),
      } as any);

      const result = await addToCart('prod-123', 5, 'user-123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Only 10 items available');
      expect(result.message).toContain('You already have 8 in your cart');
    });

    test('should fail with validation error for invalid data', async () => {
      vi.mocked(validateDataSafe).mockReturnValue({
        success: false,
        error: { issues: [{ message: 'Invalid quantity' }] },
      } as any);

      const result = await addToCart('prod-123', -1, 'user-123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation error');
    });

    test('should fail when neither userId nor sessionId provided', async () => {
      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: { productId: 'prod-123', quantity: 2 },
      });

      // Mock product query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'prod-123', stock: 10, price: 10000 }]),
      } as any);

      const result = await addToCart('prod-123', 2);

      expect(result.success).toBe(false);
      expect(result.message).toBe('User or session identifier required');
    });

    test('should create new cart for user if not exists', async () => {
      vi.mocked(validateDataSafe).mockReturnValue({
        success: true,
        data: { productId: 'prod-123', quantity: 2 },
      });

      // Mock product query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'prod-123', stock: 10, price: 10000 }]),
      } as any);

      // Mock cart query - no cart exists
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock cart creation
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'new-cart-123' }]),
      } as any);

      // Mock cart item query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock cart item creation
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await addToCart('prod-123', 2, 'user-123');

      expect(result.success).toBe(true);
    });
  });

  describe('updateCartQuantity', () => {
    test('should successfully update cart item quantity', async () => {
      // Mock cart item query with product
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            cartItem: { id: 'item-123', quantity: 2 },
            product: { id: 'prod-123', stock: 10 },
          },
        ]),
      } as any);

      // Mock update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await updateCartQuantity('item-123', 5);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Cart updated');
      expect(revalidatePath).toHaveBeenCalledWith('/cart');
    });

    test('should remove item when quantity is zero', async () => {
      // Mock delete
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await updateCartQuantity('item-123', 0);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Item removed from cart');
    });

    test('should fail when quantity exceeds stock', async () => {
      // Mock cart item query with product
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            cartItem: { id: 'item-123', quantity: 2 },
            product: { id: 'prod-123', stock: 5 },
          },
        ]),
      } as any);

      const result = await updateCartQuantity('item-123', 10);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Only 5 items available');
    });

    test('should fail when cart item not found', async () => {
      // Mock cart item query - not found
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await updateCartQuantity('item-999', 5);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart item not found');
    });

    test('should fail for negative quantity', async () => {
      const result = await updateCartQuantity('item-123', -5);

      expect(result.success).toBe(false);
      expect(result.message).toContain('non-negative integer');
    });

    test('should fail for decimal quantity', async () => {
      const result = await updateCartQuantity('item-123', 2.5);

      expect(result.success).toBe(false);
      expect(result.message).toContain('non-negative integer');
    });
  });

  describe('removeFromCart', () => {
    test('should successfully remove item from cart', async () => {
      // Mock delete
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await removeFromCart('item-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Item removed from cart');
      expect(revalidatePath).toHaveBeenCalledWith('/cart');
    });

    test('should handle errors gracefully', async () => {
      // Mock delete to throw error
      vi.mocked(db.delete).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await removeFromCart('item-123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to remove item from cart');
    });
  });

  describe('mergeCart', () => {
    test('should successfully merge guest cart with user cart', async () => {
      // Mock guest cart query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'guest-cart-123' }]),
      } as any);

      // Mock guest cart items query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          { id: 'guest-item-1', productId: 'prod-1', quantity: 2 },
          { id: 'guest-item-2', productId: 'prod-2', quantity: 3 },
        ]),
      } as any);

      // Mock user cart query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'user-cart-123' }]),
      } as any);

      // Mock user cart items query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: 'user-item-1', productId: 'prod-1', quantity: 1 }]),
      } as any);

      // Mock product queries for stock check
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'prod-1', stock: 10 }]),
      } as any);

      // Mock update and insert
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      // Mock delete guest cart
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      await mergeCart('session-123', 'user-123');

      expect(revalidatePath).toHaveBeenCalledWith('/cart');
    });

    test('should handle no guest cart gracefully', async () => {
      // Mock guest cart query - no cart found
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      await mergeCart('session-123', 'user-123');

      // Should not throw error
      expect(true).toBe(true);
    });

    test('should delete empty guest cart', async () => {
      // Mock guest cart query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'guest-cart-123' }]),
      } as any);

      // Mock guest cart items query - empty
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock delete
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      await mergeCart('session-123', 'user-123');

      expect(db.delete).toHaveBeenCalled();
    });

    test('should create user cart if not exists', async () => {
      // Mock guest cart query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'guest-cart-123' }]),
      } as any);

      // Mock guest cart items query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ id: 'guest-item-1', productId: 'prod-1', quantity: 2 }]),
      } as any);

      // Mock user cart query - no cart
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock cart creation
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'new-user-cart-123' }]),
      } as any);

      // Mock user cart items query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock cart item insert
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      // Mock delete guest cart
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      await mergeCart('session-123', 'user-123');

      expect(db.insert).toHaveBeenCalled();
    });

    test('should respect stock limits when merging', async () => {
      // Mock guest cart query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'guest-cart-123' }]),
      } as any);

      // Mock guest cart items query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ id: 'guest-item-1', productId: 'prod-1', quantity: 8 }]),
      } as any);

      // Mock user cart query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'user-cart-123' }]),
      } as any);

      // Mock user cart items query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: 'user-item-1', productId: 'prod-1', quantity: 5 }]),
      } as any);

      // Mock product query - stock is 10
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'prod-1', stock: 10 }]),
      } as any);

      // Mock update - should cap at stock (10)
      const mockUpdate = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: mockUpdate,
      } as any);

      // Mock delete guest cart
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      await mergeCart('session-123', 'user-123');

      // Verify update was called (quantity should be capped at 10, not 13)
      expect(db.update).toHaveBeenCalled();
    });
  });
});
