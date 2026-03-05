# Coupon System Documentation

## Overview
The coupon system allows administrators to create and manage discount coupons that customers can apply during checkout to receive discounts on their orders.

## Features

### Admin Features
- Create new coupons with custom codes
- Set discount type (Percentage or Flat amount)
- Configure minimum order value requirements
- Set maximum usage limits
- Define expiration dates
- Edit existing coupons
- Delete coupons
- View coupon usage statistics

### Customer Features
- Apply coupon codes during checkout
- View discount amount in order summary
- Receive validation messages for invalid/expired coupons

## Admin Panel Access

Navigate to **Admin Panel > Coupons** to manage coupons.

### Creating a Coupon

1. Click "Create Coupon" button
2. Fill in the following details:
   - **Coupon Code**: Unique code (e.g., SUMMER20) - uppercase letters and numbers
   - **Discount Type**: Choose between Percentage (%) or Flat Amount (₹)
   - **Discount Value**: 
     - For percentage: 1-100
     - For flat: amount in rupees
   - **Minimum Order Value**: Minimum cart value required (in rupees)
   - **Maximum Uses**: Total number of times the coupon can be used
   - **Expiry Date**: Date when the coupon expires
3. Click "Create Coupon"

### Editing a Coupon

1. Find the coupon in the list
2. Click "Edit" button
3. Update the details (Note: Coupon code cannot be changed)
4. Click "Update Coupon"

### Deleting a Coupon

1. Find the coupon in the list
2. Click the delete (trash) icon
3. Confirm deletion

## Coupon Status

Coupons can have the following statuses:
- **Active**: Valid and can be used
- **Expired**: Past the expiration date
- **Max Uses Reached**: Usage limit has been reached

## Customer Usage

### Applying a Coupon

1. Add items to cart
2. Proceed to checkout
3. Complete address information (Step 1)
4. On Order Review page (Step 2), enter coupon code
5. Click "Apply"
6. Discount will be reflected in the order total

### Coupon Validation

The system validates:
- Coupon exists and is active
- Not expired
- Usage limit not exceeded
- Minimum order value is met

## Technical Details

### Database Schema

```sql
CREATE TABLE "coupons" (
  "id" uuid PRIMARY KEY,
  "code" varchar(50) UNIQUE NOT NULL,
  "discount_type" enum('PERCENTAGE', 'FLAT') NOT NULL,
  "discount_value" integer NOT NULL,
  "min_order_value" integer DEFAULT 0 NOT NULL,
  "max_uses" integer NOT NULL,
  "current_uses" integer DEFAULT 0 NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

### API Endpoints

- `lib/actions/coupons.ts`:
  - `validateCoupon()` - Validate and apply coupon
  - `createCoupon()` - Create new coupon (Admin)
  - `updateCoupon()` - Update existing coupon (Admin)
  - `deleteCoupon()` - Delete coupon (Admin)
  - `incrementCouponUsage()` - Increment usage count

- `lib/queries/coupons.ts`:
  - `getAllCoupons()` - Get all coupons
  - `getCouponById()` - Get coupon by ID
  - `getCouponByCode()` - Get coupon by code

### Discount Calculation

- **Percentage**: `discount = (subtotal * discountValue) / 100`
- **Flat**: `discount = discountValue` (capped at subtotal)

## Best Practices

1. **Coupon Codes**: Use memorable, easy-to-type codes
2. **Expiration**: Set reasonable expiration dates
3. **Minimum Order**: Use to encourage larger purchases
4. **Usage Limits**: Prevent abuse with reasonable limits
5. **Testing**: Always test coupons before sharing with customers

## Examples

### Percentage Discount
- Code: `SAVE20`
- Type: Percentage
- Value: 20
- Min Order: ₹500
- Max Uses: 100
- Result: 20% off orders above ₹500

### Flat Discount
- Code: `FLAT100`
- Type: Flat
- Value: 100
- Min Order: ₹1000
- Max Uses: 50
- Result: ₹100 off orders above ₹1000

## Troubleshooting

### Coupon Not Applying
- Check if coupon is expired
- Verify minimum order value is met
- Ensure usage limit not exceeded
- Confirm coupon code is correct (case-insensitive)

### Discount Not Showing
- Refresh the page
- Clear browser cache
- Check order review page for applied discount
