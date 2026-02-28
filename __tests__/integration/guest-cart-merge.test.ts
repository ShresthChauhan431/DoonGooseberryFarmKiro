/**
 * Integration Test: Guest to User Cart Merge
 *
 * Tests the cart merge functionality when a guest logs in or registers:
 * - Guest adds items to cart (session-based)
 * - Guest logs in or registers
 * - Guest cart is merged with user cart
 * - Duplicate products have quantities combined
 * - Guest cart is deleted after merge
 * - User cart contains all items
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { addToCart, mergeCart } from '@/lib/actions/cart';
import { db } from '@/lib/db';
import { getCart } from '@/lib/queries/cart';

// Mock dependencies
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';

describe('Integration: Guest to User Cart Merge', () => {
  const guestSessionId = 'guest-session-123';
  const userId = 'user-456';
  const productId1 = 'prod-1';
  const productId2 = 'prod-2';
  const productId3 = 'prod-3';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Guest cart is merged with empty user cart', async () => {
    // Step 1: Guest adds items to cart (session-based)
    vi.mocked(getSession).mockResolvedValue(null); // Not authenticated

    // Mock product queries for guest cart
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      // Product 1 query
      mockChain.limit.mockResolvedValueOnce([
        { id: productId1, price: 25000, stock: 20, name: 'Product 1' },
      ]);

      // Guest cart doesn't exist yet
      mockChain.limit.mockResolvedValueOnce([]);

      // Cart item doesn't exist
      mockChain.limit.mockResolvedValueOnce([]);

      return mockChain;
    }) as any);

    vi.spyOn(db, 'insert').mockImplementation((() => {
      return {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'guest-cart-123' }]),
      };
    }) as any);

    const addResult1 = await addToCart(productId1, 2, undefined, guestSessionId);
    expect(addResult1.success).toBe(true);

    // Add second product to guest cart
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
      };

      mockChain.limit.mockResolvedValueOnce([
        { id: productId2, price: 30000, stock: 15, name: 'Product 2' },
      ]);

      mockChain.limit.mockResolvedValueOnce([{ id: 'guest-cart-123' }]);

      mockChain.limit.mockResolvedValueOnce([]);

      return mockChain;
    }) as any);

    const addResult2 = await addToCart(productId2, 3, undefined, guestSessionId);
    expect(addResult2.success).toBe(true);

    // Step 2: Guest logs in
    vi.mocked(getSession).mockResolvedValue({
      user: {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
      },
    } as any);

    // Step 3: Merge guest cart with user cart
    // Mock queries for merge operation
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      // Guest cart query
      mockChain.limit.mockResolvedValueOnce([{ id: 'guest-cart-123' }]);

      // Guest cart items query
      mockChain.where.mockResolvedValueOnce([
        { id: 'guest-item-1', productId: productId1, quantity: 2 },
        { id: 'guest-item-2', productId: productId2, quantity: 3 },
      ]);

      // User cart query (empty)
      mockChain.limit.mockResolvedValueOnce([]);

      return mockChain;
    }) as any);

    // Mock cart creation for user
    vi.spyOn(db, 'insert').mockImplementation((() => {
      return {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'user-cart-456' }]),
      };
    }) as any);

    // Mock user cart items query (empty)
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      mockChain.where.mockResolvedValueOnce([]);

      // Product stock queries
      mockChain.limit.mockResolvedValue([{ id: productId1, stock: 20 }]);

      return mockChain;
    }) as any);

    // Mock delete guest cart
    vi.spyOn(db, 'delete').mockImplementation((() => {
      return {
        where: vi.fn().mockResolvedValue(undefined),
      };
    }) as any);

    await mergeCart(guestSessionId, userId);

    // Verify revalidatePath was called
    expect(revalidatePath).toHaveBeenCalledWith('/cart');

    // Verify guest cart was deleted
    expect(db.delete).toHaveBeenCalled();
  });

  test('Guest cart is merged with existing user cart - no duplicates', async () => {
    // Scenario: Guest has items A and B, User has item C
    // After merge: User cart should have A, B, and C

    // Mock guest cart query
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      // Guest cart exists
      mockChain.limit.mockResolvedValueOnce([{ id: 'guest-cart-789' }]);

      // Guest cart items (products 1 and 2)
      mockChain.where.mockResolvedValueOnce([
        { id: 'guest-item-1', productId: productId1, quantity: 2 },
        { id: 'guest-item-2', productId: productId2, quantity: 1 },
      ]);

      // User cart exists
      mockChain.limit.mockResolvedValueOnce([{ id: 'user-cart-789' }]);

      // User cart items (product 3)
      mockChain.where.mockResolvedValueOnce([
        { id: 'user-item-1', productId: productId3, quantity: 3 },
      ]);

      // Product stock queries
      mockChain.limit.mockResolvedValue([{ id: productId1, stock: 20 }]);

      return mockChain;
    }) as any);

    // Mock insert for new cart items
    vi.spyOn(db, 'insert').mockImplementation((() => {
      return {
        values: vi.fn().mockResolvedValue(undefined),
      };
    }) as any);

    // Mock delete guest cart
    vi.spyOn(db, 'delete').mockImplementation((() => {
      return {
        where: vi.fn().mockResolvedValue(undefined),
      };
    }) as any);

    await mergeCart(guestSessionId, userId);

    // Verify insert was called to add guest items to user cart
    expect(db.insert).toHaveBeenCalled();

    // Verify guest cart was deleted
    expect(db.delete).toHaveBeenCalled();

    expect(revalidatePath).toHaveBeenCalledWith('/cart');
  });

  test('Guest cart is merged with user cart - duplicate products have quantities combined', async () => {
    // Scenario: Guest has 2 of product A, User has 3 of product A
    // After merge: User cart should have 5 of product A (combined)

    // Mock guest cart query
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      // Guest cart exists
      mockChain.limit.mockResolvedValueOnce([{ id: 'guest-cart-dup' }]);

      // Guest cart items (product 1 with quantity 2)
      mockChain.where.mockResolvedValueOnce([
        { id: 'guest-item-1', productId: productId1, quantity: 2 },
      ]);

      // User cart exists
      mockChain.limit.mockResolvedValueOnce([{ id: 'user-cart-dup' }]);

      // User cart items (product 1 with quantity 3)
      mockChain.where.mockResolvedValueOnce([
        { id: 'user-item-1', productId: productId1, quantity: 3 },
      ]);

      // Product stock query
      mockChain.limit.mockResolvedValue([{ id: productId1, stock: 20 }]);

      return mockChain;
    }) as any);

    // Mock update for existing cart item
    let updatedQuantity = 0;
    vi.spyOn(db, 'update').mockImplementation((() => {
      return {
        set: vi.fn().mockImplementation((values: any) => {
          updatedQuantity = values.quantity;
          return {
            where: vi.fn().mockResolvedValue(undefined),
          };
        }),
      };
    }) as any);

    // Mock delete guest cart
    vi.spyOn(db, 'delete').mockImplementation((() => {
      return {
        where: vi.fn().mockResolvedValue(undefined),
      };
    }) as any);

    await mergeCart(guestSessionId, userId);

    // Verify update was called to increment quantity
    expect(db.update).toHaveBeenCalled();

    // Verify quantity was combined (3 + 2 = 5)
    expect(updatedQuantity).toBe(5);

    // Verify guest cart was deleted
    expect(db.delete).toHaveBeenCalled();

    expect(revalidatePath).toHaveBeenCalledWith('/cart');
  });

  test('Guest cart merge respects stock limits when combining quantities', async () => {
    // Scenario: Guest has 8 of product A, User has 5 of product A, Stock is 10
    // After merge: User cart should have 10 of product A (capped at stock)

    const stockLimit = 10;

    // Mock guest cart query
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      // Guest cart exists
      mockChain.limit.mockResolvedValueOnce([{ id: 'guest-cart-stock' }]);

      // Guest cart items (product 1 with quantity 8)
      mockChain.where.mockResolvedValueOnce([
        { id: 'guest-item-1', productId: productId1, quantity: 8 },
      ]);

      // User cart exists
      mockChain.limit.mockResolvedValueOnce([{ id: 'user-cart-stock' }]);

      // User cart items (product 1 with quantity 5)
      mockChain.where.mockResolvedValueOnce([
        { id: 'user-item-1', productId: productId1, quantity: 5 },
      ]);

      // Product stock query (stock is 10)
      mockChain.limit.mockResolvedValue([{ id: productId1, stock: stockLimit }]);

      return mockChain;
    }) as any);

    // Mock update for existing cart item
    let updatedQuantity = 0;
    vi.spyOn(db, 'update').mockImplementation((() => {
      return {
        set: vi.fn().mockImplementation((values: any) => {
          updatedQuantity = values.quantity;
          return {
            where: vi.fn().mockResolvedValue(undefined),
          };
        }),
      };
    }) as any);

    // Mock delete guest cart
    vi.spyOn(db, 'delete').mockImplementation((() => {
      return {
        where: vi.fn().mockResolvedValue(undefined),
      };
    }) as any);

    await mergeCart(guestSessionId, userId);

    // Verify quantity was capped at stock limit (not 13)
    expect(updatedQuantity).toBe(stockLimit);
    expect(updatedQuantity).not.toBe(13); // 5 + 8 = 13, but capped at 10

    expect(revalidatePath).toHaveBeenCalledWith('/cart');
  });

  test('Empty guest cart does not affect user cart', async () => {
    // Scenario: Guest has no items, User has items
    // After merge: User cart should remain unchanged

    // Mock guest cart query (no cart)
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      // Guest cart doesn't exist
      mockChain.limit.mockResolvedValueOnce([]);

      return mockChain;
    }) as any);

    await mergeCart(guestSessionId, userId);

    // Verify no database operations were performed
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
    expect(db.delete).not.toHaveBeenCalled();
  });

  test('Guest cart with empty items is deleted', async () => {
    // Scenario: Guest cart exists but has no items
    // After merge: Guest cart should be deleted

    // Mock guest cart query
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      // Guest cart exists
      mockChain.limit.mockResolvedValueOnce([{ id: 'guest-cart-empty' }]);

      // Guest cart items (empty)
      mockChain.where.mockResolvedValueOnce([]);

      return mockChain;
    }) as any);

    // Mock delete guest cart
    vi.spyOn(db, 'delete').mockImplementation((() => {
      return {
        where: vi.fn().mockResolvedValue(undefined),
      };
    }) as any);

    await mergeCart(guestSessionId, userId);

    // Verify guest cart was deleted
    expect(db.delete).toHaveBeenCalled();
  });

  test('Multiple products are merged correctly with mixed scenarios', async () => {
    // Complex scenario:
    // Guest has: Product A (qty 2), Product B (qty 3), Product C (qty 1)
    // User has: Product A (qty 1), Product D (qty 2)
    // After merge: User should have A (qty 3), B (qty 3), C (qty 1), D (qty 2)

    // Mock guest cart query
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      // Guest cart exists
      mockChain.limit.mockResolvedValueOnce([{ id: 'guest-cart-complex' }]);

      // Guest cart items
      mockChain.where.mockResolvedValueOnce([
        { id: 'guest-item-1', productId: 'prod-A', quantity: 2 },
        { id: 'guest-item-2', productId: 'prod-B', quantity: 3 },
        { id: 'guest-item-3', productId: 'prod-C', quantity: 1 },
      ]);

      // User cart exists
      mockChain.limit.mockResolvedValueOnce([{ id: 'user-cart-complex' }]);

      // User cart items
      mockChain.where.mockResolvedValueOnce([
        { id: 'user-item-1', productId: 'prod-A', quantity: 1 },
        { id: 'user-item-2', productId: 'prod-D', quantity: 2 },
      ]);

      // Product stock queries
      mockChain.limit.mockResolvedValue([{ id: 'prod-A', stock: 20 }]);

      return mockChain;
    }) as any);

    const updatedItems: any[] = [];
    const insertedItems: any[] = [];

    // Mock update for existing items (Product A)
    vi.spyOn(db, 'update').mockImplementation((() => {
      return {
        set: vi.fn().mockImplementation((values: any) => {
          updatedItems.push(values);
          return {
            where: vi.fn().mockResolvedValue(undefined),
          };
        }),
      };
    }) as any);

    // Mock insert for new items (Products B and C)
    vi.spyOn(db, 'insert').mockImplementation((() => {
      return {
        values: vi.fn().mockImplementation((values: any) => {
          insertedItems.push(values);
          return Promise.resolve(undefined);
        }),
      };
    }) as any);

    // Mock delete guest cart
    vi.spyOn(db, 'delete').mockImplementation((() => {
      return {
        where: vi.fn().mockResolvedValue(undefined),
      };
    }) as any);

    await mergeCart(guestSessionId, userId);

    // Verify Product A was updated (1 + 2 = 3)
    expect(updatedItems.length).toBeGreaterThan(0);
    expect(updatedItems[0].quantity).toBe(3);

    // Verify Products B and C were inserted
    expect(insertedItems.length).toBeGreaterThan(0);

    // Verify guest cart was deleted
    expect(db.delete).toHaveBeenCalled();

    expect(revalidatePath).toHaveBeenCalledWith('/cart');
  });

  test('User cart is created if it does not exist during merge', async () => {
    // Scenario: Guest has items, User has no cart yet
    // After merge: User cart should be created with guest items

    // Mock guest cart query
    vi.spyOn(db, 'select').mockImplementation((() => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      // Guest cart exists
      mockChain.limit.mockResolvedValueOnce([{ id: 'guest-cart-new' }]);

      // Guest cart items
      mockChain.where.mockResolvedValueOnce([
        { id: 'guest-item-1', productId: productId1, quantity: 2 },
      ]);

      // User cart doesn't exist
      mockChain.limit.mockResolvedValueOnce([]);

      // User cart items (empty, cart doesn't exist)
      mockChain.where.mockResolvedValueOnce([]);

      // Product stock query
      mockChain.limit.mockResolvedValue([{ id: productId1, stock: 20 }]);

      return mockChain;
    }) as any);

    let cartCreated = false;
    // Mock cart creation
    vi.spyOn(db, 'insert').mockImplementation((() => {
      return {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockImplementation(() => {
          cartCreated = true;
          return Promise.resolve([{ id: 'new-user-cart' }]);
        }),
      };
    }) as any);

    // Mock delete guest cart
    vi.spyOn(db, 'delete').mockImplementation((() => {
      return {
        where: vi.fn().mockResolvedValue(undefined),
      };
    }) as any);

    await mergeCart(guestSessionId, userId);

    // Verify user cart was created
    expect(cartCreated).toBe(true);

    // Verify guest cart was deleted
    expect(db.delete).toHaveBeenCalled();

    expect(revalidatePath).toHaveBeenCalledWith('/cart');
  });
});
