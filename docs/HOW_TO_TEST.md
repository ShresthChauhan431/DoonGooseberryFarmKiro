# How to Test Your E-Commerce Platform

## Quick Start

```bash
# 1. Start the development server
pnpm dev

# 2. In another terminal, run the test script
tsx scripts/test-checkout.ts

# 3. Open database studio (optional, to monitor changes)
pnpm db:studio

# 4. Open your browser
http://localhost:3000
```

## 🛒 How to Add Items to Cart

### Step-by-Step Instructions

1. **Navigate to Shop**
   - Click "All Products" in the navigation menu
   - Or go directly to: `http://localhost:3000/shop`

2. **Browse Products**
   - You'll see a grid of available products
   - Each product shows image, name, price, and category

3. **View Product Details**
   - Click on any product card
   - You'll be taken to the product detail page

4. **Add to Cart**
   - On the product page, you'll see:
     - Product name and description
     - Price
     - Stock status
     - Quantity selector
     - "Add to Cart" button
   
5. **Select Quantity**
   - Use the + and - buttons to adjust quantity
   - Or type the number directly
   - Maximum is limited by available stock

6. **Click "Add to Cart"**
   - Button will show "Adding..." while processing
   - You'll see a success toast notification
   - Cart badge in header will update with item count

7. **Verify Cart**
   - Look at the shopping cart icon in the header
   - The badge should show the number of items
   - Click the cart icon to open the cart sheet

### What Happens Behind the Scenes

When you add an item to cart:

1. **Session ID Created**
   - A unique session ID is generated
   - Stored in both localStorage and cookies
   - Format: `session_[timestamp]_[random]`

2. **Cart Created/Updated**
   - If no cart exists, a new one is created
   - Cart is linked to your session ID (or user ID if logged in)
   - Item is added to `cart_items` table

3. **Database Updates**
   - `carts` table: Cart record created/updated
   - `cart_items` table: Item added with quantity

4. **UI Updates**
   - Cart badge shows total item count
   - Toast notification confirms addition
   - Page refreshes to sync data

### Troubleshooting Cart Issues

**Problem**: Items not being added to cart

**Check These**:

1. **Browser Console** (Press F12)
   ```
   Look for:
   - "Adding to cart: {productId, quantity, sessionId}"
   - "Add to cart result: {success: true/false}"
   - Any error messages
   ```

2. **Cookies** (F12 → Application → Cookies)
   ```
   Should see:
   - cart_session_id: session_[timestamp]_[random]
   ```

3. **localStorage** (F12 → Application → Local Storage)
   ```
   Should see:
   - sessionId: session_[timestamp]_[random]
   ```

4. **Database** (Run: `pnpm db:studio`)
   ```
   Check tables:
   - carts: Should have a record with your sessionId
   - cart_items: Should have items linked to your cart
   ```

5. **Product Stock**
   ```
   - Verify product has stock > 0
   - Check products table in database studio
   ```

**Common Solutions**:
- Clear cookies and localStorage, then refresh
- Check if product is active and has stock
- Verify database connection
- Check server logs for errors

## 📦 How Delivery Charges Work

### Calculation Rules

The system automatically calculates shipping based on your cart subtotal:

| Cart Subtotal | Shipping Cost | Display |
|--------------|---------------|---------|
| Less than ₹500 | ₹50 | Shows "₹50" |
| ₹500 or more | ₹0 | Shows "FREE" |

### Examples

**Example 1: Small Order**
```
Product A: ₹200 × 1 = ₹200
Product B: ₹150 × 1 = ₹150
----------------------------
Subtotal:           ₹350
Shipping:            ₹50  ← Charged because < ₹500
----------------------------
Total:              ₹400
```

**Example 2: Large Order**
```
Product A: ₹200 × 2 = ₹400
Product B: ₹150 × 1 = ₹150
----------------------------
Subtotal:           ₹550
Shipping:           FREE  ← Free because ≥ ₹500
----------------------------
Total:              ₹550
```

**Example 3: Crossing Threshold**
```
Start with:
Product A: ₹200 × 2 = ₹400
Shipping: ₹50
Total: ₹450

Add more:
Product B: ₹150 × 1 = ₹150
New Subtotal: ₹550
Shipping: FREE ← Automatically updates!
New Total: ₹550
```

### Where to See Shipping Charges

1. **Cart Sheet** (Click cart icon in header)
   - Shows subtotal
   - Shows shipping (₹50 or FREE)
   - Shows total

2. **Checkout Step 2** (Order Review)
   - Detailed breakdown
   - Subtotal, shipping, discount, total

3. **Checkout Step 3** (Payment)
   - Final payment summary
   - All charges listed

### Testing Shipping Calculation

```bash
# Run the test script
tsx scripts/test-checkout.ts

# It will test:
# - Subtotal < ₹500 → Should show ₹50 shipping
# - Subtotal ≥ ₹500 → Should show FREE shipping
```

## 📍 How to Test Delivery Address

### Address Form Fields

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| Full Name | Yes | Any text | John Doe |
| Address Line 1 | Yes | Any text | 123 Main Street |
| Address Line 2 | No | Any text | Apartment 4B |
| City | Yes | Any text | Mumbai |
| State | Yes | Any text | Maharashtra |
| Pincode | Yes | Exactly 6 digits | 400001 |
| Phone Number | Yes | Exactly 10 digits | 9876543210 |

### Testing the Address Form

1. **Go to Checkout**
   - Add items to cart
   - Click "Proceed to Checkout"
   - Login if not already logged in

2. **Test Validation**

   **Test Empty Fields**:
   - Leave fields empty
   - Click "Continue to Review"
   - Should show error messages

   **Test Invalid Pincode**:
   - Enter 5 digits: `40000`
   - Should show: "Pincode must be exactly 6 digits"
   - Enter 7 digits: `4000001`
   - Should show: "Pincode must be exactly 6 digits"
   - Enter letters: `ABC123`
   - Should be blocked (only digits allowed)

   **Test Invalid Phone**:
   - Enter 9 digits: `987654321`
   - Should show: "Phone number must be exactly 10 digits"
   - Enter 11 digits: `98765432100`
   - Should show: "Phone number must be exactly 10 digits"
   - Enter letters: `98765ABCDE`
   - Should be blocked (only digits allowed)

3. **Test Valid Submission**
   ```
   Full Name: John Doe
   Address Line 1: 123 Main Street
   Address Line 2: Apartment 4B
   City: Mumbai
   State: Maharashtra
   Pincode: 400001
   Phone: 9876543210
   ```
   - Click "Continue to Review"
   - Should proceed to Step 2

4. **Verify Address Storage**
   - Open Developer Tools (F12)
   - Go to Application → Session Storage
   - Look for `checkoutAddress`
   - Should contain your address in JSON format

## 💳 How to Test Payment

### Prerequisites

1. **Get Razorpay Test Credentials**
   - Sign up at https://razorpay.com
   - Go to Settings → API Keys
   - Switch to "Test Mode"
   - Generate Test Keys
   - Copy Key ID and Key Secret

2. **Add to .env File**
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Restart Server**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   pnpm dev
   ```

### Complete Payment Flow

1. **Add Items to Cart**
   - Add 2-3 products
   - Ensure total is > ₹500 to test free shipping

2. **Go to Checkout**
   - Click "Proceed to Checkout"
   - Login if needed

3. **Step 1: Enter Address**
   - Fill all required fields
   - Use valid pincode (6 digits) and phone (10 digits)
   - Click "Continue to Review"

4. **Step 2: Review Order**
   - Verify all items are correct
   - Check quantities and prices
   - Verify subtotal calculation
   - Check shipping charges (FREE if > ₹500)
   - Optionally apply a coupon code
   - Click "Continue to Payment"

5. **Step 3: Payment**
   - Review payment summary
   - Verify total amount
   - Click "Pay ₹XXX" button
   - Razorpay modal should open

6. **Complete Payment in Razorpay Modal**

   **Test Success**:
   - Select "Card" payment method
   - Enter card details:
     - Card Number: `4111 1111 1111 1111`
     - CVV: `123`
     - Expiry: `12/25` (any future date)
     - Name: `Test User`
   - Click "Pay"
   - Should redirect to success page

   **Test Failure** (optional):
   - Use card: `4000 0000 0000 0002`
   - Payment will fail
   - Modal will show error

7. **Verify Success**
   - Should see order success page
   - Order number displayed
   - Estimated delivery date shown
   - Check email for confirmation

8. **Verify Database Changes**
   ```bash
   # Open database studio
   pnpm db:studio
   ```
   
   Check these tables:
   - `orders`: New order created
   - `order_items`: Items linked to order
   - `products`: Stock decreased
   - `carts`: Your cart deleted
   - `cart_items`: Cart items deleted

### Razorpay Test Cards

| Card Number | Result | Use Case |
|-------------|--------|----------|
| 4111 1111 1111 1111 | Success | Normal payment |
| 4000 0000 0000 0002 | Failure | Test error handling |
| 5555 5555 5555 4444 | Success | Mastercard |
| 3782 822463 10005 | Success | American Express |

All test cards:
- CVV: Any 3 digits (e.g., 123)
- Expiry: Any future date (e.g., 12/25)
- Name: Any name (e.g., Test User)

### Payment Troubleshooting

**Problem**: Razorpay modal not opening

**Solutions**:
1. Check `.env` file has `RAZORPAY_KEY_ID`
2. Verify Razorpay script loaded (F12 → Network tab)
3. Check browser console for errors
4. Ensure you're using Test Mode credentials

**Problem**: Payment verification failed

**Solutions**:
1. Check `.env` file has `RAZORPAY_KEY_SECRET`
2. Verify secret is correct (no extra spaces)
3. Check server logs for signature verification errors

**Problem**: Order not created after payment

**Solutions**:
1. Check server logs for errors
2. Verify database connection
3. Check if cart exists and has items
4. Look for transaction errors in logs

## ✅ Complete Test Checklist

### Cart Testing
- [ ] Add item from product page
- [ ] Cart badge updates with count
- [ ] Open cart sheet
- [ ] View items in cart
- [ ] Update quantity in cart
- [ ] Remove item from cart
- [ ] Cart persists after page refresh

### Shipping Testing
- [ ] Add items < ₹500, verify ₹50 shipping
- [ ] Add items ≥ ₹500, verify FREE shipping
- [ ] Cross threshold, verify shipping updates
- [ ] Check shipping in cart sheet
- [ ] Check shipping in order review
- [ ] Check shipping in payment summary

### Address Testing
- [ ] Submit empty form, see errors
- [ ] Enter invalid pincode, see error
- [ ] Enter invalid phone, see error
- [ ] Enter valid address, proceed to next step
- [ ] Verify address in session storage
- [ ] Address appears in order review

### Payment Testing
- [ ] Razorpay modal opens
- [ ] Test card payment succeeds
- [ ] Redirect to success page
- [ ] Order number displayed
- [ ] Email confirmation received
- [ ] Cart cleared after order
- [ ] Product stock decreased
- [ ] Order appears in account orders

### Database Testing
- [ ] Cart created in database
- [ ] Cart items added
- [ ] Order created after payment
- [ ] Order items linked correctly
- [ ] Product stock updated
- [ ] Cart deleted after order
- [ ] Coupon usage incremented (if used)

## 🚀 Quick Commands

```bash
# Start development
pnpm dev

# Run checkout test
tsx scripts/test-checkout.ts

# Open database studio
pnpm db:studio

# Check database migrations
pnpm db:migrate

# Seed database with test data
pnpm db:seed

# Run all tests
pnpm test
```

## 📚 Additional Resources

- **Detailed Testing Guide**: `docs/TESTING_GUIDE.md`
- **Quick Reference**: `docs/QUICK_TEST_REFERENCE.md`
- **Cart Test Script**: `scripts/test-cart.ts`
- **Checkout Test Script**: `scripts/test-checkout.ts`

## 💡 Pro Tips

1. **Keep Console Open**: Always have browser console open (F12) while testing
2. **Monitor Database**: Keep `pnpm db:studio` running to see real-time changes
3. **Test Both Scenarios**: Test with logged-in and guest users
4. **Clear Data**: If cart behaves strangely, clear cookies and localStorage
5. **Check Logs**: Server logs show detailed information about operations
6. **Use Test Mode**: Always use Razorpay test credentials, never production keys
7. **Test Edge Cases**: Try adding 0 quantity, exceeding stock, etc.
8. **Verify Emails**: Check spam folder for order confirmation emails
