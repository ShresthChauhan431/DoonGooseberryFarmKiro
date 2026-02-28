import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db } from '@/lib/db';
import { getCategories } from '../categories';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('Category Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    test('returns all categories ordered by name', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Chutneys',
          slug: 'chutneys',
          description: 'Delicious chutneys',
        },
        {
          id: 'cat-2',
          name: 'Jams',
          slug: 'jams',
          description: 'Sweet jams',
        },
        {
          id: 'cat-3',
          name: 'Pickles',
          slug: 'pickles',
          description: 'Tangy pickles',
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockCategories),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getCategories();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Chutneys');
      expect(result[1].name).toBe('Jams');
      expect(result[2].name).toBe('Pickles');
    });

    test('returns empty array when no categories exist', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getCategories();

      expect(result).toEqual([]);
    });

    test('includes all category fields', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Test Category',
          slug: 'test-category',
          description: 'A test category description',
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockCategories),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getCategories();

      expect(result).toHaveLength(1);
      const category = result[0];

      expect(category.id).toBe('cat-1');
      expect(category.name).toBe('Test Category');
      expect(category.slug).toBe('test-category');
      expect(category.description).toBe('A test category description');
    });

    test('handles categories with null descriptions', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Category Without Description',
          slug: 'no-description',
          description: null,
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockCategories),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getCategories();

      expect(result).toHaveLength(1);
      expect(result[0].description).toBeNull();
    });

    test('returns categories in alphabetical order by name', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Apples',
          slug: 'apples',
          description: 'Apple products',
        },
        {
          id: 'cat-2',
          name: 'Bananas',
          slug: 'bananas',
          description: 'Banana products',
        },
        {
          id: 'cat-3',
          name: 'Cherries',
          slug: 'cherries',
          description: 'Cherry products',
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockCategories),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getCategories();

      expect(result).toHaveLength(3);
      // Verify alphabetical order
      expect(result[0].name).toBe('Apples');
      expect(result[1].name).toBe('Bananas');
      expect(result[2].name).toBe('Cherries');
    });

    test('handles single category', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Only Category',
          slug: 'only-category',
          description: 'The only category',
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockCategories),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getCategories();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Only Category');
    });

    test('handles many categories', async () => {
      const mockCategories = Array.from({ length: 20 }, (_, i) => ({
        id: `cat-${i}`,
        name: `Category ${i}`,
        slug: `category-${i}`,
        description: `Description ${i}`,
      }));

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockCategories),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getCategories();

      expect(result).toHaveLength(20);
      expect(result[0].id).toBe('cat-0');
      expect(result[19].id).toBe('cat-19');
    });
  });
});
