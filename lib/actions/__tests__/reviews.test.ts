/**
 * Unit tests for Reviews Server Actions
 * Tests submitReview
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { submitReview } from '../reviews';

// Mock dependencies
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
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

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';

describe('Reviews Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitReview', () => {
    test('should successfully submit new review', async () => {
      // Mock authenticated session
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock verified purchase check - user has purchased
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'order-item-123' }]),
      } as any);

      // Mock existing review check - no existing review
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock review creation
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'review-123' }]),
      } as any);

      // Mock product query for slug
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ slug: 'mango-pickle' }]),
      } as any);

      const result = await submitReview('prod-123', 5, 'Excellent product!');

      expect(result.success).toBe(true);
      expect(result.message).toContain('submitted successfully');
      expect(result.reviewId).toBe('review-123');
      expect(revalidatePath).toHaveBeenCalled();
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await submitReview('prod-123', 5, 'Great product');

      expect(result.success).toBe(false);
      expect(result.message).toContain('must be logged in');
    });

    test('should fail when user has not purchased product', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock verified purchase check - no purchase
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await submitReview('prod-123', 5, 'Great product');

      expect(result.success).toBe(false);
      expect(result.message).toContain('must purchase this product');
    });

    test('should fail with invalid rating (below 1)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const result = await submitReview('prod-123', 0, 'Test comment here');

      expect(result.success).toBe(false);
    });

    test('should fail with invalid rating (above 5)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const result = await submitReview('prod-123', 6, 'Test comment here');

      expect(result.success).toBe(false);
    });

    test('should fail with short comment (less than 10 characters)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const result = await submitReview('prod-123', 5, 'Short');

      expect(result.success).toBe(false);
    });

    test('should fail with long comment (more than 500 characters)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const longComment = 'a'.repeat(501);
      const result = await submitReview('prod-123', 5, longComment);

      expect(result.success).toBe(false);
    });

    test('should update existing review', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock verified purchase check
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'order-item-123' }]),
      } as any);

      // Mock existing review check - review exists
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'review-123' }]),
      } as any);

      // Mock review update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      // Mock product query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ slug: 'mango-pickle' }]),
      } as any);

      const result = await submitReview('prod-123', 4, 'Updated review text');

      expect(result.success).toBe(true);
      expect(result.message).toContain('updated successfully');
      expect(db.update).toHaveBeenCalled();
    });

    test('should accept valid comment length (10-500 characters)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'order-item-123' }]),
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'review-123' }]),
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ slug: 'mango-pickle' }]),
      } as any);

      const validComment = 'This is a valid comment with exactly enough characters.';
      const result = await submitReview('prod-123', 5, validComment);

      expect(result.success).toBe(true);
    });

    test('should accept all valid ratings (1-5)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'order-item-123' }]),
      } as any);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'review-123' }]),
      } as any);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ slug: 'mango-pickle' }]),
      } as any);

      for (let rating = 1; rating <= 5; rating++) {
        const result = await submitReview('prod-123', rating, 'Valid comment text here');
        expect(result.success).toBe(true);
      }
    });
  });
});
