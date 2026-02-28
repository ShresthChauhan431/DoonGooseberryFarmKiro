# Testing Guide: Cart, Checkout, Payment & Delivery

This guide will help you test all the key features of your e-commerce platform.

## 1. Testing Cart Functionality

### How to Add Items to Cart

1. **Navigate to Shop Page**
   - Go to `/shop` or click "All Products" in the navigation
   - You should see a grid of products

2. **Add Item to Cart**
   - Click on any product to view details
   - Select quantity using the quantity selector
   - Click "Add to Cart" button
   - You should see a success toast notification
   - Cart badge in header should update with item count

3. **Verify Cart Badge**
   - Look at the shopping cart icon in the header
   - The badge should show the total number of items in your cart

4. **Open Cart Sheet**
   - Click the cart icon in the header
   - A side panel should open showing your cart items
   - Each item should display:
     - Product image
     - Product name
     - Price per unit
     - Quantity selector
     - Subtotal for that item
     - Remove button

### Troubleshooting Cart Issues

If items are not being added to cart:

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for any error messages in the Console tab
   - Check for sessionId logs

2. **Check Cookies**
   - In Developer Tools, go to Application > Cookies
   - Look for `cart_session_id` cookie
   - If missing, try clearing cookies and refreshing

3. **Check localStorage**
   - In Developer Tools, go to Application > Local Storage
   - Look for `cart_session_id` key
   - Should match the cookie value

4. **Verify Database**
   - Run: `pnpm db:studio`
   - Check the `carts` and `cart_items` tables
   - Verify items are being saved

## 2. Testing Delivery Charges

### Delivery Charge Rules

The system calculates shipping based on cart subtotal:

- **Subtotal < ₹500**: Shipping = ₹50
- **Subtotal ≥ ₹500**: Shipping = FREE (₹0)

### How to Test

1. **Test with Small Order (< ₹500)**
   - Add items totaling less than ₹500
   - Open cart sheet
   - Verify shipping shows ₹50

2. **Test with Large Order (≥ ₹500)**
   - Add items totaling ₹500 or more
   - Open cart sheet
   - Verify shipping shows "FREE"

3. **Test Threshold Crossing**
   - Start with items < ₹500 (should show ₹50 shipping)
   - Add more items to cross ₹500
   - Shipping should automatically change to FREE

### Where Shipping is Calculated

The shipping calculation is in `lib/utils/cart.ts`:
```typescript
const shipping = subtotal < 50000 ? 5000 : 0;
// Note: Values are in paise (1 rupee = 100 paise)
// 50000 paise = ₹500
// 5000 paise = ₹50
```

## 3. Testing Delivery Address

### How to Test Address Form

1. **Add Items to Cart**
   - Add at least one item to your cart

2. **Go to Checkout**
   - Click "Proceed to Checkout" from cart
   - You'll be redirected to login if not authenticated
   - After login, you'll see Step 1: Shipping Address

3. **Fill Address Form**
   - **Full Name**: Enter your name
   - **Address Line 1**: House number, street name
   - **Address Line 2**: Apartment, suite (optional)
   - **City**: Enter city name
   - **State**: Enter state name
   - **Pincode**: Must be exactly 6 digits (e.g., 400001)
   - **Phone Number**: Must be exactly 10 digits (e.g., 9876543210)

4. **Validation Tests**
   - Try submitting with empty fields → Should show error messages
   - Try entering 5 digits in pincode → Should show error
   - Try entering 9 digits in phone → Should show error
   - Try entering letters in pincode/phone → Should be blocked
   - Fill all fields correctly → Should proceed to Step 2

5. **Verify Address Storage**
   - After submitting, open Developer Tools
   - Go to Application > Session Storage
   - Look for `checkoutAddress` key
   - Should contain your address data in JSON format

## 4. Testing Payment Flow

### Prerequisites

Before testing payment, ensure:

1. **Razorpay Configuration**
   - Check `.env` file has:
     ```
     RAZORPAY_KEY_ID=your_key_id
     RAZORPAY_KEY_SECRET=your_key_secret
     ```
   - For testing, use Razorpay Test Mode credentials

2. **Get Test Credentials**
   - Sign up at https://razorpay.com
   - Go to Settings > API Keys
   - Generate Test Mode keys
   - Add to `.env` file

### How to Test Payment

1. **Complete Address Form**
   - Fill and submit the address form (Step 1)

2. **Review Order (Step 2)**
   - Verify all items are listed correctly
   - Check quantities and prices
   - Verify subtotal calculation
   - Check shipping charges
   - Apply coupon if you have one (optional)
   - Click "Continue to Payment"

3. **Payment Page (Step 3)**
   - You should see:
     - Payment summary with all totals
     - Accepted payment methods
     - "Pay ₹XXX" button

4. **Initiate Payment**
   - Click the "Pay" button
   - Razorpay modal should open
   - You'll see payment options:
     - Credit/Debit Card
     - UPI
     - Net Banking
     - Wallets

5. **Test Mode Payment**
   - In test mode, use these test cards:
     - **Success**: 4111 1111 1111 1111
     - **Failure**: 4000 0000 0000 0002
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

6. **After Payment**
   - On success: Redirected to order success page
   - Order confirmation email sent
   - Cart cleared
   - Product stock decremented

### Troubleshooting Payment Issues

1. **Razorpay Modal Not Opening**
   - Check browser console for errors
   - Verify Razorpay script is loaded
   - Check if `RAZORPAY_KEY_ID` is set correctly

2. **Payment Verification Failed**
   - Check `RAZORPAY_KEY_SECRET` is correct
   - Verify signature verification in server logs
   - Check database for order creation

3. **Order Not Created**
   - Check server logs for errors
   - Verify database connection
   - Check if cart exists and has items

## 5. Complete Checkout Flow Test

### End-to-End Test Scenario

1. **Setup**
   - Clear cart (if any)
   - Ensure you're logged in
   - Have test Razorpay credentials

2. **Add Products**
   - Add 2-3 different products
   - Vary quantities
   - Ensure total is > ₹500 to test free shipping

3. **Review Cart**
   - Open cart sheet
   - Verify all items
   - Check subtotal
   - Verify shipping (should be FREE if > ₹500)
   - Click "Proceed to Checkout"

4. **Enter Address**
   - Fill all required fields
   - Use valid pincode and phone
   - Click "Continue to Review"

5. **Review Order**
   - Verify items, quantities, prices
   - Check totals
   - Optionally apply coupon
   - Click "Continue to Payment"

6. **Complete Payment**
   - Review payment summary
   - Click "Pay" button
   - Complete payment in Razorpay modal
   - Wait for redirect

7. **Verify Success**
   - Should see order success page
   - Order number displayed
   - Estimated delivery date shown
   - Check email for confirmation

8. **Verify Database**
   - Run: `pnpm db:studio`
   - Check `orders` table for new order
   - Check `order_items` table for items
   - Verify `products` table stock decreased
   - Verify `carts` and `cart_items` are cleared

## 6. Testing Coupon Codes

### How to Test Coupons

1. **Create Test Coupon (Admin)**
   - Login as admin
   - Go to Admin Panel
   - Create a coupon with:
     - Code: TEST10
     - Type: PERCENTAGE
     - Value: 10
     - Min Order: 0

2. **Apply Coupon**
   - Add items to cart
   - Go to checkout Step 2 (Order Review)
   - Enter coupon code: TEST10
   - Click "Apply"
   - Discount should be calculated
   - Total should decrease

3. **Verify Discount Calculation**
   - **Percentage**: Discount = (Subtotal × Percentage) / 100
   - **Flat**: Discount = Fixed amount
   - Check that total = subtotal + shipping - discount

## 7. Common Issues & Solutions

### Cart Not Working

**Issue**: Items not adding to cart

**Solutions**:
1. Check browser console for errors
2. Verify `cart_session_id` cookie exists
3. Clear cookies and localStorage, refresh page
4. Check database connection
5. Verify product has stock available

### Address Form Errors

**Issue**: Cannot submit address form

**Solutions**:
1. Ensure pincode is exactly 6 digits
2. Ensure phone is exactly 10 digits
3. Fill all required fields
4. Check for validation error messages

### Payment Not Working

**Issue**: Razorpay modal not opening

**Solutions**:
1. Verify Razorpay credentials in `.env`
2. Check if Razorpay script loaded (Network tab)
3. Use test mode credentials for testing
4. Check browser console for errors

### Shipping Not Calculated

**Issue**: Shipping shows wrong amount

**Solutions**:
1. Verify subtotal calculation
2. Check threshold: < ₹500 = ₹50, ≥ ₹500 = FREE
3. Remember: Prices are in paise (multiply by 100)
4. Check `lib/utils/cart.ts` for calculation logic

## 8. Quick Test Commands

```bash
# Start development server
pnpm dev

# Open database studio
pnpm db:studio

# Check database migrations
pnpm db:generate
pnpm db:migrate

# Run tests
pnpm test

# Check logs
# Look in terminal where dev server is running
```

## 9. Test Checklist

- [ ] Add item to cart from product page
- [ ] Update quantity in cart
- [ ] Remove item from cart
- [ ] Verify cart badge updates
- [ ] Test shipping calculation (< ₹500 and ≥ ₹500)
- [ ] Fill address form with valid data
- [ ] Test address form validation
- [ ] Review order summary
- [ ] Apply coupon code
- [ ] Complete payment with test card
- [ ] Verify order success page
- [ ] Check order confirmation email
- [ ] Verify database updates (orders, stock, cart cleared)
- [ ] Test as guest user (if applicable)
- [ ] Test as logged-in user

## 10. Support & Debugging

If you encounter issues:

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Server Logs**: Look in terminal where `pnpm dev` is running
3. **Check Database**: Use `pnpm db:studio` to inspect data
4. **Check Environment Variables**: Verify `.env` file has all required values
5. **Clear Cache**: Clear browser cache, cookies, and localStorage

For payment issues specifically:
- Use Razorpay Test Mode
- Check Razorpay dashboard for payment logs
- Verify webhook configuration (if using webhooks)
