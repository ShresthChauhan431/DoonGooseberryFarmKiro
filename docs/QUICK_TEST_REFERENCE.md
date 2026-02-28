# Quick Test Reference Card

## 🛒 Add Items to Cart

1. Go to `/shop`
2. Click on a product
3. Select quantity
4. Click "Add to Cart"
5. Check cart badge in header updates

**Troubleshooting**: Check browser console, verify `cart_session_id` cookie exists

---

## 📦 Delivery Charges

| Cart Subtotal | Shipping Cost |
|--------------|---------------|
| < ₹500       | ₹50          |
| ≥ ₹500       | FREE (₹0)    |

**Note**: All prices stored in paise (₹1 = 100 paise)

---

## 📍 Delivery Address Format

- **Name**: Required
- **Address Line 1**: Required
- **Address Line 2**: Optional
- **City**: Required
- **State**: Required
- **Pincode**: Exactly 6 digits (e.g., 400001)
- **Phone**: Exactly 10 digits (e.g., 9876543210)

---

## 💳 Payment Testing

### Razorpay Test Cards

| Purpose | Card Number          | Result  |
|---------|---------------------|---------|
| Success | 4111 1111 1111 1111 | Success |
| Failure | 4000 0000 0000 0002 | Failure |

- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

### Required Environment Variables

```env
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

Get test credentials from: https://razorpay.com (Test Mode)

---

## 🔄 Complete Checkout Flow

1. **Add to Cart** → Click product → Select quantity → Add to Cart
2. **View Cart** → Click cart icon → Review items
3. **Checkout** → Click "Proceed to Checkout"
4. **Address (Step 1)** → Fill form → Continue
5. **Review (Step 2)** → Verify order → Apply coupon (optional) → Continue
6. **Payment (Step 3)** → Click Pay → Complete in Razorpay modal
7. **Success** → View order confirmation → Check email

---

## 🐛 Quick Debugging

### Cart Issues
```bash
# Check browser console
F12 → Console tab

# Check cookies
F12 → Application → Cookies → cart_session_id

# Check database
pnpm db:studio
```

### Payment Issues
```bash
# Verify environment variables
cat .env | grep RAZORPAY

# Check server logs
# Look in terminal where pnpm dev is running
```

### Database Issues
```bash
# Open database studio
pnpm db:studio

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed
```

---

## 📊 What to Check in Database

After completing an order, verify:

1. **orders** table → New order created
2. **order_items** table → Items linked to order
3. **products** table → Stock decreased
4. **carts** table → Cart deleted
5. **cart_items** table → Cart items deleted
6. **coupons** table → Usage count increased (if coupon used)

---

## ✅ Quick Test Checklist

- [ ] Add item to cart
- [ ] Cart badge updates
- [ ] Shipping < ₹500 shows ₹50
- [ ] Shipping ≥ ₹500 shows FREE
- [ ] Address form validates correctly
- [ ] Order review shows correct totals
- [ ] Payment modal opens
- [ ] Payment completes successfully
- [ ] Order success page displays
- [ ] Email confirmation received
- [ ] Database updated correctly

---

## 🚀 Start Testing

```bash
# Start development server
pnpm dev

# Open in browser
http://localhost:3000

# Open database studio (in another terminal)
pnpm db:studio
```

---

## 📞 Common Error Messages

| Error | Solution |
|-------|----------|
| "Cart is empty" | Add items to cart first |
| "Unauthorized" | Login before checkout |
| "Invalid pincode" | Use exactly 6 digits |
| "Invalid phone" | Use exactly 10 digits |
| "Payment verification failed" | Check Razorpay credentials |
| "Product out of stock" | Check product stock in database |

---

## 💡 Pro Tips

1. **Use Test Mode**: Always use Razorpay test credentials for testing
2. **Check Console**: Keep browser console open while testing
3. **Database Studio**: Keep `pnpm db:studio` open to monitor changes
4. **Clear Data**: Clear cookies/localStorage if cart behaves strangely
5. **Test Both Scenarios**: Test with subtotal < ₹500 and ≥ ₹500
6. **Email Testing**: Check spam folder for confirmation emails
