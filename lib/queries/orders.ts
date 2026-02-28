import { asc, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orderItems, orders, products, users } from '@/lib/db/schema';

export interface OrderWithItems {
  id: number;
  userId: string | null;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | null;
  subtotal: number | null;
  shipping: number | null;
  discount: number | null;
  total: number | null;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  } | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  couponCode: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  items: Array<{
    id: number;
    productId: string | null;
    quantity: number | null;
    price: number | null;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[] | null;
    };
  }>;
}

/**
 * Get order by ID with items and product details
 */
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, parseInt(orderId, 10)))
    .limit(1);

  if (!order) {
    return null;
  }
  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        images: products.images,
      },
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  return {
    ...order,
    items: items.map((item) => ({
      ...item,
      product: item.product ?? { id: '', name: 'Deleted Product', slug: '', images: [] },
    })),
  } as OrderWithItems;
}

/**
 * Get user orders (most recent first)
 */
export async function getUserOrders(userId: string) {
  return await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

/**
 * Calculate estimated delivery date based on order status
 */
export function getEstimatedDeliveryDate(orderDate: Date, status: string): string {
  const date = new Date(orderDate);

  switch (status) {
    case 'PENDING':
    case 'PROCESSING':
      date.setDate(date.getDate() + 7);
      break;
    case 'SHIPPED':
      date.setDate(new Date().getDate() + 3);
      break;
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      date.setDate(date.getDate() + 7);
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Get all orders with optional status filter (for admin)
 */
export async function getAllOrders(statusFilter?: string) {
  // Use a simple query without join to users (userId may not exist)
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));

  // Filter by status if needed
  const filtered = statusFilter ? allOrders.filter((o) => o.status === statusFilter) : allOrders;

  // Enrich with user info
  const enriched = await Promise.all(
    filtered.map(async (order) => {
      let user = { name: 'Unknown', email: '' };
      if (order.userId) {
        const [u] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, order.userId))
          .limit(1);
        if (u) {
          user = { name: u.name || 'Unknown', email: u.email };
        }
      }
      return { ...order, user };
    })
  );

  return enriched;
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Use raw SQL for aggregations to avoid schema column type issues
  const [todayStats] = await db
    .select({
      count: sql<number>`cast(count(*) as int)`,
      revenue: sql<number>`cast(coalesce(sum(${orders.total}), 0) as int)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, todayStart));

  const [weekStats] = await db
    .select({
      count: sql<number>`cast(count(*) as int)`,
      revenue: sql<number>`cast(coalesce(sum(${orders.total}), 0) as int)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, weekStart));

  const [monthStats] = await db
    .select({
      count: sql<number>`cast(count(*) as int)`,
      revenue: sql<number>`cast(coalesce(sum(${orders.total}), 0) as int)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, monthStart));

  // Get low stock products (stock < 10)
  const lowStockProducts = await db
    .select()
    .from(products)
    .where(sql`${products.stock} < 10 AND ${products.isActive} = true`)
    .orderBy(asc(products.stock));

  // Get 10 most recent orders (without join to users for reliability)
  const recentOrdersRaw = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10);

  // Enrich with user info
  const recentOrders = await Promise.all(
    recentOrdersRaw.map(async (order) => {
      let user = { name: 'Unknown', email: '' };
      if (order.userId) {
        const [u] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, order.userId))
          .limit(1);
        if (u) {
          user = { name: u.name || 'Unknown', email: u.email };
        }
      }
      return { ...order, user };
    })
  );

  return {
    todayOrders: todayStats?.count ?? 0,
    todayRevenue: todayStats?.revenue ?? 0,
    weekOrders: weekStats?.count ?? 0,
    weekRevenue: weekStats?.revenue ?? 0,
    monthOrders: monthStats?.count ?? 0,
    monthRevenue: monthStats?.revenue ?? 0,
    lowStockProducts,
    recentOrders,
  };
}
