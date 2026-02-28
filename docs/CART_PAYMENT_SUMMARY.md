# Cart, Payment & Delivery - Complete Summary

## 📋 Overview

This document provides a complete summary of how cart, payment, delivery address, and delivery charges work in your e-commerce platform.

## 🛒 Cart System

### How It Works

1. **Session Management**
   - Each user gets a unique session ID
   - Format: `session_[timestamp]_[random]`
   - Stored in both localStorage and cookies
   - Persists for 30 days

2. **Cart Creation**
   - Cart created automatically when first item added
   - Linked to session ID (guest) or user ID (logged in)
   - Stored in `carts` table in database

3. **Cart Items**
   - Each item stored in `cart_items` table
   - Links to product and cart
   - Tracks quantity per product

4. **Cart Persistence**
   - Guest carts persist across sessions
   - User carts sync across devices
   - Cart merges when guest logs in

### Adding Items to Cart

**Location**: Product detail page (`/shop/[slug]`)

**Component**: `components/product/product-info.tsx`

**Process**:
1. User selects quantity
2. Clicks "Add to Cart"
3. System gets/creates session ID
4. Calls `addToCart` server action
5. Creates/updates cart in database
6. Updates UI with success message
7. Cart badge shows item count

**Code Flow**:
```typescript
// Client side
handleAddToCart() 
  → getSessionId() 
  → addToCart(productId, quantity, userId, sessionId)
  → Server action processes
  → Database updated
  → UI refreshed
```

### Cart Display

**Cart Sheet**: Click cart icon in header
- Shows all items
- Displays quantities and prices
- Allows quantity updates
- Shows subtotal and shipping
- "Proceed to Checkout" button

**Cart Page**: `/cart`
- Full page view of cart
- Same functionality as cart sheet
- Better for mobile users

## 📦 Delivery Charges

### Calculation Logic

**File**: `lib/utils/cart.ts`

**Function**: `calculateCartTotals()`

**Rules**:
```typescript
const shipping = subtotal < 50000 ? 5000 : 0;
// 50000 paise = ₹500
// 5000 paise = ₹50
```

| Condition | Shipping | Display |
|-----------|----------|---------|
| Subtotal < ₹500 | ₹50 (5000 paise) | "₹50" |
| Subtotal ≥ ₹500 | ₹0 (0 paise) | "FREE" |

### Why Paise?

All prices stored in paise (smallest currency unit):
- ₹1 = 100 paise
- ₹500 = 50000 paise
- ₹50 = 5000 paise

**Benefits**:
- No floating point errors
- Accurate calculations
- Standard practice for payment systems

### Where Shipping is Displayed

1. **Cart Sheet/Page**
   ```
   Subtotal:    ₹450
   Shipping:     ₹50
   Total:       ₹500
   ```

2. **Checkout Step 2 (Order Review)**
   ```
   Subtotal:    ₹600
   Shipping:    FREE
   Discount:     ₹60 (if coupon applied)
   Total:       ₹540
   ```

3. **Checkout Step 3 (Payment)**
   ```
   Payment Summary
   Subtotal:    ₹600
   Shipping:    FREE
   Total:       ₹600
   ```

### Modifying Shipping Rules

To change shipping rules, edit `lib/utils/cart.ts`:

```typescript
export function calculateCartTotals(cartItems: CartItem[], coupon?: Coupon): CartTotals {
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  // Modify this line to change shipping rules
  const shipping = subtotal < 50000 ? 5000 : 0;
  
  // Examples:
  // Always free: const shipping = 0;
  // Always ₹50: const shipping = 5000;
  // Free above ₹1000: const shipping = subtotal < 100000 ? 5000 : 0;
  // Tiered: const shipping = subtotal < 50000 ? 5000 : subtotal < 100000 ? 2500 : 0;
  
  // ... rest of function
}
```

## 📍 Delivery Address

### Address Form

**Location**: Checkout Step 1 (`/checkout?step=1`)

**Component**: `components/checkout/address-form.tsx`

### Field Specifications

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| name | Text | Yes | Min 1 char | John Doe |
| addressLine1 | Text | Yes | Min 1 char | 123 Main Street |
| addressLine2 | Text | No | - | Apartment 4B |
| city | Text | Yes | Min 1 char | Mumbai |
| state | Text | Yes | Min 1 char | Maharashtra |
| pincode | Text | Yes | Exactly 6 digits | 400001 |
| phone | Text | Yes | Exactly 10 digits | 9876543210 |

### Validation Rules

**Pincode**:
```typescript
z.string()
  .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
  .min(6, 'Pincode must be 6 digits')
  .max(6, 'Pincode must be 6 digits')
```

**Phone**:
```typescript
z.string()
  .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
  .min(10, 'Phone number must be 10 digits')
  .max(10, 'Phone number must be 10 digits')
```

### Address Storage

**During Checkout**:
- Stored in `sessionStorage` as `checkoutAddress`
- Persists only during checkout session
- Cleared after order completion

**After Order**:
- Stored in `orders` table as `shippingAddress` JSON field
- Permanently linked to order
- Used for order fulfillment

**Format**:
```json
{
  "name": "John Doe",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "phone": "9876543210"
}
```

## 💳 Payment System

### Payment Provider

**Razorpay** - Indian payment gateway
- Supports cards, UPI, net banking, wallets
- PCI DSS compliant
- Test mode for development

### Payment Flow

**Step-by-Step**:

1. **User Clicks "Pay"** (Checkout Step 3)
   - Component: `components/checkout/payment-form.tsx`
   - Calls: `createRazorpayOrderAction()`

2. **Server Creates Razorpay Order**
   - File: `lib/actions/orders.ts`
   - Function: `createRazorpayOrderAction()`
   - Creates order in Razorpay system
   - Returns order ID and public key

3. **Razorpay Modal Opens**
   - Client-side Razorpay SDK
   - User enters payment details
   - Payment processed by Razorpay

4. **Payment Success Callback**
   - Razorpay returns payment details
   - Calls: `verifyPaymentAndCreateOrder()`

5. **Server Verifies Payment**
   - File: `lib/actions/orders.ts`
   - Function: `verifyPaymentAndCreateOrder()`
   - Verifies signature
   - Creates order in database
   - Decrements product stock
   - Clears cart
   - Sends confirmation email

6. **Redirect to Success Page**
   - URL: `/order/[orderId]/success`
   - Shows order details
   - Displays order number
   - Shows estimated delivery

### Payment Configuration

**Environment Variables**:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

**Get Credentials**:
1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Switch to Test Mode
4. Generate Test Keys
5. Add to `.env` file

### Test Cards

| Card Number | Result | CVV | Expiry |
|-------------|--------|-----|--------|
| 4111 1111 1111 1111 | Success | Any 3 digits | Any future date |
| 4000 0000 0000 0002 | Failure | Any 3 digits | Any future date |
| 5555 5555 5555 4444 | Success (Mastercard) | Any 3 digits | Any future date |

### Payment Security

**Signature Verification**:
```typescript
// Server verifies payment signature
const isValid = verifyPaymentSignature(
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
);

if (!isValid) {
  // Payment rejected
  return { success: false, message: 'Payment verification failed' };
}
```

**Security Features**:
- HTTPS only in production
- Signature verification
- Server-side validation
- No card details stored
- PCI DSS compliant

## 🔄 Complete Checkout Flow

### Overview

```
Cart → Login → Address → Review → Payment → Success
```

### Detailed Steps

**Step 0: Cart**
- User adds items to cart
- Reviews cart contents
- Clicks "Proceed to Checkout"

**Step 1: Address** (`/checkout?step=1`)
- User fills shipping address form
- Validates all fields
- Stores in sessionStorage
- Proceeds to review

**Step 2: Review** (`/checkout?step=2`)
- Displays all cart items
- Shows quantities and prices
- Calculates subtotal
- Calculates shipping
- Allows coupon application
- Shows final total
- Proceeds to payment

**Step 3: Payment** (`/checkout?step=3`)
- Shows payment summary
- Displays total amount
- Opens Razorpay modal
- Processes payment
- Verifies payment
- Creates order
- Clears cart
- Sends email
- Redirects to success

**Step 4: Success** (`/order/[orderId]/success`)
- Shows order confirmation
- Displays order number
- Shows estimated delivery
- Provides order tracking link

### Database Changes

**After Successful Order**:

1. **orders** table
   - New order record created
   - Status: PENDING
   - Includes all totals
   - Stores shipping address
   - Links to user

2. **order_items** table
   - Items copied from cart
   - Linked to order
   - Price locked at purchase time

3. **products** table
   - Stock decremented
   - For each item in order

4. **carts** table
   - Cart deleted

5. **cart_items** table
   - All items deleted

6. **coupons** table (if used)
   - Usage count incremented

## 🧪 Testing Checklist

### Cart Testing
- [ ] Add item to cart
- [ ] Cart badge updates
- [ ] Open cart sheet
- [ ] Update quantity
- [ ] Remove item
- [ ] Cart persists after refresh

### Shipping Testing
- [ ] Subtotal < ₹500 shows ₹50
- [ ] Subtotal ≥ ₹500 shows FREE
- [ ] Shipping updates when crossing threshold

### Address Testing
- [ ] All fields validate correctly
- [ ] Pincode accepts only 6 digits
- [ ] Phone accepts only 10 digits
- [ ] Form submits with valid data
- [ ] Address stored in sessionStorage

### Payment Testing
- [ ] Razorpay modal opens
- [ ] Test card payment succeeds
- [ ] Order created in database
- [ ] Cart cleared
- [ ] Stock decremented
- [ ] Email sent
- [ ] Redirect to success page

## 📊 Database Schema

### Relevant Tables

**carts**
```sql
id: serial primary key
user_id: integer (nullable)
session_id: varchar (nullable)
created_at: timestamp
```

**cart_items**
```sql
id: serial primary key
cart_id: integer (foreign key)
product_id: integer (foreign key)
quantity: integer
created_at: timestamp
```

**orders**
```sql
id: serial primary key
user_id: integer (foreign key)
status: enum (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
subtotal: integer (paise)
shipping: integer (paise)
discount: integer (paise)
total: integer (paise)
shipping_address: jsonb
razorpay_order_id: varchar
razorpay_payment_id: varchar
coupon_code: varchar (nullable)
created_at: timestamp
updated_at: timestamp
```

**order_items**
```sql
id: serial primary key
order_id: integer (foreign key)
product_id: integer (foreign key)
quantity: integer
price: integer (paise, locked at purchase time)
created_at: timestamp
```

## 🔧 Configuration

### Shipping Rules

**File**: `lib/utils/cart.ts`
**Function**: `calculateCartTotals()`

### Payment Gateway

**File**: `lib/payment/razorpay.ts`
**Environment**: `.env`

### Address Validation

**File**: `components/checkout/address-form.tsx`
**Schema**: Zod validation

## 📚 Related Documentation

- [How to Test](HOW_TO_TEST.md) - Step-by-step testing guide
- [Testing Guide](TESTING_GUIDE.md) - Comprehensive testing scenarios
- [Quick Reference](QUICK_TEST_REFERENCE.md) - Quick lookup guide

## 🆘 Troubleshooting

### Cart Not Working
1. Check browser console for errors
2. Verify `cart_session_id` cookie exists
3. Check database for cart records
4. Clear cookies and localStorage

### Shipping Not Calculating
1. Verify subtotal is correct
2. Check threshold (₹500 = 50000 paise)
3. Review `calculateCartTotals()` function

### Address Form Errors
1. Ensure pincode is exactly 6 digits
2. Ensure phone is exactly 10 digits
3. Fill all required fields

### Payment Not Working
1. Verify Razorpay credentials in `.env`
2. Check Razorpay script loaded
3. Use test mode credentials
4. Check server logs for errors

## 💡 Key Takeaways

1. **Prices in Paise**: All prices stored as integers in paise
2. **Session Management**: Cart linked to session ID or user ID
3. **Shipping Threshold**: Free shipping at ₹500 or above
4. **Address Validation**: Strict validation for pincode and phone
5. **Payment Security**: Signature verification for all payments
6. **Database Transactions**: Order creation uses transactions for consistency
7. **Email Notifications**: Async email sending doesn't block order creation
