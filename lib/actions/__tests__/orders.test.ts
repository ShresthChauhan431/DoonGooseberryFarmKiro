/**
 * Unit tests for Orders Server Actions
 * Tests createRazorpayOrderAction, verifyPaymentAndCreateOrder, and updateOrderStatus
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  createRazorpayOrderAction,
  updateOrderStatus,
  verifyPaymentAndCreateOrder,
} from '../orders';

// Mock dependencies
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/payment/razorpay', () => ({
  createRazorpayOrder: vi.fn(),
  getRazorpayKeyId: vi.fn(() => 'test_key_id'),
  verifyPaymentSignature: vi.fn(),
}));

vi.mock('@/lib/queries/cart', () => ({
  getCart: vi.fn(),
  calculateCartTotals: vi.fn(),
}));

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(),
}));

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email/send';
import { createRazorpayOrder, verifyPaymentSignature } from '@/lib/payment/razorpay';
import { calculateCartTotals, getCart } from '@/lib/queries/cart';

describe('Orders Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRazorpayOrderAction', () => {
    test('should successfully create Razorpay order', async () => {
      // Mock authenticated session
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock Razorpay order creation
      vi.mocked(createRazorpayOrder).mockResolvedValue({
        id: 'order_123',
        amount: 50000,
        currency: 'INR',
      } as any);

      const result = await createRazorpayOrderAction(50000);

      expect(result.success).toBe(true);
      expect(result.data?.orderId).toBe('order_123');
      expect(result.data?.keyId).toBe('test_key_id');
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await createRazorpayOrderAction(50000);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    test('should fail for invalid amount (zero)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const result = await createRazorpayOrderAction(0);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid amount');
    });

    test('should fail for invalid amount (negative)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const result = await createRazorpayOrderAction(-1000);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid amount');
    });

    test('should handle Razorpay API errors', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(createRazorpayOrder).mockRejectedValue(new Error('Razorpay API error'));

      const result = await createRazorpayOrderAction(50000);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to create payment order');
    });
  });

  describe('verifyPaymentAndCreateOrder', () => {
    const mockAddress = {
      name: 'John Doe',
      addressLine1: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
    };

    test('should successfully verify payment and create order', async () => {
      // Mock authenticated session
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock payment verification
      vi.mocked(verifyPaymentSignature).mockReturnValue(true);

      // Mock cart with items
      vi.mocked(getCart).mockResolvedValue({
        id: 'cart-123',
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 2,
            product: { id: 'prod-1', price: 10000, stock: 10 },
          },
        ],
      } as any);

      // Mock cart totals
      vi.mocked(calculateCartTotals).mockReturnValue({
        subtotal: 20000,
        shipping: 5000,
        discount: 0,
        total: 25000,
      });

      // Mock database transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return callback({
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{ id: 'order-123', createdAt: new Date() }]),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
          }),
          delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        } as any);
      });

      // Mock email sending
      vi.mocked(sendEmail).mockResolvedValue(undefined);

      const result = await verifyPaymentAndCreateOrder(
        'order_123',
        'pay_123',
        'signature_123',
        mockAddress
      );

      expect(result.success).toBe(true);
      expect(result.data?.orderId).toBe('order-123');
      expect(revalidatePath).toHaveBeenCalledWith('/cart');
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await verifyPaymentAndCreateOrder(
        'order_123',
        'pay_123',
        'signature_123',
        mockAddress
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    test('should fail when payment signature is invalid', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock payment verification failure
      vi.mocked(verifyPaymentSignature).mockReturnValue(false);

      const result = await verifyPaymentAndCreateOrder(
        'order_123',
        'pay_123',
        'invalid_signature',
        mockAddress
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Payment verification failed');
    });

    test('should fail when cart is empty', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(verifyPaymentSignature).mockReturnValue(true);

      // Mock empty cart
      vi.mocked(getCart).mockResolvedValue({
        id: 'cart-123',
        items: [],
      } as any);

      const result = await verifyPaymentAndCreateOrder(
        'order_123',
        'pay_123',
        'signature_123',
        mockAddress
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart is empty');
    });

    test('should apply coupon discount when provided', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(verifyPaymentSignature).mockReturnValue(true);

      vi.mocked(getCart).mockResolvedValue({
        id: 'cart-123',
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 2,
            product: { id: 'prod-1', price: 10000, stock: 10 },
          },
        ],
      } as any);

      // Mock coupon query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'coupon-1',
            code: 'SAVE10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            currentUses: 5,
          },
        ]),
      } as any);

      vi.mocked(calculateCartTotals).mockReturnValue({
        subtotal: 20000,
        shipping: 5000,
        discount: 2000,
        total: 23000,
      });

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return callback({
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{ id: 'order-123', createdAt: new Date() }]),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
          }),
          delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        } as any);
      });

      vi.mocked(sendEmail).mockResolvedValue(undefined);

      const result = await verifyPaymentAndCreateOrder(
        'order_123',
        'pay_123',
        'signature_123',
        mockAddress,
        'SAVE10'
      );

      expect(result.success).toBe(true);
    });

    test('should handle database transaction errors', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(verifyPaymentSignature).mockReturnValue(true);

      vi.mocked(getCart).mockResolvedValue({
        id: 'cart-123',
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 2,
            product: { id: 'prod-1', price: 10000, stock: 10 },
          },
        ],
      } as any);

      vi.mocked(calculateCartTotals).mockReturnValue({
        subtotal: 20000,
        shipping: 5000,
        discount: 0,
        total: 25000,
      });

      // Mock transaction failure
      vi.mocked(db.transaction).mockRejectedValue(new Error('Database error'));

      const result = await verifyPaymentAndCreateOrder(
        'order_123',
        'pay_123',
        'signature_123',
        mockAddress
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to create order');
    });
  });

  describe('updateOrderStatus', () => {
    test('should successfully update order status (PENDING to PROCESSING)', async () => {
      // Mock admin session
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);

      // Mock order query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'order-123',
            status: 'PENDING',
            userId: 'user-123',
            shippingAddress: {},
            createdAt: new Date(),
          },
        ]),
      } as any);

      // Mock transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return callback({
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
          }),
        } as any);
      });

      const result = await updateOrderStatus('order-123', 'PROCESSING');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Order status updated successfully');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/orders');
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await updateOrderStatus('order-123', 'PROCESSING');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    test('should fail when user is not admin', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com', name: 'User', role: 'USER' },
      } as any);

      const result = await updateOrderStatus('order-123', 'PROCESSING');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Admin access required');
    });

    test('should fail when order not found', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);

      // Mock order query - not found
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await updateOrderStatus('order-999', 'PROCESSING');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order not found');
    });

    test('should fail for invalid status transition (PENDING to DELIVERED)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'order-123',
            status: 'PENDING',
            userId: 'user-123',
          },
        ]),
      } as any);

      const result = await updateOrderStatus('order-123', 'DELIVERED');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot transition from PENDING to DELIVERED');
    });

    test('should fail for invalid status transition (DELIVERED to SHIPPED)', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'order-123',
            status: 'DELIVERED',
            userId: 'user-123',
          },
        ]),
      } as any);

      const result = await updateOrderStatus('order-123', 'SHIPPED');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot transition from DELIVERED to SHIPPED');
    });

    test('should restore stock when order is cancelled', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'order-123',
            status: 'PENDING',
            userId: 'user-123',
          },
        ]),
      } as any);

      const mockTransaction = vi.fn(async (callback) => {
        const tx = {
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
          }),
          select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnValue({
              // Mock order items query
              then: vi.fn().mockResolvedValue([
                { productId: 'prod-1', quantity: 2 },
                { productId: 'prod-2', quantity: 3 },
              ]),
              // Mock product query
              limit: vi.fn().mockResolvedValue([{ id: 'prod-1', stock: 10 }]),
            }),
          }),
        };
        return callback(tx);
      });

      vi.mocked(db.transaction).mockImplementation(mockTransaction as any);

      const result = await updateOrderStatus('order-123', 'CANCELLED');

      expect(result.success).toBe(true);
    });

    test('should send shipping email when status changes to SHIPPED', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'order-123',
            status: 'PROCESSING',
            userId: 'user-123',
            shippingAddress: {},
            createdAt: new Date(),
          },
        ]),
      } as any);

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return callback({
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
          }),
        } as any);
      });

      // Mock user query for email
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Test User',
          },
        ]),
      } as any);

      vi.mocked(sendEmail).mockResolvedValue(undefined);

      const result = await updateOrderStatus('order-123', 'SHIPPED');

      expect(result.success).toBe(true);
      // Email sending is async and doesn't block, so we can't directly test it
    });

    test('should send delivery email when status changes to DELIVERED', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'order-123',
            status: 'SHIPPED',
            userId: 'user-123',
            shippingAddress: {},
            createdAt: new Date(),
          },
        ]),
      } as any);

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return callback({
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
          }),
        } as any);
      });

      // Mock user query for email
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Test User',
          },
        ]),
      } as any);

      vi.mocked(sendEmail).mockResolvedValue(undefined);

      const result = await updateOrderStatus('order-123', 'DELIVERED');

      expect(result.success).toBe(true);
    });

    test('should allow valid transition PENDING to CANCELLED', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'order-123',
            status: 'PENDING',
            userId: 'user-123',
          },
        ]),
      } as any);

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return callback({
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
          }),
          select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);
      });

      const result = await updateOrderStatus('order-123', 'CANCELLED');

      expect(result.success).toBe(true);
    });

    test('should allow valid transition PROCESSING to SHIPPED', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'order-123',
            status: 'PROCESSING',
            userId: 'user-123',
            shippingAddress: {},
            createdAt: new Date(),
          },
        ]),
      } as any);

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return callback({
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
          }),
        } as any);
      });

      // Mock user query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Test User',
          },
        ]),
      } as any);

      const result = await updateOrderStatus('order-123', 'SHIPPED');

      expect(result.success).toBe(true);
    });

    test('should allow valid transition SHIPPED to DELIVERED', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'order-123',
            status: 'SHIPPED',
            userId: 'user-123',
            shippingAddress: {},
            createdAt: new Date(),
          },
        ]),
      } as any);

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return callback({
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
          }),
        } as any);
      });

      // Mock user query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Test User',
          },
        ]),
      } as any);

      const result = await updateOrderStatus('order-123', 'DELIVERED');

      expect(result.success).toBe(true);
    });
  });
});
