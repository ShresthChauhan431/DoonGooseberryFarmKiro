/**
 * Unit tests for Coupons Server Actions
 * Tests validateCoupon and incrementCouponUsage
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { incrementCouponUsage, validateCoupon } from '../coupons';

// Mock dependencies
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';

describe('Coupons Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateCoupon', () => {
    test('should successfully validate valid coupon', async () => {
      // Mock authenticated session
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock coupon query - valid coupon
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'SAVE10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderValue: 0,
            maxUses: 100,
            currentUses: 50,
            expiresAt: new Date(Date.now() + 86400000), // Tomorrow
          },
        ]),
      } as any);

      const result = await validateCoupon('SAVE10', 50000); // ₹500

      expect(result.success).toBe(true);
      expect(result.message).toContain('applied successfully');
      expect(result.data?.code).toBe('SAVE10');
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await validateCoupon('SAVE10', 50000);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    test('should fail with empty coupon code', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const result = await validateCoupon('', 50000);

      expect(result.success).toBe(false);
      expect(result.message).toContain('enter a coupon code');
    });

    test('should fail with invalid order amount (zero)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const result = await validateCoupon('SAVE10', 0);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid order amount');
    });

    test('should fail with invalid order amount (negative)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const result = await validateCoupon('SAVE10', -1000);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid order amount');
    });

    test('should fail when coupon does not exist', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock coupon query - not found
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await validateCoupon('INVALID', 50000);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid coupon code');
    });

    test('should fail when coupon has expired', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock coupon query - expired coupon
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'EXPIRED',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderValue: 0,
            maxUses: 100,
            currentUses: 50,
            expiresAt: new Date(Date.now() - 86400000), // Yesterday
          },
        ]),
      } as any);

      const result = await validateCoupon('EXPIRED', 50000);

      expect(result.success).toBe(false);
      expect(result.message).toContain('coupon has expired');
    });

    test('should fail when coupon has reached max uses', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock coupon query - max uses reached
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'MAXED',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderValue: 0,
            maxUses: 100,
            currentUses: 100, // Reached max
            expiresAt: new Date(Date.now() + 86400000),
          },
        ]),
      } as any);

      const result = await validateCoupon('MAXED', 50000);

      expect(result.success).toBe(false);
      expect(result.message).toContain('reached its usage limit');
    });

    test('should fail when order does not meet minimum value', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock coupon query - minimum order value ₹500
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'SAVE10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderValue: 50000, // ₹500
            maxUses: 100,
            currentUses: 50,
            expiresAt: new Date(Date.now() + 86400000),
          },
        ]),
      } as any);

      const result = await validateCoupon('SAVE10', 30000); // ₹300

      expect(result.success).toBe(false);
      expect(result.message).toContain('Minimum order value');
      expect(result.message).toContain('₹500');
    });

    test('should validate percentage discount coupon', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'SAVE20',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            minOrderValue: 0,
            maxUses: 100,
            currentUses: 10,
            expiresAt: new Date(Date.now() + 86400000),
          },
        ]),
      } as any);

      const result = await validateCoupon('SAVE20', 100000);

      expect(result.success).toBe(true);
      expect(result.data?.discountType).toBe('PERCENTAGE');
      expect(result.data?.discountValue).toBe(20);
    });

    test('should validate flat discount coupon', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'FLAT50',
            discountType: 'FLAT',
            discountValue: 5000, // ₹50
            minOrderValue: 0,
            maxUses: 100,
            currentUses: 10,
            expiresAt: new Date(Date.now() + 86400000),
          },
        ]),
      } as any);

      const result = await validateCoupon('FLAT50', 100000);

      expect(result.success).toBe(true);
      expect(result.data?.discountType).toBe('FLAT');
      expect(result.data?.discountValue).toBe(5000);
    });

    test('should handle case-insensitive coupon codes', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'SAVE10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderValue: 0,
            maxUses: 100,
            currentUses: 50,
            expiresAt: new Date(Date.now() + 86400000),
          },
        ]),
      } as any);

      const result = await validateCoupon('save10', 50000); // lowercase

      expect(result.success).toBe(true);
    });

    test('should allow coupon at exactly minimum order value', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'SAVE10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderValue: 50000, // ₹500
            maxUses: 100,
            currentUses: 50,
            expiresAt: new Date(Date.now() + 86400000),
          },
        ]),
      } as any);

      const result = await validateCoupon('SAVE10', 50000); // Exactly ₹500

      expect(result.success).toBe(true);
    });

    test('should allow coupon at exactly max uses - 1', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'SAVE10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderValue: 0,
            maxUses: 100,
            currentUses: 99, // One use left
            expiresAt: new Date(Date.now() + 86400000),
          },
        ]),
      } as any);

      const result = await validateCoupon('SAVE10', 50000);

      expect(result.success).toBe(true);
    });
  });

  describe('incrementCouponUsage', () => {
    test('should successfully increment coupon usage', async () => {
      // Mock coupon query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'SAVE10',
            currentUses: 50,
          },
        ]),
      } as any);

      // Mock update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      await incrementCouponUsage('SAVE10');

      expect(db.update).toHaveBeenCalled();
    });

    test('should handle non-existent coupon gracefully', async () => {
      // Mock coupon query - not found
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      // Should not throw error
      await incrementCouponUsage('NONEXISTENT');

      expect(db.update).not.toHaveBeenCalled();
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      vi.mocked(db.select).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Should not throw error
      await incrementCouponUsage('SAVE10');

      // Function should complete without throwing
      expect(true).toBe(true);
    });

    test('should handle case-insensitive coupon codes', async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-123',
            code: 'SAVE10',
            currentUses: 50,
          },
        ]),
      } as any);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      await incrementCouponUsage('save10'); // lowercase

      expect(db.update).toHaveBeenCalled();
    });
  });
});
