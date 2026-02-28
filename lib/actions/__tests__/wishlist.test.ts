/**
 * Unit tests for Wishlist Server Actions
 * Tests toggleWishlist, isInWishlist, and mergeGuestWishlist
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { isInWishlist, mergeGuestWishlist, toggleWishlist } from '../wishlist';

// Mock dependencies
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';

describe('Wishlist Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toggleWishlist', () => {
    test('should add product to wishlist when not present', async () => {
      // Mock authenticated session
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock wishlist check - product not in wishlist
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock insert
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await toggleWishlist('prod-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Added to wishlist');
      expect(result.state).toBe('added');
      expect(revalidatePath).toHaveBeenCalledWith('/account/wishlist');
    });

    test('should remove product from wishlist when present', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock wishlist check - product in wishlist
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'wishlist-item-123' }]),
      } as any);

      // Mock delete
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await toggleWishlist('prod-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Removed from wishlist');
      expect(result.state).toBe('removed');
      expect(revalidatePath).toHaveBeenCalledWith('/account/wishlist');
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await toggleWishlist('prod-123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('must be logged in');
    });

    test('should handle errors gracefully', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock database error
      vi.mocked(db.select).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await toggleWishlist('prod-123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to update wishlist');
    });
  });

  describe('isInWishlist', () => {
    test('should return true when product is in wishlist', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock wishlist check - product in wishlist
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'wishlist-item-123' }]),
      } as any);

      const result = await isInWishlist('prod-123');

      expect(result).toBe(true);
    });

    test('should return false when product is not in wishlist', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock wishlist check - product not in wishlist
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await isInWishlist('prod-123');

      expect(result).toBe(false);
    });

    test('should return false when user not authenticated', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await isInWishlist('prod-123');

      expect(result).toBe(false);
    });

    test('should return false on error', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock database error
      vi.mocked(db.select).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await isInWishlist('prod-123');

      expect(result).toBe(false);
    });
  });

  describe('mergeGuestWishlist', () => {
    test('should merge guest wishlist items with user wishlist', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const guestProductIds = ['prod-1', 'prod-2', 'prod-3'];

      // Mock existing wishlist query - user has prod-1
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ productId: 'prod-1' }]),
      } as any);

      // Mock insert for new items
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await mergeGuestWishlist(guestProductIds);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Merged 2 items'); // prod-2 and prod-3
      expect(revalidatePath).toHaveBeenCalledWith('/account/wishlist');
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await mergeGuestWishlist(['prod-1', 'prod-2']);

      expect(result.success).toBe(false);
      expect(result.message).toContain('must be logged in');
    });

    test('should handle empty guest wishlist', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock existing wishlist query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await mergeGuestWishlist([]);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Merged 0 items');
    });

    test('should avoid duplicate entries', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const guestProductIds = ['prod-1', 'prod-2'];

      // Mock existing wishlist query - user already has both products
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ productId: 'prod-1' }, { productId: 'prod-2' }]),
      } as any);

      const result = await mergeGuestWishlist(guestProductIds);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Merged 0 items'); // No new items
      expect(db.insert).not.toHaveBeenCalled();
    });

    test('should handle errors gracefully', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock database error
      vi.mocked(db.select).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await mergeGuestWishlist(['prod-1']);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to merge wishlist');
    });

    test('should merge only new items when some already exist', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const guestProductIds = ['prod-1', 'prod-2', 'prod-3', 'prod-4'];

      // Mock existing wishlist query - user has prod-1 and prod-3
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ productId: 'prod-1' }, { productId: 'prod-3' }]),
      } as any);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await mergeGuestWishlist(guestProductIds);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Merged 2 items'); // prod-2 and prod-4
    });
  });
});
