'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { cartItems, carts, products } from '@/lib/db/schema';
import { cartItemSchema, formatValidationErrors, validateDataSafe } from '@/lib/utils/validation';

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Add product to cart
 * Validates quantity and stock availability
 */
export async function addToCart(
  productId: string,
  quantity: number,
  userId?: string,
  sessionId?: string
): Promise<ActionResult> {
  try {
    console.log('[addToCart] Called with:', { productId, quantity, userId, sessionId });

    // Validate input with Zod schema
    const validation = validateDataSafe(cartItemSchema, { productId, quantity });
    if (!validation.success) {
      console.error('[addToCart] Validation failed:', validation.error);
      return {
        success: false,
        message: formatValidationErrors(validation.error)[0] || 'Invalid cart item data',
      };
    }

    const validated = validation.data;

    // Get product and check stock
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, validated.productId))
      .limit(1);

    if (!product || product.length === 0) {
      console.error('[addToCart] Product not found:', validated.productId);
      return {
        success: false,
        message: 'Product not found',
      };
    }

    console.log('[addToCart] Product found:', product[0].name, 'Stock:', product[0].stock);

    // Validate stock availability
    if (product[0].stock === 0) {
      return {
        success: false,
        message: 'This product is currently out of stock',
      };
    }

    if (validated.quantity > product[0].stock) {
      return {
        success: false,
        message: `Only ${product[0].stock} items available. Please reduce quantity.`,
      };
    }

    // Get or create cart
    let cart;
    if (userId) {
      const existingCart = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);

      if (existingCart.length > 0) {
        cart = existingCart[0];
      } else {
        const newCart = await db.insert(carts).values({ userId }).returning();
        cart = newCart[0];
      }
    } else if (sessionId) {
      const existingCart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, sessionId))
        .limit(1);

      if (existingCart.length > 0) {
        cart = existingCart[0];
        console.log('[addToCart] Using existing cart:', cart.id);
      } else {
        const newCart = await db.insert(carts).values({ sessionId }).returning();
        cart = newCart[0];
        console.log('[addToCart] Created new cart:', cart.id);
      }
    } else {
      console.error('[addToCart] No userId or sessionId provided');
      return {
        success: false,
        message: 'User or session identifier required',
      };
    }

    // Check if product already in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, validated.productId)))
      .limit(1);

    if (existingItem.length > 0) {
      // Increment quantity
      const newQuantity = existingItem[0].quantity + validated.quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > product[0].stock) {
        return {
          success: false,
          message: `Only ${product[0].stock} items available. You already have ${existingItem[0].quantity} in your cart.`,
        };
      }

      await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem[0].id));

      console.log('[addToCart] Updated existing cart item, new quantity:', newQuantity);
    } else {
      // Create new cart item
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId: validated.productId,
        quantity: validated.quantity,
      });

      console.log('[addToCart] Created new cart item');
    }

    revalidatePath('/cart');
    revalidatePath('/shop');

    console.log('[addToCart] Success!');
    return {
      success: true,
      message: 'Product added to cart',
    };
  } catch (error) {
    console.error('[addToCart] Error:', error);
    return {
      success: false,
      message: 'Failed to add product to cart',
    };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
): Promise<ActionResult> {
  try {
    // If quantity is 0, remove the item
    if (quantity === 0) {
      return await removeFromCart(cartItemId);
    }

    // Validate quantity is positive integer
    if (!Number.isInteger(quantity) || quantity < 0) {
      return {
        success: false,
        message: 'Quantity must be a non-negative integer',
      };
    }

    // Get cart item with product info
    const item = await db
      .select({
        cartItem: cartItems,
        product: products,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.id, cartItemId))
      .limit(1);

    if (!item || item.length === 0) {
      return {
        success: false,
        message: 'Cart item not found',
      };
    }

    // Validate stock availability
    if (item[0].product && quantity > item[0].product.stock) {
      return {
        success: false,
        message: `Only ${item[0].product.stock} items available`,
      };
    }

    // Update quantity
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));

    revalidatePath('/cart');

    return {
      success: true,
      message: 'Cart updated',
    };
  } catch (error) {
    console.error('Update cart quantity error:', error);
    return {
      success: false,
      message: 'Failed to update cart',
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: string): Promise<ActionResult> {
  try {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

    revalidatePath('/cart');

    return {
      success: true,
      message: 'Item removed from cart',
    };
  } catch (error) {
    console.error('Remove from cart error:', error);
    return {
      success: false,
      message: 'Failed to remove item from cart',
    };
  }
}

/**
 * Merge guest cart with user cart on login
 * Transfers items from session cart to user cart
 */
export async function mergeCart(sessionId: string, userId: string): Promise<void> {
  try {
    // Get guest cart
    const guestCart = await db.select().from(carts).where(eq(carts.sessionId, sessionId)).limit(1);

    if (!guestCart || guestCart.length === 0) {
      // No guest cart to merge
      return;
    }

    // Get guest cart items
    const guestCartItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, guestCart[0].id));

    if (guestCartItems.length === 0) {
      // No items to merge, just delete the guest cart
      await db.delete(carts).where(eq(carts.id, guestCart[0].id));
      return;
    }

    // Get or create user cart
    let userCart = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);

    if (!userCart || userCart.length === 0) {
      const newCart = await db.insert(carts).values({ userId }).returning();
      userCart = newCart;
    }

    // Get existing user cart items
    const userCartItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, userCart[0].id));

    // Merge each guest cart item
    for (const guestItem of guestCartItems) {
      // Check if product already exists in user cart
      const existingUserItem = userCartItems.find((item) => item.productId === guestItem.productId);

      if (existingUserItem) {
        // Get product to check stock
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, guestItem.productId))
          .limit(1);

        if (product && product.length > 0) {
          // Increment quantity, but don't exceed stock
          const newQuantity = Math.min(
            existingUserItem.quantity + guestItem.quantity,
            product[0].stock
          );

          await db
            .update(cartItems)
            .set({ quantity: newQuantity })
            .where(eq(cartItems.id, existingUserItem.id));
        }
      } else {
        // Create new cart item in user cart
        await db.insert(cartItems).values({
          cartId: userCart[0].id,
          productId: guestItem.productId,
          quantity: guestItem.quantity,
        });
      }
    }

    // Delete guest cart and its items
    await db.delete(carts).where(eq(carts.id, guestCart[0].id));

    revalidatePath('/cart');
  } catch (error) {
    console.error('Merge cart error:', error);
    // Don't throw error, just log it - cart merge failure shouldn't block login
  }
}
