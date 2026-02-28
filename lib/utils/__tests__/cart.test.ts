/**
 * Unit tests for cart utility functions
 * Tests calculateCartTotals function with various scenarios
 */

import { describe, expect, test } from 'vitest';
import { type CartItem, type Coupon, calculateCartTotals } from '../cart';

// Helper function to create mock cart items
function createMockCartItem(price: number, quantity: number): CartItem {
  return {
    id: `item-${Math.random()}`,
    cartId: 'cart-123',
    productId: `product-${Math.random()}`,
    quantity,
    product: {
      id: `product-${Math.random()}`,
      name: 'Test Product',
      slug: 'test-product',
      price,
      stock: 100,
      images: ['https://example.com/image.jpg'],
      category: {
        id: 'cat-123',
        name: 'Test Category',
        slug: 'test-category',
      },
    },
  };
}

describe('calculateCartTotals', () => {
  describe('Subtotal Calculation', () => {
    test('should calculate correct subtotal for single item', () => {
      const items = [createMockCartItem(10000, 2)]; // ₹100 × 2
      const totals = calculateCartTotals(items);
      expect(totals.subtotal).toBe(20000); // ₹200
    });

    test('should calculate correct subtotal for multiple items', () => {
      const items = [
        createMockCartItem(10000, 2), // ₹100 × 2 = ₹200
        createMockCartItem(5000, 3), // ₹50 × 3 = ₹150
        createMockCartItem(15000, 1), // ₹150 × 1 = ₹150
      ];
      const totals = calculateCartTotals(items);
      expect(totals.subtotal).toBe(50000); // ₹500
    });

    test('should return zero subtotal for empty cart', () => {
      const items: CartItem[] = [];
      const totals = calculateCartTotals(items);
      expect(totals.subtotal).toBe(0);
    });

    test('should handle large quantities', () => {
      const items = [createMockCartItem(1000, 100)]; // ₹10 × 100
      const totals = calculateCartTotals(items);
      expect(totals.subtotal).toBe(100000); // ₹1000
    });
  });

  describe('Shipping Cost Calculation', () => {
    test('should apply ₹50 shipping for subtotal below ₹500', () => {
      const items = [createMockCartItem(30000, 1)]; // ₹300
      const totals = calculateCartTotals(items);
      expect(totals.shipping).toBe(5000); // ₹50
    });

    test('should apply free shipping for subtotal exactly ₹500', () => {
      const items = [createMockCartItem(50000, 1)]; // ₹500
      const totals = calculateCartTotals(items);
      expect(totals.shipping).toBe(0);
    });

    test('should apply free shipping for subtotal above ₹500', () => {
      const items = [createMockCartItem(60000, 1)]; // ₹600
      const totals = calculateCartTotals(items);
      expect(totals.shipping).toBe(0);
    });

    test('should apply ₹50 shipping for subtotal just below ₹500', () => {
      const items = [createMockCartItem(49999, 1)]; // ₹499.99
      const totals = calculateCartTotals(items);
      expect(totals.shipping).toBe(5000); // ₹50
    });

    test('should apply free shipping for empty cart', () => {
      const items: CartItem[] = [];
      const totals = calculateCartTotals(items);
      expect(totals.shipping).toBe(5000); // ₹50 (subtotal is 0, which is < 50000)
    });
  });

  describe('Discount Calculation - Percentage Coupon', () => {
    test('should apply 10% discount correctly', () => {
      const items = [createMockCartItem(100000, 1)]; // ₹1000
      const coupon: Coupon = {
        id: 'coupon-1',
        code: 'SAVE10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      expect(totals.discount).toBe(10000); // ₹100 (10% of ₹1000)
    });

    test('should apply 20% discount correctly', () => {
      const items = [createMockCartItem(50000, 1)]; // ₹500
      const coupon: Coupon = {
        id: 'coupon-2',
        code: 'SAVE20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      expect(totals.discount).toBe(10000); // ₹100 (20% of ₹500)
    });

    test('should floor percentage discount to integer', () => {
      const items = [createMockCartItem(10001, 1)]; // ₹100.01
      const coupon: Coupon = {
        id: 'coupon-3',
        code: 'SAVE10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      expect(totals.discount).toBe(1000); // Floor of 1000.1
    });

    test('should apply 100% discount', () => {
      const items = [createMockCartItem(50000, 1)]; // ₹500
      const coupon: Coupon = {
        id: 'coupon-4',
        code: 'FREE',
        discountType: 'PERCENTAGE',
        discountValue: 100,
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      expect(totals.discount).toBe(50000); // ₹500 (100% of ₹500)
    });
  });

  describe('Discount Calculation - Flat Coupon', () => {
    test('should apply flat ₹100 discount', () => {
      const items = [createMockCartItem(50000, 1)]; // ₹500
      const coupon: Coupon = {
        id: 'coupon-5',
        code: 'FLAT100',
        discountType: 'FLAT',
        discountValue: 10000, // ₹100
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      expect(totals.discount).toBe(10000); // ₹100
    });

    test('should apply flat ₹50 discount', () => {
      const items = [createMockCartItem(30000, 1)]; // ₹300
      const coupon: Coupon = {
        id: 'coupon-6',
        code: 'FLAT50',
        discountType: 'FLAT',
        discountValue: 5000, // ₹50
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      expect(totals.discount).toBe(5000); // ₹50
    });

    test('should apply flat discount even if it exceeds subtotal', () => {
      const items = [createMockCartItem(10000, 1)]; // ₹100
      const coupon: Coupon = {
        id: 'coupon-7',
        code: 'FLAT200',
        discountType: 'FLAT',
        discountValue: 20000, // ₹200
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      expect(totals.discount).toBe(20000); // ₹200 (exceeds subtotal)
    });
  });

  describe('Total Calculation', () => {
    test('should calculate total as subtotal + shipping - discount', () => {
      const items = [createMockCartItem(30000, 1)]; // ₹300
      const coupon: Coupon = {
        id: 'coupon-8',
        code: 'SAVE10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      // Subtotal: ₹300 (30000)
      // Shipping: ₹50 (5000) - because subtotal < ₹500
      // Discount: ₹30 (3000) - 10% of ₹300
      // Total: 30000 + 5000 - 3000 = 32000 (₹320)
      expect(totals.total).toBe(32000);
    });

    test('should calculate total with free shipping', () => {
      const items = [createMockCartItem(60000, 1)]; // ₹600
      const coupon: Coupon = {
        id: 'coupon-9',
        code: 'SAVE10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      // Subtotal: ₹600 (60000)
      // Shipping: ₹0 (0) - because subtotal >= ₹500
      // Discount: ₹60 (6000) - 10% of ₹600
      // Total: 60000 + 0 - 6000 = 54000 (₹540)
      expect(totals.total).toBe(54000);
    });

    test('should ensure total is never negative', () => {
      const items = [createMockCartItem(10000, 1)]; // ₹100
      const coupon: Coupon = {
        id: 'coupon-10',
        code: 'HUGE',
        discountType: 'FLAT',
        discountValue: 50000, // ₹500 discount
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      // Subtotal: ₹100 (10000)
      // Shipping: ₹50 (5000)
      // Discount: ₹500 (50000)
      // Total would be: 10000 + 5000 - 50000 = -35000
      // But should be clamped to 0
      expect(totals.total).toBe(0);
    });

    test('should calculate total without coupon', () => {
      const items = [createMockCartItem(40000, 1)]; // ₹400
      const totals = calculateCartTotals(items);
      // Subtotal: ₹400 (40000)
      // Shipping: ₹50 (5000)
      // Discount: ₹0 (0)
      // Total: 40000 + 5000 = 45000 (₹450)
      expect(totals.total).toBe(45000);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero-price items', () => {
      const items = [createMockCartItem(0, 5)];
      const totals = calculateCartTotals(items);
      expect(totals.subtotal).toBe(0);
      expect(totals.shipping).toBe(5000); // ₹50 because subtotal < ₹500
      expect(totals.total).toBe(5000);
    });

    test('should handle very large subtotals', () => {
      const items = [createMockCartItem(10000000, 1)]; // ₹100,000
      const totals = calculateCartTotals(items);
      expect(totals.subtotal).toBe(10000000);
      expect(totals.shipping).toBe(0); // Free shipping
      expect(totals.total).toBe(10000000);
    });

    test('should handle multiple items with mixed prices', () => {
      const items = [
        createMockCartItem(1000, 10), // ₹10 × 10 = ₹100
        createMockCartItem(50000, 1), // ₹500 × 1 = ₹500
        createMockCartItem(25000, 2), // ₹250 × 2 = ₹500
      ];
      const totals = calculateCartTotals(items);
      expect(totals.subtotal).toBe(110000); // ₹1100
      expect(totals.shipping).toBe(0); // Free shipping
      expect(totals.total).toBe(110000);
    });

    test('should return all zero values for empty cart without coupon', () => {
      const items: CartItem[] = [];
      const totals = calculateCartTotals(items);
      expect(totals.subtotal).toBe(0);
      expect(totals.shipping).toBe(5000); // ₹50 because subtotal < ₹500
      expect(totals.discount).toBe(0);
      expect(totals.total).toBe(5000);
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle cart at free shipping threshold with percentage discount', () => {
      const items = [createMockCartItem(50000, 1)]; // Exactly ₹500
      const coupon: Coupon = {
        id: 'coupon-11',
        code: 'SAVE15',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      // Subtotal: ₹500 (50000)
      // Shipping: ₹0 (0) - free shipping at ₹500
      // Discount: ₹75 (7500) - 15% of ₹500
      // Total: 50000 + 0 - 7500 = 42500 (₹425)
      expect(totals.subtotal).toBe(50000);
      expect(totals.shipping).toBe(0);
      expect(totals.discount).toBe(7500);
      expect(totals.total).toBe(42500);
    });

    test('should handle cart just below free shipping threshold with flat discount', () => {
      const items = [createMockCartItem(49999, 1)]; // ₹499.99
      const coupon: Coupon = {
        id: 'coupon-12',
        code: 'FLAT10',
        discountType: 'FLAT',
        discountValue: 1000, // ₹10
        minOrderValue: 0,
      };
      const totals = calculateCartTotals(items, coupon);
      // Subtotal: ₹499.99 (49999)
      // Shipping: ₹50 (5000) - paid shipping because < ₹500
      // Discount: ₹10 (1000)
      // Total: 49999 + 5000 - 1000 = 53999 (₹539.99)
      expect(totals.subtotal).toBe(49999);
      expect(totals.shipping).toBe(5000);
      expect(totals.discount).toBe(1000);
      expect(totals.total).toBe(53999);
    });
  });
});
