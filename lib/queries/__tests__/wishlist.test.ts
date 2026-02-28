import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db } from '@/lib/db';
import { getUserWishlist } from '../wishlist';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('Wishlist Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserWishlist', () => {
    test('returns wishlist items with product and category details', async () => {
      const mockWishlistItems = [
        {
          id: 'wish-1',
          productId: 'prod-1',
          createdAt: new Date('2024-01-01'),
          product: {
            id: 'prod-1',
            name: 'Mango Pickle',
            slug: 'mango-pickle',
            price: 25000,
            stock: 50,
            images: ['image1.jpg', 'image2.jpg'],
          },
          category: {
            name: 'Pickles',
            slug: 'pickles',
          },
        },
        {
          id: 'wish-2',
          productId: 'prod-2',
          createdAt: new Date('2024-01-02'),
          product: {
            id: 'prod-2',
            name: 'Gooseberry Chutney',
            slug: 'gooseberry-chutney',
            price: 15000,
            stock: 30,
            images: ['image3.jpg'],
          },
          category: {
            name: 'Chutneys',
            slug: 'chutneys',
          },
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockWishlistItems),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserWishlist('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('wish-1');
      expect(result[0].product.name).toBe('Mango Pickle');
      expect(result[0].product.category?.name).toBe('Pickles');
      expect(result[1].id).toBe('wish-2');
      expect(result[1].product.name).toBe('Gooseberry Chutney');
      expect(result[1].product.category?.name).toBe('Chutneys');
    });

    test('returns empty array when user has no wishlist items', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserWishlist('user-no-wishlist');

      expect(result).toEqual([]);
    });

    test('handles products without category', async () => {
      const mockWishlistItems = [
        {
          id: 'wish-1',
          productId: 'prod-1',
          createdAt: new Date('2024-01-01'),
          product: {
            id: 'prod-1',
            name: 'Uncategorized Product',
            slug: 'uncategorized-product',
            price: 10000,
            stock: 20,
            images: ['image1.jpg'],
          },
          category: null, // No category
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockWishlistItems),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserWishlist('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].product.category).toBeNull();
    });

    test('returns items ordered by creation date', async () => {
      const mockWishlistItems = [
        {
          id: 'wish-1',
          productId: 'prod-1',
          createdAt: new Date('2024-01-01'),
          product: {
            id: 'prod-1',
            name: 'Product 1',
            slug: 'product-1',
            price: 10000,
            stock: 10,
            images: [],
          },
          category: null,
        },
        {
          id: 'wish-2',
          productId: 'prod-2',
          createdAt: new Date('2024-01-02'),
          product: {
            id: 'prod-2',
            name: 'Product 2',
            slug: 'product-2',
            price: 20000,
            stock: 20,
            images: [],
          },
          category: null,
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockWishlistItems),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserWishlist('user-123');

      expect(result).toHaveLength(2);
      // Verify items are in order (oldest first based on orderBy in the query)
      expect(result[0].createdAt.getTime()).toBeLessThan(result[1].createdAt.getTime());
    });

    test('includes all product details needed for display', async () => {
      const mockWishlistItems = [
        {
          id: 'wish-1',
          productId: 'prod-1',
          createdAt: new Date('2024-01-01'),
          product: {
            id: 'prod-1',
            name: 'Test Product',
            slug: 'test-product',
            price: 35000,
            stock: 15,
            images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
          },
          category: {
            name: 'Test Category',
            slug: 'test-category',
          },
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockWishlistItems),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserWishlist('user-123');

      expect(result).toHaveLength(1);
      const item = result[0];

      // Verify all required fields are present
      expect(item.id).toBeDefined();
      expect(item.productId).toBeDefined();
      expect(item.createdAt).toBeDefined();
      expect(item.product.id).toBeDefined();
      expect(item.product.name).toBeDefined();
      expect(item.product.slug).toBeDefined();
      expect(item.product.price).toBeDefined();
      expect(item.product.stock).toBeDefined();
      expect(item.product.images).toBeDefined();
      expect(item.product.category).toBeDefined();
    });

    test('handles out of stock products', async () => {
      const mockWishlistItems = [
        {
          id: 'wish-1',
          productId: 'prod-1',
          createdAt: new Date('2024-01-01'),
          product: {
            id: 'prod-1',
            name: 'Out of Stock Product',
            slug: 'out-of-stock',
            price: 10000,
            stock: 0, // Out of stock
            images: ['image1.jpg'],
          },
          category: {
            name: 'Test',
            slug: 'test',
          },
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockWishlistItems),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserWishlist('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].product.stock).toBe(0);
    });
  });
});
