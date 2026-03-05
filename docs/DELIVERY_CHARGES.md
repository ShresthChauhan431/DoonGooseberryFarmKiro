# Delivery Charges Management

## Overview
The delivery charges management system allows administrators to configure shipping costs, free delivery thresholds, and express delivery options dynamically without code changes.

## Features

### Admin Features
- **Standard Delivery Charge**: Set flat delivery fee for regular orders
- **Free Delivery Threshold**: Configure minimum order value for free shipping
- **Express Delivery**: Enable/disable express shipping option
- **Express Delivery Charge**: Set additional cost for express delivery
- **Real-time Preview**: See current configuration summary
- **Dynamic Calculation**: Shipping costs calculated automatically at checkout

### Customer Experience
- Automatic shipping calculation based on cart value
- Free delivery badge when threshold is met
- Clear shipping cost display in cart and checkout
- Encourages larger orders to qualify for free shipping

## Admin Panel Access

Navigate to **Admin Panel > Delivery** to manage delivery charges.

## Configuration Options

### Standard Delivery Charge
- **Default**: ₹50
- **Description**: Flat delivery charge for orders below free delivery threshold
- **Format**: Amount in rupees (e.g., 50.00)
- **Minimum**: ₹0 (free delivery for all orders)

### Free Delivery Threshold
- **Default**: ₹500
- **Description**: Minimum order value to qualify for free delivery
- **Format**: Amount in rupees (e.g., 500.00)
- **Special**: Set to 0 to disable free delivery

### Express Delivery (Optional)
- **Default**: Disabled
- **Description**: Faster delivery option (1-2 days)
- **Toggle**: Enable/disable express delivery
- **Additional Charge**: Extra cost for express shipping

### Express Delivery Charge
- **Default**: ₹100
- **Description**: Additional charge for express delivery
- **Format**: Amount in rupees (e.g., 100.00)
- **Note**: Only applies when express delivery is enabled

## How It Works

### Shipping Calculation Logic

```javascript
if (orderSubtotal >= freeDeliveryThreshold && freeDeliveryThreshold > 0) {
  shippingCost = 0; // Free delivery
} else {
  shippingCost = standardDeliveryCharge;
}
```

### Example Scenarios

#### Scenario 1: Standard Configuration
- Standard Charge: ₹50
- Free Threshold: ₹500
- Express: Disabled

**Results:**
- Cart ₹300 → Shipping: ₹50
- Cart ₹500 → Shipping: FREE
- Cart ₹800 → Shipping: FREE

#### Scenario 2: With Express Delivery
- Standard Charge: ₹50
- Free Threshold: ₹500
- Express: Enabled (₹100)

**Results:**
- Cart ₹300 → Standard: ₹50, Express: ₹150
- Cart ₹500 → Standard: FREE, Express: ₹100
- Cart ₹800 → Standard: FREE, Express: ₹100

#### Scenario 3: No Free Delivery
- Standard Charge: ₹60
- Free Threshold: ₹0 (disabled)
- Express: Disabled

**Results:**
- Cart ₹300 → Shipping: ₹60
- Cart ₹500 → Shipping: ₹60
- Cart ₹800 → Shipping: ₹60

## Technical Implementation

### Database Storage

Settings are stored in the `site_settings` table:

```sql
INSERT INTO site_settings (key, value, type, category) VALUES
  ('standard_delivery_charge', '5000', 'number', 'delivery'),  -- ₹50 in paise
  ('free_delivery_threshold', '50000', 'number', 'delivery'),  -- ₹500 in paise
  ('express_delivery_enabled', 'false', 'boolean', 'delivery'),
  ('express_delivery_charge', '10000', 'number', 'delivery');  -- ₹100 in paise
```

### API Functions

**lib/queries/settings.ts:**
```typescript
getDeliverySettings() // Get all delivery settings
```

**lib/utils/shipping.ts:**
```typescript
calculateShipping(subtotal) // Calculate shipping cost
getShippingInfo() // Get shipping info for display
```

**lib/actions/settings.ts:**
```typescript
updateSettings(settings) // Update delivery settings
```

### Integration Points

1. **Cart Page**: Displays shipping cost estimate
2. **Checkout**: Calculates final shipping cost
3. **Order Creation**: Stores shipping cost with order
4. **Order Confirmation**: Shows shipping cost in email

## Best Practices

### Setting Standard Charge
1. **Research Competitors**: Check what others charge
2. **Cover Costs**: Ensure it covers actual shipping expenses
3. **Keep Reasonable**: Don't discourage small orders
4. **Round Numbers**: Use ₹50, ₹60, ₹75 (easy to understand)

### Setting Free Threshold
1. **Analyze AOV**: Set slightly above average order value
2. **Encourage Upsells**: Make it achievable but motivating
3. **Test Different Values**: A/B test to find optimal threshold
4. **Seasonal Adjustments**: Lower during sales, raise during peak

### Express Delivery
1. **Partner Capability**: Only enable if you can deliver faster
2. **Clear Timeline**: Communicate 1-2 day delivery clearly
3. **Premium Pricing**: Charge enough to cover expedited costs
4. **Limited Availability**: Consider disabling for remote areas

## Customer Communication

### Cart Page Messages
```
Subtotal < Threshold:
"Add ₹X more for FREE delivery!"

Subtotal >= Threshold:
"🎉 You qualify for FREE delivery!"
```

### Checkout Display
```
Subtotal: ₹450.00
Shipping: ₹50.00
-----------------
Total: ₹500.00
```

### Order Confirmation
```
Your order #ABC123 has been confirmed!

Subtotal: ₹450.00
Shipping: ₹50.00
Discount: ₹0.00
-----------------
Total: ₹500.00

Estimated Delivery: 5-7 business days
```

## Common Configurations

### Budget-Friendly Store
- Standard: ₹40
- Free Threshold: ₹400
- Express: Disabled

### Premium Store
- Standard: ₹0 (always free)
- Free Threshold: ₹0
- Express: Enabled (₹150)

### Balanced Approach
- Standard: ₹50
- Free Threshold: ₹500
- Express: Enabled (₹100)

### High-Value Products
- Standard: ₹100
- Free Threshold: ₹1000
- Express: Enabled (₹200)

## Troubleshooting

### Shipping Not Calculating
- Check if delivery settings are saved
- Verify settings are in paise (multiply by 100)
- Clear browser cache
- Check browser console for errors

### Free Delivery Not Working
- Verify free threshold is greater than 0
- Check if cart subtotal includes discounts
- Ensure threshold is in paise (₹500 = 50000 paise)

### Express Delivery Not Showing
- Confirm express delivery is enabled
- Check if express charge is set
- Verify checkout page integration

## Migration from Hardcoded Values

If upgrading from hardcoded shipping (₹50 below ₹500):

```sql
-- Add default settings
INSERT INTO site_settings (key, value, type, category) VALUES
  ('standard_delivery_charge', '5000', 'number', 'delivery'),
  ('free_delivery_threshold', '50000', 'number', 'delivery'),
  ('express_delivery_enabled', 'false', 'boolean', 'delivery'),
  ('express_delivery_charge', '10000', 'number', 'delivery')
ON CONFLICT (key) DO NOTHING;
```

## Analytics & Optimization

### Metrics to Track
1. **Average Order Value (AOV)**: Before and after threshold changes
2. **Conversion Rate**: Impact of shipping costs on purchases
3. **Cart Abandonment**: Shipping-related drop-offs
4. **Express Adoption**: Percentage choosing express delivery

### Optimization Tips
1. **A/B Test Thresholds**: Try ₹400 vs ₹500 vs ₹600
2. **Seasonal Promotions**: Temporary free shipping campaigns
3. **Member Benefits**: Free shipping for registered users
4. **Bundle Deals**: Encourage multi-item purchases

## Future Enhancements

### Potential Features
1. **Zone-Based Pricing**: Different rates for different regions
2. **Weight-Based Shipping**: Calculate by product weight
3. **Carrier Integration**: Real-time rates from shipping partners
4. **Delivery Slots**: Let customers choose delivery time
5. **COD Charges**: Additional fee for cash on delivery
6. **International Shipping**: Support for cross-border orders

## Support

For issues or questions:
1. Check admin panel for current settings
2. Review shipping calculation in cart
3. Test with different cart values
4. Check server logs for errors
5. Contact development team

---

**Last Updated**: March 5, 2026
**Version**: 1.0.0
