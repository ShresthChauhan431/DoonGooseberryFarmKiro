# Sales Banner Documentation

## Overview
The sales banner feature allows administrators to display a promotional banner at the top of the homepage to highlight sales, special offers, and important announcements.

## Features

- Enable/disable banner visibility
- Customize banner text with emojis
- Set clickable link (optional)
- Choose custom background color
- Choose custom text color
- Live preview in admin panel
- Dismissible by users (per session)

## Admin Panel Access

Navigate to **Admin Panel > Settings > Homepage** and scroll to the "Sales Banner" section.

## Configuration

### Enable/Disable Banner

Toggle the "Enable Sales Banner" switch to show or hide the banner on your homepage.

### Banner Text

Enter your promotional message in the "Banner Text" field.

**Tips:**
- Keep it short and compelling (recommended: under 100 characters)
- Use emojis to make it eye-catching (e.g., 🎉, 🔥, ⭐)
- Include the offer details and urgency
- Mention coupon codes if applicable

**Examples:**
- `🎉 Summer Sale! Get 20% off on all products. Use code: SUMMER20`
- `🔥 Limited Time Offer: Buy 2 Get 1 Free on Selected Items!`
- `⭐ New Arrivals! Fresh Gooseberry Products Now Available`

### Banner Link (Optional)

Set where users should go when they click the banner.

**Common Links:**
- `/shop` - All products page
- `/shop?category=pickles` - Specific category
- `/shop?sale=true` - Sale items
- Leave empty for non-clickable banner

### Colors

#### Background Color
Choose a color that stands out but matches your brand.

**Recommended Colors:**
- Green: `#16a34a` (Success/Sale)
- Red: `#dc2626` (Urgent/Limited)
- Blue: `#2563eb` (Info/New)
- Orange: `#ea580c` (Warning/Hot)

#### Text Color
Ensure good contrast with background color for readability.

**Recommended:**
- White: `#ffffff` (for dark backgrounds)
- Black: `#000000` (for light backgrounds)

### Preview

The admin panel shows a live preview of how the banner will appear on your homepage.

## User Experience

### Display
- Banner appears at the very top of the homepage
- Above the hero carousel
- Full width of the screen
- Responsive on all devices

### Dismissal
- Users can close the banner by clicking the X button
- Banner stays hidden for the current session
- Reappears on next visit

### Click Behavior
- If link is set: Entire banner is clickable
- If no link: Banner is informational only
- Hover effect shows it's interactive

## Technical Details

### Database Settings

The following settings are stored in the `site_settings` table:

```javascript
{
  sales_banner_enabled: 'true' | 'false',
  sales_banner_text: 'Your promotional message',
  sales_banner_link: '/shop',
  sales_banner_bg_color: '#16a34a',
  sales_banner_text_color: '#ffffff'
}
```

### Component

Location: `components/sales-banner.tsx`

Props:
- `text`: Banner message
- `link`: Optional URL
- `bgColor`: Background color (hex)
- `textColor`: Text color (hex)

### Integration

The banner is integrated in `app/(shop)/page.tsx` and appears only when enabled.

## Best Practices

### Content
1. **Be Clear**: State the offer clearly
2. **Create Urgency**: Use time-limited language
3. **Include CTA**: Tell users what to do
4. **Keep it Short**: Mobile users should see full message

### Design
1. **High Contrast**: Ensure text is readable
2. **Brand Consistency**: Use brand colors
3. **Test on Mobile**: Check appearance on small screens
4. **Accessibility**: Ensure sufficient color contrast (WCAG AA)

### Timing
1. **Update Regularly**: Keep content fresh
2. **Seasonal Offers**: Align with holidays/seasons
3. **Remove Expired**: Disable when offer ends
4. **Test Before Launch**: Preview before enabling

## Examples

### Summer Sale
```
Text: 🎉 Summer Sale! Get 20% off on all products. Use code: SUMMER20
Link: /shop
Background: #16a34a (Green)
Text Color: #ffffff (White)
```

### New Product Launch
```
Text: ⭐ NEW! Fresh Mango Pickle Now Available - Order Today!
Link: /shop/mango-pickle
Background: #ea580c (Orange)
Text Color: #ffffff (White)
```

### Free Shipping
```
Text: 🚚 Free Shipping on Orders Above ₹500 - Limited Time!
Link: /shop
Background: #2563eb (Blue)
Text Color: #ffffff (White)
```

### Festival Offer
```
Text: 🪔 Diwali Special: Flat ₹100 Off on Orders Above ₹1000
Link: /shop
Background: #dc2626 (Red)
Text Color: #ffffff (White)
```

## Troubleshooting

### Banner Not Showing
- Check if "Enable Sales Banner" is toggled on
- Clear browser cache
- Verify settings are saved
- Check if user dismissed it (try incognito mode)

### Text Not Readable
- Increase color contrast
- Use white text on dark backgrounds
- Use dark text on light backgrounds
- Test on different devices

### Link Not Working
- Verify link starts with `/` for internal links
- Use full URL for external links (https://...)
- Test link in browser address bar first

## Accessibility

The sales banner follows accessibility best practices:
- Semantic HTML structure
- Keyboard accessible close button
- Sufficient color contrast
- Screen reader friendly
- Focus indicators for interactive elements

## Performance

The banner is:
- Lightweight (minimal CSS/JS)
- No external dependencies
- Client-side state management
- No impact on page load time
