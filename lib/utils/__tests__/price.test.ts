import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import { formatPrice, paiseToRupees, rupeesToPaise } from '../price';

describe('Price Utilities', () => {
  /**
   * Feature: doon-farm-ecommerce, Property 1: Price Integer Storage
   * For any price value stored in the database, converting from paise to rupees
   * and back to paise shall preserve the original value.
   * Validates: Requirements 2.4, 2.10, 30.10
   */
  test('Property 1: Price round-trip preservation', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10000000 }), (paise) => {
        const rupees = paiseToRupees(paise);
        const backToPaise = rupeesToPaise(rupees);
        return backToPaise === paise;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: doon-farm-ecommerce, Property 7: Price Formatting
   * For any price value in paise, formatting the price for display shall produce
   * a string with exactly 2 decimal places and the ₹ symbol.
   * Validates: Requirements 10.14
   */
  test('Property 7: Price formatting consistency', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10000000 }), (paise) => {
        const formatted = formatPrice(paise);

        // Check that it starts with ₹
        if (!formatted.startsWith('₹')) return false;

        // Extract the numeric part
        const numericPart = formatted.substring(1);

        // Check that it has exactly 2 decimal places
        const decimalMatch = numericPart.match(/\.\d{2}$/);
        if (!decimalMatch) return false;

        // Verify the value is correct
        const expectedRupees = (paise / 100).toFixed(2);
        return numericPart === expectedRupees;
      }),
      { numRuns: 100 }
    );
  });

  // Unit tests for specific examples
  describe('formatPrice', () => {
    test('formats 0 paise correctly', () => {
      expect(formatPrice(0)).toBe('₹0.00');
    });

    test('formats 100 paise (₹1) correctly', () => {
      expect(formatPrice(100)).toBe('₹1.00');
    });

    test('formats 12345 paise (₹123.45) correctly', () => {
      expect(formatPrice(12345)).toBe('₹123.45');
    });

    test('formats 50000 paise (₹500) correctly', () => {
      expect(formatPrice(50000)).toBe('₹500.00');
    });
  });

  describe('rupeesToPaise', () => {
    test('converts 0 rupees correctly', () => {
      expect(rupeesToPaise(0)).toBe(0);
    });

    test('converts 1 rupee correctly', () => {
      expect(rupeesToPaise(1)).toBe(100);
    });

    test('converts 123.45 rupees correctly', () => {
      expect(rupeesToPaise(123.45)).toBe(12345);
    });

    test('converts 500 rupees correctly', () => {
      expect(rupeesToPaise(500)).toBe(50000);
    });

    test('rounds fractional paise correctly', () => {
      expect(rupeesToPaise(1.234)).toBe(123); // 123.4 paise rounds to 123
      expect(rupeesToPaise(1.235)).toBe(124); // 123.5 paise rounds to 124
    });
  });

  describe('paiseToRupees', () => {
    test('converts 0 paise correctly', () => {
      expect(paiseToRupees(0)).toBe(0);
    });

    test('converts 100 paise correctly', () => {
      expect(paiseToRupees(100)).toBe(1);
    });

    test('converts 12345 paise correctly', () => {
      expect(paiseToRupees(12345)).toBe(123.45);
    });

    test('converts 50000 paise correctly', () => {
      expect(paiseToRupees(50000)).toBe(500);
    });
  });
});
