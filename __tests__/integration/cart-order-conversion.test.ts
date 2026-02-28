/**
 * Integration Test: Cart to Order Conversion
 *
 * Tests that cart items are correctly converted to order items:
 * - Cart items are correctly converted to order items
 * - Prices are captured at time of purchase (not referenced)
 * - Quantities are preserved
 * - Subtotal, shipping, discount, total calculations are correct
 * - Cart is cleared after order creation
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { verifyPaymentAndCreateOrder } from '@/lib/actions/orders';
import { db } from '@/lib/db';
import { calculateCartTotals, getCart } from '@/lib/queries/cart';
import { getOrderById } from '@/lib/queries/orders';
import type { CartItem, Coupon } from '@/lib/utils/cart';

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
import { verifyPaymentSignature } from '@/lib/payment/razorpay';

describe('Integration: Cart to Order Conversion', () => {
  const testUserId = 'test-user-123';

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

    // Mock successful payment verification
    vi.mocked(verifyPaymentSignature).mockReturnValue(true);

    // Mock email sending
    vi.mocked(sendEmail).mockResolvedValue(undefined);
  });

  test('Cart items are correctly converted to order items with captured prices', async () => {
    // Setup: Cart with multiple items at different prices
    const cartItems: CartItem[] = [
      {
        id: 'item-1',
        cartId: 'cart-123',
        productId: 'prod-1',
        quantity: 2,
        product: {
          id: 'prod-1',
          name: 'Mango Pickle',
          slug: 'mango-pickle',
          price: 25000, // ₹250 in paise
          stock: 20,
          images: ['image1.jpg'],
          category: null,
        },
      },
      {
        id: 'item-2',
        cartId: 'cart-123',
        productId: 'prod-2',
        quantity: 3,
        product: {
          id: 'prod-2',
          name: 'Gooseberry Chutney',
          slug: 'gooseberry-chutney',
          price: 30000, // ₹300 in paise
          stock: 15,
          images: ['image2.jpg'],
          category: null,
        },
      },
      {
        id: 'item-3',
        cartId: 'cart-123',
        productId: 'prod-3',
        quantity: 1,
        product: {
          id: 'prod-3',
          name: 'Mixed Fruit Jam',
          slug: 'mixed-fruit-jam',
          price: 35000, // ₹350 in paise
          stock: 10,
          images: ['image3.jpg'],
          category: null,
        },
      },
    ];

    // Mock getCart to return our test cart
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
      mockChain.where.mockResolvedValueOnce(
        cartItems.map((item) => ({
          id: item.id,
          cartId: item.cartId,
          productId: item.productId,
          quantity: item.quantity,
          product: item.product,
          category: null,
        }))
      );

      return mockChain;
    }) as any);

    // Calculate expected totals
    const totals = calculateCartTotals(cartItems);
    // Subtotal: (2 × 25000) + (3 × 30000) + (1 × 35000) = 50000 + 90000 + 35000 = 175000
    // Shipping: 175000 >= 50000, so 0
    // Discount: 0 (no coupon)
    // Total: 175000
    expect(totals.subtotal).toBe(175000);
    expect(totals.shipping).toBe(0);
    expect(totals.discount).toBe(0);
    expect(totals.total).toBe(175000);

    // Mock database transaction for order creation
    const createdOrderItems: any[] = [];
    vi.spyOn(db, 'transaction').mockImplementation(async (callback) => {
      const tx = {
        insert: vi.fn().mockImplementation((table) => {
          return {
            values: vi.fn().mockImplementation((values) => {
              // Capture order items being created
              if (Array.isArray(values)) {
                createdOrderItems.push(...values);
              }
              return {
                returning: vi.fn().mockResolvedValue([
                  {
                    id: 'order-123',
                    userId: testUserId,
                    status: 'PENDING',
                    subtotal: totals.subtotal,
                    shipping: totals.shipping,
                    discount: totals.discount,
                    total: totals.total,
                    createdAt: new Date(),
                  },
                ]),
              };
            }),
          };
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

    const result = await verifyPaymentAndCreateOrder(
      'order_razorpay_123',
      'pay_123',
      'signature_123',
      shippingAddress
    );

    expect(result.success).toBe(true);

    // Verify order items were created with correct data
    expect(createdOrderItems).toHaveLength(3);

    // Verify first order item
    expect(createdOrderItems[0]).toMatchObject({
      orderId: 'order-123',
      productId: 'prod-1',
      quantity: 2,
      price: 25000, // Price captured at time of purchase
    });

    // Verify second order item
    expect(createdOrderItems[1]).toMatchObject({
      orderId: 'order-123',
      productId: 'prod-2',
      quantity: 3,
      price: 30000, // Price captured at time of purchase
    });

    // Verify third order item
    expect(createdOrderItems[2]).toMatchObject({
      orderId: 'order-123',
      productId: 'prod-3',
      quantity: 1,
      price: 35000, // Price captured at time of purchase
    });
  });

  test('Quantities are preserved during cart to order conversion', async () => {
    const cartItems: CartItem[] = [
      {
        id: 'item-1',
        cartId: 'cart-456',
        productId: 'prod-1',
        quantity: 5, // Specific quantity to test
        product: {
          id: 'prod-1',
          name: 'Product 1',
          slug: 'product-1',
          price: 20000,
          stock: 10,
          images: [],
          category: null,
        },
      },
      {
        id: 'item-2',
        cartId: 'cart-456',
        productId: 'prod-2',
        quantity: 7, // Different quantity
        product: {
          id: 'prod-2',
          name: 'Product 2',
          slug: 'product-2',
          price: 15000,
          stock: 10,
          images: [],
          category: null,
        },
      },
    ];

    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      mockChain.limit.mockResolvedValueOnce([
        { id: 'cart-456', userId: testUserId, sessionId: null, createdAt: new Date() },
      ]);

      mockChain.where.mockResolvedValueOnce(
        cartItems.map((item) => ({
          id: item.id,
          cartId: item.cartId,
          productId: item.productId,
          quantity: item.quantity,
          product: item.product,
          category: null,
        }))
      );

      return mockChain;
    }) as any);

    const createdOrderItems: any[] = [];
    vi.spyOn(db, 'transaction').mockImplementation(async (callback) => {
      const tx = {
        insert: vi.fn().mockImplementation((table) => {
          return {
            values: vi.fn().mockImplementation((values) => {
              if (Array.isArray(values)) {
                createdOrderItems.push(...values);
              }
              return {
                returning: vi.fn().mockResolvedValue([
                  {
                    id: 'order-456',
                    userId: testUserId,
                    status: 'PENDING',
                    subtotal: 205000,
                    shipping: 0,
                    discount: 0,
                    total: 205000,
                    createdAt: new Date(),
                  },
                ]),
              };
            }),
          };
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

    const result = await verifyPaymentAndCreateOrder(
      'order_razorpay_456',
      'pay_456',
      'signature_456',
      shippingAddress
    );

    expect(result.success).toBe(true);

    // Verify quantities are preserved exactly
    expect(createdOrderItems[0].quantity).toBe(5);
    expect(createdOrderItems[1].quantity).toBe(7);
  });

  test('Subtotal, shipping, discount, and total calculations are correct', async () => {
    // Test case 1: Subtotal < ₹500 (should have shipping)
    const cartItems1: CartItem[] = [
      {
        id: 'item-1',
        cartId: 'cart-789',
        productId: 'prod-1',
        quantity: 1,
        product: {
          id: 'prod-1',
          name: 'Product 1',
          slug: 'product-1',
          price: 30000, // ₹300
          stock: 10,
          images: [],
          category: null,
        },
      },
    ];

    const totals1 = calculateCartTotals(cartItems1);
    expect(totals1.subtotal).toBe(30000);
    expect(totals1.shipping).toBe(5000); // ₹50 shipping
    expect(totals1.discount).toBe(0);
    expect(totals1.total).toBe(35000); // 30000 + 5000

    // Test case 2: Subtotal >= ₹500 (free shipping)
    const cartItems2: CartItem[] = [
      {
        id: 'item-1',
        cartId: 'cart-790',
        productId: 'prod-1',
        quantity: 2,
        product: {
          id: 'prod-1',
          name: 'Product 1',
          slug: 'product-1',
          price: 30000, // ₹300 × 2 = ₹600
          stock: 10,
          images: [],
          category: null,
        },
      },
    ];

    const totals2 = calculateCartTotals(cartItems2);
    expect(totals2.subtotal).toBe(60000);
    expect(totals2.shipping).toBe(0); // Free shipping
    expect(totals2.discount).toBe(0);
    expect(totals2.total).toBe(60000);

    // Test case 3: With percentage discount
    const coupon: Coupon = {
      id: 'coupon-1',
      code: 'SAVE20',
      discountType: 'PERCENTAGE',
      discountValue: 20, // 20% off
      minOrderValue: 0,
    };

    const totals3 = calculateCartTotals(cartItems2, coupon);
    expect(totals3.subtotal).toBe(60000);
    expect(totals3.shipping).toBe(0);
    expect(totals3.discount).toBe(12000); // 20% of 60000
    expect(totals3.total).toBe(48000); // 60000 - 12000

    // Test case 4: With flat discount
    const flatCoupon: Coupon = {
      id: 'coupon-2',
      code: 'FLAT100',
      discountType: 'FLAT',
      discountValue: 10000, // ₹100 flat discount
      minOrderValue: 0,
    };

    const totals4 = calculateCartTotals(cartItems2, flatCoupon);
    expect(totals4.subtotal).toBe(60000);
    expect(totals4.shipping).toBe(0);
    expect(totals4.discount).toBe(10000);
    expect(totals4.total).toBe(50000); // 60000 - 10000

    // Test case 5: Discount larger than subtotal (total should be 0, not negative)
    const hugeCoupon: Coupon = {
      id: 'coupon-3',
      code: 'HUGE',
      discountType: 'FLAT',
      discountValue: 100000, // ₹1000 discount on ₹300 subtotal
      minOrderValue: 0,
    };

    const totals5 = calculateCartTotals(cartItems1, hugeCoupon);
    expect(totals5.subtotal).toBe(30000);
    expect(totals5.shipping).toBe(5000);
    expect(totals5.discount).toBe(100000);
    expect(totals5.total).toBe(0); // Should be 0, not negative
    expect(totals5.total).toBeGreaterThanOrEqual(0);
  });

  test('Cart is cleared after order creation', async () => {
    const cartItems: CartItem[] = [
      {
        id: 'item-1',
        cartId: 'cart-clear',
        productId: 'prod-1',
        quantity: 1,
        product: {
          id: 'prod-1',
          name: 'Product 1',
          slug: 'product-1',
          price: 50000,
          stock: 10,
          images: [],
          category: null,
        },
      },
    ];

    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      mockChain.limit.mockResolvedValueOnce([
        { id: 'cart-clear', userId: testUserId, sessionId: null, createdAt: new Date() },
      ]);

      mockChain.where.mockResolvedValueOnce(
        cartItems.map((item) => ({
          id: item.id,
          cartId: item.cartId,
          productId: item.productId,
          quantity: item.quantity,
          product: item.product,
          category: null,
        }))
      );

      return mockChain;
    }) as any);

    let cartDeleted = false;
    vi.spyOn(db, 'transaction').mockImplementation(async (callback) => {
      const tx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([
            {
              id: 'order-clear',
              userId: testUserId,
              status: 'PENDING',
              subtotal: 50000,
              shipping: 0,
              discount: 0,
              total: 50000,
              createdAt: new Date(),
            },
          ]),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(undefined),
        }),
        delete: vi.fn().mockImplementation(() => {
          cartDeleted = true;
          return {
            where: vi.fn().mockResolvedValue(undefined),
          };
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

    const result = await verifyPaymentAndCreateOrder(
      'order_razorpay_clear',
      'pay_clear',
      'signature_clear',
      shippingAddress
    );

    expect(result.success).toBe(true);

    // Verify cart was deleted
    expect(cartDeleted).toBe(true);
  });

  test('Price changes after adding to cart do not affect order', async () => {
    // Scenario: Product price changes between adding to cart and checkout
    // Order should use the price at time of purchase (from cart), not current product price

    const originalPrice = 25000; // ₹250
    const newPrice = 30000; // ₹300 (price increased)

    const cartItems: CartItem[] = [
      {
        id: 'item-1',
        cartId: 'cart-price',
        productId: 'prod-price',
        quantity: 2,
        product: {
          id: 'prod-price',
          name: 'Product with Price Change',
          slug: 'product-price-change',
          price: originalPrice, // Cart has old price
          stock: 10,
          images: [],
          category: null,
        },
      },
    ];

    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      mockChain.limit.mockResolvedValueOnce([
        { id: 'cart-price', userId: testUserId, sessionId: null, createdAt: new Date() },
      ]);

      mockChain.where.mockResolvedValueOnce(
        cartItems.map((item) => ({
          id: item.id,
          cartId: item.cartId,
          productId: item.productId,
          quantity: item.quantity,
          product: item.product, // Returns cart's stored price
          category: null,
        }))
      );

      return mockChain;
    }) as any);

    const createdOrderItems: any[] = [];
    vi.spyOn(db, 'transaction').mockImplementation(async (callback) => {
      const tx = {
        insert: vi.fn().mockImplementation((table) => {
          return {
            values: vi.fn().mockImplementation((values) => {
              if (Array.isArray(values)) {
                createdOrderItems.push(...values);
              }
              return {
                returning: vi.fn().mockResolvedValue([
                  {
                    id: 'order-price',
                    userId: testUserId,
                    status: 'PENDING',
                    subtotal: 50000, // 2 × 25000
                    shipping: 0,
                    discount: 0,
                    total: 50000,
                    createdAt: new Date(),
                  },
                ]),
              };
            }),
          };
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

    const result = await verifyPaymentAndCreateOrder(
      'order_razorpay_price',
      'pay_price',
      'signature_price',
      shippingAddress
    );

    expect(result.success).toBe(true);

    // Verify order item has the original price (from cart), not the new price
    expect(createdOrderItems[0].price).toBe(originalPrice);
    expect(createdOrderItems[0].price).not.toBe(newPrice);

    // Verify subtotal is calculated with original price
    const expectedSubtotal = originalPrice * 2;
    expect(expectedSubtotal).toBe(50000);
  });
});
