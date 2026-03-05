# Admin Panel Quick Start Guide

## Overview
This guide helps you quickly set up and configure your Doon Gooseberry Farm e-commerce store through the admin panel.

## Accessing Admin Panel

1. Navigate to `/admin` in your browser
2. Login with admin credentials
3. You'll see the admin dashboard

## Initial Setup Checklist

### 1. Configure Delivery Charges
**Location**: Admin > Delivery

Set up your shipping costs:
- **Standard Delivery**: ₹50 (default)
- **Free Delivery Threshold**: ₹500 (default)
- **Express Delivery**: Enable if you offer faster shipping
- **Express Charge**: ₹100 (if enabled)

**Recommended Settings:**
```
Standard Delivery: ₹50
Free Threshold: ₹500
Express: Disabled (enable later if needed)
```

### 2. Create Promotional Coupons
**Location**: Admin > Coupons

Create your first coupon:
1. Click "Create Coupon"
2. Enter code (e.g., `WELCOME10`)
3. Choose discount type (Percentage or Flat)
4. Set discount value (e.g., 10 for 10%)
5. Set minimum order value (e.g., ₹300)
6. Set maximum uses (e.g., 100)
7. Set expiry date
8. Click "Create Coupon"

**Starter Coupons:**
- `WELCOME10` - 10% off, min ₹300, for new customers
- `SAVE50` - ₹50 off, min ₹500, general promotion
- `BULK20` - 20% off, min ₹1000, for bulk orders

### 3. Configure Sales Banner
**Location**: Admin > Settings > Homepage

Set up promotional banner:
1. Toggle "Enable Sales Banner" ON
2. Enter banner text (e.g., "🎉 Welcome! Use code WELCOME10 for 10% off")
3. Set link (e.g., `/shop`)
4. Choose colors:
   - Background: Green (#16a34a) for sales
   - Text: White (#ffffff) for contrast
5. Preview and save

### 4. Customize Homepage
**Location**: Admin > Settings > Homepage

Configure hero section:
1. Upload hero images (recommended: 1920x1080px)
2. Set hero title
3. Set hero subtitle
4. Configure button text and link
5. Save changes

### 5. Update General Settings
**Location**: Admin > Settings > General

Update store information:
- Site name
- Site description
- Contact email
- Contact phone
- Social media links

## Daily Operations

### Managing Orders
**Location**: Admin > Orders

1. View all orders
2. Click order to see details
3. Update order status:
   - PENDING → PROCESSING (when preparing)
   - PROCESSING → SHIPPED (when dispatched)
   - SHIPPED → DELIVERED (when received)
   - Any → CANCELLED (if needed)

**Status Emails:**
- SHIPPED: Customer receives tracking info
- DELIVERED: Customer receives confirmation

### Managing Products
**Location**: Admin > Products

**Add New Product:**
1. Click "Add Product"
2. Fill in details:
   - Name
   - Description
   - Price
   - Category
   - Stock quantity
   - Images (multiple)
3. Click "Create Product"

**Edit Product:**
1. Find product in list
2. Click "Edit"
3. Update details
4. Save changes

**Delete Product:**
1. Find product
2. Click delete icon
3. Confirm deletion

### Managing Coupons
**Location**: Admin > Coupons

**Monitor Usage:**
- Check "Current Uses" vs "Max Uses"
- View expiry dates
- See active/expired status

**Edit Coupon:**
- Update discount value
- Change expiry date
- Adjust max uses
- Modify minimum order value

**Delete Coupon:**
- Remove expired or unused coupons
- Clean up old promotions

## Common Tasks

### Running a Sale

1. **Create Sale Coupon:**
   - Code: `SALE20`
   - Type: Percentage
   - Value: 20
   - Min Order: ₹500
   - Max Uses: 500
   - Expires: End of sale period

2. **Update Sales Banner:**
   - Text: "🔥 SALE! Get 20% off with code SALE20"
   - Link: `/shop`
   - Background: Red (#dc2626)
   - Enable banner

3. **Promote:**
   - Share coupon code on social media
   - Send email to customers
   - Update homepage hero text

### Seasonal Promotions

**Diwali Example:**
```
Coupon:
- Code: DIWALI25
- Discount: 25%
- Min Order: ₹1000
- Max Uses: 200

Banner:
- Text: "🪔 Diwali Special! 25% off on orders above ₹1000"
- Background: Orange (#ea580c)
```

**Summer Sale Example:**
```
Coupon:
- Code: SUMMER20
- Discount: 20%
- Min Order: ₹500
- Max Uses: 300

Banner:
- Text: "☀️ Summer Sale! Beat the heat with 20% off"
- Background: Blue (#2563eb)
```

### Free Shipping Campaign

1. **Temporary Free Shipping:**
   - Go to Admin > Delivery
   - Set "Free Delivery Threshold" to ₹0
   - Save changes

2. **Update Banner:**
   - Text: "🚚 FREE Shipping on All Orders - Limited Time!"
   - Enable banner

3. **After Campaign:**
   - Restore original threshold (₹500)
   - Disable or update banner

## Best Practices

### Coupons
- ✅ Use memorable codes (SAVE20, WELCOME10)
- ✅ Set reasonable expiry dates
- ✅ Monitor usage regularly
- ✅ Delete expired coupons
- ❌ Don't create too many active coupons
- ❌ Don't set unrealistic discounts

### Delivery Charges
- ✅ Cover actual shipping costs
- ✅ Set achievable free delivery threshold
- ✅ Test with different cart values
- ❌ Don't change too frequently
- ❌ Don't set threshold too high

### Sales Banner
- ✅ Keep text short and clear
- ✅ Use emojis for attention
- ✅ Update regularly
- ✅ Test on mobile devices
- ❌ Don't use too many colors
- ❌ Don't leave outdated banners

### Orders
- ✅ Update status promptly
- ✅ Communicate with customers
- ✅ Process within 24 hours
- ❌ Don't delay shipping updates
- ❌ Don't cancel without reason

## Troubleshooting

### Coupon Not Working
1. Check if coupon is expired
2. Verify minimum order value is met
3. Check if max uses reached
4. Ensure code is entered correctly

### Banner Not Showing
1. Verify banner is enabled
2. Clear browser cache
3. Check if text is set
4. Test in incognito mode

### Shipping Not Calculating
1. Check delivery settings are saved
2. Verify values are positive
3. Test with different cart amounts
4. Check browser console for errors

### Order Status Not Updating
1. Verify you're logged in as admin
2. Check valid status transition
3. Refresh the page
4. Check server logs

## Quick Reference

### Admin URLs
- Dashboard: `/admin`
- Products: `/admin/products`
- Orders: `/admin/orders`
- Coupons: `/admin/coupons`
- Delivery: `/admin/delivery`
- Settings: `/admin/settings`

### Default Values
- Standard Delivery: ₹50
- Free Threshold: ₹500
- Express Delivery: Disabled
- Express Charge: ₹100

### Status Flow
```
PENDING → PROCESSING → SHIPPED → DELIVERED
         ↓
      CANCELLED
```

### Coupon Types
- **Percentage**: 10% off (value: 10)
- **Flat**: ₹100 off (value: 100)

## Support

Need help?
1. Check documentation in `/docs` folder
2. Review error messages carefully
3. Test in development environment first
4. Contact development team

---

**Last Updated**: March 5, 2026
**Version**: 1.0.0
