# Cart Fix Testing Guide

## What Was Fixed

The cart was appearing empty because of a session ID mismatch:
- **Client side** was creating a session ID in `localStorage` with key `sessionId`
- **Server side** was looking for a session ID in cookies with key `cart_session_id`
- These didn't match, so items added to cart weren't visible

## Changes Made

1. **Unified Session ID Key**: Changed from `sessionId` to `cart_session_id` everywhere
2. **Session Init Component**: Added `CartSessionInit` that runs on page load to ensure session ID exists
3. **Migration**: Old `sessionId` values are automatically migrated to `cart_session_id`
4. **Sync**: Session ID is now synced between localStorage and cookies

## How to Test

### Step 1: Clear Old Data (Important!)

Before testing, clear your browser data:

1. Open Developer Tools (F12)
2. Go to **Application** tab
3. Clear **Cookies**:
   - Right-click on your site under Cookies
   - Click "Clear"
4. Clear **Local Storage**:
   - Right-click on your site under Local Storage
   - Click "Clear"
5. **Refresh the page** (Ctrl+R or Cmd+R)

### Step 2: Verify Session ID Initialization

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Refresh the page
4. You should see:
   ```
   [CartSessionInit] Created new session ID: session_[timestamp]_[random]
   [CartSessionInit] Set session ID cookie
   ```

5. Go to **Application** tab
6. Check **Cookies** → Should see `cart_session_id` with a value
7. Check **Local Storage** → Should see `cart_session_id` with the same value

### Step 3: Add Item to Cart

1. Go to `/shop`
2. Click on any product
3. Click "Add to Cart"
4. Watch the **Console** tab for logs:
   ```
   Found existing session ID in cookie: session_[timestamp]_[random]
   Adding to cart: {productId: "...", quantity: 1, sessionId: "session_..."}
   [addToCart] Called with: {productId: "...", quantity: 1, sessionId: "session_..."}
   [addToCart] Product found: [Product Name] Stock: [number]
   [addToCart] Using existing cart: [cart_id] OR Created new cart: [cart_id]
   [addToCart] Created new cart item OR Updated existing cart item
   [addToCart] Success!
   Add to cart result: {success: true, message: "Product added to cart"}
   ```

5. You should see a success toast: "Added to cart"

### Step 4: Verify Cart Badge Updates

1. Look at the cart icon in the header
2. The badge should show "1" (or the number of items)
3. If it doesn't update immediately, refresh the page
4. After refresh, the badge should show the correct count

### Step 5: Open Cart Sheet

1. Click the cart icon in the header
2. The cart sheet should open
3. You should see your item(s) listed
4. Each item should show:
   - Product image
   - Product name
   - Price
   - Quantity selector
   - Remove button

### Step 6: Verify Database

1. Open database studio:
   ```bash
   pnpm db:studio
   ```

2. Check **carts** table:
   - Should have a record with your `session_id`
   - Note the `id` value

3. Check **cart_items** table:
   - Should have items with `cart_id` matching the cart `id`
   - Should show correct `product_id` and `quantity`

## Troubleshooting

### Cart Still Empty After Adding

**Check Console Logs**:
- Look for `[addToCart]` logs
- Check if session ID is consistent across all logs
- Look for any error messages

**Check Session ID Consistency**:
1. In Console, type: `document.cookie`
2. Look for `cart_session_id=session_...`
3. In Console, type: `localStorage.getItem('cart_session_id')`
4. Both should return the same session ID

**If Session IDs Don't Match**:
1. Clear cookies and localStorage
2. Refresh the page
3. Try again

### Badge Not Updating

**Solution**: Refresh the page after adding to cart
- The badge updates on server-side render
- After adding to cart, the page refreshes automatically
- If it doesn't, manually refresh (F5)

### Items Disappear After Refresh

**This means**:
- Items are being added to cart
- But session ID is changing between requests

**Solution**:
1. Check browser console for session ID logs
2. Ensure `cart_session_id` cookie is being set
3. Check cookie expiry (should be 30 days)
4. Verify cookie path is `/`

### Database Shows Cart But UI Doesn't

**This means**:
- Items are in database
- But server is querying with wrong session ID

**Solution**:
1. Check what session ID the server is using
2. In Header component, it reads from cookies
3. Verify cookie exists and has correct value
4. Check server logs for session ID being used

## Expected Behavior

### First Visit
1. Page loads
2. `CartSessionInit` creates new session ID
3. Session ID stored in localStorage and cookie
4. Cart is empty (badge shows 0)

### Adding First Item
1. Click "Add to Cart"
2. `getSessionId()` reads session ID from cookie
3. `addToCart` action creates cart in database
4. Cart item added to database
5. Page refreshes
6. Header reads cart from database using cookie session ID
7. Badge shows 1

### Adding More Items
1. Click "Add to Cart" on another product
2. Same session ID used
3. Item added to existing cart
4. Page refreshes
5. Badge shows updated count

### After Page Refresh
1. Page loads
2. `CartSessionInit` finds existing session ID in cookie
3. Syncs to localStorage
4. Header reads cart using session ID
5. Badge shows correct count
6. Cart sheet shows all items

## Success Criteria

✅ Session ID created on first page load
✅ Session ID stored in both localStorage and cookie
✅ Session ID persists across page refreshes
✅ Adding item to cart succeeds
✅ Cart badge updates with item count
✅ Cart sheet shows added items
✅ Database has cart and cart_items records
✅ Items persist after page refresh

## Quick Test Commands

```bash
# Start dev server
pnpm dev

# Open database studio (in another terminal)
pnpm db:studio

# Check server logs
# Look in terminal where pnpm dev is running
```

## Console Commands for Debugging

```javascript
// Check session ID in cookie
document.cookie

// Check session ID in localStorage
localStorage.getItem('cart_session_id')

// Check all localStorage
localStorage

// Clear localStorage
localStorage.clear()

// Clear specific item
localStorage.removeItem('cart_session_id')
```

## What to Report If Still Not Working

If the cart still doesn't work after following these steps, please provide:

1. **Console logs** when adding to cart (copy all `[addToCart]` logs)
2. **Session ID from cookie**: `document.cookie`
3. **Session ID from localStorage**: `localStorage.getItem('cart_session_id')`
4. **Network tab**: Screenshot of the cart action request/response
5. **Database**: Screenshot of carts and cart_items tables
6. **Any error messages** in console or network tab
