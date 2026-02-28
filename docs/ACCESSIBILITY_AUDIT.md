# Accessibility Audit Guide

This document provides instructions for running Lighthouse accessibility audits on the Doon Gooseberry Farm e-commerce platform.

## Requirements

- Requirement 33.11: Achieve Lighthouse accessibility score of 90 or higher
- All pages should be tested for accessibility compliance

## Running Lighthouse Audits

### Method 1: Chrome DevTools (Recommended)

1. Open the application in Google Chrome
2. Open Chrome DevTools (F12 or Cmd+Option+I on Mac)
3. Navigate to the "Lighthouse" tab
4. Select the following options:
   - Mode: Navigation
   - Categories: Check "Accessibility"
   - Device: Desktop and Mobile (run separately)
5. Click "Analyze page load"
6. Review the accessibility score and recommendations

### Method 2: Lighthouse CLI

Install Lighthouse globally:
```bash
npm install -g lighthouse
```

Run Lighthouse for specific pages:
```bash
# Homepage
lighthouse http://localhost:3000 --only-categories=accessibility --view

# Shop page
lighthouse http://localhost:3000/shop --only-categories=accessibility --view

# Product detail page
lighthouse http://localhost:3000/shop/mango-pickle --only-categories=accessibility --view

# Cart page
lighthouse http://localhost:3000/cart --only-categories=accessibility --view

# Checkout page (requires authentication)
lighthouse http://localhost:3000/checkout --only-categories=accessibility --view --extra-headers="{\"Cookie\":\"session=YOUR_SESSION_TOKEN\"}"
```

### Method 3: Lighthouse CI (Automated)

For continuous integration, add Lighthouse CI to your workflow:

```bash
npm install -D @lhci/cli
```

Create `.lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/shop",
        "http://localhost:3000/cart"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

Run Lighthouse CI:
```bash
lhci autorun
```

## Pages to Test

Test the following pages to ensure comprehensive accessibility coverage:

### Public Pages
- [ ] Homepage (/)
- [ ] Shop page (/shop)
- [ ] Product detail page (/shop/[slug])
- [ ] Search results (/search)
- [ ] Cart page (/cart)
- [ ] Blog listing (/blog)
- [ ] Blog post (/blog/[slug])
- [ ] Login page (/login)
- [ ] Register page (/register)

### Authenticated Pages
- [ ] Checkout page (/checkout)
- [ ] Order success page (/order/[orderId]/success)
- [ ] Account dashboard (/account)
- [ ] Order history (/account/orders)
- [ ] Order detail (/account/orders/[orderId])
- [ ] Addresses (/account/addresses)
- [ ] Wishlist (/account/wishlist)

### Admin Pages
- [ ] Admin dashboard (/admin)
- [ ] Products management (/admin/products)
- [ ] Product creation (/admin/products/new)
- [ ] Product edit (/admin/products/[id]/edit)
- [ ] Orders management (/admin/orders)
- [ ] Order detail (/admin/orders/[id])

## Common Accessibility Issues to Check

### 1. Color Contrast
- Text should have a contrast ratio of at least 4.5:1
- Large text (18pt+) should have at least 3:1
- Check all text colors against backgrounds

### 2. Keyboard Navigation
- All interactive elements should be keyboard accessible
- Tab order should be logical
- Focus indicators should be visible
- No keyboard traps

### 3. ARIA Labels
- Images should have alt text
- Buttons should have accessible names
- Form inputs should have associated labels
- Icons should have aria-labels or sr-only text

### 4. Semantic HTML
- Use proper heading hierarchy (h1, h2, h3)
- Use semantic elements (nav, main, article, aside, footer)
- Use lists for list content
- Use tables for tabular data

### 5. Form Accessibility
- All inputs should have associated labels
- Error messages should be announced to screen readers
- Required fields should be indicated
- Form validation should be accessible

### 6. Screen Reader Testing
- Test with NVDA (Windows) or VoiceOver (Mac)
- Ensure all content is announced properly
- Check that navigation is logical
- Verify error messages are announced

## Target Scores

- **Accessibility Score**: ≥ 90 (Required)
- **Performance Score**: ≥ 90 (Recommended)
- **Best Practices Score**: ≥ 90 (Recommended)
- **SEO Score**: ≥ 90 (Recommended)

## Accessibility Features Implemented

### ✅ Semantic HTML
- Proper use of header, nav, main, article, footer elements
- Heading hierarchy maintained throughout

### ✅ Alt Text
- All images have descriptive alt text
- Decorative images use empty alt=""

### ✅ Keyboard Accessibility
- All interactive elements are keyboard accessible
- Visible focus indicators on all focusable elements
- Logical tab order

### ✅ ARIA Labels
- Screen reader text for icon-only buttons
- Proper aria-labels for complex interactions
- aria-live regions for dynamic content

### ✅ Color Contrast
- Text meets 4.5:1 contrast ratio
- Interactive elements meet contrast requirements

### ✅ Skip Navigation
- Skip to main content link for keyboard users

### ✅ Form Accessibility
- All inputs have associated labels
- Error messages use role="alert" and aria-live
- Required fields are indicated

### ✅ Touch-Friendly
- Minimum 44×44px touch targets
- Adequate spacing between interactive elements

### ✅ Responsive Design
- Mobile-first approach
- Proper viewport configuration
- Readable font sizes on all devices

## Fixing Common Issues

### Issue: Images missing alt text
**Fix**: Add descriptive alt text to all images
```tsx
<Image src="/product.jpg" alt="Mango Pickle - 500g jar" />
```

### Issue: Low color contrast
**Fix**: Adjust colors to meet 4.5:1 ratio
```css
/* Before: contrast ratio 3:1 */
color: #999;

/* After: contrast ratio 4.5:1 */
color: #767676;
```

### Issue: Missing form labels
**Fix**: Associate labels with inputs
```tsx
<FormLabel htmlFor="email">Email</FormLabel>
<Input id="email" type="email" />
```

### Issue: No focus indicators
**Fix**: Add visible focus styles
```css
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

## Continuous Monitoring

1. Run Lighthouse audits before each deployment
2. Set up automated Lighthouse CI in GitHub Actions
3. Monitor accessibility scores over time
4. Address any regressions immediately

## Resources

- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Accessibility Scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)

## Testing Checklist

Before marking accessibility as complete:

- [ ] All pages achieve Lighthouse accessibility score ≥ 90
- [ ] Manual keyboard navigation test passed
- [ ] Screen reader test passed (NVDA or VoiceOver)
- [ ] Color contrast verified with WebAIM checker
- [ ] All images have alt text
- [ ] All forms have proper labels
- [ ] Focus indicators are visible
- [ ] Skip navigation link works
- [ ] Touch targets are at least 44×44px
- [ ] No accessibility errors in axe DevTools
