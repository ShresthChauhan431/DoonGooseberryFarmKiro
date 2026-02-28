# Requirements Document

## Introduction

This document specifies the requirements for the Doon Gooseberry Farm e-commerce platform, a monolithic Next.js 16 application that enables customers to browse, purchase, and review farm products (pickles, chutneys, jams, juices, candies, and spices) while providing farm administrators with tools to manage products, orders, and customer data.

The platform replaces an existing WordPress-based website with a modern, performant solution built on Next.js 16 App Router, PostgreSQL with Drizzle ORM, Better Auth for authentication, shadcn/ui for components, and Razorpay for payment processing.

## Glossary

- **System**: The Doon Gooseberry Farm e-commerce platform
- **Customer**: A user browsing or purchasing products (authenticated or guest)
- **Admin**: A user with ADMIN role who manages products, orders, and content
- **User**: An authenticated customer with a registered account
- **Guest**: An unauthenticated customer browsing the site
- **Product**: A farm product available for purchase (pickle, chutney, jam, juice, candy, or spice)
- **Cart**: A collection of products selected by a customer for purchase
- **Order**: A completed purchase transaction with payment confirmation
- **Session**: An authenticated user session managed by Better Auth
- **Server_Action**: A Next.js server-side function that handles data mutations
- **Price**: Product price stored as integer in paise (1 rupee = 100 paise)
- **Slug**: A unique URL-friendly identifier for products and categories
- **Verified_Purchase**: An order where the customer successfully purchased the product
- **Wishlist**: A saved collection of products a user wants to purchase later
- **Coupon**: A discount code that reduces order total based on validation rules
- **Review**: Customer feedback with star rating for a product
- **ISR**: Incremental Static Regeneration for cached pages
- **Razorpay**: Payment gateway service for processing transactions
- **Better_Auth**: Authentication library managing sessions and user identity
- **Drizzle_ORM**: TypeScript ORM for database operations
- **Server_Component**: React component that renders on the server
- **Client_Component**: React component that renders in the browser


## Requirements

### Requirement 1: Project Foundation and Tooling

**User Story:** As a developer, I want a properly configured Next.js 16 monolithic application with modern tooling, so that I can build features efficiently with type safety and code quality enforcement.

#### Acceptance Criteria

1. THE System SHALL use Next.js 16 with App Router and TypeScript
2. THE System SHALL use pnpm as the package manager
3. THE System SHALL use Biome for linting and formatting
4. THE System SHALL use Tailwind CSS for styling
5. THE System SHALL use shadcn/ui component library
6. THE System SHALL validate environment variables using Zod schemas
7. THE System SHALL configure TypeScript path aliases for imports
8. WHEN a developer commits code, THE System SHALL run Biome checks via pre-commit hook

### Requirement 2: Database Schema and ORM

**User Story:** As a developer, I want a well-structured PostgreSQL database with type-safe queries, so that I can reliably store and retrieve e-commerce data.

#### Acceptance Criteria

1. THE System SHALL use PostgreSQL as the database
2. THE System SHALL use Drizzle ORM for database operations
3. THE System SHALL define tables for users, sessions, products, categories, orders, order_items, cart, cart_items, reviews, addresses, and coupons
4. THE System SHALL store Price values as integers representing paise
5. THE System SHALL enforce unique constraints on product Slug values
6. THE System SHALL use pgEnum for order status with values: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
7. THE System SHALL define foreign key relationships between related tables
8. THE System SHALL create indexes on frequently queried columns
9. THE System SHALL provide a seed script that populates 17 initial products across 6 categories
10. FOR ALL Price values, THE System SHALL store them as integers and never as floating-point numbers


### Requirement 3: Authentication and Authorization

**User Story:** As a customer, I want to create an account and log in securely, so that I can track my orders and save my preferences.

#### Acceptance Criteria

1. THE System SHALL use Better_Auth for authentication
2. THE System SHALL support email and password authentication
3. THE System SHALL support Google OAuth authentication
4. THE System SHALL create Session records in the database for authenticated users
5. THE System SHALL assign role values of USER or ADMIN to each user account
6. WHEN a user registers, THE System SHALL create a user record with role USER
7. WHEN a user logs in, THE System SHALL create a Session record
8. WHEN a user logs out, THE System SHALL invalidate the Session record
9. THE System SHALL provide middleware that protects authenticated routes
10. THE System SHALL redirect unauthenticated users to the login page when accessing protected routes
11. WHEN an ADMIN user accesses admin routes, THE System SHALL grant access
12. WHEN a USER attempts to access admin routes, THE System SHALL deny access and redirect

### Requirement 4: Shared Layout and Navigation

**User Story:** As a customer, I want consistent navigation across all pages, so that I can easily find products and access my account.

#### Acceptance Criteria

1. THE System SHALL display a header on all pages with logo, category navigation, search icon, cart icon, and user menu
2. THE System SHALL display a footer on all pages with contact information and links
3. THE System SHALL display a cart badge showing the count of items in the cart
4. WHEN the cart contains items, THE System SHALL display the item count on the cart badge
5. WHEN the cart is empty, THE System SHALL display zero on the cart badge
6. WHEN a user is authenticated, THE System SHALL display the user name in the header
7. WHEN a user is not authenticated, THE System SHALL display login and register links
8. THE System SHALL provide a mobile navigation drawer for screens smaller than 768px
9. THE System SHALL load category data from the database for navigation menus
10. THE System SHALL use sticky positioning for the header during scroll


### Requirement 5: Homepage

**User Story:** As a customer, I want an engaging homepage that showcases the farm story and featured products, so that I understand the brand and can quickly start shopping.

#### Acceptance Criteria

1. THE System SHALL display a hero section with farm story headline and call-to-action button
2. THE System SHALL display a featured products carousel with the top 6 products
3. THE System SHALL display a category grid with links to filtered shop pages
4. THE System SHALL display trust badges for "100% Natural", "Farm Fresh", "Free Shipping above ₹500", and "Secure Checkout"
5. THE System SHALL display a testimonials section with customer reviews
6. THE System SHALL provide a newsletter signup form
7. WHEN a customer submits the newsletter form, THE System SHALL save the email to a subscribers table
8. THE System SHALL use next/image with priority for the hero background image
9. THE System SHALL implement the featured products carousel with scroll snap CSS
10. WHEN a customer clicks "Add to Cart" on a featured product, THE System SHALL execute the addToCart Server_Action

### Requirement 6: Product Catalog and Shop Page

**User Story:** As a customer, I want to browse all products with filtering and sorting options, so that I can find products that match my preferences.

#### Acceptance Criteria

1. THE System SHALL display all active products on the /shop page
2. THE System SHALL read filter parameters from URL searchParams (category, sort, priceMin, priceMax)
3. WHEN category filter is applied, THE System SHALL display only products in that category
4. WHEN sort parameter is "price-asc", THE System SHALL display products ordered by price ascending
5. WHEN sort parameter is "price-desc", THE System SHALL display products ordered by price descending
6. WHEN sort parameter is "newest", THE System SHALL display products ordered by creation date descending
7. WHEN priceMin and priceMax are provided, THE System SHALL display only products within that price range
8. THE System SHALL display a filter sidebar on desktop screens
9. THE System SHALL display filters in a slide-over Sheet on mobile screens
10. WHEN a customer changes filters, THE System SHALL update the URL searchParams
11. THE System SHALL display products in a responsive CSS grid layout
12. THE System SHALL use Suspense boundaries with skeleton loading states for the product grid
13. THE System SHALL display each product with image, name, category badge, price, and "Add to Cart" button
14. WHEN a product has a sale price, THE System SHALL display the original price with strikethrough


### Requirement 7: Product Detail Page

**User Story:** As a customer, I want to view detailed information about a product, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. THE System SHALL display product detail pages at /shop/[slug]
2. THE System SHALL display product image gallery with zoom capability
3. THE System SHALL display product name, category, price, and description
4. THE System SHALL display nutritional information for food products
5. THE System SHALL display a quantity selector with increment and decrement buttons
6. THE System SHALL display an "Add to Cart" button
7. WHEN a customer clicks "Add to Cart", THE System SHALL execute the addToCart Server_Action with selected quantity
8. THE System SHALL display customer reviews with star ratings
9. THE System SHALL display related products from the same category
10. THE System SHALL generate metadata using Next.js generateMetadata API
11. THE System SHALL include JSON-LD structured data for Product schema
12. WHEN a product Slug does not exist, THE System SHALL return a 404 error page

### Requirement 8: Search Functionality

**User Story:** As a customer, I want to search for products by name or description, so that I can quickly find specific items.

#### Acceptance Criteria

1. THE System SHALL provide a search input in the header
2. THE System SHALL support keyboard shortcut (⌘K or Ctrl+K) to focus search
3. WHEN a customer submits a search query, THE System SHALL navigate to /search?q=[query]
4. THE System SHALL use PostgreSQL full-text search on product name and description fields
5. THE System SHALL display search results in a grid layout matching the shop page
6. WHEN no results match the query, THE System SHALL display a "No products found" message
7. THE System SHALL highlight matching terms in search results
8. THE System SHALL limit search results to active products only


### Requirement 9: Shopping Cart Management

**User Story:** As a customer, I want to add products to my cart and modify quantities, so that I can prepare my order before checkout.

#### Acceptance Criteria

1. THE System SHALL provide an addToCart Server_Action that accepts productId and quantity
2. THE System SHALL provide a removeFromCart Server_Action that accepts cartItemId
3. THE System SHALL provide an updateCartQuantity Server_Action that accepts cartItemId and quantity
4. THE System SHALL provide a getCart Server_Action that returns cart items with product details
5. WHEN a Guest adds a product to cart, THE System SHALL associate the cart with the session identifier
6. WHEN a User adds a product to cart, THE System SHALL associate the cart with the user identifier
7. WHEN a Guest logs in, THE System SHALL merge the guest cart with the user cart
8. WHEN a product already exists in the cart, THE System SHALL increment the quantity instead of creating a duplicate entry
9. WHEN cart quantity is updated to zero, THE System SHALL remove the cart item
10. WHEN a Server_Action modifies the cart, THE System SHALL call revalidatePath for /cart
11. THE System SHALL use optimistic updates with useOptimistic hook for cart mutations
12. THE System SHALL validate that quantity values are positive integers
13. THE System SHALL validate that requested quantity does not exceed product stock
14. WHEN stock is insufficient, THE System SHALL return an error message

### Requirement 10: Cart Display

**User Story:** As a customer, I want to view my cart contents and see the total cost, so that I can review my order before checkout.

#### Acceptance Criteria

1. THE System SHALL display a dedicated cart page at /cart
2. THE System SHALL provide a cart slide-over Sheet component accessible from the header
3. THE System SHALL display each cart item with product image, name, price, and quantity
4. THE System SHALL provide quantity stepper controls for each cart item
5. THE System SHALL provide a remove button for each cart item
6. THE System SHALL display the subtotal for each cart item (price × quantity)
7. THE System SHALL display the cart subtotal (sum of all item subtotals)
8. THE System SHALL display shipping cost
9. WHEN cart subtotal is ₹500 or greater, THE System SHALL set shipping cost to zero
10. WHEN cart subtotal is less than ₹500, THE System SHALL set shipping cost to ₹50
11. THE System SHALL display the order total (subtotal + shipping)
12. THE System SHALL display a "Continue to Checkout" button
13. WHEN the cart is empty, THE System SHALL display an "Your cart is empty" message
14. THE System SHALL format all Price values as rupees with two decimal places for display


### Requirement 11: Checkout Flow

**User Story:** As a customer, I want a clear multi-step checkout process, so that I can complete my purchase with confidence.

#### Acceptance Criteria

1. THE System SHALL require authentication before accessing checkout
2. WHEN a Guest attempts to access checkout, THE System SHALL redirect to login page
3. THE System SHALL implement a 3-step checkout flow using URL parameter ?step=1,2,3
4. WHEN step=1, THE System SHALL display the shipping address form
5. WHEN step=2, THE System SHALL display the order review summary
6. WHEN step=3, THE System SHALL display the payment interface
7. THE System SHALL validate shipping address using Zod schema
8. THE System SHALL require name, address line 1, city, state, and pincode fields
9. WHEN shipping address is valid, THE System SHALL allow progression to step 2
10. WHEN order review is confirmed, THE System SHALL allow progression to step 3
11. THE System SHALL display order summary with all cart items, quantities, prices, subtotal, shipping, and total
12. THE System SHALL allow customers to edit cart from the review step
13. THE System SHALL validate that cart is not empty before allowing checkout
14. WHEN cart is empty during checkout, THE System SHALL redirect to /cart

### Requirement 12: Payment Processing

**User Story:** As a customer, I want to pay securely using Razorpay, so that I can complete my purchase.

#### Acceptance Criteria

1. THE System SHALL integrate Razorpay payment gateway
2. THE System SHALL create Razorpay orders via Server_Action
3. THE System SHALL never expose Razorpay API keys to the client
4. WHEN payment is initiated, THE System SHALL create a Razorpay order with order total in paise
5. WHEN Razorpay payment succeeds, THE System SHALL verify the payment signature server-side
6. WHEN signature verification succeeds, THE System SHALL create an Order record in the database
7. WHEN signature verification fails, THE System SHALL reject the payment and log the error
8. WHEN Order is created, THE System SHALL create order_items records for each cart item
9. WHEN Order is created, THE System SHALL set order status to PENDING
10. WHEN Order is created, THE System SHALL clear the customer cart
11. WHEN Order is created, THE System SHALL redirect to /order/[orderId]/success
12. THE System SHALL store the Razorpay payment ID with the Order record
13. THE System SHALL store the price at time of purchase in order_items (not reference product price)


### Requirement 13: Order Confirmation and Email

**User Story:** As a customer, I want to receive an order confirmation email, so that I have a record of my purchase.

#### Acceptance Criteria

1. THE System SHALL display an order success page at /order/[orderId]/success
2. THE System SHALL display order number, items purchased, quantities, total amount, and estimated delivery date
3. THE System SHALL display shipping address on the success page
4. THE System SHALL provide a link to view order details in the account dashboard
5. WHEN an Order is created, THE System SHALL send a confirmation email to the customer
6. THE System SHALL use React Email for email templates
7. THE System SHALL use Resend service to send emails
8. THE System SHALL include order summary, order number, and support contact in the email
9. WHEN email sending fails, THE System SHALL log the error but not block order creation
10. THE System SHALL format the email template with product images and farm branding

### Requirement 14: User Account Dashboard

**User Story:** As a customer, I want to view my order history and manage my account, so that I can track purchases and update my information.

#### Acceptance Criteria

1. THE System SHALL provide a user dashboard at /account
2. THE System SHALL protect the /account route with authentication middleware
3. THE System SHALL display tabs for "My Orders", "Addresses", "Profile Settings", and "Wishlist"
4. WHEN "My Orders" tab is active, THE System SHALL display a list of all user orders
5. THE System SHALL display order number, date, status, and total for each order
6. THE System SHALL provide status badges with colors: PENDING (yellow), PROCESSING (blue), SHIPPED (purple), DELIVERED (green), CANCELLED (red)
7. WHEN a customer clicks an order, THE System SHALL navigate to /account/orders/[orderId]
8. WHEN "Addresses" tab is active, THE System SHALL display saved addresses
9. THE System SHALL provide add, edit, and delete actions for addresses
10. THE System SHALL allow customers to mark one address as default
11. WHEN "Profile Settings" tab is active, THE System SHALL display name and email
12. THE System SHALL allow customers to update their name
13. WHEN "Wishlist" tab is active, THE System SHALL display wishlist items


### Requirement 15: Order Detail and Tracking

**User Story:** As a customer, I want to view detailed information about my orders and track their status, so that I know when to expect delivery.

#### Acceptance Criteria

1. THE System SHALL display order detail pages at /account/orders/[orderId]
2. THE System SHALL verify that the order belongs to the authenticated user
3. WHEN an order does not belong to the user, THE System SHALL return a 403 forbidden error
4. THE System SHALL display order number, order date, and current status
5. THE System SHALL display a status timeline showing order progression
6. THE System SHALL display all order items with product images, names, quantities, and prices
7. THE System SHALL display subtotal, shipping cost, discount (if applied), and total
8. THE System SHALL display shipping address
9. THE System SHALL display payment method and transaction ID
10. THE System SHALL display estimated delivery date based on order status

### Requirement 16: Admin Panel Access Control

**User Story:** As an admin, I want secure access to the admin panel, so that I can manage the e-commerce platform.

#### Acceptance Criteria

1. THE System SHALL provide an admin panel at /admin
2. THE System SHALL protect all /admin routes with authentication middleware
3. WHEN a user with role ADMIN accesses /admin routes, THE System SHALL grant access
4. WHEN a user with role USER accesses /admin routes, THE System SHALL redirect to homepage
5. WHEN an unauthenticated user accesses /admin routes, THE System SHALL redirect to login page
6. THE System SHALL display an admin sidebar with navigation links
7. THE System SHALL use a distinct layout for admin pages separate from the public site


### Requirement 17: Admin Product Management

**User Story:** As an admin, I want to create, edit, and delete products, so that I can maintain the product catalog.

#### Acceptance Criteria

1. THE System SHALL display a products table at /admin/products
2. THE System SHALL display product name, category, price, stock, and status for each product
3. THE System SHALL provide a "Create Product" button
4. THE System SHALL provide edit and delete actions for each product
5. WHEN creating a product, THE System SHALL display a form with fields: name, slug, description, price, category, stock, images, and isActive
6. THE System SHALL validate that Slug is unique before creating a product
7. WHEN Slug is not unique, THE System SHALL return an error message
8. THE System SHALL generate Slug automatically from product name if not provided
9. THE System SHALL support image upload to Cloudflare R2 or Vercel Blob storage
10. THE System SHALL allow multiple images per product stored as JSONB array
11. WHEN editing a product, THE System SHALL pre-populate the form with existing values
12. WHEN deleting a product, THE System SHALL prompt for confirmation
13. WHEN a product is deleted, THE System SHALL set isActive to false instead of removing the record
14. THE System SHALL validate all product data using Zod schemas
15. THE System SHALL execute all product mutations via Server_Action
16. WHEN product data changes, THE System SHALL call revalidatePath for affected pages

### Requirement 18: Admin Order Management

**User Story:** As an admin, I want to view and update order statuses, so that I can fulfill customer orders.

#### Acceptance Criteria

1. THE System SHALL display an orders table at /admin/orders
2. THE System SHALL display order number, customer name, date, status, and total for each order
3. THE System SHALL provide filters for order status
4. WHEN a status filter is applied, THE System SHALL display only orders with that status
5. WHEN an admin clicks an order, THE System SHALL display full order details
6. THE System SHALL provide a status dropdown to update order status
7. THE System SHALL allow status transitions: PENDING → PROCESSING → SHIPPED → DELIVERED
8. THE System SHALL allow status transition: PENDING → CANCELLED
9. THE System SHALL allow status transition: PROCESSING → CANCELLED
10. WHEN order status changes to SHIPPED, THE System SHALL send a shipping notification email to the customer
11. WHEN order status changes to DELIVERED, THE System SHALL send a delivery confirmation email to the customer
12. THE System SHALL execute status updates via Server_Action
13. WHEN order status changes, THE System SHALL record the timestamp of the change


### Requirement 19: Admin Dashboard Statistics

**User Story:** As an admin, I want to see key business metrics at a glance, so that I can monitor platform performance.

#### Acceptance Criteria

1. THE System SHALL display a dashboard at /admin
2. THE System SHALL display total orders count for today, this week, and this month
3. THE System SHALL display total revenue for today, this week, and this month
4. THE System SHALL display a list of products with stock below 10 units
5. THE System SHALL display the 10 most recent orders
6. THE System SHALL calculate all statistics using Drizzle ORM aggregate queries
7. THE System SHALL render the dashboard as a Server_Component
8. THE System SHALL display statistics in card components with clear labels
9. THE System SHALL format revenue values as rupees with two decimal places

### Requirement 20: Product Reviews and Ratings

**User Story:** As a customer, I want to read and write product reviews, so that I can make informed decisions and share my experience.

#### Acceptance Criteria

1. THE System SHALL display reviews on product detail pages
2. THE System SHALL display star rating (1-5 stars) for each review
3. THE System SHALL display review text, reviewer name, and review date
4. THE System SHALL calculate and display average rating for each product
5. THE System SHALL display rating distribution (count of 5-star, 4-star, etc.)
6. THE System SHALL provide a "Write Review" button on product pages
7. WHEN a User clicks "Write Review", THE System SHALL verify the user has a Verified_Purchase
8. WHEN a user has not purchased the product, THE System SHALL display "Purchase required to review"
9. WHEN a user has purchased the product, THE System SHALL display the review form
10. THE System SHALL require star rating (1-5) and review text
11. THE System SHALL validate review text is between 10 and 500 characters
12. WHEN a review is submitted, THE System SHALL save it via Server_Action
13. WHEN a review is saved, THE System SHALL call revalidatePath for the product page
14. THE System SHALL allow one review per user per product
15. WHEN a user has already reviewed a product, THE System SHALL display "Edit Review" instead of "Write Review"


### Requirement 21: Wishlist Management

**User Story:** As a customer, I want to save products to a wishlist, so that I can purchase them later.

#### Acceptance Criteria

1. THE System SHALL display a heart icon on product cards and product detail pages
2. WHEN a User clicks the heart icon, THE System SHALL toggle the product in the wishlist
3. WHEN a product is in the wishlist, THE System SHALL display a filled heart icon
4. WHEN a product is not in the wishlist, THE System SHALL display an outlined heart icon
5. THE System SHALL execute wishlist toggle via Server_Action
6. THE System SHALL display wishlist items at /account/wishlist
7. THE System SHALL display product image, name, price, and "Add to Cart" button for each wishlist item
8. THE System SHALL provide a remove button for each wishlist item
9. WHEN a Guest clicks the heart icon, THE System SHALL store wishlist items in localStorage
10. WHEN a Guest logs in, THE System SHALL merge localStorage wishlist with database wishlist
11. WHEN merging wishlists, THE System SHALL avoid duplicate entries
12. THE System SHALL use optimistic updates for wishlist toggle actions

### Requirement 22: Coupon Code System

**User Story:** As a customer, I want to apply discount coupons at checkout, so that I can save money on my purchase.

#### Acceptance Criteria

1. THE System SHALL provide a coupon code input field at checkout
2. WHEN a customer enters a coupon code, THE System SHALL validate it via Server_Action
3. THE System SHALL validate that the coupon code exists in the database
4. THE System SHALL validate that the coupon has not expired
5. THE System SHALL validate that the coupon has not exceeded maximum uses
6. THE System SHALL validate that the order subtotal meets the minimum order value
7. WHEN all validations pass, THE System SHALL apply the discount to the order total
8. WHEN coupon discount type is percentage, THE System SHALL calculate discount as (subtotal × percentage / 100)
9. WHEN coupon discount type is flat, THE System SHALL subtract the flat amount from subtotal
10. WHEN validation fails, THE System SHALL return a descriptive error message
11. THE System SHALL display the applied discount in the order summary
12. THE System SHALL store the coupon code and discount amount with the Order record
13. WHEN an Order is created with a coupon, THE System SHALL increment the coupon usage count


### Requirement 23: Blog for SEO and Content Marketing

**User Story:** As a customer, I want to read blog posts about recipes and farm stories, so that I can learn more about the products and farm.

#### Acceptance Criteria

1. THE System SHALL provide a blog at /blog
2. THE System SHALL use MDX files stored in src/content/blog/ for blog posts
3. THE System SHALL use next-mdx-remote to render MDX content
4. THE System SHALL display a list of blog posts with title, excerpt, date, and featured image
5. THE System SHALL display individual blog posts at /blog/[slug]
6. THE System SHALL generate metadata for each blog post using generateMetadata API
7. THE System SHALL include Open Graph tags for social media sharing
8. THE System SHALL support code syntax highlighting in blog posts
9. THE System SHALL support embedded images in blog posts using next/image
10. THE System SHALL display related products at the end of recipe blog posts

### Requirement 24: SEO and Metadata

**User Story:** As a business owner, I want the website to rank well in search engines, so that customers can discover our products.

#### Acceptance Criteria

1. THE System SHALL use Next.js Metadata API for all pages
2. THE System SHALL generate unique title and description for each page
3. THE System SHALL include Open Graph tags for social media sharing
4. THE System SHALL include Twitter Card tags
5. THE System SHALL include JSON-LD structured data for Product schema on product pages
6. THE System SHALL include JSON-LD structured data for Organization schema on the homepage
7. THE System SHALL include JSON-LD structured data for BreadcrumbList on category and product pages
8. THE System SHALL generate a sitemap.xml file
9. THE System SHALL generate a robots.txt file
10. THE System SHALL use semantic HTML elements (header, nav, main, article, footer)
11. THE System SHALL include alt text for all images


### Requirement 25: Image Optimization

**User Story:** As a customer, I want pages to load quickly with optimized images, so that I have a smooth browsing experience.

#### Acceptance Criteria

1. THE System SHALL use next/image component for all images
2. THE System SHALL serve images in WebP format
3. THE System SHALL define sizes prop for responsive images
4. THE System SHALL use priority loading for above-the-fold images
5. THE System SHALL use lazy loading for below-the-fold images
6. THE System SHALL generate blur placeholders for product images
7. THE System SHALL store uploaded images in Cloudflare R2 or Vercel Blob storage
8. THE System SHALL serve images through a CDN
9. THE System SHALL compress images to reduce file size
10. THE System SHALL define width and height attributes to prevent layout shift

### Requirement 26: Caching Strategy

**User Story:** As a customer, I want pages to load quickly, so that I can browse products efficiently.

#### Acceptance Criteria

1. THE System SHALL use Incremental Static Regeneration (ISR) for product detail pages
2. THE System SHALL revalidate product list pages every 60 seconds
3. THE System SHALL use no-store cache directive for cart pages
4. THE System SHALL use no-store cache directive for checkout pages
5. THE System SHALL use no-store cache directive for account pages
6. THE System SHALL use no-store cache directive for admin pages
7. WHEN a product is created or updated, THE System SHALL call revalidatePath for /shop
8. WHEN a product is created or updated, THE System SHALL call revalidatePath for /shop/[slug]
9. WHEN an order status changes, THE System SHALL call revalidatePath for /admin/orders
10. THE System SHALL use revalidateTag for cache invalidation where appropriate


### Requirement 27: Loading States and Error Handling

**User Story:** As a customer, I want clear feedback when pages are loading or errors occur, so that I understand what is happening.

#### Acceptance Criteria

1. THE System SHALL provide loading.tsx files for all route segments
2. THE System SHALL provide error.tsx files for all route segments
3. THE System SHALL display skeleton loaders for product grids during loading
4. THE System SHALL display skeleton loaders for product detail pages during loading
5. THE System SHALL display skeleton loaders for cart during loading
6. THE System SHALL use optimistic updates for cart actions with loading indicators
7. WHEN a Server_Action fails, THE System SHALL display an error message to the user
8. WHEN a page fails to load, THE System SHALL display the error boundary with retry option
9. THE System SHALL log all errors to the console in development mode
10. THE System SHALL send all errors to Sentry in production mode
11. THE System SHALL provide user-friendly error messages (not technical stack traces)

### Requirement 28: Deployment and Production Configuration

**User Story:** As a business owner, I want the application deployed to production with monitoring, so that customers can access the platform reliably.

#### Acceptance Criteria

1. THE System SHALL deploy to Railway hosting platform
2. THE System SHALL deploy PostgreSQL database on Railway
3. THE System SHALL configure all environment variables in Railway dashboard
4. THE System SHALL run database migrations before deployment
5. THE System SHALL configure custom domain with SSL certificate
6. THE System SHALL integrate Sentry for error tracking
7. THE System SHALL configure Uptime Robot for availability monitoring
8. THE System SHALL provide a /api/health endpoint that checks database connectivity
9. WHEN database connection fails, THE /api/health endpoint SHALL return 503 status
10. WHEN database connection succeeds, THE /api/health endpoint SHALL return 200 status
11. THE System SHALL enable Railway automatic backups for the database
12. THE System SHALL configure Razorpay in live mode (not test mode)
13. THE System SHALL never commit .env files to version control


### Requirement 29: Data Serialization and Parsing

**User Story:** As a developer, I want reliable data serialization for JSONB fields and API responses, so that data integrity is maintained.

#### Acceptance Criteria

1. THE System SHALL store product images as JSONB array in the database
2. THE System SHALL store shipping addresses as JSONB object in orders table
3. THE System SHALL parse JSONB data when reading from the database
4. THE System SHALL serialize data to JSONB when writing to the database
5. THE System SHALL validate JSONB structure using Zod schemas before database operations
6. FOR ALL JSONB fields, parsing then serializing then parsing SHALL produce equivalent data (round-trip property)
7. WHEN JSONB parsing fails, THE System SHALL log the error and return a default value
8. THE System SHALL use JSON.stringify for serialization
9. THE System SHALL use JSON.parse for deserialization
10. THE System SHALL handle null and undefined values in JSONB fields

### Requirement 30: Price Calculation Correctness

**User Story:** As a customer, I want accurate price calculations throughout my shopping experience, so that I am charged correctly.

#### Acceptance Criteria

1. THE System SHALL calculate cart subtotal as the sum of (item price × item quantity) for all cart items
2. THE System SHALL calculate shipping cost as ₹50 when subtotal is less than ₹500
3. THE System SHALL calculate shipping cost as ₹0 when subtotal is ₹500 or greater
4. WHEN a percentage coupon is applied, THE System SHALL calculate discount as (subtotal × percentage / 100)
5. WHEN a flat coupon is applied, THE System SHALL calculate discount as the coupon amount
6. THE System SHALL calculate order total as (subtotal + shipping - discount)
7. THE System SHALL ensure order total is never negative
8. WHEN discount exceeds subtotal, THE System SHALL set order total to shipping cost only
9. FOR ALL price calculations, THE System SHALL use integer arithmetic in paise
10. FOR ALL price calculations, converting to rupees then back to paise SHALL preserve the original value (round-trip property)
11. THE System SHALL round all displayed prices to 2 decimal places
12. THE System SHALL maintain price consistency between cart display, checkout, and order confirmation


### Requirement 31: Form Validation and Data Integrity

**User Story:** As a developer, I want all user inputs validated before processing, so that invalid data never enters the system.

#### Acceptance Criteria

1. THE System SHALL validate all form inputs using Zod schemas
2. THE System SHALL validate inputs on both client and server
3. WHEN validation fails on the client, THE System SHALL display inline error messages
4. WHEN validation fails on the server, THE System SHALL return error messages to the client
5. THE System SHALL validate email format using regex pattern
6. THE System SHALL validate phone numbers are 10 digits
7. THE System SHALL validate pincode is 6 digits
8. THE System SHALL validate product price is a positive integer
9. THE System SHALL validate product stock is a non-negative integer
10. THE System SHALL validate quantity is a positive integer
11. THE System SHALL validate rating is between 1 and 5
12. THE System SHALL sanitize text inputs to prevent XSS attacks
13. THE System SHALL validate that required fields are not empty
14. FOR ALL validated forms, submitting valid data SHALL succeed and submitting invalid data SHALL fail

### Requirement 32: Inventory Management

**User Story:** As an admin, I want the system to track product inventory, so that customers cannot purchase out-of-stock items.

#### Acceptance Criteria

1. THE System SHALL store stock quantity for each product
2. WHEN a product is added to cart, THE System SHALL verify stock availability
3. WHEN requested quantity exceeds available stock, THE System SHALL return an error
4. WHEN an order is created, THE System SHALL decrement product stock by the ordered quantity
5. WHEN an order is cancelled, THE System SHALL increment product stock by the ordered quantity
6. THE System SHALL display "Out of Stock" badge when stock is zero
7. THE System SHALL disable "Add to Cart" button when stock is zero
8. THE System SHALL display "Low Stock" badge when stock is below 10 units
9. THE System SHALL use database transactions for stock updates to prevent race conditions
10. FOR ALL stock operations, THE System SHALL ensure stock never becomes negative


### Requirement 33: Accessibility Compliance

**User Story:** As a customer with disabilities, I want the website to be accessible, so that I can use it with assistive technologies.

#### Acceptance Criteria

1. THE System SHALL use semantic HTML elements
2. THE System SHALL provide alt text for all images
3. THE System SHALL ensure all interactive elements are keyboard accessible
4. THE System SHALL provide visible focus indicators for keyboard navigation
5. THE System SHALL use ARIA labels where semantic HTML is insufficient
6. THE System SHALL maintain color contrast ratio of at least 4.5:1 for text
7. THE System SHALL provide skip navigation links
8. THE System SHALL ensure form inputs have associated labels
9. THE System SHALL provide error messages that are announced to screen readers
10. THE System SHALL support screen reader navigation
11. THE System SHALL achieve Lighthouse accessibility score of 90 or higher

### Requirement 34: Performance Optimization

**User Story:** As a customer, I want fast page loads, so that I can browse products without delays.

#### Acceptance Criteria

1. THE System SHALL achieve Lighthouse performance score of 90 or higher
2. THE System SHALL achieve First Contentful Paint (FCP) under 1.5 seconds
3. THE System SHALL achieve Largest Contentful Paint (LCP) under 2.5 seconds
4. THE System SHALL achieve Time to Interactive (TTI) under 3.5 seconds
5. THE System SHALL achieve Cumulative Layout Shift (CLS) under 0.1
6. THE System SHALL use code splitting for route-based chunks
7. THE System SHALL preload critical resources
8. THE System SHALL defer non-critical JavaScript
9. THE System SHALL minimize CSS and JavaScript bundle sizes
10. THE System SHALL use compression (gzip or brotli) for text assets
11. THE System SHALL implement database query optimization with proper indexes
12. THE System SHALL limit database queries per page to prevent N+1 problems


### Requirement 35: Mobile Responsiveness

**User Story:** As a customer using a mobile device, I want the website to work well on my screen size, so that I can shop comfortably.

#### Acceptance Criteria

1. THE System SHALL use responsive design for all pages
2. THE System SHALL support screen sizes from 320px to 2560px width
3. THE System SHALL use mobile-first CSS approach
4. THE System SHALL display navigation in a drawer on screens smaller than 768px
5. THE System SHALL display filters in a slide-over Sheet on screens smaller than 768px
6. THE System SHALL use touch-friendly button sizes (minimum 44×44px)
7. THE System SHALL optimize images for mobile bandwidth
8. THE System SHALL use appropriate font sizes for mobile readability
9. THE System SHALL test on iOS Safari and Android Chrome browsers
10. THE System SHALL prevent horizontal scrolling on mobile devices
11. THE System SHALL use viewport meta tag for proper mobile scaling

### Requirement 36: Security Best Practices

**User Story:** As a business owner, I want the platform to be secure, so that customer data is protected.

#### Acceptance Criteria

1. THE System SHALL use HTTPS for all connections
2. THE System SHALL store passwords using bcrypt hashing
3. THE System SHALL never expose API keys or secrets to the client
4. THE System SHALL validate and sanitize all user inputs
5. THE System SHALL use parameterized queries to prevent SQL injection
6. THE System SHALL implement CSRF protection for forms
7. THE System SHALL set secure HTTP headers (CSP, X-Frame-Options, etc.)
8. THE System SHALL use httpOnly cookies for session tokens
9. THE System SHALL implement rate limiting for authentication endpoints
10. THE System SHALL log security events (failed logins, unauthorized access attempts)
11. THE System SHALL keep all dependencies updated to patch security vulnerabilities
12. THE System SHALL never log sensitive data (passwords, payment details)


### Requirement 37: Newsletter Subscription

**User Story:** As a customer, I want to subscribe to the newsletter, so that I can receive updates about new products and offers.

#### Acceptance Criteria

1. THE System SHALL provide a newsletter signup form on the homepage
2. THE System SHALL require email address for subscription
3. THE System SHALL validate email format before submission
4. WHEN a customer submits the form, THE System SHALL save the email to a subscribers table
5. WHEN an email already exists, THE System SHALL display "Already subscribed" message
6. WHEN subscription succeeds, THE System SHALL display a success message
7. THE System SHALL execute subscription via Server_Action
8. THE System SHALL validate email using Zod schema
9. THE System SHALL store subscription timestamp
10. THE System SHALL provide an unsubscribe mechanism (future enhancement placeholder)

### Requirement 38: Related Products Recommendation

**User Story:** As a customer, I want to see related products, so that I can discover items I might be interested in.

#### Acceptance Criteria

1. THE System SHALL display related products on product detail pages
2. THE System SHALL select related products from the same category
3. THE System SHALL exclude the current product from related products
4. THE System SHALL display up to 4 related products
5. THE System SHALL randomize related product selection
6. THE System SHALL display related products with image, name, price, and link
7. WHEN fewer than 4 products exist in the category, THE System SHALL display all available products
8. WHEN no other products exist in the category, THE System SHALL hide the related products section


### Requirement 39: Order Status Workflow

**User Story:** As a business owner, I want orders to follow a defined status workflow, so that order fulfillment is tracked consistently.

#### Acceptance Criteria

1. THE System SHALL create orders with status PENDING
2. THE System SHALL allow status transition from PENDING to PROCESSING
3. THE System SHALL allow status transition from PROCESSING to SHIPPED
4. THE System SHALL allow status transition from SHIPPED to DELIVERED
5. THE System SHALL allow status transition from PENDING to CANCELLED
6. THE System SHALL allow status transition from PROCESSING to CANCELLED
7. THE System SHALL prevent status transition from SHIPPED to CANCELLED
8. THE System SHALL prevent status transition from DELIVERED to any other status
9. THE System SHALL prevent status transition from CANCELLED to any other status
10. WHEN an invalid status transition is attempted, THE System SHALL return an error message
11. FOR ALL valid status transitions, applying the transition SHALL update the order status
12. FOR ALL invalid status transitions, applying the transition SHALL fail with an error

### Requirement 40: Guest Checkout Prevention

**User Story:** As a business owner, I want customers to create accounts before checkout, so that I can build a customer database and enable order tracking.

#### Acceptance Criteria

1. THE System SHALL require authentication for checkout
2. WHEN a Guest attempts to access /checkout, THE System SHALL redirect to /login
3. THE System SHALL preserve the cart during the login redirect
4. WHEN a Guest logs in from the checkout redirect, THE System SHALL return to /checkout
5. THE System SHALL display a message encouraging account creation before checkout
6. THE System SHALL allow Guests to browse products and add items to cart
7. THE System SHALL store Guest cart using session identifier
8. WHEN a Guest registers, THE System SHALL preserve the cart contents


## Correctness Properties

These properties define testable invariants and relationships that must hold throughout the system.

### Property 1: Price Integrity (Invariant)
- All Price values stored in the database SHALL be non-negative integers
- Converting price from paise to rupees and back to paise SHALL yield the original value
- Cart subtotal SHALL always equal the sum of (item price × quantity) for all items

### Property 2: Cart-Order Consistency (Invariant)
- When an Order is created, the order total SHALL match the cart total at time of creation
- Order items SHALL preserve the price at time of purchase, not reference current product price
- Order item quantities SHALL match cart item quantities at time of order creation

### Property 3: Stock Conservation (Invariant)
- Product stock SHALL never be negative
- Sum of (order item quantities for product X) + (current stock of product X) SHALL equal initial stock
- When order is cancelled, restoring stock SHALL return to previous stock level

### Property 4: Authentication State (Invariant)
- A user SHALL have at most one active Session at a time
- Protected routes SHALL only be accessible when a valid Session exists
- Admin routes SHALL only be accessible when Session role equals ADMIN

### Property 5: JSONB Round-Trip (Round Trip Property)
- FOR ALL product images arrays: parse(serialize(images)) SHALL equal images
- FOR ALL shipping addresses: parse(serialize(address)) SHALL equal address
- FOR ALL JSONB fields: deserializing then serializing SHALL produce equivalent data

### Property 6: Cart Merge Idempotence (Idempotence)
- Merging a guest cart with user cart twice SHALL produce the same result as merging once
- Adding the same product to cart twice SHALL increment quantity, not create duplicate entries
- Applying the same coupon code twice SHALL not double the discount

### Property 7: Filter Consistency (Metamorphic Property)
- Number of products after applying category filter SHALL be less than or equal to total products
- Number of products after applying price range filter SHALL be less than or equal to total products
- Applying multiple filters SHALL never increase the result count

### Property 8: Order Status Progression (State Machine Property)
- Order status SHALL only transition through valid state paths
- Once an order reaches DELIVERED or CANCELLED, status SHALL not change
- Invalid status transitions SHALL always fail with an error

### Property 9: Coupon Validation (Error Conditions)
- Expired coupons SHALL always fail validation
- Coupons exceeding max uses SHALL always fail validation
- Orders below minimum value SHALL fail coupon validation
- Valid coupons meeting all criteria SHALL pass validation

### Property 10: Search Completeness (Metamorphic Property)
- Searching for product name SHALL return that product if it exists and is active
- Search results SHALL only include active products (isActive = true)
- Empty search query SHALL return all active products

### Property 11: Review Authorization (Invariant)
- Only users with Verified_Purchase SHALL create reviews
- Each user SHALL have at most one review per product
- Review rating SHALL always be between 1 and 5 inclusive

### Property 12: Slug Uniqueness (Invariant)
- No two products SHALL have the same Slug value
- Creating a product with existing Slug SHALL fail
- Updating a product to an existing Slug SHALL fail

