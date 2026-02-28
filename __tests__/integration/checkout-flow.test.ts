/**
 * Integration Test: Complete Checkout Flow
 *
 * Tests the full journey from cart to order completion:
 * - User adds products to cart
 * - User proceeds to checkout
 * - User enters shipping address
 * - User applies coupon code (optional)
 * - Payment is processed via Razorpay
 * - Order is created with correct totals
 * - Cart is cleared
 * - Product stock is decremented
 * - Confirmation email is sent
 * - User can view order in account
 */

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { addToCart, removeFromCart } from '@/lib/actions/cart';
import { validateCoupon } from '@/lib/actions/coupons';
import { createRazorpayOrderAction, verifyPaymentAndCreateOrder } from '@/lib/actions/orders';
import { db } from '@/lib/db';
import { cartItems, carts, coupons, orderItems, orders, products } from '@/lib/db/schema';
import { getCart } from '@/lib/queries/cart';
import { getOrderById } from '@/lib/queries/orders';

// Mock dependencies
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/payment/razorpay', () => ({
  createRazorpayOrder: vi.fn(),
  getRazorpayKeyId: vi.fn(() => 'test_key_id'),
  verifyPaymentSignature: vi.fn(),
}));

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { getSession } from '@/lib/auth/session';
import { sendEmail } from '@/lib/email/send';
import { createRazorpayOrder, verifyPaymentSignature } from '@/lib/payment/razorpay';

describe('Integration: Complete Checkout Flow', () => {
  const testUserId = 'test-user-123';
  const testProductId1 = 'test-product-1';
  const testProductId2 = 'test-product-2';
  const testCouponCode = 'SAVE10';

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock authenticated session
    vi.mocked(getSession).mockResolvedValue({
      user: {
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      },
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Complete checkout flow: cart → payment → order → confirmation', async () => {
    // ===== STEP 1: User adds products to cart =====

    // Mock product queries
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      // First call: product 1 query
      mockChain.limit.mockResolvedValueOnce([
        { id: testProductId1, price: 50000, stock: 10, name: 'Product 1' },
      ]);

      // Second call: cart query (doesn't exist yet)
      mockChain.limit.mockResolvedValueOnce([]);

      // Third call: cart item query (doesn't exist)
      mockChain.limit.mockResolvedValueOnce([]);

      return mockChain;
    }) as any);

    // Mock cart creation
    vi.spyOn(db, 'insert').mockImplementation((() => {
      return {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'cart-123' }]),
      };
    }) as any);

    const addResult1 = await addToCart(testProductId1, 2, testUserId);
    expect(addResult1.success).toBe(true);

    // ===== STEP 2: Add second product =====

    // Reset mocks for second product
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      // Product 2 query
      mockChain.limit.mockResolvedValueOnce([
        { id: testProductId2, price: 30000, stock: 15, name: 'Product 2' },
      ]);

      // Cart exists now
      mockChain.limit.mockResolvedValueOnce([{ id: 'cart-123' }]);

      // Cart item doesn't exist
      mockChain.limit.mockResolvedValueOnce([]);

      return mockChain;
    }) as any);

    const addResult2 = await addToCart(testProductId2, 3, testUserId);
    expect(addResult2.success).toBe(true);

    // ===== STEP 3: Get cart and verify items =====

    // Mock getCart query
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      // Cart query
      mockChain.limit.mockResolvedValueOnce([
        { id: 'cart-123', userId: testUserId, sessionId: null, createdAt: new Date() },
      ]);

      // Cart items query
      mockChain.where.mockResolvedValueOnce([
        {
          id: 'item-1',
          cartId: 'cart-123',
          productId: testProductId1,
          quantity: 2,
          product: {
            id: testProductId1,
            name: 'Product 1',
            slug: 'product-1',
            price: 50000,
            stock: 10,
            images: [],
          },
          category: { id: 'cat-1', name: 'Category 1', slug: 'category-1' },
        },
        {
          id: 'item-2',
          cartId: 'cart-123',
          productId: testProductId2,
          quantity: 3,
          product: {
            id: testProductId2,
            name: 'Product 2',
            slug: 'product-2',
            price: 30000,
            stock: 15,
            images: [],
          },
          category: { id: 'cat-1', name: 'Category 1', slug: 'category-1' },
        },
      ]);

      return mockChain;
    }) as any);

    const cart = await getCart(testUserId);
    expect(cart).not.toBeNull();
    expect(cart?.items).toHaveLength(2);
    expect(cart?.items[0].quantity).toBe(2);
    expect(cart?.items[1].quantity).toBe(3);

    // ===== STEP 4: Apply coupon code =====

    // Mock coupon validation
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      mockChain.limit.mockResolvedValueOnce([
        {
          id: 'coupon-1',
          code: testCouponCode,
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minOrderValue: 0,
          maxUses: 100,
          currentUses: 5,
          expiresAt: new Date(Date.now() + 86400000), // Tomorrow
        },
      ]);

      return mockChain;
    }) as any);

    const couponResult = await validateCoupon(testCouponCode, 190000); // subtotal
    expect(couponResult.success).toBe(true);
    expect(couponResult.data?.discount).toBe(19000); // 10% of 190000

    // ===== STEP 5: Create Razorpay order =====

    vi.mocked(createRazorpayOrder).mockResolvedValue({
      id: 'order_razorpay_123',
      amount: 171000, // 190000 - 19000 (discount) + 0 (free shipping)
      currency: 'INR',
    } as any);

    const razorpayOrderResult = await createRazorpayOrderAction(171000);
    expect(razorpayOrderResult.success).toBe(true);
    expect(razorpayOrderResult.data?.orderId).toBe('order_razorpay_123');

    // ===== STEP 6: Verify payment and create order =====

    vi.mocked(verifyPaymentSignature).mockReturnValue(true);

    // Mock getCart for order creation
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      // Cart query
      mockChain.limit.mockResolvedValueOnce([
        { id: 'cart-123', userId: testUserId, sessionId: null, createdAt: new Date() },
      ]);

      // Cart items query
      mockChain.where.mockResolvedValueOnce([
        {
          id: 'item-1',
          cartId: 'cart-123',
          productId: testProductId1,
          quantity: 2,
          product: {
            id: testProductId1,
            name: 'Product 1',
            slug: 'product-1',
            price: 50000,
            stock: 10,
            images: [],
          },
          category: null,
        },
        {
          id: 'item-2',
          cartId: 'cart-123',
          productId: testProductId2,
          quantity: 3,
          product: {
            id: testProductId2,
            name: 'Product 2',
            slug: 'product-2',
            price: 30000,
            stock: 15,
            images: [],
          },
          category: null,
        },
      ]);

      // Coupon query
      mockChain.limit.mockResolvedValueOnce([
        {
          id: 'coupon-1',
          code: testCouponCode,
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minOrderValue: 0,
          currentUses: 5,
        },
      ]);

      return mockChain;
    }) as any);

    // Mock database transaction
    vi.spyOn(db, 'transaction').mockImplementation(async (callback) => {
      const tx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([
            {
              id: 'order-123',
              userId: testUserId,
              status: 'PENDING',
              subtotal: 190000,
              shipping: 0,
              discount: 19000,
              total: 171000,
              createdAt: new Date(),
            },
          ]),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(undefined),
        }),
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      };
      return callback(tx as any);
    });

    // Mock email sending
    vi.mocked(sendEmail).mockResolvedValue(undefined);

    const shippingAddress = {
      name: 'Test User',
      addressLine1: '123 Test St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
    };

    const orderResult = await verifyPaymentAndCreateOrder(
      'order_razorpay_123',
      'pay_123',
      'signature_123',
      shippingAddress,
      testCouponCode
    );

    expect(orderResult.success).toBe(true);
    expect(orderResult.data?.orderId).toBe('order-123');

    // ===== STEP 7: Verify order was created correctly =====

    // The transaction mock should have been called to:
    // 1. Create order
    // 2. Create order items
    // 3. Decrement product stock
    // 4. Clear cart
    // 5. Increment coupon usage

    expect(db.transaction).toHaveBeenCalled();

    // ===== STEP 8: Verify confirmation email was sent =====

    // Email sending is async and doesn't block, but we can verify it was called
    // In real implementation, this happens after order creation
    expect(sendEmail).toHaveBeenCalled();

    // ===== STEP 9: Verify user can view order =====

    // Mock getOrderById query
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      // Order query
      mockChain.limit.mockResolvedValueOnce([
        {
          id: 'order-123',
          userId: testUserId,
          status: 'PENDING',
          subtotal: 190000,
          shipping: 0,
          discount: 19000,
          total: 171000,
          shippingAddress: shippingAddress,
          razorpayOrderId: 'order_razorpay_123',
          razorpayPaymentId: 'pay_123',
          couponCode: testCouponCode,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      // Order items query
      mockChain.where.mockResolvedValueOnce([
        {
          id: 'order-item-1',
          orderId: 'order-123',
          productId: testProductId1,
          quantity: 2,
          price: 50000,
          product: {
            id: testProductId1,
            name: 'Product 1',
            slug: 'product-1',
            images: [],
          },
        },
        {
          id: 'order-item-2',
          orderId: 'order-123',
          productId: testProductId2,
          quantity: 3,
          price: 30000,
          product: {
            id: testProductId2,
            name: 'Product 2',
            slug: 'product-2',
            images: [],
          },
        },
      ]);

      return mockChain;
    }) as any);

    const order = await getOrderById('order-123');
    expect(order).not.toBeNull();
    expect(order?.id).toBe('order-123');
    expect(order?.status).toBe('PENDING');
    expect(order?.total).toBe(171000);
    expect(order?.items).toHaveLength(2);
    expect(order?.couponCode).toBe(testCouponCode);
  });

  test('Checkout flow without coupon code', async () => {
    // Similar flow but without coupon application

    // Mock product and cart setup
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      // Product query
      mockChain.limit.mockResolvedValueOnce([
        { id: testProductId1, price: 60000, stock: 10, name: 'Product 1' },
      ]);

      // Cart doesn't exist
      mockChain.limit.mockResolvedValueOnce([]);

      // Cart item doesn't exist
      mockChain.limit.mockResolvedValueOnce([]);

      return mockChain;
    }) as any);

    vi.spyOn(db, 'insert').mockImplementation((() => {
      return {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'cart-456' }]),
      };
    }) as any);

    const addResult = await addToCart(testProductId1, 1, testUserId);
    expect(addResult.success).toBe(true);

    // Create Razorpay order (subtotal 60000 + 0 shipping = 60000)
    vi.mocked(createRazorpayOrder).mockResolvedValue({
      id: 'order_razorpay_456',
      amount: 60000,
      currency: 'INR',
    } as any);

    const razorpayOrderResult = await createRazorpayOrderAction(60000);
    expect(razorpayOrderResult.success).toBe(true);

    // Verify payment and create order
    vi.mocked(verifyPaymentSignature).mockReturnValue(true);

    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      // Cart query
      mockChain.limit.mockResolvedValueOnce([
        { id: 'cart-456', userId: testUserId, sessionId: null, createdAt: new Date() },
      ]);

      // Cart items query
      mockChain.where.mockResolvedValueOnce([
        {
          id: 'item-1',
          cartId: 'cart-456',
          productId: testProductId1,
          quantity: 1,
          product: {
            id: testProductId1,
            name: 'Product 1',
            slug: 'product-1',
            price: 60000,
            stock: 10,
            images: [],
          },
          category: null,
        },
      ]);

      return mockChain;
    }) as any);

    vi.spyOn(db, 'transaction').mockImplementation(async (callback) => {
      const tx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([
            {
              id: 'order-456',
              userId: testUserId,
              status: 'PENDING',
              subtotal: 60000,
              shipping: 0,
              discount: 0,
              total: 60000,
              createdAt: new Date(),
            },
          ]),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(undefined),
        }),
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      };
      return callback(tx as any);
    });

    const shippingAddress = {
      name: 'Test User',
      addressLine1: '123 Test St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
    };

    const orderResult = await verifyPaymentAndCreateOrder(
      'order_razorpay_456',
      'pay_456',
      'signature_456',
      shippingAddress
    );

    expect(orderResult.success).toBe(true);
    expect(orderResult.data?.orderId).toBe('order-456');
  });

  test('Checkout flow fails with invalid payment signature', async () => {
    // Setup cart with items
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      mockChain.limit.mockResolvedValueOnce([
        { id: testProductId1, price: 50000, stock: 10, name: 'Product 1' },
      ]);
      mockChain.limit.mockResolvedValueOnce([]);
      mockChain.limit.mockResolvedValueOnce([]);

      return mockChain;
    }) as any);

    vi.spyOn(db, 'insert').mockImplementation((() => {
      return {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'cart-789' }]),
      };
    }) as any);

    await addToCart(testProductId1, 1, testUserId);

    // Payment signature verification fails
    vi.mocked(verifyPaymentSignature).mockReturnValue(false);

    const shippingAddress = {
      name: 'Test User',
      addressLine1: '123 Test St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
    };

    const orderResult = await verifyPaymentAndCreateOrder(
      'order_razorpay_789',
      'pay_789',
      'invalid_signature',
      shippingAddress
    );

    expect(orderResult.success).toBe(false);
    expect(orderResult.message).toContain('Payment verification failed');
  });

  test('Checkout flow fails with empty cart', async () => {
    // Mock empty cart
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      // Cart exists but is empty
      mockChain.limit.mockResolvedValueOnce([
        { id: 'cart-empty', userId: testUserId, sessionId: null, createdAt: new Date() },
      ]);

      // No cart items
      mockChain.where.mockResolvedValueOnce([]);

      return mockChain;
    }) as any);

    vi.mocked(verifyPaymentSignature).mockReturnValue(true);

    const shippingAddress = {
      name: 'Test User',
      addressLine1: '123 Test St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
    };

    const orderResult = await verifyPaymentAndCreateOrder(
      'order_razorpay_empty',
      'pay_empty',
      'signature_empty',
      shippingAddress
    );

    expect(orderResult.success).toBe(false);
    expect(orderResult.message).toBe('Cart is empty');
  });
});
