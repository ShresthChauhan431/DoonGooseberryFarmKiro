# Design Document: Doon Gooseberry Farm E-Commerce Platform

## Overview

### Purpose

This document provides a comprehensive technical design for the Doon Gooseberry Farm e-commerce platform, a monolithic Next.js 16 application that enables customers to browse and purchase farm products (pickles, chutneys, jams, juices, candies, and spices) while providing administrators with tools to manage products, orders, and customer data.

### System Architecture

The platform follows a monolithic architecture built on Next.js 16 App Router with all features contained in a single codebase. The system uses:

- **Frontend**: React 19 Server Components with selective Client Components for interactivity
- **Backend**: Next.js Server Actions for mutations, API routes for webhooks
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Authentication**: Better Auth with session-based authentication
- **Payments**: Razorpay integration for payment processing
- **Email**: React Email templates with Resend service
- **Hosting**: Railway platform with PostgreSQL database
- **Storage**: Cloudflare R2 or Vercel Blob for product images
- **UI**: shadcn/ui components with Tailwind CSS

### Key Design Principles

1. **Server-First Architecture**: Maximize Server Components for data fetching, minimize client-side JavaScript
2. **Type Safety**: End-to-end TypeScript with Zod validation for runtime safety
3. **Price Integrity**: All prices stored as integers (paise) to avoid floating-point errors
4. **Optimistic Updates**: Immediate UI feedback with useOptimistic for cart operations
5. **Caching Strategy**: ISR for product pages, no-store for dynamic user data
6. **Security**: Server-side validation, parameterized queries, secure session management


## Architecture

### System Context Diagram

```mermaid
graph TB
    Customer[Customer Browser]
    Admin[Admin Browser]
    NextJS[Next.js 16 App]
    PostgreSQL[(PostgreSQL Database)]
    BetterAuth[Better Auth]
    Razorpay[Razorpay API]
    Resend[Resend Email Service]
    Storage[Cloudflare R2 / Vercel Blob]
    
    Customer -->|HTTPS| NextJS
    Admin -->|HTTPS| NextJS
    NextJS -->|Drizzle ORM| PostgreSQL
    NextJS -->|Session Management| BetterAuth
    BetterAuth -->|Store Sessions| PostgreSQL
    NextJS -->|Payment Processing| Razorpay
    NextJS -->|Send Emails| Resend
    NextJS -->|Upload/Serve Images| Storage
```

### Application Architecture

```mermaid
graph TB
    subgraph "Next.js App Router"
        Routes[Route Handlers]
        ServerComponents[Server Components]
        ClientComponents[Client Components]
        ServerActions[Server Actions]
        Middleware[Auth Middleware]
    end
    
    subgraph "Data Layer"
        DrizzleORM[Drizzle ORM]
        Schemas[Database Schemas]
        Queries[Query Functions]
    end
    
    subgraph "Business Logic"
        CartLogic[Cart Management]
        OrderLogic[Order Processing]
        AuthLogic[Authentication]
        PaymentLogic[Payment Verification]
        PriceCalc[Price Calculations]
    end
    
    Routes --> ServerComponents
    ServerComponents --> ServerActions
    ClientComponents --> ServerActions
    Middleware --> Routes
    ServerActions --> BusinessLogic
    BusinessLogic --> DrizzleORM
    DrizzleORM --> Schemas
    DrizzleORM --> Queries

```

### Data Flow Patterns

#### Read Flow (Server Components)
1. User requests page → Next.js route
2. Server Component executes on server
3. Drizzle ORM queries PostgreSQL
4. Data serialized and sent to client
5. React hydrates with data

#### Write Flow (Server Actions)
1. User triggers action (form submit, button click)
2. Client Component calls Server Action
3. Server Action validates input (Zod)
4. Business logic executes
5. Drizzle ORM mutates database
6. revalidatePath/revalidateTag invalidates cache
7. Response sent to client
8. Optimistic UI updates confirmed/rolled back

#### Authentication Flow
1. User submits credentials
2. Better Auth validates against database
3. Session created in database
4. httpOnly cookie set with session token
5. Middleware validates session on protected routes
6. User/role data available in Server Components

#### Payment Flow
1. User completes checkout
2. Server Action creates Razorpay order
3. Client loads Razorpay SDK
4. User completes payment in Razorpay modal
5. Razorpay webhook/callback to server
6. Server verifies payment signature
7. Order created in database
8. Cart cleared
9. Confirmation email sent
10. Redirect to success page


## Components and Interfaces

### File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (shop)/
│   │   ├── layout.tsx              # Public layout with header/footer
│   │   ├── page.tsx                # Homepage
│   │   ├── shop/
│   │   │   ├── page.tsx            # Product listing with filters
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Product detail
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx            # Multi-step checkout
│   │   ├── search/
│   │   │   └── page.tsx
│   │   └── blog/
│   │       ├── page.tsx
│   │       └── [slug]/
│   │           └── page.tsx
│   ├── account/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Dashboard with tabs
│   │   └── orders/
│   │       └── [orderId]/
│   │           └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx              # Admin sidebar layout
│   │   ├── page.tsx                # Dashboard with stats
│   │   ├── products/
│   │   │   ├── page.tsx            # Product table
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   └── orders/
│   │       ├── page.tsx            # Orders table
│   │       └── [id]/
│   │           └── page.tsx
│   ├── order/
│   │   └── [orderId]/
│   │       └── success/
│   │           └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts        # Better Auth routes
│   │   ├── webhooks/
│   │   │   └── razorpay/
│   │   │       └── route.ts
│   │   └── health/
│   │       └── route.ts
│   ├── layout.tsx                  # Root layout
│   └── middleware.ts               # Auth middleware
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── mobile-nav.tsx
│   │   └── cart-badge.tsx
│   ├── product/
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-filters.tsx
│   │   ├── add-to-cart-button.tsx
│   │   └── related-products.tsx
│   ├── cart/
│   │   ├── cart-item.tsx
│   │   ├── cart-summary.tsx
│   │   └── cart-sheet.tsx
│   ├── checkout/
│   │   ├── checkout-steps.tsx
│   │   ├── address-form.tsx
│   │   ├── order-review.tsx
│   │   └── payment-form.tsx
│   └── admin/
│       ├── product-form.tsx
│       ├── order-status-select.tsx
│       └── stats-card.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts                # Drizzle client
│   │   ├── schema.ts               # All table schemas
│   │   └── seed.ts                 # Seed script
│   ├── auth/
│   │   ├── config.ts               # Better Auth config
│   │   └── session.ts              # Session helpers
│   ├── actions/
│   │   ├── cart.ts                 # Cart Server Actions
│   │   ├── products.ts             # Product Server Actions
│   │   ├── orders.ts               # Order Server Actions
│   │   ├── auth.ts                 # Auth Server Actions
│   │   └── reviews.ts              # Review Server Actions
│   ├── queries/
│   │   ├── products.ts             # Product queries
│   │   ├── cart.ts                 # Cart queries
│   │   ├── orders.ts               # Order queries
│   │   └── reviews.ts              # Review queries
│   ├── utils/
│   │   ├── price.ts                # Price formatting/conversion
│   │   ├── slug.ts                 # Slug generation
│   │   └── validation.ts           # Zod schemas
│   ├── payment/
│   │   └── razorpay.ts             # Razorpay integration
│   └── email/
│       ├── templates/
│       │   ├── order-confirmation.tsx
│       │   ├── order-shipped.tsx
│       │   └── order-delivered.tsx
│       └── send.ts                 # Email sending logic
└── types/
    └── index.ts                    # Shared TypeScript types
```


### Key Server Actions

#### Cart Actions (`lib/actions/cart.ts`)

```typescript
// Add product to cart
async function addToCart(productId: string, quantity: number): Promise<ActionResult>
// - Validates quantity is positive integer
// - Validates quantity doesn't exceed stock
// - Gets user/session identifier
// - Checks if product already in cart
// - If exists: increments quantity
// - If new: creates cart_item record
// - Calls revalidatePath('/cart')
// - Returns success/error

// Update cart item quantity
async function updateCartQuantity(cartItemId: string, quantity: number): Promise<ActionResult>
// - Validates quantity
// - If quantity === 0: calls removeFromCart
// - Updates cart_item record
// - Calls revalidatePath('/cart')
// - Returns success/error

// Remove item from cart
async function removeFromCart(cartItemId: string): Promise<ActionResult>
// - Deletes cart_item record
// - Calls revalidatePath('/cart')
// - Returns success/error

// Merge guest cart with user cart on login
async function mergeCart(sessionId: string, userId: string): Promise<void>
// - Queries guest cart items
// - For each item:
//   - Check if product exists in user cart
//   - If exists: increment quantity
//   - If new: create cart_item with userId
// - Delete guest cart
```

#### Order Actions (`lib/actions/orders.ts`)

```typescript
// Create Razorpay order
async function createRazorpayOrder(amount: number): Promise<{ orderId: string, key: string }>
// - Validates amount > 0
// - Calls Razorpay API to create order
// - Returns order ID and public key

// Verify payment and create order
async function verifyPaymentAndCreateOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  shippingAddress: Address,
  couponCode?: string
): Promise<ActionResult>
// - Verifies Razorpay signature
// - Gets user cart
// - Calculates totals (subtotal, shipping, discount, total)
// - Starts database transaction:
//   - Creates order record
//   - Creates order_items from cart_items
//   - Decrements product stock
//   - Clears cart
//   - Increments coupon usage if applied
// - Sends confirmation email (async, don't block)
// - Returns order ID

// Update order status (admin only)
async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<ActionResult>
// - Validates user is admin
// - Gets current order status
// - Validates status transition is allowed
// - Updates order status
// - Records timestamp
// - If status === SHIPPED: send shipping email
// - If status === DELIVERED: send delivery email
// - If status === CANCELLED: restore product stock
// - Calls revalidatePath('/admin/orders')
// - Returns success/error
```


#### Product Actions (`lib/actions/products.ts`)

```typescript
// Create product (admin only)
async function createProduct(data: ProductInput): Promise<ActionResult>
// - Validates user is admin
// - Validates data with Zod schema
// - Generates slug if not provided
// - Checks slug uniqueness
// - Uploads images to storage
// - Creates product record
// - Calls revalidatePath('/shop')
// - Returns product ID or error

// Update product (admin only)
async function updateProduct(id: string, data: ProductInput): Promise<ActionResult>
// - Validates user is admin
// - Validates data with Zod schema
// - If slug changed: checks uniqueness
// - Uploads new images if provided
// - Updates product record
// - Calls revalidatePath('/shop') and revalidatePath(`/shop/${slug}`)
// - Returns success/error

// Delete product (soft delete, admin only)
async function deleteProduct(id: string): Promise<ActionResult>
// - Validates user is admin
// - Sets isActive = false
// - Calls revalidatePath('/shop')
// - Returns success/error
```

#### Review Actions (`lib/actions/reviews.ts`)

```typescript
// Create or update review
async function submitReview(
  productId: string,
  rating: number,
  comment: string
): Promise<ActionResult>
// - Validates user is authenticated
// - Validates rating is 1-5
// - Validates comment length (10-500 chars)
// - Checks if user has verified purchase
// - If no purchase: returns error
// - Checks if review already exists
// - If exists: updates review
// - If new: creates review
// - Calls revalidatePath(`/shop/${productSlug}`)
// - Returns success/error
```

#### Wishlist Actions (`lib/actions/wishlist.ts`)

```typescript
// Toggle product in wishlist
async function toggleWishlist(productId: string): Promise<ActionResult>
// - Gets user ID
// - Checks if product in wishlist
// - If exists: removes from wishlist
// - If not: adds to wishlist
// - Calls revalidatePath('/account/wishlist')
// - Returns new state (added/removed)
```


### Key Query Functions

#### Product Queries (`lib/queries/products.ts`)

```typescript
// Get all products with filters
async function getProducts(filters: {
  category?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest';
  priceMin?: number;
  priceMax?: number;
  search?: string;
  isActive?: boolean;
}): Promise<Product[]>
// - Builds Drizzle query with where clauses
// - Applies category filter if provided
// - Applies price range filter if provided
// - Applies search using PostgreSQL full-text search
// - Applies sort order
// - Returns products array

// Get product by slug
async function getProductBySlug(slug: string): Promise<Product | null>
// - Queries products table with slug
// - Includes category relation
// - Returns product or null

// Get related products
async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4): Promise<Product[]>
// - Queries products in same category
// - Excludes current product
// - Randomizes order
// - Limits results
// - Returns products array
```

#### Cart Queries (`lib/queries/cart.ts`)

```typescript
// Get cart with items
async function getCart(userId?: string, sessionId?: string): Promise<CartWithItems | null>
// - Queries cart by userId or sessionId
// - Joins cart_items with products
// - Calculates item subtotals
// - Returns cart with items or null

// Calculate cart totals
function calculateCartTotals(cartItems: CartItem[], coupon?: Coupon): {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}
// - Calculates subtotal: sum of (price × quantity)
// - Calculates shipping: 50 if subtotal < 500, else 0
// - Calculates discount based on coupon type
// - Calculates total: subtotal + shipping - discount
// - Ensures total >= 0
// - Returns totals object
```

#### Order Queries (`lib/queries/orders.ts`)

```typescript
// Get user orders
async function getUserOrders(userId: string): Promise<Order[]>
// - Queries orders by userId
// - Orders by createdAt desc
// - Returns orders array

// Get order by ID with items
async function getOrderById(orderId: string): Promise<OrderWithItems | null>
// - Queries order by ID
// - Joins order_items with products
// - Returns order with items or null

// Get admin dashboard stats
async function getAdminStats(): Promise<AdminStats>
// - Queries order counts and revenue for today/week/month
// - Queries low stock products (stock < 10)
// - Queries recent orders (limit 10)
// - Returns stats object
```


### Utility Functions

#### Price Utilities (`lib/utils/price.ts`)

```typescript
// Convert paise to rupees for display
function formatPrice(paise: number): string
// - Divides by 100
// - Formats with 2 decimal places
// - Adds ₹ symbol
// - Returns formatted string (e.g., "₹123.45")

// Convert rupees to paise for storage
function rupeesToPaise(rupees: number): number
// - Multiplies by 100
// - Rounds to nearest integer
// - Returns paise

// Convert paise to rupees (for calculations)
function paiseToRupees(paise: number): number
// - Divides by 100
// - Returns rupees as number
```

#### Slug Utilities (`lib/utils/slug.ts`)

```typescript
// Generate URL-friendly slug from text
function generateSlug(text: string): string
// - Converts to lowercase
// - Replaces spaces with hyphens
// - Removes special characters
// - Returns slug

// Ensure slug is unique
async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string>
// - Checks if slug exists in database
// - If unique: returns slug
// - If exists: appends number and retries
// - Returns unique slug
```

#### Validation Schemas (`lib/utils/validation.ts`)

```typescript
// Product validation schema
const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().int().positive(),
  categoryId: z.string().uuid(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().url()).min(1),
  isActive: z.boolean().default(true),
});

// Address validation schema
const addressSchema = z.object({
  name: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^\d{6}$/),
  phone: z.string().regex(/^\d{10}$/),
});

// Review validation schema
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(500),
});

// Cart item validation schema
const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});
```


### Authentication Middleware

```typescript
// middleware.ts
import { betterAuth } from '@/lib/auth/config';

export async function middleware(request: NextRequest) {
  const session = await betterAuth.api.getSession({
    headers: request.headers,
  });

  const path = request.nextUrl.pathname;

  // Protect /account routes
  if (path.startsWith('/account')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect /admin routes
  if (path.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect /checkout routes
  if (path.startsWith('/checkout')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', '/checkout');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/checkout/:path*'],
};
```

### Payment Integration

```typescript
// lib/payment/razorpay.ts
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create Razorpay order
export async function createRazorpayOrder(amount: number) {
  const order = await razorpay.orders.create({
    amount: amount, // amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  });
  return order;
}

// Verify payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const text = `${orderId}|${paymentId}`;
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest('hex');
  return generated_signature === signature;
}
```


## Data Models

### Database Schema

The system uses 11 PostgreSQL tables with the following relationships:

```mermaid
erDiagram
    users ||--o{ sessions : has
    users ||--o{ orders : places
    users ||--o{ reviews : writes
    users ||--o{ carts : owns
    users ||--o{ addresses : has
    users ||--o{ wishlist : has
    
    categories ||--o{ products : contains
    products ||--o{ cart_items : in
    products ||--o{ order_items : in
    products ||--o{ reviews : receives
    products ||--o{ wishlist : in
    
    carts ||--o{ cart_items : contains
    orders ||--o{ order_items : contains
    orders }o--|| coupons : uses
    
    users {
        uuid id PK
        string email UK
        string password
        string name
        enum role
        timestamp createdAt
    }
    
    sessions {
        uuid id PK
        uuid userId FK
        string token UK
        timestamp expiresAt
    }
    
    categories {
        uuid id PK
        string name
        string slug UK
        string description
    }
    
    products {
        uuid id PK
        string name
        string slug UK
        text description
        int price
        uuid categoryId FK
        int stock
        jsonb images
        boolean isActive
        timestamp createdAt
    }
    
    carts {
        uuid id PK
        uuid userId FK
        string sessionId
        timestamp createdAt
    }
    
    cart_items {
        uuid id PK
        uuid cartId FK
        uuid productId FK
        int quantity
    }
    
    orders {
        uuid id PK
        uuid userId FK
        enum status
        int subtotal
        int shipping
        int discount
        int total
        jsonb shippingAddress
        string razorpayOrderId
        string razorpayPaymentId
        string couponCode
        timestamp createdAt
    }
    
    order_items {
        uuid id PK
        uuid orderId FK
        uuid productId FK
        int quantity
        int price
    }
    
    reviews {
        uuid id PK
        uuid productId FK
        uuid userId FK
        int rating
        text comment
        timestamp createdAt
    }
    
    addresses {
        uuid id PK
        uuid userId FK
        string name
        string addressLine1
        string addressLine2
        string city
        string state
        string pincode
        string phone
        boolean isDefault
    }
    
    coupons {
        uuid id PK
        string code UK
        enum discountType
        int discountValue
        int minOrderValue
        int maxUses
        int currentUses
        timestamp expiresAt
    }
    
    wishlist {
        uuid id PK
        uuid userId FK
        uuid productId FK
        timestamp createdAt
    }
```


### Drizzle Schema Definitions

```typescript
// lib/db/schema.ts
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const discountTypeEnum = pgEnum('discount_type', ['PERCENTAGE', 'FLAT']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('USER'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Sessions table (Better Auth)
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // in paise
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  stock: integer('stock').notNull().default(0),
  images: jsonb('images').notNull().$type<string[]>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Carts table
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Cart items table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  subtotal: integer('subtotal').notNull(), // in paise
  shipping: integer('shipping').notNull(), // in paise
  discount: integer('discount').notNull().default(0), // in paise
  total: integer('total').notNull(), // in paise
  shippingAddress: jsonb('shipping_address').notNull().$type<Address>(),
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 255 }),
  couponCode: varchar('coupon_code', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(), // price at time of purchase, in paise
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Addresses table
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  addressLine1: varchar('address_line_1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 6 }).notNull(),
  phone: varchar('phone', { length: 10 }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
});

// Coupons table
export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: integer('discount_value').notNull(), // percentage or paise
  minOrderValue: integer('min_order_value').notNull().default(0), // in paise
  maxUses: integer('max_uses').notNull(),
  currentUses: integer('current_uses').notNull().default(0),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Wishlist table
export const wishlist = pgTable('wishlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Subscribers table (newsletter)
export const subscribers = pgTable('subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```


### TypeScript Types

```typescript
// types/index.ts

export type Role = 'USER' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type DiscountType = 'PERCENTAGE' | 'FLAT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in paise
  categoryId: string;
  category?: Category;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItem[];
  createdAt: Date;
}

export interface Address {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number; // in paise
  shipping: number; // in paise
  discount: number; // in paise
  total: number; // in paise
  shippingAddress: Address;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  couponCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number; // price at time of purchase, in paise
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: User;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number; // percentage or paise
  minOrderValue: number; // in paise
  maxUses: number;
  currentUses: number;
  expiresAt: Date;
}

export interface CartTotals {
  subtotal: number; // in paise
  shipping: number; // in paise
  discount: number; // in paise
  total: number; // in paise
}

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export interface AdminStats {
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Price Integer Storage

For any price value stored in the database, the value shall be a non-negative integer representing paise, and converting from paise to rupees and back to paise shall preserve the original value.

**Validates: Requirements 2.4, 2.10, 30.10**

### Property 2: Slug Uniqueness

For any two products in the database, their slug values shall be different. When attempting to create or update a product with a slug that already exists, the operation shall fail with an error.

**Validates: Requirements 2.5**

### Property 3: Cart Quantity Validation

For any cart operation, when adding or updating a product quantity, if the requested quantity is not a positive integer or exceeds available stock, the operation shall fail with an error.

**Validates: Requirements 9.12, 9.13, 32.3**

### Property 4: Cart Duplicate Prevention

For any cart, when adding a product that already exists in the cart, the system shall increment the existing cart item's quantity instead of creating a duplicate cart item entry.

**Validates: Requirements 9.8**

### Property 5: Cart Merge Idempotence

For any guest cart and user cart, merging the guest cart into the user cart twice shall produce the same result as merging once, with no duplicate products and correct quantities.

**Validates: Requirements 9.7**

### Property 6: Shipping Cost Calculation

For any cart subtotal, if the subtotal is less than ₹500 (50000 paise), the shipping cost shall be ₹50 (5000 paise). If the subtotal is ₹500 or greater, the shipping cost shall be ₹0.

**Validates: Requirements 10.9, 10.10, 30.2, 30.3**

### Property 7: Price Formatting

For any price value in paise, formatting the price for display shall produce a string with exactly 2 decimal places and the ₹ symbol.

**Validates: Requirements 10.14**

### Property 8: Cart Subtotal Calculation

For any cart with items, the subtotal shall equal the sum of (item price × item quantity) for all cart items.

**Validates: Requirements 30.1**

### Property 9: Coupon Discount Calculation

For any valid coupon and cart subtotal, if the coupon type is PERCENTAGE, the discount shall equal (subtotal × percentage / 100). If the coupon type is FLAT, the discount shall equal the coupon discount value.

**Validates: Requirements 22.8, 22.9, 30.4, 30.5**

### Property 10: Order Total Calculation

For any order, the total shall equal (subtotal + shipping - discount), and the total shall never be negative. When the discount exceeds the subtotal, the total shall equal the shipping cost only.

**Validates: Requirements 30.6, 30.7, 30.8**


### Property 11: Coupon Validation Rules

For any coupon code, the validation shall fail if: (1) the code does not exist in the database, (2) the coupon has expired, (3) the coupon has reached maximum uses, or (4) the order subtotal is below the minimum order value. Valid coupons meeting all criteria shall pass validation.

**Validates: Requirements 22.3, 22.4, 22.5, 22.6**

### Property 12: Order Creation Consistency

For any cart, when an order is created, the order shall contain order items equal in count to cart items, each order item shall store the price at time of purchase (not current product price), and the cart shall be empty after order creation.

**Validates: Requirements 12.8, 12.10, 12.13**

### Property 13: Payment Signature Verification

For any Razorpay payment, when the signature is valid (matches the HMAC-SHA256 hash of orderId|paymentId), the verification shall succeed. When the signature is invalid, the verification shall fail.

**Validates: Requirements 12.5**

### Property 14: JSONB Round-Trip Integrity

For any JSONB field (product images array or shipping address object), parsing then serializing then parsing the data shall produce equivalent data to the original.

**Validates: Requirements 29.6**

### Property 15: Stock Conservation

For any product, the stock value shall never be negative. When an order is created, the product stock shall decrease by the ordered quantity. When an order is cancelled, the product stock shall increase by the ordered quantity, returning to the previous level.

**Validates: Requirements 32.4, 32.5, 32.10**

### Property 16: Stock Availability Validation

For any product, when adding the product to cart or creating an order, if the product stock is zero or the requested quantity exceeds available stock, the operation shall fail with an error.

**Validates: Requirements 32.2**

### Property 17: Category Filter Consistency

For any category filter applied to the product list, all returned products shall belong to the specified category, and the count of filtered products shall be less than or equal to the total product count.

**Validates: Requirements 6.3**

### Property 18: Price Range Filter Consistency

For any price range filter (priceMin, priceMax) applied to the product list, all returned products shall have prices within the specified range (inclusive), and the count of filtered products shall be less than or equal to the total product count.

**Validates: Requirements 6.7**

### Property 19: Search Active Products Only

For any search query, all returned products shall have isActive set to true, excluding inactive products from search results.

**Validates: Requirements 8.7**

### Property 20: Related Products Filtering

For any product, the related products list shall only include products from the same category, shall exclude the current product, and shall contain at most 4 products.

**Validates: Requirements 38.2, 38.3**


### Property 21: Order Status Valid Transitions

For any order, the following status transitions shall succeed: PENDING → PROCESSING, PROCESSING → SHIPPED, SHIPPED → DELIVERED, PENDING → CANCELLED, PROCESSING → CANCELLED. All other transitions shall fail with an error.

**Validates: Requirements 39.2, 39.3, 39.4, 39.5, 39.6, 39.11, 39.12**

### Property 22: Order Status Terminal States

For any order with status DELIVERED or CANCELLED, attempting to transition to any other status shall fail with an error, as these are terminal states.

**Validates: Requirements 39.7, 39.8, 39.9**

### Property 23: Review Authorization

For any user attempting to create a review for a product, the operation shall only succeed if the user has a verified purchase (completed order containing that product). Users without a verified purchase shall receive an error.

**Validates: Requirements 20.7**

### Property 24: Review Uniqueness

For any user and product combination, the user shall have at most one review for that product. Attempting to create a duplicate review shall fail, and the system shall offer to update the existing review instead.

**Validates: Requirements 20.14**

### Property 25: Wishlist Toggle Idempotence

For any product in a user's wishlist, toggling the wishlist status twice (add then remove, or remove then add) shall return the wishlist to its original state.

**Validates: Requirements 21.2**

### Property 26: Wishlist Merge Deduplication

For any guest wishlist and user wishlist, when merging on login, the resulting wishlist shall contain no duplicate products, with each product appearing at most once.

**Validates: Requirements 21.11**

### Property 27: Form Validation Consistency

For any validated form with a Zod schema, submitting data that passes the schema validation shall succeed, and submitting data that fails the schema validation shall fail with descriptive error messages.

**Validates: Requirements 31.14**


## Error Handling

### Error Handling Strategy

The system implements a comprehensive error handling approach across all layers:

#### Server Action Error Handling

All Server Actions follow a consistent error handling pattern:

```typescript
async function serverAction(input: Input): Promise<ActionResult> {
  try {
    // 1. Validate input with Zod
    const validated = schema.parse(input);
    
    // 2. Check authorization
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }
    
    // 3. Execute business logic
    const result = await performOperation(validated);
    
    // 4. Revalidate cache
    revalidatePath('/relevant-path');
    
    // 5. Return success
    return { success: true, data: result };
  } catch (error) {
    // Log error for debugging
    console.error('Server action error:', error);
    
    // Return user-friendly message
    if (error instanceof ZodError) {
      return { success: false, message: 'Invalid input data' };
    }
    if (error instanceof DatabaseError) {
      return { success: false, message: 'Database operation failed' };
    }
    return { success: false, message: 'An unexpected error occurred' };
  }
}
```

#### Database Error Handling

Database operations use try-catch blocks with specific error handling:

- **Unique constraint violations**: Return user-friendly messages (e.g., "Email already exists")
- **Foreign key violations**: Return messages indicating invalid references
- **Connection errors**: Log and return generic error message
- **Transaction failures**: Rollback and return error state

#### Payment Error Handling

Payment operations have specific error scenarios:

- **Signature verification failure**: Log security event, reject payment, notify admin
- **Razorpay API errors**: Log error, return user-friendly message, allow retry
- **Network timeouts**: Implement retry logic with exponential backoff
- **Insufficient funds**: Display Razorpay error message to user

#### Client-Side Error Handling

Client Components handle errors from Server Actions:

```typescript
async function handleAction() {
  try {
    const result = await serverAction(data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success('Operation successful');
  } catch (error) {
    toast.error('An unexpected error occurred');
  }
}
```

#### Error Boundaries

Each route segment has an error.tsx file that catches rendering errors:

```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">
        We're sorry for the inconvenience. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

#### Validation Errors

All user inputs are validated with Zod schemas:

- **Client-side validation**: Immediate feedback with inline error messages
- **Server-side validation**: Double-check all inputs, never trust client
- **Error messages**: Specific, actionable messages (e.g., "Password must be at least 8 characters")

#### Stock Validation Errors

Special handling for inventory errors:

- **Out of stock**: "This product is currently out of stock"
- **Insufficient stock**: "Only X items available. Please reduce quantity."
- **Stock changed during checkout**: "Stock has changed. Please review your cart."

#### Authentication Errors

- **Invalid credentials**: "Invalid email or password"
- **Session expired**: Redirect to login with return URL
- **Unauthorized access**: Redirect to homepage with error message
- **Rate limiting**: "Too many attempts. Please try again later."


## Testing Strategy

### Dual Testing Approach

The system employs both unit testing and property-based testing for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs through randomization

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

#### Library Selection

The system uses **fast-check** for property-based testing in TypeScript/JavaScript. Fast-check provides:

- Automatic test case generation
- Shrinking to find minimal failing examples
- Configurable number of test runs
- Built-in generators for common types

#### Configuration

Each property test is configured to run a minimum of 100 iterations to ensure adequate coverage through randomization:

```typescript
import fc from 'fast-check';

test('Property: Price round-trip preservation', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 1000000 }), (paise) => {
      const rupees = paiseToRupees(paise);
      const backToPaise = rupeesToPaise(rupees);
      return backToPaise === paise;
    }),
    { numRuns: 100 }
  );
});
```

#### Property Test Tags

Each property test includes a comment tag referencing the design document property:

```typescript
/**
 * Feature: doon-farm-ecommerce, Property 1: Price Integer Storage
 * For any price value stored in the database, converting from paise to rupees
 * and back to paise shall preserve the original value.
 */
test('Property 1: Price round-trip preservation', () => {
  // test implementation
});
```

#### Property Test Implementation

Each correctness property from the design document is implemented as a single property-based test:

**Property 1: Price Integer Storage**
```typescript
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
```

**Property 3: Cart Quantity Validation**
```typescript
test('Property 3: Cart quantity validation', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string(), // productId
      fc.integer(), // quantity
      fc.integer({ min: 0, max: 100 }), // stock
      async (productId, quantity, stock) => {
        const result = await addToCart(productId, quantity, stock);
        
        if (quantity <= 0 || quantity > stock) {
          return !result.success;
        }
        return result.success;
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 6: Shipping Cost Calculation**
```typescript
test('Property 6: Shipping cost calculation', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 1000000 }), (subtotal) => {
      const shipping = calculateShipping(subtotal);
      
      if (subtotal < 50000) { // less than ₹500
        return shipping === 5000; // ₹50
      } else {
        return shipping === 0;
      }
    }),
    { numRuns: 100 }
  );
});
```

**Property 8: Cart Subtotal Calculation**
```typescript
test('Property 8: Cart subtotal calculation', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          price: fc.integer({ min: 1, max: 100000 }),
          quantity: fc.integer({ min: 1, max: 10 }),
        })
      ),
      (cartItems) => {
        const calculatedSubtotal = calculateCartSubtotal(cartItems);
        const expectedSubtotal = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        return calculatedSubtotal === expectedSubtotal;
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 14: JSONB Round-Trip Integrity**
```typescript
test('Property 14: JSONB round-trip integrity', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.array(fc.webUrl()), // product images
        fc.record({ // shipping address
          name: fc.string(),
          addressLine1: fc.string(),
          city: fc.string(),
          state: fc.string(),
          pincode: fc.string({ minLength: 6, maxLength: 6 }),
          phone: fc.string({ minLength: 10, maxLength: 10 }),
        })
      ),
      (data) => {
        const serialized = JSON.stringify(data);
        const parsed = JSON.parse(serialized);
        return JSON.stringify(parsed) === serialized;
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 21: Order Status Valid Transitions**
```typescript
test('Property 21: Order status valid transitions', () => {
  const validTransitions = [
    ['PENDING', 'PROCESSING'],
    ['PROCESSING', 'SHIPPED'],
    ['SHIPPED', 'DELIVERED'],
    ['PENDING', 'CANCELLED'],
    ['PROCESSING', 'CANCELLED'],
  ];
  
  const invalidTransitions = [
    ['SHIPPED', 'CANCELLED'],
    ['DELIVERED', 'PENDING'],
    ['DELIVERED', 'PROCESSING'],
    ['DELIVERED', 'SHIPPED'],
    ['DELIVERED', 'CANCELLED'],
    ['CANCELLED', 'PENDING'],
    ['CANCELLED', 'PROCESSING'],
    ['CANCELLED', 'SHIPPED'],
    ['CANCELLED', 'DELIVERED'],
  ];
  
  fc.assert(
    fc.property(
      fc.constantFrom(...validTransitions),
      async ([from, to]) => {
        const result = await transitionOrderStatus(from, to);
        return result.success === true;
      }
    ),
    { numRuns: 100 }
  );
  
  fc.assert(
    fc.property(
      fc.constantFrom(...invalidTransitions),
      async ([from, to]) => {
        const result = await transitionOrderStatus(from, to);
        return result.success === false;
      }
    ),
    { numRuns: 100 }
  );
});
```


### Unit Testing

Unit tests complement property tests by verifying specific examples, integration points, and edge cases:

#### Server Actions Unit Tests

```typescript
describe('Cart Actions', () => {
  test('should add product to empty cart', async () => {
    const result = await addToCart('product-123', 2);
    expect(result.success).toBe(true);
    
    const cart = await getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
  });
  
  test('should increment quantity when adding existing product', async () => {
    await addToCart('product-123', 2);
    await addToCart('product-123', 3);
    
    const cart = await getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(5);
  });
  
  test('should reject negative quantity', async () => {
    const result = await addToCart('product-123', -1);
    expect(result.success).toBe(false);
    expect(result.message).toContain('positive');
  });
  
  test('should reject quantity exceeding stock', async () => {
    const result = await addToCart('product-123', 100);
    expect(result.success).toBe(false);
    expect(result.message).toContain('stock');
  });
});

describe('Order Actions', () => {
  test('should create order from cart', async () => {
    await addToCart('product-123', 2);
    const result = await createOrder(mockAddress);
    
    expect(result.success).toBe(true);
    expect(result.data.orderId).toBeDefined();
    
    const cart = await getCart();
    expect(cart.items).toHaveLength(0);
  });
  
  test('should store price at time of purchase', async () => {
    await addToCart('product-123', 1);
    const order = await createOrder(mockAddress);
    
    // Change product price
    await updateProduct('product-123', { price: 99900 });
    
    // Order item price should not change
    const orderDetails = await getOrderById(order.data.orderId);
    expect(orderDetails.items[0].price).toBe(49900); // original price
  });
});
```

#### Query Function Unit Tests

```typescript
describe('Product Queries', () => {
  test('should filter products by category', async () => {
    const products = await getProducts({ category: 'pickles' });
    expect(products.every(p => p.category.slug === 'pickles')).toBe(true);
  });
  
  test('should filter products by price range', async () => {
    const products = await getProducts({ priceMin: 10000, priceMax: 50000 });
    expect(products.every(p => p.price >= 10000 && p.price <= 50000)).toBe(true);
  });
  
  test('should return only active products in search', async () => {
    const products = await getProducts({ search: 'mango' });
    expect(products.every(p => p.isActive === true)).toBe(true);
  });
});

describe('Cart Calculations', () => {
  test('should calculate correct subtotal', () => {
    const items = [
      { price: 10000, quantity: 2 }, // ₹100 × 2
      { price: 5000, quantity: 3 },  // ₹50 × 3
    ];
    const totals = calculateCartTotals(items);
    expect(totals.subtotal).toBe(35000); // ₹350
  });
  
  test('should apply free shipping for orders over ₹500', () => {
    const items = [{ price: 60000, quantity: 1 }]; // ₹600
    const totals = calculateCartTotals(items);
    expect(totals.shipping).toBe(0);
  });
  
  test('should apply ₹50 shipping for orders under ₹500', () => {
    const items = [{ price: 30000, quantity: 1 }]; // ₹300
    const totals = calculateCartTotals(items);
    expect(totals.shipping).toBe(5000); // ₹50
  });
  
  test('should apply percentage coupon correctly', () => {
    const items = [{ price: 100000, quantity: 1 }]; // ₹1000
    const coupon = { discountType: 'PERCENTAGE', discountValue: 10 };
    const totals = calculateCartTotals(items, coupon);
    expect(totals.discount).toBe(10000); // ₹100 (10%)
  });
  
  test('should not allow negative total', () => {
    const items = [{ price: 10000, quantity: 1 }]; // ₹100
    const coupon = { discountType: 'FLAT', discountValue: 20000 }; // ₹200 off
    const totals = calculateCartTotals(items, coupon);
    expect(totals.total).toBeGreaterThanOrEqual(0);
  });
});
```

#### Utility Function Unit Tests

```typescript
describe('Price Utilities', () => {
  test('should format price with 2 decimal places', () => {
    expect(formatPrice(12345)).toBe('₹123.45');
    expect(formatPrice(10000)).toBe('₹100.00');
    expect(formatPrice(99)).toBe('₹0.99');
  });
  
  test('should convert rupees to paise', () => {
    expect(rupeesToPaise(100)).toBe(10000);
    expect(rupeesToPaise(1.5)).toBe(150);
  });
});

describe('Slug Utilities', () => {
  test('should generate valid slug from text', () => {
    expect(generateSlug('Mango Pickle')).toBe('mango-pickle');
    expect(generateSlug('Spicy Chutney!')).toBe('spicy-chutney');
  });
  
  test('should ensure slug uniqueness', async () => {
    const slug1 = await ensureUniqueSlug('mango-pickle');
    const slug2 = await ensureUniqueSlug('mango-pickle');
    expect(slug1).not.toBe(slug2);
    expect(slug2).toMatch(/^mango-pickle-\d+$/);
  });
});
```

#### Integration Tests

```typescript
describe('Checkout Flow Integration', () => {
  test('should complete full checkout flow', async () => {
    // 1. Add products to cart
    await addToCart('product-1', 2);
    await addToCart('product-2', 1);
    
    // 2. Verify cart totals
    const cart = await getCart();
    expect(cart.items).toHaveLength(2);
    
    // 3. Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(cart.total);
    expect(razorpayOrder.orderId).toBeDefined();
    
    // 4. Verify payment and create order
    const order = await verifyPaymentAndCreateOrder(
      razorpayOrder.orderId,
      'mock-payment-id',
      'mock-signature',
      mockAddress
    );
    expect(order.success).toBe(true);
    
    // 5. Verify cart is cleared
    const emptyCart = await getCart();
    expect(emptyCart.items).toHaveLength(0);
    
    // 6. Verify order exists
    const orderDetails = await getOrderById(order.data.orderId);
    expect(orderDetails.items).toHaveLength(2);
  });
});
```

### Test Coverage Goals

- **Server Actions**: 100% coverage (all paths tested)
- **Query Functions**: 100% coverage (all filters tested)
- **Utility Functions**: 100% coverage (all edge cases tested)
- **Components**: 80% coverage (critical user interactions tested)
- **Overall**: 90% code coverage minimum

### Testing Tools

- **Test Runner**: Vitest (fast, ESM-native)
- **Property Testing**: fast-check
- **Mocking**: Vitest mocks for database and external services
- **Test Database**: PostgreSQL test instance with seed data
- **CI/CD**: Run tests on every commit, block merge if tests fail


## Caching and Performance

### Caching Strategy

The system implements a multi-layered caching strategy optimized for the Next.js App Router:

#### Static Generation with ISR

Product pages use Incremental Static Regeneration for optimal performance:

```typescript
// app/shop/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const products = await getProducts({ isActive: true });
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  // ...
}
```

#### Dynamic Pages with No-Store

User-specific pages use no-store to prevent caching:

```typescript
// app/cart/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CartPage() {
  const cart = await getCart();
  // Always fetch fresh cart data
}
```

#### Cache Invalidation

Server Actions invalidate cache after mutations:

```typescript
async function updateProduct(id: string, data: ProductInput) {
  // Update product in database
  await db.update(products).set(data).where(eq(products.id, id));
  
  // Invalidate product list page
  revalidatePath('/shop');
  
  // Invalidate specific product page
  revalidatePath(`/shop/${data.slug}`);
  
  // Invalidate by tag (if using tags)
  revalidateTag('products');
}
```

#### Cache Configuration by Route

| Route | Strategy | Revalidate | Reason |
|-------|----------|------------|--------|
| `/` (Homepage) | ISR | 60s | Featured products change infrequently |
| `/shop` | ISR | 60s | Product list updates periodically |
| `/shop/[slug]` | ISR | 3600s | Product details rarely change |
| `/cart` | Dynamic | 0 | User-specific, always fresh |
| `/checkout` | Dynamic | 0 | User-specific, always fresh |
| `/account/*` | Dynamic | 0 | User-specific, always fresh |
| `/admin/*` | Dynamic | 0 | Admin data, always fresh |
| `/blog` | Static | - | Blog posts are static |
| `/blog/[slug]` | Static | - | Blog posts are static |

### Database Query Optimization

#### Indexes

Critical indexes for query performance:

```sql
-- Products table
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_price ON products(price);

-- Orders table
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Cart items table
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- Reviews table
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Full-text search
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || description));
```

#### Query Patterns

Optimize common queries with proper joins and selections:

```typescript
// Efficient: Select only needed fields
const products = await db
  .select({
    id: products.id,
    name: products.name,
    slug: products.slug,
    price: products.price,
    images: products.images,
  })
  .from(products)
  .where(eq(products.isActive, true));

// Efficient: Join with category in single query
const product = await db
  .select()
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .where(eq(products.slug, slug))
  .limit(1);

// Efficient: Batch load cart items with products
const cartWithItems = await db
  .select()
  .from(cartItems)
  .leftJoin(products, eq(cartItems.productId, products.id))
  .where(eq(cartItems.cartId, cartId));
```

#### Prevent N+1 Queries

Use joins or batch loading instead of sequential queries:

```typescript
// Bad: N+1 query
const orders = await getOrders();
for (const order of orders) {
  order.items = await getOrderItems(order.id); // N queries
}

// Good: Single query with join
const ordersWithItems = await db
  .select()
  .from(orders)
  .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
  .leftJoin(products, eq(orderItems.productId, products.id));
```

### Image Optimization

#### Next.js Image Component

All images use next/image for automatic optimization:

```typescript
<Image
  src={product.images[0]}
  alt={product.name}
  width={600}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={product.blurDataURL}
/>
```

#### Image Storage and CDN

- **Storage**: Cloudflare R2 or Vercel Blob
- **CDN**: Automatic CDN distribution
- **Formats**: WebP with JPEG fallback
- **Sizes**: Multiple sizes generated automatically
- **Lazy Loading**: Below-the-fold images lazy loaded

### Bundle Optimization

#### Code Splitting

- **Route-based splitting**: Automatic with App Router
- **Component splitting**: Dynamic imports for heavy components
- **Vendor splitting**: Separate chunks for node_modules

```typescript
// Dynamic import for heavy components
const AdminDashboard = dynamic(() => import('@/components/admin/dashboard'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

#### Tree Shaking

- Import only needed functions from libraries
- Use ES modules for better tree shaking
- Avoid importing entire libraries

```typescript
// Good: Import specific functions
import { formatPrice } from '@/lib/utils/price';

// Bad: Import entire module
import * as utils from '@/lib/utils';
```

### Performance Monitoring

#### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.5s
- **TTI (Time to Interactive)**: < 3.5s

#### Monitoring Tools

- **Vercel Analytics**: Real user monitoring
- **Lighthouse CI**: Automated performance testing
- **Web Vitals**: Track Core Web Vitals in production


## Security Considerations

### Authentication Security

#### Session Management

- **httpOnly cookies**: Session tokens stored in httpOnly cookies (not accessible via JavaScript)
- **Secure flag**: Cookies only sent over HTTPS in production
- **SameSite**: Set to 'lax' to prevent CSRF attacks
- **Session expiration**: Sessions expire after 7 days of inactivity
- **Token rotation**: New token generated on sensitive operations

#### Password Security

- **Hashing**: bcrypt with salt rounds of 12
- **Minimum requirements**: 8 characters minimum
- **No password storage**: Never log or store plaintext passwords
- **Password reset**: Secure token-based reset flow

### Input Validation and Sanitization

#### Server-Side Validation

All inputs validated on server with Zod schemas:

```typescript
const productSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().min(10).max(2000).trim(),
  price: z.number().int().positive(),
  // ... other fields
});

// Validate before processing
const validated = productSchema.parse(input);
```

#### XSS Prevention

- **React escaping**: React automatically escapes rendered content
- **Sanitize HTML**: Use DOMPurify for any user-generated HTML
- **Content Security Policy**: Strict CSP headers
- **No dangerouslySetInnerHTML**: Avoid unless absolutely necessary

#### SQL Injection Prevention

- **Parameterized queries**: Drizzle ORM uses parameterized queries
- **No raw SQL**: Avoid raw SQL queries where possible
- **Input validation**: Validate all inputs before database operations

```typescript
// Safe: Parameterized query
const products = await db
  .select()
  .from(products)
  .where(eq(products.slug, userInput)); // Automatically parameterized

// Unsafe: Never do this
const products = await db.execute(`SELECT * FROM products WHERE slug = '${userInput}'`);
```

### API Security

#### Rate Limiting

Implement rate limiting on sensitive endpoints:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

Apply to authentication endpoints:

```typescript
async function loginAction(email: string, password: string) {
  const allowed = await checkRateLimit(email);
  if (!allowed) {
    return { success: false, message: 'Too many attempts. Try again later.' };
  }
  // ... proceed with login
}
```

#### CORS Configuration

- **Strict origin**: Only allow requests from own domain
- **Credentials**: Allow credentials for authenticated requests
- **Methods**: Limit to necessary HTTP methods

#### API Key Protection

- **Environment variables**: Store all secrets in environment variables
- **Never expose**: Never send API keys to client
- **Server-only**: Keep Razorpay secret key server-side only

```typescript
// Good: Server Action
async function createRazorpayOrder(amount: number) {
  const razorpay = new Razorpay({
    key_secret: process.env.RAZORPAY_KEY_SECRET!, // Server-side only
  });
  // ...
}

// Bad: Never do this
const razorpaySecret = process.env.RAZORPAY_KEY_SECRET; // In client component
```

### Payment Security

#### Razorpay Integration

- **Signature verification**: Always verify payment signatures server-side
- **Amount validation**: Verify payment amount matches order amount
- **Idempotency**: Prevent duplicate order creation for same payment

```typescript
async function verifyPaymentAndCreateOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  shippingAddress: Address
) {
  // 1. Verify signature
  const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    console.error('Invalid payment signature', { razorpayOrderId, razorpayPaymentId });
    return { success: false, message: 'Payment verification failed' };
  }
  
  // 2. Check if order already created (idempotency)
  const existing = await db
    .select()
    .from(orders)
    .where(eq(orders.razorpayOrderId, razorpayOrderId))
    .limit(1);
  
  if (existing.length > 0) {
    return { success: true, data: { orderId: existing[0].id } };
  }
  
  // 3. Create order
  // ...
}
```

#### PCI Compliance

- **No card storage**: Never store card details
- **Razorpay handles**: All card data handled by Razorpay
- **HTTPS only**: All payment pages served over HTTPS

### Authorization

#### Role-Based Access Control

```typescript
async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  if (session.user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return session;
}

// Use in admin actions
async function deleteProduct(id: string) {
  await requireAdmin();
  // ... proceed with deletion
}
```

#### Resource Ownership

Verify user owns resource before allowing access:

```typescript
async function getOrder(orderId: string) {
  const session = await getSession();
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  
  if (!order[0]) {
    throw new Error('Order not found');
  }
  
  // Verify ownership (unless admin)
  if (order[0].userId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  
  return order[0];
}
```

### Security Headers

Configure security headers in next.config.js:

```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.razorpay.com;",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Logging and Monitoring

#### Security Event Logging

Log security-relevant events:

- Failed login attempts
- Invalid payment signatures
- Unauthorized access attempts
- Rate limit violations
- Admin actions (product/order changes)

```typescript
async function logSecurityEvent(event: string, details: any) {
  console.error('[SECURITY]', event, details);
  // In production: send to Sentry or logging service
}
```

#### Error Handling

- **Never expose stack traces**: Show generic errors to users
- **Log detailed errors**: Log full errors server-side for debugging
- **Sanitize error messages**: Remove sensitive data from error messages


## Deployment and Infrastructure

### Railway Deployment

#### Project Setup

1. **Create Railway project**: Connect GitHub repository
2. **Add PostgreSQL service**: Railway provides managed PostgreSQL
3. **Configure environment variables**: Set all required env vars
4. **Enable automatic deployments**: Deploy on push to main branch

#### Environment Variables

Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Better Auth
AUTH_SECRET=<random-secret-key>
AUTH_URL=https://doonfarm.com

# Razorpay
RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<razorpay-secret-key>

# Email (Resend)
RESEND_API_KEY=<resend-api-key>
FROM_EMAIL=orders@doonfarm.com

# Storage (Cloudflare R2 or Vercel Blob)
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret-key>
R2_BUCKET_NAME=doon-farm-images

# Monitoring
SENTRY_DSN=<sentry-dsn>
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>

# Node Environment
NODE_ENV=production
```

#### Build Configuration

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "format": "biome format --write .",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "tsx lib/db/migrate.ts",
    "db:seed": "tsx lib/db/seed.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Railway build command:
```bash
pnpm install && pnpm db:migrate && pnpm build
```

Railway start command:
```bash
pnpm start
```

#### Database Migrations

Run migrations before deployment:

```typescript
// lib/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migrations complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
```

### Custom Domain Configuration

1. **Add domain in Railway**: Settings → Domains
2. **Configure DNS**: Add CNAME record pointing to Railway
3. **SSL certificate**: Automatic via Let's Encrypt
4. **Force HTTPS**: Redirect HTTP to HTTPS

### Database Backups

Railway provides automatic daily backups:

- **Retention**: 7 days for free tier, 30 days for pro
- **Manual backups**: Create before major changes
- **Restore process**: Available through Railway dashboard

Additional backup strategy:

```bash
# Manual backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240101.sql
```

### Monitoring and Observability

#### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Check database connection
    await db.execute(sql`SELECT 1`);
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

#### Sentry Integration

Error tracking with Sentry:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
});
```

#### Uptime Monitoring

Configure Uptime Robot to monitor:

- **Main site**: https://doonfarm.com (every 5 minutes)
- **Health endpoint**: https://doonfarm.com/api/health (every 5 minutes)
- **Alert contacts**: Email and SMS on downtime

### Performance Optimization for Production

#### Next.js Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pub-xxxxx.r2.dev'], // R2 bucket domain
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
```

#### Compression

Enable compression in production:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Enable compression
  response.headers.set('Content-Encoding', 'gzip');
  
  return response;
}
```

### Scaling Considerations

#### Database Connection Pooling

Use connection pooling for better performance:

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

// Connection pool configuration
const sql = postgres(connectionString, {
  max: 10, // Maximum connections
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Connection timeout
});

export const db = drizzle(sql);
```

#### Horizontal Scaling

Railway supports horizontal scaling:

- **Multiple instances**: Scale to multiple containers
- **Load balancing**: Automatic load balancing
- **Session affinity**: Not required (stateless design)

#### Caching Layer

Consider adding Redis for caching:

- **Session storage**: Store sessions in Redis
- **Rate limiting**: Use Redis for rate limit counters
- **Cache frequently accessed data**: Product lists, categories

### Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Seed data loaded (initial products and categories)
- [ ] Razorpay configured in live mode
- [ ] Custom domain configured with SSL
- [ ] Sentry error tracking configured
- [ ] Uptime monitoring configured
- [ ] Health check endpoint working
- [ ] All tests passing
- [ ] Performance audit completed (Lighthouse score > 90)
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Backup strategy in place
- [ ] Monitoring dashboards set up


## Implementation Notes

### Development Workflow

#### Initial Setup

1. **Clone repository and install dependencies**:
   ```bash
   git clone <repository-url>
   cd doon-farm-ecommerce
   pnpm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Set up database**:
   ```bash
   # Generate migrations
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # Seed initial data
   pnpm db:seed
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

#### Development Best Practices

1. **Use TypeScript strictly**: Enable strict mode, no `any` types
2. **Follow file structure**: Keep components colocated with routes
3. **Server Components by default**: Only use Client Components when needed
4. **Validate all inputs**: Use Zod schemas for validation
5. **Test as you build**: Write tests alongside implementation
6. **Use Biome**: Run `pnpm lint` and `pnpm format` before committing
7. **Commit frequently**: Small, focused commits with clear messages

#### Feature Implementation Order

Recommended order for implementing features:

**Phase 1: Foundation (Week 1)**
1. Project setup and tooling configuration
2. Database schema and migrations
3. Authentication with Better Auth
4. Basic layout (header, footer, navigation)

**Phase 2: Core E-Commerce (Week 2-3)**
5. Product catalog and filtering
6. Product detail pages
7. Shopping cart functionality
8. Search functionality

**Phase 3: Checkout and Orders (Week 3-4)**
9. Checkout flow (multi-step)
10. Razorpay payment integration
11. Order creation and confirmation
12. Email notifications

**Phase 4: User Features (Week 4-5)**
13. User account dashboard
14. Order history and tracking
15. Product reviews and ratings
16. Wishlist functionality

**Phase 5: Admin Panel (Week 5-6)**
17. Admin authentication and authorization
18. Product management (CRUD)
19. Order management and status updates
20. Dashboard with statistics

**Phase 6: Content and SEO (Week 6-7)**
21. Blog with MDX
22. SEO optimization (metadata, structured data)
23. Newsletter subscription
24. Related products recommendations

**Phase 7: Polish and Optimization (Week 7-8)**
25. Image optimization
26. Performance optimization
27. Accessibility improvements
28. Error handling and loading states
29. Mobile responsiveness
30. Testing and bug fixes

**Phase 8: Deployment (Week 8)**
31. Railway deployment setup
32. Environment configuration
33. Domain and SSL setup
34. Monitoring and error tracking
35. Final testing and launch

### Key Implementation Details

#### Price Handling

Always work with prices in paise (integers) internally:

```typescript
// Store in database
const product = {
  price: 49900, // ₹499.00 in paise
};

// Display to user
const displayPrice = formatPrice(product.price); // "₹499.00"

// User input (convert to paise)
const userInputRupees = 499;
const priceInPaise = rupeesToPaise(userInputRupees); // 49900
```

#### Cart State Management

Cart state flows through Server Components and Server Actions:

```typescript
// Server Component (reads cart)
async function CartPage() {
  const cart = await getCart();
  return <CartDisplay cart={cart} />;
}

// Client Component (optimistic updates)
'use client';
function CartItem({ item }) {
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(item.quantity);
  
  async function updateQuantity(newQuantity: number) {
    setOptimisticQuantity(newQuantity); // Immediate UI update
    const result = await updateCartQuantity(item.id, newQuantity);
    if (!result.success) {
      toast.error(result.message);
    }
  }
  
  return (
    <div>
      <QuantityStepper value={optimisticQuantity} onChange={updateQuantity} />
    </div>
  );
}
```

#### Authentication Flow

Better Auth handles authentication, but you need to integrate it:

```typescript
// lib/auth/config.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});

// Get session in Server Component
export async function getSession() {
  const session = await auth.api.getSession({
    headers: headers(),
  });
  return session;
}
```

#### Image Upload Flow

Handle image uploads to R2/Blob storage:

```typescript
// lib/storage/upload.ts
import { put } from '@vercel/blob';

export async function uploadProductImage(file: File): Promise<string> {
  const blob = await put(`products/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });
  return blob.url;
}

// In product form
async function handleImageUpload(files: FileList) {
  const uploadPromises = Array.from(files).map(uploadProductImage);
  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}
```

#### Order Status State Machine

Implement status transitions with validation:

```typescript
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return validTransitions[from].includes(to);
}

async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const order = await getOrderById(orderId);
  
  if (!canTransition(order.status, newStatus)) {
    return {
      success: false,
      message: `Cannot transition from ${order.status} to ${newStatus}`,
    };
  }
  
  // Update status
  await db.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId));
  
  // Handle side effects
  if (newStatus === 'CANCELLED') {
    await restoreStock(orderId);
  }
  if (newStatus === 'SHIPPED') {
    await sendShippingEmail(orderId);
  }
  
  return { success: true };
}
```

### Common Pitfalls to Avoid

1. **Don't use floating-point for prices**: Always use integers (paise)
2. **Don't skip server-side validation**: Always validate on server, even if validated on client
3. **Don't expose API keys**: Keep secrets server-side only
4. **Don't forget cache invalidation**: Call revalidatePath after mutations
5. **Don't create N+1 queries**: Use joins or batch loading
6. **Don't skip error handling**: Handle all error cases gracefully
7. **Don't forget accessibility**: Use semantic HTML and ARIA labels
8. **Don't skip testing**: Write tests as you implement features
9. **Don't hardcode values**: Use environment variables for configuration
10. **Don't forget mobile**: Test on mobile devices throughout development

### Troubleshooting Guide

#### Database Connection Issues

```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Railway logs
railway logs
```

#### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check TypeScript errors
pnpm tsc --noEmit
```

#### Payment Integration Issues

- **Test mode**: Use Razorpay test keys during development
- **Signature verification**: Log the generated signature vs received signature
- **Webhook testing**: Use Razorpay webhook testing tool
- **Amount mismatch**: Ensure amount is in paise, not rupees

#### Performance Issues

- **Slow queries**: Check database indexes, use EXPLAIN ANALYZE
- **Large bundles**: Analyze bundle with `@next/bundle-analyzer`
- **Slow images**: Ensure using next/image with proper sizes
- **Cache not working**: Check revalidate settings and cache headers

## Conclusion

This design document provides a comprehensive blueprint for implementing the Doon Gooseberry Farm e-commerce platform. The design emphasizes:

- **Type safety** through TypeScript and Zod validation
- **Performance** through ISR, caching, and optimization
- **Security** through proper authentication, validation, and authorization
- **Correctness** through property-based testing and comprehensive test coverage
- **Maintainability** through clear architecture and code organization

The monolithic Next.js architecture provides a solid foundation for rapid development while maintaining the flexibility to scale as the business grows. The use of modern tools like Drizzle ORM, Better Auth, and shadcn/ui ensures a productive development experience with excellent type safety and developer ergonomics.

By following this design and implementing the 27 correctness properties through property-based testing, the system will have strong guarantees about its behavior and reliability. The combination of unit tests and property tests provides comprehensive coverage that catches both specific bugs and general correctness issues.

The deployment strategy on Railway with PostgreSQL provides a production-ready hosting solution with automatic scaling, backups, and monitoring. The security measures, including proper authentication, input validation, and payment verification, ensure customer data is protected.

This design is ready to guide implementation through all 40 requirements, with clear patterns for Server Components, Server Actions, database operations, and user interactions. The phased implementation approach allows for incremental development and testing, ensuring each feature is solid before moving to the next.

