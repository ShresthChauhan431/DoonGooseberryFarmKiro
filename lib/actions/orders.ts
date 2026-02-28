'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { validateCoupon } from '@/lib/actions/coupons';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { cartItems, carts, coupons, orderItems, orders, products, users } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/send';
import { OrderConfirmationEmail } from '@/lib/email/templates/order-confirmation';
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  verifyPaymentSignature,
} from '@/lib/payment/razorpay';
import { type Coupon, calculateCartTotals, getCart } from '@/lib/queries/cart';
import { getEstimatedDeliveryDate } from '@/lib/queries/orders';

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

interface Address {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

/**
 * Create a Razorpay order for payment
 * Returns the Razorpay order ID and public key for client-side payment
 */
export async function createRazorpayOrderAction(amount: number): Promise<ActionResult> {
  try {
    // Validate user is authenticated
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    // Validate amount
    if (amount <= 0) {
      return { success: false, message: 'Invalid amount' };
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(amount);

    return {
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: getRazorpayKeyId(),
      },
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      message: 'Failed to create payment order. Please try again.',
    };
  }
}

/**
 * Verify payment signature and create order in database
 * This is called after successful payment from Razorpay
 */
export async function verifyPaymentAndCreateOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  shippingAddress: Address,
  couponCode?: string
): Promise<ActionResult> {
  try {
    // Validate user is authenticated
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      console.error('Invalid payment signature', {
        razorpayOrderId,
        razorpayPaymentId,
      });
      return {
        success: false,
        message: 'Payment verification failed. Please contact support.',
      };
    }

    // Get user cart
    const cart = await getCart(session.user.id);
    if (!cart || cart.items.length === 0) {
      return { success: false, message: 'Cart is empty' };
    }

    // Validate and get coupon if provided
    let validatedCoupon: any;
    if (couponCode) {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode.toUpperCase()))
        .limit(1);

      if (coupon) {
        validatedCoupon = coupon;
      }
    }

    // Calculate totals
    const totals = calculateCartTotals(cart.items, validatedCoupon);

    // Create order in database transaction
    const result = await db.transaction(async (tx) => {
      // Create order record
      const [order] = await tx
        .insert(orders)
        .values({
          userId: session.user.id,
          status: 'PENDING',
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          discount: totals.discount,
          total: totals.total,
          shippingAddress: shippingAddress,
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: razorpayPaymentId,
          couponCode: couponCode || null,
        })
        .returning();

      // Create order items from cart items
      const orderItemsData = cart.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price, // Store price at time of purchase
      }));

      await tx.insert(orderItems).values(orderItemsData);

      // Decrement product stock
      for (const item of cart.items) {
        await tx
          .update(products)
          .set({
            stock: item.product.stock - item.quantity,
          })
          .where(eq(products.id, item.productId));
      }

      // Clear cart items
      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

      // Delete cart
      await tx.delete(carts).where(eq(carts.id, cart.id));

      // Increment coupon usage if applied
      if (couponCode && validatedCoupon) {
        await tx
          .update(coupons)
          .set({
            currentUses: validatedCoupon.currentUses + 1,
          })
          .where(eq(coupons.code, couponCode.toUpperCase()));
      }

      return order;
    });

    // Revalidate cart and order pages
    revalidatePath('/cart');
    revalidatePath('/account');

    // Send confirmation email (async, don't block order creation)
    sendOrderConfirmationEmail(
      String(result.id),
      session.user.email,
      session.user.name,
      cart.items,
      totals,
      shippingAddress,
      result.createdAt ?? new Date()
    ).catch((error) => {
      // Log error but don't fail the order creation
      console.error('Failed to send order confirmation email:', error);
    });

    return {
      success: true,
      data: { orderId: result.id },
      message: 'Order created successfully',
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      message: 'Failed to create order. Please contact support.',
    };
  }
}

/**
 * Send order confirmation email
 * This is called asynchronously after order creation
 */
async function sendOrderConfirmationEmail(
  orderId: string,
  customerEmail: string,
  customerName: string,
  cartItems: any[],
  totals: { subtotal: number; shipping: number; discount: number; total: number },
  shippingAddress: Address,
  orderDate: Date
) {
  const orderNumber = orderId.slice(0, 8).toUpperCase();
  const estimatedDelivery = getEstimatedDeliveryDate(orderDate, 'PENDING');

  const emailItems = cartItems.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
    image: item.product.images[0] || 'https://via.placeholder.com/80',
  }));

  const formattedOrderDate = orderDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  await sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - Order #${orderNumber}`,
    react: OrderConfirmationEmail({
      orderNumber,
      customerName,
      orderDate: formattedOrderDate,
      items: emailItems,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.discount,
      total: totals.total,
      shippingAddress,
      estimatedDelivery,
    }),
  });
}

/**
 * Update order status (admin only)
 * Validates status transitions and sends emails for SHIPPED and DELIVERED
 * Restores stock when order is CANCELLED
 */
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<ActionResult> {
  try {
    // Require admin authentication
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
      return { success: false, message: 'Admin access required' };
    }

    // Get current order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(orderId)))
      .limit(1);

    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    const currentStatus = order.status;

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    const allowedStatuses = validTransitions[currentStatus ?? 'PENDING'] || [];

    if (!allowedStatuses.includes(newStatus)) {
      return {
        success: false,
        message: `Cannot transition from ${currentStatus} to ${newStatus}`,
      };
    }

    // Update order status in transaction
    await db.transaction(async (tx) => {
      // Update order status and timestamp
      await tx
        .update(orders)
        .set({
          status: newStatus as any,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, Number(orderId)));

      // If cancelled, restore product stock
      if (newStatus === 'CANCELLED') {
        const orderItemsList = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, Number(orderId)));

        for (const item of orderItemsList) {
          const [product] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId!))
            .limit(1);

          if (product) {
            await tx
              .update(products)
              .set({
                stock: product.stock + (item.quantity ?? 0),
              })
              .where(eq(products.id, item.productId!));
          }
        }
      }
    });

    // Get user info for email
    const [user] = await db.select().from(users).where(eq(users.id, order.userId!)).limit(1);

    // Send email notifications (async, don't block)
    if (newStatus === 'SHIPPED' && user) {
      sendShippingEmail(
        orderId,
        user.email,
        user.name,
        order.shippingAddress as Address,
        order.createdAt ?? new Date()
      ).catch((error) => {
        console.error('Failed to send shipping email:', error);
      });
    }

    if (newStatus === 'DELIVERED' && user) {
      sendDeliveryEmail(orderId, user.email, user.name, order.shippingAddress as Address).catch(
        (error) => {
          console.error('Failed to send delivery email:', error);
        }
      );
    }

    // Revalidate admin orders page
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);

    return {
      success: true,
      message: 'Order status updated successfully',
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      message: 'Failed to update order status',
    };
  }
}

/**
 * Send shipping notification email
 */
async function sendShippingEmail(
  orderId: string,
  customerEmail: string,
  customerName: string,
  shippingAddress: Address,
  orderDate: Date
) {
  const { OrderShippedEmail } = await import('@/lib/email/templates/order-shipped');
  const { getEstimatedDeliveryDate } = await import('@/lib/queries/orders');

  const orderNumber = orderId.slice(0, 8).toUpperCase();
  const estimatedDelivery = getEstimatedDeliveryDate(orderDate, 'SHIPPED');

  await sendEmail({
    to: customerEmail,
    subject: `Your Order #${orderNumber} Has Been Shipped`,
    react: OrderShippedEmail({
      orderNumber,
      customerName,
      estimatedDelivery,
      shippingAddress,
    }),
  });
}

/**
 * Send delivery confirmation email
 */
async function sendDeliveryEmail(
  orderId: string,
  customerEmail: string,
  customerName: string,
  shippingAddress: Address
) {
  const { OrderDeliveredEmail } = await import('@/lib/email/templates/order-delivered');

  const orderNumber = orderId.slice(0, 8).toUpperCase();
  const deliveryDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  await sendEmail({
    to: customerEmail,
    subject: `Your Order #${orderNumber} Has Been Delivered`,
    react: OrderDeliveredEmail({
      orderNumber,
      customerName,
      deliveryDate,
      shippingAddress,
    }),
  });
}
