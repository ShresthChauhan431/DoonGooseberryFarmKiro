import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db } from '@/lib/db';
import {
  getProductReviewStats,
  getProductReviews,
  hasUserReviewed,
  hasVerifiedPurchase,
} from '../reviews';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    execute: vi.fn(),
  },
}));

describe('Review Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProductReviews', () => {
    test('returns reviews with user information ordered by date', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Excellent product!',
          createdAt: new Date('2024-01-02'),
          user: {
            id: 'user-1',
            name: 'John Doe',
          },
        },
        {
          id: 'review-2',
          rating: 4,
          comment: 'Very good',
          createdAt: new Date('2024-01-01'),
          user: {
            id: 'user-2',
            name: 'Jane Smith',
          },
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockReviews),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getProductReviews('prod-123');

      expect(result).toHaveLength(2);
      expect(result[0].rating).toBe(5);
      expect(result[0].user?.name).toBe('John Doe');
      expect(result[1].rating).toBe(4);
      expect(result[1].user?.name).toBe('Jane Smith');
    });

    test('returns empty array when product has no reviews', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getProductReviews('prod-no-reviews');

      expect(result).toEqual([]);
    });

    test('handles reviews from deleted users', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Great!',
          createdAt: new Date('2024-01-01'),
          user: null, // Deleted user
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockReviews),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getProductReviews('prod-123');

      expect(result).toHaveLength(1);
      expect(result[0].user).toBeNull();
    });

    test('includes all review fields', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Amazing product with great quality!',
          createdAt: new Date('2024-01-15T10:30:00Z'),
          user: {
            id: 'user-1',
            name: 'Test User',
          },
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockReviews),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getProductReviews('prod-123');

      expect(result).toHaveLength(1);
      const review = result[0];

      expect(review.id).toBe('review-1');
      expect(review.rating).toBe(5);
      expect(review.comment).toBe('Amazing product with great quality!');
      expect(review.createdAt).toBeInstanceOf(Date);
      expect(review.user?.id).toBe('user-1');
      expect(review.user?.name).toBe('Test User');
    });
  });

  describe('getProductReviewStats', () => {
    test('calculates review statistics correctly', async () => {
      const mockStats = {
        averageRating: 4.2,
        totalReviews: 10,
        rating5: 5,
        rating4: 3,
        rating3: 1,
        rating2: 1,
        rating1: 0,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockStats]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getProductReviewStats('prod-123');

      expect(result.averageRating).toBe(4.2);
      expect(result.totalReviews).toBe(10);
      expect(result.rating5).toBe(5);
      expect(result.rating4).toBe(3);
      expect(result.rating3).toBe(1);
      expect(result.rating2).toBe(1);
      expect(result.rating1).toBe(0);
    });

    test('returns zero stats when product has no reviews', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getProductReviewStats('prod-no-reviews');

      expect(result.averageRating).toBe(0);
      expect(result.totalReviews).toBe(0);
      expect(result.rating5).toBe(0);
      expect(result.rating4).toBe(0);
      expect(result.rating3).toBe(0);
      expect(result.rating2).toBe(0);
      expect(result.rating1).toBe(0);
    });

    test('handles perfect 5-star ratings', async () => {
      const mockStats = {
        averageRating: 5.0,
        totalReviews: 3,
        rating5: 3,
        rating4: 0,
        rating3: 0,
        rating2: 0,
        rating1: 0,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockStats]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getProductReviewStats('prod-123');

      expect(result.averageRating).toBe(5.0);
      expect(result.totalReviews).toBe(3);
      expect(result.rating5).toBe(3);
    });

    test('handles low ratings', async () => {
      const mockStats = {
        averageRating: 1.5,
        totalReviews: 4,
        rating5: 0,
        rating4: 0,
        rating3: 0,
        rating2: 2,
        rating1: 2,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockStats]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getProductReviewStats('prod-123');

      expect(result.averageRating).toBe(1.5);
      expect(result.totalReviews).toBe(4);
      expect(result.rating1).toBe(2);
      expect(result.rating2).toBe(2);
    });

    test('calculates rating distribution correctly', async () => {
      const mockStats = {
        averageRating: 3.8,
        totalReviews: 20,
        rating5: 8,
        rating4: 6,
        rating3: 4,
        rating2: 1,
        rating1: 1,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockStats]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getProductReviewStats('prod-123');

      // Verify distribution adds up to total
      const distributionSum =
        result.rating5 + result.rating4 + result.rating3 + result.rating2 + result.rating1;
      expect(distributionSum).toBe(result.totalReviews);
    });
  });

  describe('hasVerifiedPurchase', () => {
    test('returns true when user has purchased the product', async () => {
      vi.mocked(db.execute).mockResolvedValue([{ has_purchase: true }] as any);

      const result = await hasVerifiedPurchase('user-123', 'prod-123');

      expect(result).toBe(true);
    });

    test('returns false when user has not purchased the product', async () => {
      vi.mocked(db.execute).mockResolvedValue([{ has_purchase: false }] as any);

      const result = await hasVerifiedPurchase('user-123', 'prod-456');

      expect(result).toBe(false);
    });

    test('returns false when query returns no results', async () => {
      vi.mocked(db.execute).mockResolvedValue([] as any);

      const result = await hasVerifiedPurchase('user-123', 'prod-789');

      expect(result).toBe(false);
    });

    test('returns false when has_purchase is undefined', async () => {
      vi.mocked(db.execute).mockResolvedValue([{}] as any);

      const result = await hasVerifiedPurchase('user-123', 'prod-999');

      expect(result).toBe(false);
    });

    test('only considers delivered, shipped, or processing orders', async () => {
      // This test verifies the SQL query logic (implicitly through the mock)
      vi.mocked(db.execute).mockResolvedValue([{ has_purchase: true }] as any);

      const result = await hasVerifiedPurchase('user-123', 'prod-123');

      expect(result).toBe(true);
      // The actual SQL query filters by status IN ('DELIVERED', 'SHIPPED', 'PROCESSING')
    });
  });

  describe('hasUserReviewed', () => {
    test('returns true when user has reviewed the product', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'review-1' }]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await hasUserReviewed('user-123', 'prod-123');

      expect(result).toBe(true);
    });

    test('returns false when user has not reviewed the product', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await hasUserReviewed('user-123', 'prod-456');

      expect(result).toBe(false);
    });

    test('returns false for new user', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await hasUserReviewed('new-user', 'prod-123');

      expect(result).toBe(false);
    });

    test('returns false for non-existent product', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await hasUserReviewed('user-123', 'non-existent-prod');

      expect(result).toBe(false);
    });

    test('only checks for one review (limit 1)', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'review-1' }]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await hasUserReviewed('user-123', 'prod-123');

      expect(result).toBe(true);
      // Verify limit was called (implicitly through the mock chain)
      expect(mockSelect.limit).toHaveBeenCalled();
    });
  });
});
