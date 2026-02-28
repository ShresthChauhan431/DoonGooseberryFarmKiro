import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db } from '@/lib/db';
import { getAdminStats, getOrderById, getUserOrders } from '../orders';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    execute: vi.fn(),
  },
}));

describe('Order Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrderById', () => {
    test('returns order with items when order exists', async () => {
      const mockOrder = {
        id: 1,
        userId: 'user-123',
        status: 'DELIVERED',
        subtotal: 50000,
        shipping: 5000,
        discount: 5000,
        total: 50000,
        shippingAddress: {
          name: 'John Doe',
          addressLine1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
        },
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
        couponCode: 'SAVE10',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const mockItems = [
        {
          id: 1,
          productId: 'prod-1',
          quantity: 2,
          price: 20000,
          product: {
            id: 'prod-1',
            name: 'Mango Pickle',
            slug: 'mango-pickle',
            images: ['image1.jpg'],
          },
        },
        {
          id: 2,
          productId: 'prod-2',
          quantity: 1,
          price: 10000,
          product: {
            id: 'prod-2',
            name: 'Gooseberry Chutney',
            slug: 'gooseberry-chutney',
            images: ['image2.jpg'],
          },
        },
      ];

      // Mock the order query
      const mockOrderSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockOrder]),
      };

      // Mock the items query
      const mockItemsSelect = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockItems),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockOrderSelect as any)
        .mockReturnValueOnce(mockItemsSelect as any);

      const result = await getOrderById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.items).toHaveLength(2);
      expect(result?.items[0].product.name).toBe('Mango Pickle');
      expect(result?.items[1].product.name).toBe('Gooseberry Chutney');
    });

    test('returns null when order does not exist', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getOrderById('999');

      expect(result).toBeNull();
    });

    test('handles deleted products gracefully', async () => {
      const mockOrder = {
        id: 1,
        userId: 'user-123',
        status: 'DELIVERED',
        subtotal: 20000,
        shipping: 0,
        discount: 0,
        total: 20000,
        shippingAddress: null,
        razorpayOrderId: null,
        razorpayPaymentId: null,
        couponCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockItems = [
        {
          id: 1,
          productId: 'prod-deleted',
          quantity: 1,
          price: 20000,
          product: null, // Deleted product
        },
      ];

      const mockOrderSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockOrder]),
      };

      const mockItemsSelect = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockItems),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockOrderSelect as any)
        .mockReturnValueOnce(mockItemsSelect as any);

      const result = await getOrderById('1');

      expect(result).toBeDefined();
      expect(result?.items[0].product.name).toBe('Deleted Product');
      expect(result?.items[0].product.id).toBe('');
    });
  });

  describe('getUserOrders', () => {
    test('returns all orders for a user ordered by creation date', async () => {
      const mockOrders = [
        {
          id: 2,
          userId: 'user-123',
          status: 'DELIVERED',
          total: 30000,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 1,
          userId: 'user-123',
          status: 'PROCESSING',
          total: 20000,
          createdAt: new Date('2024-01-01'),
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockOrders),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserOrders('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2); // Most recent first
      expect(result[1].id).toBe(1);
    });

    test('returns empty array when user has no orders', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserOrders('user-no-orders');

      expect(result).toEqual([]);
    });
  });

  describe('getAdminStats', () => {
    test('calculates statistics correctly', async () => {
      const mockTodayStats = { count: 5, revenue: 50000 };
      const mockWeekStats = { count: 20, revenue: 200000 };
      const mockMonthStats = { count: 100, revenue: 1000000 };
      const mockLowStockProducts = [
        {
          id: 'prod-1',
          name: 'Low Stock Product',
          stock: 5,
          isActive: true,
        },
      ];
      const mockRecentOrders = [
        {
          id: 1,
          userId: 'user-1',
          status: 'DELIVERED',
          total: 10000,
          createdAt: new Date(),
        },
      ];

      // Mock stats queries
      const mockStatsSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockTodayStats]),
      };

      // Mock low stock query
      const mockLowStockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockLowStockProducts),
      };

      // Mock recent orders query
      const mockRecentOrdersSelect = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockRecentOrders),
      };

      // Mock user query for enrichment
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ name: 'John Doe', email: 'john@example.com' }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockStatsSelect as any) // today
        .mockReturnValueOnce({
          ...mockStatsSelect,
          where: vi.fn().mockResolvedValue([mockWeekStats]),
        } as any) // week
        .mockReturnValueOnce({
          ...mockStatsSelect,
          where: vi.fn().mockResolvedValue([mockMonthStats]),
        } as any) // month
        .mockReturnValueOnce(mockLowStockSelect as any) // low stock
        .mockReturnValueOnce(mockRecentOrdersSelect as any) // recent orders
        .mockReturnValue(mockUserSelect as any); // user enrichment

      const result = await getAdminStats();

      expect(result.todayOrders).toBe(5);
      expect(result.todayRevenue).toBe(50000);
      expect(result.weekOrders).toBe(20);
      expect(result.weekRevenue).toBe(200000);
      expect(result.monthOrders).toBe(100);
      expect(result.monthRevenue).toBe(1000000);
      expect(result.lowStockProducts).toHaveLength(1);
      expect(result.recentOrders).toHaveLength(1);
      expect(result.recentOrders[0].user.name).toBe('John Doe');
    });

    test('handles null stats gracefully', async () => {
      const mockStatsSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([null]),
      };

      const mockLowStockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      const mockRecentOrdersSelect = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockStatsSelect as any)
        .mockReturnValueOnce(mockStatsSelect as any)
        .mockReturnValueOnce(mockStatsSelect as any)
        .mockReturnValueOnce(mockLowStockSelect as any)
        .mockReturnValueOnce(mockRecentOrdersSelect as any);

      const result = await getAdminStats();

      expect(result.todayOrders).toBe(0);
      expect(result.todayRevenue).toBe(0);
      expect(result.weekOrders).toBe(0);
      expect(result.weekRevenue).toBe(0);
      expect(result.monthOrders).toBe(0);
      expect(result.monthRevenue).toBe(0);
    });

    test('handles orders without userId', async () => {
      const mockStatsSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0, revenue: 0 }]),
      };

      const mockLowStockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      const mockRecentOrdersSelect = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            userId: null, // Guest order
            status: 'DELIVERED',
            total: 10000,
            createdAt: new Date(),
          },
        ]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockStatsSelect as any)
        .mockReturnValueOnce(mockStatsSelect as any)
        .mockReturnValueOnce(mockStatsSelect as any)
        .mockReturnValueOnce(mockLowStockSelect as any)
        .mockReturnValueOnce(mockRecentOrdersSelect as any);

      const result = await getAdminStats();

      expect(result.recentOrders).toHaveLength(1);
      expect(result.recentOrders[0].user.name).toBe('Unknown');
      expect(result.recentOrders[0].user.email).toBe('');
    });
  });
});
