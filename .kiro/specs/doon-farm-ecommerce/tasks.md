# Implementation Tasks: Doon Gooseberry Farm E-Commerce Platform

## Overview

This task list provides a step-by-step implementation plan for the Doon Gooseberry Farm e-commerce platform. The implementation follows a 10-phase approach, building incrementally from project foundation through deployment. Each task references specific requirements and includes property-based tests to validate correctness.

## Implementation Language

**TypeScript** with Next.js 16 App Router

## Tasks

- [x] 0. Phase 0: Project Setup and Tooling
  - [x] 0.1 Initialize Next.js 16 project with TypeScript and App Router
    - Create new Next.js project with `pnpm create next-app@latest`
    - Configure TypeScript with strict mode enabled
    - Set up pnpm as package manager
    - Configure path aliases (@/ for src/)
    - _Requirements: 1.1, 1.2, 1.7_
  
  - [x] 0.2 Install and configure Biome for linting and formatting
    - Install Biome package
    - Create biome.json configuration file
    - Configure pre-commit hooks with husky
    - Add lint and format scripts to package.json
    - _Requirements: 1.3, 1.8_
  
  - [x] 0.3 Set up Tailwind CSS and shadcn/ui
    - Install Tailwind CSS and dependencies
    - Configure tailwind.config.js with custom theme
    - Initialize shadcn/ui with `npx shadcn-ui@latest init`
    - Install core shadcn/ui components (Button, Card, Input, Label, Select, Sheet, Dialog, Tabs)
    - _Requirements: 1.4, 1.5_
  
  - [x] 0.4 Configure environment variables with Zod validation
    - Create .env.example file with all required variables
    - Create lib/env.ts with Zod schemas for environment validation
    - Validate environment variables at build time
    - Document all environment variables
    - _Requirements: 1.6_


- [x] 1. Phase 1: Database Schema and ORM Setup
  - [x] 1.1 Install and configure Drizzle ORM with PostgreSQL
    - Install drizzle-orm, drizzle-kit, and postgres packages
    - Create lib/db/index.ts with database connection
    - Configure drizzle.config.ts for migrations
    - Set up connection pooling (max 10 connections)
    - _Requirements: 2.1, 2.2_
  
  - [x] 1.2 Define database schema with all 11 tables
    - Create lib/db/schema.ts with all table definitions
    - Define enums: roleEnum, orderStatusEnum, discountTypeEnum
    - Define tables: users, sessions, categories, products, carts, cart_items, orders, order_items, reviews, addresses, coupons, wishlist, subscribers
    - Set up foreign key relationships and constraints
    - Add unique constraints on slug fields
    - _Requirements: 2.3, 2.5, 2.6, 2.7_
  
  - [x] 1.3 Create database indexes for query optimization
    - Add indexes on products (category_id, slug, is_active, price)
    - Add indexes on orders (user_id, status, created_at)
    - Add indexes on cart_items (cart_id, product_id)
    - Add indexes on reviews (product_id, user_id)
    - Add full-text search index on products (name, description)
    - _Requirements: 2.8_
  
  - [x] 1.4 Generate and run database migrations
    - Run `pnpm db:generate` to create migration files
    - Create lib/db/migrate.ts script
    - Test migrations on local database
    - _Requirements: 2.1, 2.2_
  
  - [x] 1.5 Create database seed script with initial data
    - Create lib/db/seed.ts script
    - Seed 6 categories (Pickles, Chutneys, Jams, Juices, Candies, Spices)
    - Seed 17 initial products with realistic data
    - Create admin user account
    - _Requirements: 2.9_
  
  - [x] 1.6 Write property test for price integer storage
    - **Property 1: Price Integer Storage**
    - **Validates: Requirements 2.4, 2.10, 30.10**
    - Test that converting paise to rupees and back preserves original value
    - Use fast-check with 100 iterations
  
  - [x] 1.7 Write property test for slug uniqueness
    - **Property 2: Slug Uniqueness**
    - **Validates: Requirements 2.5**
    - Test that creating products with duplicate slugs fails
    - Test that slug generation ensures uniqueness


- [x] 2. Phase 2: Authentication with Better Auth
  - [x] 2.1 Install and configure Better Auth
    - Install better-auth package
    - Create lib/auth/config.ts with Better Auth configuration
    - Configure Drizzle adapter for session storage
    - Set up email/password authentication
    - Configure Google OAuth provider
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 2.2 Create authentication API routes
    - Create app/api/auth/[...all]/route.ts for Better Auth
    - Export GET and POST handlers
    - Test authentication endpoints
    - _Requirements: 3.1_
  
  - [x] 2.3 Create session helper functions
    - Create lib/auth/session.ts with getSession() helper
    - Create requireAuth() helper for protected routes
    - Create requireAdmin() helper for admin routes
    - _Requirements: 3.9, 3.11_
  
  - [x] 2.4 Implement authentication middleware
    - Create middleware.ts for route protection
    - Protect /account routes (require authentication)
    - Protect /admin routes (require ADMIN role)
    - Protect /checkout routes (require authentication)
    - Implement redirects with return URLs
    - _Requirements: 3.9, 3.10, 3.11, 3.12, 16.2, 16.3, 16.4, 16.5, 40.2_
  
  - [x] 2.5 Create login page
    - Create app/(auth)/login/page.tsx
    - Build login form with email and password fields
    - Add Google OAuth button
    - Implement form validation with Zod
    - Handle login errors and display messages
    - _Requirements: 3.2, 3.3, 3.7_
  
  - [x] 2.6 Create registration page
    - Create app/(auth)/register/page.tsx
    - Build registration form with email, password, and name fields
    - Set default role to USER
    - Implement form validation with Zod
    - Handle registration errors
    - _Requirements: 3.2, 3.6_
  
  - [x] 2.7 Implement logout functionality
    - Create logout Server Action in lib/actions/auth.ts
    - Invalidate session on logout
    - Redirect to homepage after logout
    - _Requirements: 3.8_


- [x] 3. Phase 3: Shared Layout and Navigation
  - [x] 3.1 Create root layout with global styles
    - Create app/layout.tsx with HTML structure
    - Import global Tailwind CSS
    - Configure font (Inter or similar)
    - Add metadata configuration
    - _Requirements: 4.1, 4.2_
  
  - [x] 3.2 Build header component with navigation
    - Create components/layout/header.tsx
    - Add logo and site branding
    - Build category navigation menu
    - Add search icon (placeholder for now)
    - Add cart icon with badge
    - Add user menu (login/register or user name)
    - Implement sticky positioning
    - _Requirements: 4.1, 4.6, 4.7, 4.10_
  
  - [x] 3.3 Build footer component
    - Create components/layout/footer.tsx
    - Add contact information
    - Add navigation links (About, Contact, Privacy, Terms)
    - Add social media links
    - _Requirements: 4.2_
  
  - [x] 3.4 Create mobile navigation drawer
    - Create components/layout/mobile-nav.tsx
    - Use shadcn/ui Sheet component
    - Display category navigation
    - Display user menu items
    - Show only on screens < 768px
    - _Requirements: 4.8_
  
  - [x] 3.5 Build cart badge component
    - Create components/layout/cart-badge.tsx
    - Query cart item count from database
    - Display count on badge
    - Show zero when cart is empty
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [x] 3.6 Create public layout wrapper
    - Create app/(shop)/layout.tsx
    - Include header and footer
    - Apply to all public pages
    - _Requirements: 4.1, 4.2_
  
  - [x] 3.7 Load categories for navigation
    - Create lib/queries/categories.ts
    - Implement getCategories() query function
    - Use in header component for navigation menu
    - _Requirements: 4.9_


- [x] 4. Phase 4: Homepage
  - [x] 4.1 Create homepage with hero section
    - Create app/(shop)/page.tsx
    - Build hero section with farm story headline
    - Add call-to-action button linking to /shop
    - Use next/image with priority for hero background
    - _Requirements: 5.1, 5.8_
  
  - [x] 4.2 Build featured products carousel
    - Create components/product/featured-carousel.tsx
    - Query top 6 products from database
    - Implement scroll snap CSS for carousel
    - Display product cards with image, name, price
    - Add "Add to Cart" button on each card
    - _Requirements: 5.2, 5.9, 5.10_
  
  - [x] 4.3 Create category grid section
    - Build category grid with 6 categories
    - Link each category to /shop?category=[slug]
    - Display category images and names
    - Use responsive grid layout
    - _Requirements: 5.3_
  
  - [x] 4.4 Add trust badges section
    - Display 4 trust badges: "100% Natural", "Farm Fresh", "Free Shipping above ₹500", "Secure Checkout"
    - Use icons from lucide-react
    - Create responsive grid layout
    - _Requirements: 5.4_
  
  - [x] 4.5 Build testimonials section
    - Create testimonials component
    - Display 3-4 customer testimonials
    - Include customer name and rating
    - Use Card component from shadcn/ui
    - _Requirements: 5.5_
  
  - [x] 4.6 Create newsletter signup form
    - Create components/newsletter-form.tsx
    - Build form with email input
    - Validate email format with Zod
    - Create subscribeNewsletter Server Action
    - Save email to subscribers table
    - Display success/error messages
    - _Requirements: 5.6, 5.7, 37.1, 37.2, 37.3, 37.4, 37.5, 37.6, 37.7, 37.8, 37.9_


- [x] 5. Phase 5: Product Catalog and Shop Page
  - [x] 5.1 Create product query functions
    - Create lib/queries/products.ts
    - Implement getProducts() with filter support (category, sort, priceMin, priceMax, search, isActive)
    - Implement getProductBySlug()
    - Implement getRelatedProducts()
    - Use Drizzle ORM with proper joins
    - _Requirements: 6.1, 6.2_
  
  - [x] 5.2 Build shop page with product grid
    - Create app/(shop)/shop/page.tsx
    - Read filter parameters from URL searchParams
    - Query products with filters
    - Display products in responsive CSS grid
    - Use Suspense boundaries with skeleton loaders
    - _Requirements: 6.1, 6.2, 6.11, 6.12_
  
  - [x] 5.3 Create product card component
    - Create components/product/product-card.tsx
    - Display product image with next/image
    - Display name, category badge, price
    - Show sale price with strikethrough if applicable
    - Add "Add to Cart" button
    - Display "Out of Stock" badge when stock is zero
    - Display "Low Stock" badge when stock < 10
    - _Requirements: 6.13, 6.14, 32.6, 32.8_
  
  - [x] 5.4 Build filter sidebar for desktop
    - Create components/product/product-filters.tsx
    - Add category filter (checkboxes)
    - Add price range filter (min/max inputs)
    - Add sort dropdown (price-asc, price-desc, newest)
    - Update URL searchParams on filter change
    - Display on desktop screens (≥768px)
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.10_
  
  - [x] 5.5 Create mobile filter sheet
    - Use shadcn/ui Sheet component
    - Display filters in slide-over on mobile
    - Show on screens < 768px
    - Include same filters as desktop sidebar
    - _Requirements: 6.9_
  
  - [x] 5.6 Write property test for category filter consistency
    - **Property 17: Category Filter Consistency**
    - **Validates: Requirements 6.3**
    - Test that all filtered products belong to specified category
    - Test that filtered count ≤ total count
  
  - [x] 5.7 Write property test for price range filter consistency
    - **Property 18: Price Range Filter Consistency**
    - **Validates: Requirements 6.7**
    - Test that all filtered products are within price range
    - Test that filtered count ≤ total count


- [x] 6. Phase 6: Product Detail Page
  - [x] 6.1 Create product detail page
    - Create app/(shop)/shop/[slug]/page.tsx
    - Implement generateStaticParams for ISR
    - Query product by slug with category relation
    - Return 404 if product not found
    - Set revalidate to 3600 seconds
    - _Requirements: 7.1, 7.12_
  
  - [x] 6.2 Build product image gallery
    - Create components/product/product-gallery.tsx
    - Display main product image
    - Add thumbnail navigation for multiple images
    - Implement zoom capability on hover/click
    - Use next/image with proper sizes
    - _Requirements: 7.2_
  
  - [x] 6.3 Display product information
    - Show product name, category, price
    - Display full description
    - Show nutritional information (if available)
    - Display stock status
    - _Requirements: 7.3, 7.4_
  
  - [x] 6.4 Create quantity selector component
    - Create components/product/quantity-selector.tsx
    - Add increment and decrement buttons
    - Validate quantity is positive integer
    - Disable increment when quantity reaches stock limit
    - _Requirements: 7.5_
  
  - [x] 6.5 Add "Add to Cart" functionality
    - Display "Add to Cart" button
    - Call addToCart Server Action with selected quantity
    - Show success toast on add
    - Disable button when out of stock
    - _Requirements: 7.6, 7.7, 32.7_
  
  - [x] 6.6 Display product reviews section
    - Query reviews for product
    - Calculate and display average rating
    - Show rating distribution (5-star, 4-star, etc.)
    - Display individual reviews with star rating, comment, reviewer name, date
    - _Requirements: 7.8, 20.1, 20.2, 20.3, 20.4, 20.5_
  
  - [x] 6.7 Add "Write Review" functionality
    - Display "Write Review" button
    - Check if user has verified purchase
    - Show "Purchase required to review" if no purchase
    - Display review form if verified purchase exists
    - _Requirements: 7.8, 20.6, 20.7, 20.8_
  
  - [x] 6.8 Show related products
    - Query related products from same category
    - Exclude current product
    - Display up to 4 related products
    - Use product card component
    - _Requirements: 7.9, 38.1, 38.2, 38.3, 38.4, 38.7, 38.8_
  
  - [x] 6.9 Add SEO metadata and structured data
    - Implement generateMetadata API
    - Include JSON-LD structured data for Product schema
    - Add Open Graph tags
    - _Requirements: 7.10, 7.11, 24.5_
  
  - [x] 6.10 Write property test for related products filtering
    - **Property 20: Related Products Filtering**
    - **Validates: Requirements 38.2, 38.3**
    - Test that related products are from same category
    - Test that current product is excluded
    - Test that count ≤ 4


- [-] 7. Phase 7: Search Functionality
  - [x] 7.1 Create search page
    - Create app/(shop)/search/page.tsx
    - Read query parameter from URL (?q=)
    - Use PostgreSQL full-text search on product name and description
    - Display results in grid layout matching shop page
    - _Requirements: 8.3, 8.4, 8.5_
  
  - [x] 7.2 Add search input to header
    - Update components/layout/header.tsx
    - Add search input field
    - Implement keyboard shortcut (⌘K or Ctrl+K)
    - Navigate to /search?q=[query] on submit
    - _Requirements: 8.1, 8.2_
  
  - [x] 7.3 Handle empty search results
    - Display "No products found" message when no results
    - Show search query in message
    - Provide link to browse all products
    - _Requirements: 8.6_
  
  - [x] 7.4 Filter search to active products only
    - Ensure search only returns products with isActive = true
    - _Requirements: 8.7_
  
  - [x] 7.5 Write property test for search active products only
    - **Property 19: Search Active Products Only**
    - **Validates: Requirements 8.7**
    - Test that all search results have isActive = true


- [x] 8. Phase 8: Shopping Cart
  - [x] 8.1 Create cart query functions
    - Create lib/queries/cart.ts
    - Implement getCart() with cart items and product details
    - Implement calculateCartTotals() for subtotal, shipping, discount, total
    - _Requirements: 9.4_
  
  - [x] 8.2 Create cart Server Actions
    - Create lib/actions/cart.ts
    - Implement addToCart(productId, quantity)
    - Implement updateCartQuantity(cartItemId, quantity)
    - Implement removeFromCart(cartItemId)
    - Implement mergeCart(sessionId, userId) for guest login
    - Validate quantity is positive integer
    - Validate quantity doesn't exceed stock
    - Call revalidatePath('/cart') after mutations
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.10, 9.12, 9.13_
  
  - [x] 8.3 Handle guest and user carts
    - Associate guest carts with session identifier
    - Associate user carts with user identifier
    - Merge guest cart with user cart on login
    - _Requirements: 9.5, 9.6, 9.7_
  
  - [x] 8.4 Implement cart duplicate prevention
    - Check if product exists in cart before adding
    - Increment quantity if product already in cart
    - Don't create duplicate cart items
    - _Requirements: 9.8_
  
  - [x] 8.5 Handle quantity updates and removal
    - Remove cart item when quantity updated to zero
    - Return error when quantity exceeds stock
    - _Requirements: 9.9, 9.14_
  
  - [x] 8.6 Create cart page
    - Create app/(shop)/cart/page.tsx
    - Display all cart items with product details
    - Show quantity stepper for each item
    - Show remove button for each item
    - Display cart summary with subtotal, shipping, total
    - Show "Your cart is empty" when cart is empty
    - Add "Continue to Checkout" button
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.11, 10.12, 10.13_
  
  - [x] 8.7 Build cart item component
    - Create components/cart/cart-item.tsx
    - Display product image, name, price
    - Show quantity stepper with optimistic updates
    - Show item subtotal (price × quantity)
    - Add remove button
    - Use useOptimistic hook for immediate UI feedback
    - _Requirements: 10.3, 10.4, 10.5, 10.6, 9.11_
  
  - [x] 8.8 Create cart summary component
    - Create components/cart/cart-summary.tsx
    - Display subtotal, shipping cost, total
    - Apply free shipping rule (₹500 threshold)
    - Format prices with 2 decimal places
    - _Requirements: 10.7, 10.8, 10.9, 10.10, 10.11, 10.14_
  
  - [x] 8.9 Build cart slide-over sheet
    - Create components/cart/cart-sheet.tsx
    - Use shadcn/ui Sheet component
    - Display cart items and summary
    - Accessible from header cart icon
    - _Requirements: 10.2_
  
  - [x] 8.10 Write property test for cart quantity validation
    - **Property 3: Cart Quantity Validation**
    - **Validates: Requirements 9.12, 9.13, 32.3**
    - Test that invalid quantities fail
    - Test that quantities exceeding stock fail
  
  - [x] 8.11 Write property test for cart duplicate prevention
    - **Property 4: Cart Duplicate Prevention**
    - **Validates: Requirements 9.8**
    - Test that adding existing product increments quantity
    - Test that no duplicate cart items are created
  
  - [x] 8.12 Write property test for cart merge idempotence
    - **Property 5: Cart Merge Idempotence**
    - **Validates: Requirements 9.7**
    - Test that merging twice produces same result as merging once
  
  - [x] 8.13 Write property test for shipping cost calculation
    - **Property 6: Shipping Cost Calculation**
    - **Validates: Requirements 10.9, 10.10, 30.2, 30.3**
    - Test that subtotal < ₹500 results in ₹50 shipping
    - Test that subtotal ≥ ₹500 results in ₹0 shipping
  
  - [x] 8.14 Write property test for cart subtotal calculation
    - **Property 8: Cart Subtotal Calculation**
    - **Validates: Requirements 30.1**
    - Test that subtotal equals sum of (price × quantity) for all items
  
  - [ ]* 8.15 Write property test for price formatting
    - **Property 7: Price Formatting**
    - **Validates: Requirements 10.14**
    - Test that prices display with exactly 2 decimal places and ₹ symbol


- [x] 9. Phase 9: Checkout and Payment
  - [x] 9.1 Create checkout page with multi-step flow
    - Create app/(shop)/checkout/page.tsx
    - Implement 3-step flow using URL parameter (?step=1,2,3)
    - Require authentication (redirect to login if guest)
    - Validate cart is not empty
    - _Requirements: 11.1, 11.2, 11.3, 11.13, 11.14_
  
  - [x] 9.2 Build shipping address form (Step 1)
    - Create components/checkout/address-form.tsx
    - Add fields: name, addressLine1, addressLine2, city, state, pincode, phone
    - Validate with Zod schema
    - Require name, addressLine1, city, state, pincode
    - Validate pincode is 6 digits
    - Validate phone is 10 digits
    - Allow progression to step 2 when valid
    - _Requirements: 11.4, 11.7, 11.8, 11.9, 31.6, 31.7_
  
  - [x] 9.3 Build order review component (Step 2)
    - Create components/checkout/order-review.tsx
    - Display all cart items with quantities and prices
    - Show subtotal, shipping, total
    - Display shipping address
    - Allow editing cart
    - Allow progression to step 3 when confirmed
    - _Requirements: 11.5, 11.10, 11.11, 11.12_
  
  - [x] 9.4 Integrate Razorpay payment gateway
    - Install razorpay package
    - Create lib/payment/razorpay.ts
    - Implement createRazorpayOrder()
    - Implement verifyPaymentSignature()
    - Never expose Razorpay secret key to client
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [x] 9.5 Build payment form component (Step 3)
    - Create components/checkout/payment-form.tsx
    - Create Razorpay order via Server Action
    - Load Razorpay SDK on client
    - Display Razorpay payment modal
    - Handle payment success callback
    - _Requirements: 11.6, 12.4_
  
  - [x] 9.6 Create order Server Actions
    - Create lib/actions/orders.ts
    - Implement createRazorpayOrder(amount)
    - Implement verifyPaymentAndCreateOrder()
    - Verify payment signature server-side
    - Create order record in database transaction
    - Create order_items from cart_items
    - Store price at time of purchase
    - Decrement product stock
    - Clear cart after order creation
    - _Requirements: 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13_
  
  - [x] 9.7 Handle coupon codes
    - Add coupon code input to checkout
    - Create validateCoupon Server Action
    - Validate coupon exists, not expired, not exceeded max uses
    - Validate order meets minimum value
    - Calculate discount (percentage or flat)
    - Apply discount to order total
    - Store coupon code with order
    - Increment coupon usage count
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 22.10, 22.11, 22.12, 22.13_
  
  - [x] 9.8 Write property test for coupon discount calculation
    - **Property 9: Coupon Discount Calculation**
    - **Validates: Requirements 22.8, 22.9, 30.4, 30.5**
    - Test percentage discount calculation
    - Test flat discount calculation
  
  - [ ]* 9.9 Write property test for order total calculation
    - **Property 10: Order Total Calculation**
    - **Validates: Requirements 30.6, 30.7, 30.8**
    - Test that total = subtotal + shipping - discount
    - Test that total is never negative
    - Test that excessive discount results in total = shipping only
  
  - [ ]* 9.10 Write property test for coupon validation rules
    - **Property 11: Coupon Validation Rules**
    - **Validates: Requirements 22.3, 22.4, 22.5, 22.6**
    - Test that expired coupons fail
    - Test that coupons at max uses fail
    - Test that orders below minimum fail
    - Test that valid coupons pass
  
  - [ ]* 9.11 Write property test for payment signature verification
    - **Property 13: Payment Signature Verification**
    - **Validates: Requirements 12.5**
    - Test that valid signatures pass verification
    - Test that invalid signatures fail verification
  
  - [ ]* 9.12 Write property test for order creation consistency
    - **Property 12: Order Creation Consistency**
    - **Validates: Requirements 12.8, 12.10, 12.13**
    - Test that order items count equals cart items count
    - Test that order items store price at time of purchase
    - Test that cart is empty after order creation


- [x] 10. Phase 10: Order Confirmation and Email
  - [x] 10.1 Create order success page
    - Create app/(shop)/order/[orderId]/success/page.tsx
    - Display order number, items, quantities, total
    - Show shipping address
    - Display estimated delivery date
    - Provide link to order details in account dashboard
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 10.2 Set up email service with React Email and Resend
    - Install @react-email/components and resend packages
    - Configure Resend API key
    - Create lib/email/send.ts with email sending logic
    - _Requirements: 13.6, 13.7_
  
  - [x] 10.3 Create order confirmation email template
    - Create lib/email/templates/order-confirmation.tsx
    - Include order summary, order number, items, total
    - Add support contact information
    - Use farm branding and product images
    - _Requirements: 13.5, 13.8, 13.10_
  
  - [x] 10.4 Send confirmation email on order creation
    - Call sendEmail() after order creation
    - Don't block order creation if email fails
    - Log email errors
    - _Requirements: 13.5, 13.9_
  
  - [x] 10.5 Create shipping notification email template
    - Create lib/email/templates/order-shipped.tsx
    - Include order number and tracking information
    - _Requirements: 18.10_
  
  - [x] 10.6 Create delivery confirmation email template
    - Create lib/email/templates/order-delivered.tsx
    - Include order number and delivery confirmation
    - _Requirements: 18.11_


- [x] 11. Phase 11: User Account Dashboard
  - [x] 11.1 Create account dashboard layout
    - Create app/account/layout.tsx
    - Protect with authentication middleware
    - Add navigation tabs: "My Orders", "Addresses", "Profile Settings", "Wishlist"
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [x] 11.2 Build "My Orders" tab
    - Create app/account/page.tsx (default to orders tab)
    - Query user orders from database
    - Display order number, date, status, total
    - Add status badges with colors (PENDING: yellow, PROCESSING: blue, SHIPPED: purple, DELIVERED: green, CANCELLED: red)
    - Link to order detail page
    - _Requirements: 14.4, 14.5, 14.6, 14.7_
  
  - [x] 11.3 Create order detail page
    - Create app/account/orders/[orderId]/page.tsx
    - Verify order belongs to authenticated user
    - Return 403 if order doesn't belong to user
    - Display order number, date, status
    - Show status timeline with progression
    - Display all order items with images, names, quantities, prices
    - Show subtotal, shipping, discount, total
    - Display shipping address
    - Show payment method and transaction ID
    - Display estimated delivery date
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10_
  
  - [x] 11.4 Build "Addresses" tab
    - Display saved addresses
    - Add "Add Address" button
    - Provide edit and delete actions for each address
    - Allow marking one address as default
    - _Requirements: 14.8, 14.9, 14.10_
  
  - [x] 11.5 Create address management Server Actions
    - Create lib/actions/addresses.ts
    - Implement createAddress()
    - Implement updateAddress()
    - Implement deleteAddress()
    - Implement setDefaultAddress()
  
  - [x] 11.6 Build "Profile Settings" tab
    - Display user name and email
    - Allow updating name
    - Email is read-only
    - _Requirements: 14.11, 14.12_
  
  - [x] 11.7 Create "Wishlist" tab placeholder
    - Display wishlist items (will be implemented in Phase 13)
    - _Requirements: 14.13_


- [x] 12. Phase 12: Admin Panel
  - [x] 12.1 Create admin layout with sidebar
    - Create app/admin/layout.tsx
    - Protect with admin middleware (require ADMIN role)
    - Build sidebar navigation: Dashboard, Products, Orders
    - Use distinct styling from public site
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_
  
  - [x] 12.2 Build admin dashboard with statistics
    - Create app/admin/page.tsx
    - Query and display total orders (today, week, month)
    - Query and display total revenue (today, week, month)
    - Display products with stock < 10 units
    - Show 10 most recent orders
    - Use Drizzle ORM aggregate queries
    - Display in card components
    - Format revenue as rupees with 2 decimals
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9_
  
  - [x] 12.3 Create admin products table page
    - Create app/admin/products/page.tsx
    - Display all products in table
    - Show name, category, price, stock, status
    - Add "Create Product" button
    - Provide edit and delete actions for each product
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  
  - [x] 12.4 Build product creation page
    - Create app/admin/products/new/page.tsx
    - Display form with fields: name, slug, description, price, category, stock, images, isActive
    - Validate with Zod schema
    - Generate slug from name if not provided
    - Support image upload to Cloudflare R2 or Vercel Blob
    - Allow multiple images (JSONB array)
    - _Requirements: 17.5, 17.8, 17.9, 17.10_
  
  - [x] 12.5 Build product edit page
    - Create app/admin/products/[id]/edit/page.tsx
    - Pre-populate form with existing product data
    - Use same form as creation page
    - _Requirements: 17.11_
  
  - [x] 12.6 Create product management Server Actions
    - Create lib/actions/products.ts
    - Implement createProduct() with admin check
    - Implement updateProduct() with admin check
    - Implement deleteProduct() (soft delete, set isActive = false)
    - Validate slug uniqueness
    - Call revalidatePath after mutations
    - _Requirements: 17.6, 17.7, 17.12, 17.13, 17.14, 17.15, 17.16_
  
  - [x] 12.7 Create admin orders table page
    - Create app/admin/orders/page.tsx
    - Display all orders in table
    - Show order number, customer name, date, status, total
    - Add status filter dropdown
    - Filter orders by status when applied
    - Link to order detail page
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [x] 12.8 Build admin order detail page
    - Create app/admin/orders/[id]/page.tsx
    - Display full order details
    - Add status dropdown to update order status
    - Allow valid status transitions only
    - Record timestamp on status change
    - _Requirements: 18.5, 18.6, 18.13_
  
  - [x] 12.9 Implement order status update Server Action
    - Add updateOrderStatus() to lib/actions/orders.ts
    - Validate user is admin
    - Validate status transition is allowed
    - Update order status in database
    - Send shipping email when status changes to SHIPPED
    - Send delivery email when status changes to DELIVERED
    - Restore stock when status changes to CANCELLED
    - Call revalidatePath('/admin/orders')
    - _Requirements: 18.7, 18.8, 18.9, 18.10, 18.11, 18.12_
  
  - [ ]* 12.10 Write property test for order status valid transitions
    - **Property 21: Order Status Valid Transitions**
    - **Validates: Requirements 39.2, 39.3, 39.4, 39.5, 39.6, 39.11, 39.12**
    - Test that valid transitions succeed
    - Test that invalid transitions fail
  
  - [ ]* 12.11 Write property test for order status terminal states
    - **Property 22: Order Status Terminal States**
    - **Validates: Requirements 39.7, 39.8, 39.9**
    - Test that DELIVERED and CANCELLED cannot transition to other states


- [x] 13. Phase 13: Customer Features (Reviews, Wishlist)
  - [x] 13.1 Create review submission Server Action
    - Create lib/actions/reviews.ts
    - Implement submitReview(productId, rating, comment)
    - Validate user is authenticated
    - Validate rating is 1-5
    - Validate comment length (10-500 chars)
    - Check if user has verified purchase
    - Return error if no purchase
    - Check if review already exists
    - Update existing review or create new review
    - Call revalidatePath for product page
    - _Requirements: 20.9, 20.10, 20.11, 20.12, 20.13, 20.14, 20.15_
  
  - [x] 13.2 Build review form component
    - Create components/product/review-form.tsx
    - Add star rating selector (1-5 stars)
    - Add comment textarea
    - Validate with Zod schema
    - Display success/error messages
    - _Requirements: 20.9, 20.10, 20.11_
  
  - [x] 13.3 Create wishlist Server Actions
    - Create lib/actions/wishlist.ts
    - Implement toggleWishlist(productId)
    - Check if product in wishlist
    - Add or remove based on current state
    - Call revalidatePath('/account/wishlist')
    - Return new state (added/removed)
    - _Requirements: 21.2, 21.5_
  
  - [x] 13.4 Add wishlist heart icon to product cards
    - Update components/product/product-card.tsx
    - Display heart icon (filled if in wishlist, outlined if not)
    - Call toggleWishlist on click
    - Use optimistic updates
    - _Requirements: 21.1, 21.3, 21.4, 21.12_
  
  - [x] 13.5 Add wishlist heart icon to product detail page
    - Update app/(shop)/shop/[slug]/page.tsx
    - Display heart icon near product name
    - Same functionality as product card
    - _Requirements: 21.1, 21.2_
  
  - [x] 13.6 Handle guest wishlist in localStorage
    - Store guest wishlist items in localStorage
    - Merge with database wishlist on login
    - Avoid duplicate entries during merge
    - _Requirements: 21.9, 21.10, 21.11_
  
  - [x] 13.7 Build wishlist page
    - Update app/account/page.tsx wishlist tab
    - Display wishlist items with image, name, price
    - Add "Add to Cart" button for each item
    - Add remove button for each item
    - _Requirements: 21.6, 21.7, 21.8_
  
  - [ ]* 13.8 Write property test for review authorization
    - **Property 23: Review Authorization**
    - **Validates: Requirements 20.7**
    - Test that only users with verified purchase can review
    - Test that users without purchase receive error
  
  - [ ]* 13.9 Write property test for review uniqueness
    - **Property 24: Review Uniqueness**
    - **Validates: Requirements 20.14**
    - Test that each user has at most one review per product
  
  - [ ]* 13.10 Write property test for wishlist toggle idempotence
    - **Property 25: Wishlist Toggle Idempotence**
    - **Validates: Requirements 21.2**
    - Test that toggling twice returns to original state
  
  - [ ]* 13.11 Write property test for wishlist merge deduplication
    - **Property 26: Wishlist Merge Deduplication**
    - **Validates: Requirements 21.11**
    - Test that merged wishlist has no duplicate products


- [x] 14. Phase 14: Inventory Management
  - [x] 14.1 Implement stock validation in cart actions
    - Update addToCart to check stock availability
    - Return error when quantity exceeds stock
    - Return error when stock is zero
    - _Requirements: 32.2, 32.3_
  
  - [x] 14.2 Implement stock updates in order creation
    - Decrement product stock when order is created
    - Use database transaction to prevent race conditions
    - Ensure stock never becomes negative
    - _Requirements: 32.4, 32.10_
  
  - [x] 14.3 Implement stock restoration on order cancellation
    - Increment product stock when order is cancelled
    - Restore exact quantity from order items
    - _Requirements: 32.5_
  
  - [x] 14.4 Display stock status on product pages
    - Show "Out of Stock" badge when stock is zero
    - Show "Low Stock" badge when stock < 10
    - Disable "Add to Cart" button when stock is zero
    - _Requirements: 32.6, 32.7, 32.8_
  
  - [ ]* 14.5 Write property test for stock conservation
    - **Property 15: Stock Conservation**
    - **Validates: Requirements 32.4, 32.5, 32.10**
    - Test that stock never becomes negative
    - Test that order creation decrements stock
    - Test that order cancellation restores stock
  
  - [ ]* 14.6 Write property test for stock availability validation
    - **Property 16: Stock Availability Validation**
    - **Validates: Requirements 32.2**
    - Test that zero stock prevents cart addition
    - Test that quantity exceeding stock fails


- [x] 15. Phase 15: Blog and Content
  - [x] 15.1 Set up MDX for blog posts
    - Install next-mdx-remote package
    - Create src/content/blog/ directory
    - Configure MDX processing
    - _Requirements: 23.2, 23.3_
  
  - [x] 15.2 Create blog listing page
    - Create app/(shop)/blog/page.tsx
    - Read MDX files from content directory
    - Display list of blog posts with title, excerpt, date, featured image
    - Use static generation
    - _Requirements: 23.1, 23.4_
  
  - [x] 15.3 Create blog post page
    - Create app/(shop)/blog/[slug]/page.tsx
    - Render MDX content with next-mdx-remote
    - Support code syntax highlighting
    - Support embedded images with next/image
    - Generate metadata with generateMetadata API
    - Include Open Graph tags
    - _Requirements: 23.5, 23.6, 23.7, 23.8, 23.9_
  
  - [x] 15.4 Add related products to recipe posts
    - Display related products at end of recipe posts
    - Query products by category or tags
    - _Requirements: 23.10_
  
  - [x] 15.5 Create sample blog posts
    - Write 3-5 sample MDX blog posts
    - Include recipes, farm stories, product highlights
    - Add featured images


- [x] 16. Phase 16: SEO and Metadata
  - [x] 16.1 Configure global metadata
    - Update app/layout.tsx with site-wide metadata
    - Add title template
    - Add default description
    - Add Open Graph defaults
    - Add Twitter Card defaults
    - _Requirements: 24.1, 24.2, 24.3, 24.4_
  
  - [x] 16.2 Add JSON-LD structured data for homepage
    - Add Organization schema to homepage
    - Include business name, logo, contact info
    - _Requirements: 24.6_
  
  - [x] 16.3 Add JSON-LD structured data for product pages
    - Add Product schema to product detail pages
    - Include name, description, price, availability, rating
    - _Requirements: 24.5_
  
  - [x] 16.4 Add JSON-LD breadcrumb schema
    - Add BreadcrumbList schema to category and product pages
    - Show navigation hierarchy
    - _Requirements: 24.7_
  
  - [x] 16.5 Generate sitemap.xml
    - Create app/sitemap.ts
    - Include all static and dynamic routes
    - Include product and blog post URLs
    - _Requirements: 24.8_
  
  - [x] 16.6 Generate robots.txt
    - Create app/robots.ts
    - Allow all crawlers
    - Reference sitemap.xml
    - _Requirements: 24.9_
  
  - [x] 16.7 Ensure semantic HTML throughout
    - Use header, nav, main, article, footer elements
    - Verify all pages use proper HTML5 semantics
    - _Requirements: 24.10_
  
  - [x] 16.8 Add alt text to all images
    - Audit all images for alt text
    - Add descriptive alt text where missing
    - _Requirements: 24.11_


- [x] 17. Phase 17: Image Optimization
  - [x] 17.1 Configure next/image for all images
    - Audit all image usage
    - Replace img tags with next/image
    - Define width and height attributes
    - _Requirements: 25.1, 25.10_
  
  - [x] 17.2 Configure image formats and optimization
    - Enable WebP format in next.config.js
    - Configure device sizes and image sizes
    - _Requirements: 25.2_
  
  - [x] 17.3 Add responsive image sizes
    - Define sizes prop for responsive images
    - Optimize for mobile, tablet, desktop
    - _Requirements: 25.3_
  
  - [x] 17.4 Implement priority loading for hero images
    - Add priority prop to above-the-fold images
    - Use lazy loading for below-the-fold images
    - _Requirements: 25.4, 25.5_
  
  - [x] 17.5 Generate blur placeholders
    - Add blur placeholders for product images
    - Use base64 encoded thumbnails
    - _Requirements: 25.6_
  
  - [x] 17.6 Set up image storage
    - Configure Cloudflare R2 or Vercel Blob
    - Implement image upload functionality
    - Serve images through CDN
    - _Requirements: 25.7, 25.8_
  
  - [x] 17.7 Compress images
    - Optimize all static images
    - Configure compression settings
    - _Requirements: 25.9_


- [x] 18. Phase 18: Caching and Performance
  - [x] 18.1 Configure ISR for product pages
    - Set revalidate = 3600 for product detail pages
    - Implement generateStaticParams
    - _Requirements: 26.1_
  
  - [x] 18.2 Configure revalidation for product list
    - Set revalidate = 60 for shop page
    - _Requirements: 26.2_
  
  - [x] 18.3 Configure no-store for dynamic pages
    - Set dynamic = 'force-dynamic' for cart page
    - Set dynamic = 'force-dynamic' for checkout page
    - Set dynamic = 'force-dynamic' for account pages
    - Set dynamic = 'force-dynamic' for admin pages
    - _Requirements: 26.3, 26.4, 26.5, 26.6_
  
  - [x] 18.4 Implement cache invalidation in Server Actions
    - Call revalidatePath('/shop') after product mutations
    - Call revalidatePath('/shop/[slug]') after product updates
    - Call revalidatePath('/admin/orders') after order status changes
    - _Requirements: 26.7, 26.8, 26.9_
  
  - [x] 18.5 Optimize database queries
    - Review all queries for N+1 issues
    - Use joins instead of sequential queries
    - Select only needed fields
    - _Requirements: 34.11, 34.12_
  
  - [x] 18.6 Configure bundle optimization
    - Enable code splitting
    - Use dynamic imports for heavy components
    - Optimize package imports
    - _Requirements: 34.6, 34.9_
  
  - [x] 18.7 Run Lighthouse performance audit
    - Test homepage, shop page, product page
    - Achieve performance score ≥ 90
    - Achieve FCP < 1.5s, LCP < 2.5s, TTI < 3.5s, CLS < 0.1
    - _Requirements: 34.1, 34.2, 34.3, 34.4, 34.5_


- [x] 19. Phase 19: Loading States and Error Handling
  - [x] 19.1 Create loading.tsx files for route segments
    - Create app/(shop)/loading.tsx
    - Create app/(shop)/shop/loading.tsx
    - Create app/(shop)/shop/[slug]/loading.tsx
    - Create app/(shop)/cart/loading.tsx
    - Create app/account/loading.tsx
    - Create app/admin/loading.tsx
    - _Requirements: 27.1_
  
  - [x] 19.2 Create error.tsx files for route segments
    - Create app/(shop)/error.tsx
    - Create app/(shop)/shop/error.tsx
    - Create app/(shop)/shop/[slug]/error.tsx
    - Create app/(shop)/cart/error.tsx
    - Create app/account/error.tsx
    - Create app/admin/error.tsx
    - Include retry button in error boundaries
    - _Requirements: 27.2, 27.8_
  
  - [x] 19.3 Build skeleton loaders
    - Create skeleton for product grid
    - Create skeleton for product detail page
    - Create skeleton for cart
    - _Requirements: 27.3, 27.4, 27.5_
  
  - [x] 19.4 Implement optimistic updates for cart
    - Use useOptimistic hook in cart components
    - Show loading indicators during mutations
    - _Requirements: 27.6_
  
  - [x] 19.5 Add error handling to Server Actions
    - Display user-friendly error messages
    - Log errors to console in development
    - _Requirements: 27.7, 27.9, 27.11_
  
  - [x] 19.6 Set up Sentry for production error tracking
    - Install @sentry/nextjs
    - Configure Sentry DSN
    - Set up error reporting
    - Filter sensitive data from error reports
    - _Requirements: 27.10_


- [x] 20. Phase 20: Mobile Responsiveness and Accessibility
  - [x] 20.1 Implement responsive design for all pages
    - Use mobile-first CSS approach
    - Test on screen sizes 320px to 2560px
    - Ensure no horizontal scrolling on mobile
    - _Requirements: 35.1, 35.2, 35.3, 35.10_
  
  - [x] 20.2 Optimize mobile navigation
    - Use drawer for navigation on screens < 768px
    - Use slide-over Sheet for filters on mobile
    - _Requirements: 35.4, 35.5_
  
  - [x] 20.3 Ensure touch-friendly button sizes
    - Minimum 44×44px for all interactive elements
    - Test on touch devices
    - _Requirements: 35.6_
  
  - [x] 20.4 Optimize images for mobile
    - Use appropriate image sizes for mobile bandwidth
    - Test loading performance on mobile
    - _Requirements: 35.7_
  
  - [x] 20.5 Adjust typography for mobile
    - Use readable font sizes on mobile
    - Test on iOS Safari and Android Chrome
    - _Requirements: 35.8, 35.9_
  
  - [x] 20.6 Add viewport meta tag
    - Configure proper mobile scaling
    - _Requirements: 35.11_
  
  - [x] 20.7 Implement accessibility features
    - Use semantic HTML elements
    - Add alt text to all images
    - Ensure keyboard accessibility
    - Add visible focus indicators
    - Use ARIA labels where needed
    - Maintain 4.5:1 color contrast ratio
    - Add skip navigation links
    - Associate labels with form inputs
    - Make error messages screen reader accessible
    - _Requirements: 33.1, 33.2, 33.3, 33.4, 33.5, 33.6, 33.7, 33.8, 33.9, 33.10_
  
  - [x] 20.8 Run Lighthouse accessibility audit
    - Test all major pages
    - Achieve accessibility score ≥ 90
    - _Requirements: 33.11_


- [x] 21. Phase 21: Security Hardening
  - [x] 21.1 Configure security headers
    - Add security headers in next.config.js
    - Set Strict-Transport-Security
    - Set X-Frame-Options
    - Set X-Content-Type-Options
    - Set X-XSS-Protection
    - Set Referrer-Policy
    - Set Content-Security-Policy
    - _Requirements: 36.7_
  
  - [x] 21.2 Ensure HTTPS in production
    - Configure SSL certificate
    - Force HTTPS redirects
    - _Requirements: 36.1_
  
  - [x] 21.3 Implement password hashing
    - Use bcrypt with salt rounds of 12
    - Never log or store plaintext passwords
    - _Requirements: 36.2, 36.12_
  
  - [x] 21.4 Protect API keys and secrets
    - Store all secrets in environment variables
    - Never expose secrets to client
    - Verify Razorpay secret key is server-side only
    - _Requirements: 36.3, 36.12_
  
  - [x] 21.5 Implement input validation and sanitization
    - Validate all inputs with Zod schemas
    - Sanitize text inputs to prevent XSS
    - Use parameterized queries (Drizzle ORM)
    - _Requirements: 36.4, 36.5_
  
  - [x] 21.6 Configure CSRF protection
    - Implement CSRF tokens for forms
    - _Requirements: 36.6_
  
  - [x] 21.7 Set secure cookie flags
    - Use httpOnly cookies for session tokens
    - Set secure flag in production
    - Set SameSite to 'lax'
    - _Requirements: 36.8_
  
  - [x] 21.8 Implement rate limiting
    - Install @upstash/ratelimit
    - Add rate limiting to authentication endpoints
    - Limit to 10 attempts per 10 seconds
    - _Requirements: 36.9_
  
  - [x] 21.9 Add security event logging
    - Log failed login attempts
    - Log invalid payment signatures
    - Log unauthorized access attempts
    - Log rate limit violations
    - _Requirements: 36.10_
  
  - [x] 21.10 Update dependencies
    - Run pnpm update to patch vulnerabilities
    - Set up Dependabot for automated updates
    - _Requirements: 36.11_
  
  - [ ]* 21.11 Write property test for form validation consistency
    - **Property 27: Form Validation Consistency**
    - **Validates: Requirements 31.14**
    - Test that valid data passes validation
    - Test that invalid data fails validation


- [x] 22. Phase 22: Data Integrity and Validation
  - [x] 22.1 Create comprehensive Zod schemas
    - Create lib/utils/validation.ts
    - Define productSchema
    - Define addressSchema
    - Define reviewSchema
    - Define cartItemSchema
    - Define couponSchema
    - _Requirements: 31.1_
  
  - [x] 22.2 Implement client-side validation
    - Add validation to all forms
    - Display inline error messages
    - _Requirements: 31.2, 31.3_
  
  - [x] 22.3 Implement server-side validation
    - Validate all Server Action inputs
    - Return error messages to client
    - _Requirements: 31.2, 31.4_
  
  - [x] 22.4 Add specific field validations
    - Validate email format with regex
    - Validate phone numbers are 10 digits
    - Validate pincode is 6 digits
    - Validate product price is positive integer
    - Validate product stock is non-negative integer
    - Validate quantity is positive integer
    - Validate rating is 1-5
    - Validate required fields are not empty
    - _Requirements: 31.5, 31.6, 31.7, 31.8, 31.9, 31.10, 31.11, 31.13_
  
  - [x] 22.5 Implement XSS prevention
    - Sanitize text inputs
    - Avoid dangerouslySetInnerHTML
    - _Requirements: 31.12_
  
  - [ ]* 22.6 Write property test for JSONB round-trip integrity
    - **Property 14: JSONB Round-Trip Integrity**
    - **Validates: Requirements 29.6**
    - Test that parsing then serializing produces equivalent data
    - Test with product images arrays
    - Test with shipping address objects


- [x] 23. Phase 23: Testing and Quality Assurance
  - [x] 23.1 Set up Vitest testing framework
    - Install vitest and @testing-library/react
    - Configure vitest.config.ts
    - Add test scripts to package.json
    - _Requirements: Testing Strategy_
  
  - [x] 23.2 Set up fast-check for property-based testing
    - Install fast-check package
    - Configure for 100 iterations per property test
    - _Requirements: Testing Strategy_
  
  - [x] 23.3 Write unit tests for utility functions
    - Test price formatting functions
    - Test slug generation functions
    - Test validation schemas
    - Achieve 100% coverage for utilities
  
  - [x] 23.4 Write unit tests for Server Actions
    - Test cart actions (add, update, remove)
    - Test order actions (create, update status)
    - Test product actions (create, update, delete)
    - Test review actions
    - Test wishlist actions
    - Achieve 100% coverage for Server Actions
  
  - [x] 23.5 Write unit tests for query functions
    - Test product queries with filters
    - Test cart calculations
    - Test order queries
    - Achieve 100% coverage for queries
  
  - [x] 23.6 Write integration tests
    - Test complete checkout flow
    - Test cart to order conversion
    - Test guest to user cart merge
    - Test order status transitions
  
  - [x] 23.7 Run all property-based tests
    - Verify all 27 properties pass
    - Review any failing examples
    - Fix issues and re-run tests
  
  - [x] 23.8 Achieve overall test coverage goals
    - Server Actions: 100% coverage
    - Query Functions: 100% coverage
    - Utility Functions: 100% coverage
    - Components: 80% coverage
    - Overall: 90% minimum coverage


- [ ] 24. Phase 24: Deployment Preparation
  - [ ] 24.1 Create production environment variables
    - Document all required environment variables
    - Create .env.example file
    - Prepare values for Railway deployment
    - _Requirements: 28.3, 28.13_
  
  - [ ] 24.2 Configure Railway project
    - Create Railway account and project
    - Connect GitHub repository
    - Add PostgreSQL service
    - _Requirements: 28.1, 28.2_
  
  - [ ] 24.3 Set environment variables in Railway
    - Configure DATABASE_URL
    - Configure AUTH_SECRET and AUTH_URL
    - Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (live mode)
    - Configure RESEND_API_KEY and FROM_EMAIL
    - Configure R2 or Vercel Blob credentials
    - Configure SENTRY_DSN
    - Set NODE_ENV=production
    - _Requirements: 28.3, 28.12_
  
  - [ ] 24.4 Configure build and start commands
    - Set build command: pnpm install && pnpm db:migrate && pnpm build
    - Set start command: pnpm start
    - _Requirements: 28.4_
  
  - [ ] 24.5 Create health check endpoint
    - Create app/api/health/route.ts
    - Check database connectivity
    - Return 200 on success, 503 on failure
    - _Requirements: 28.8, 28.9, 28.10_
  
  - [ ] 24.6 Configure custom domain
    - Add custom domain in Railway
    - Configure DNS CNAME record
    - Verify SSL certificate
    - _Requirements: 28.5_
  
  - [ ] 24.7 Set up Sentry error tracking
    - Configure Sentry for production
    - Test error reporting
    - _Requirements: 28.6_
  
  - [ ] 24.8 Configure Uptime Robot monitoring
    - Add main site monitoring
    - Add health endpoint monitoring
    - Set up email and SMS alerts
    - _Requirements: 28.7_
  
  - [ ] 24.9 Enable Railway database backups
    - Configure automatic daily backups
    - Test backup restoration process
    - _Requirements: 28.11_
  
  - [ ] 24.10 Configure next.config.js for production
    - Set image domains for R2/Blob storage
    - Enable image optimization
    - Configure compression
    - Remove console logs in production
    - _Requirements: Performance Optimization_


- [ ] 25. Phase 25: Final Testing and Launch
  - [ ] 25.1 Run full test suite
    - Execute all unit tests
    - Execute all property-based tests
    - Execute all integration tests
    - Verify 90% overall coverage
  
  - [ ] 25.2 Perform manual testing
    - Test complete user registration and login flow
    - Test product browsing and filtering
    - Test search functionality
    - Test cart operations (add, update, remove)
    - Test complete checkout flow with test payment
    - Test order confirmation and email
    - Test user account dashboard
    - Test admin product management
    - Test admin order management
    - Test review submission
    - Test wishlist functionality
    - Test newsletter subscription
  
  - [ ] 25.3 Test on multiple devices and browsers
    - Test on desktop (Chrome, Firefox, Safari, Edge)
    - Test on mobile (iOS Safari, Android Chrome)
    - Test on tablet
    - Verify responsive design works correctly
  
  - [ ] 25.4 Run Lighthouse audits
    - Test homepage, shop page, product page, cart, checkout
    - Verify performance score ≥ 90
    - Verify accessibility score ≥ 90
    - Verify best practices score ≥ 90
    - Verify SEO score ≥ 90
  
  - [ ] 25.5 Test payment integration with live Razorpay
    - Switch to live Razorpay keys
    - Test small transaction
    - Verify payment signature verification
    - Verify order creation
    - Verify email confirmation
  
  - [ ] 25.6 Seed production database
    - Run database migrations on production
    - Run seed script with initial products and categories
    - Create admin user account
  
  - [ ] 25.7 Verify all environment variables
    - Check all required variables are set
    - Test database connection
    - Test email sending
    - Test image upload
    - Test payment processing
  
  - [ ] 25.8 Deploy to production
    - Push to main branch
    - Monitor Railway deployment logs
    - Verify successful deployment
  
  - [ ] 25.9 Post-deployment verification
    - Visit production URL
    - Test critical user flows
    - Check health endpoint
    - Monitor Sentry for errors
    - Verify Uptime Robot is monitoring
  
  - [ ] 25.10 Create deployment documentation
    - Document deployment process
    - Document environment variables
    - Document backup and restore procedures
    - Document monitoring and alerting setup



## Checkpoint Tasks

Throughout the implementation, the following checkpoints should be observed:

- [ ] Checkpoint 1: After Phase 3 (Shared Layout)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Checkpoint 2: After Phase 8 (Shopping Cart)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Checkpoint 3: After Phase 10 (Order Confirmation)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Checkpoint 4: After Phase 13 (Customer Features)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Checkpoint 5: After Phase 21 (Security Hardening)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Checkpoint 6: Before Deployment (Phase 25)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100 iterations using fast-check
- Unit tests validate specific examples and edge cases
- All Server Actions must include proper error handling and validation
- All mutations must call revalidatePath to invalidate cache
- All prices must be stored as integers (paise) and formatted for display
- Database transactions must be used for operations that modify multiple tables
- Authentication and authorization must be checked for all protected routes and actions

## Implementation Order

The phases are designed to be implemented sequentially, with each phase building on the previous ones:

1. **Foundation (Phases 0-3)**: Set up project, database, authentication, and layout
2. **Core E-Commerce (Phases 4-8)**: Build product catalog, search, and shopping cart
3. **Transactions (Phases 9-10)**: Implement checkout, payment, and order confirmation
4. **User Features (Phases 11-14)**: Add account dashboard, admin panel, reviews, wishlist, inventory
5. **Content & SEO (Phases 15-16)**: Add blog and optimize for search engines
6. **Optimization (Phases 17-20)**: Optimize images, performance, loading states, mobile, accessibility
7. **Security & Quality (Phases 21-23)**: Harden security, validate data, write comprehensive tests
8. **Deployment (Phases 24-25)**: Deploy to production and verify

## Success Criteria

The implementation is complete when:

- All 40 requirements are implemented and verified
- All 27 correctness properties pass property-based tests
- Test coverage is ≥ 90% overall
- Lighthouse scores are ≥ 90 for performance, accessibility, best practices, and SEO
- Application is deployed to production on Railway
- All critical user flows work correctly (browse, cart, checkout, order, admin)
- Payment integration works with live Razorpay
- Monitoring and error tracking are operational

