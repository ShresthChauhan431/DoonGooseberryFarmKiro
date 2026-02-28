/**
 * Shared cart types and pure utility functions.
 * This file is safe to import in both server and client components
 * because it does NOT import any database dependencies.
 */

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: string[];
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
}

export interface CartWithItems {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItem[];
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

/**
 * Calculate cart totals including subtotal, shipping, discount, and total
 * All values are in paise (1 rupee = 100 paise)
 */
export function calculateCartTotals(cartItems: CartItem[], coupon?: Coupon): CartTotals {
  // Calculate subtotal: sum of (price × quantity) for all items
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  // Calculate shipping: ₹50 (5000 paise) if subtotal < ₹500 (50000 paise), else ₹0
  const shipping = subtotal < 50000 ? 5000 : 0;

  // Calculate discount based on coupon type
  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'PERCENTAGE') {
      // Percentage discount: (subtotal × percentage / 100)
      discount = Math.floor((subtotal * coupon.discountValue) / 100);
    } else if (coupon.discountType === 'FLAT') {
      // Flat discount: subtract the flat amount
      discount = coupon.discountValue;
    }
  }

  // Calculate total: subtotal + shipping - discount
  let total = subtotal + shipping - discount;

  // Ensure total is never negative
  if (total < 0) {
    total = 0;
  }

  return {
    subtotal,
    shipping,
    discount,
    total,
  };
}
