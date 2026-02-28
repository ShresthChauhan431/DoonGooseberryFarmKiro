/**
 * Test script to diagnose cart issues
 * Run with: npx tsx scripts/test-cart.ts
 */

import { addToCart } from '@/lib/actions/cart';
import { db } from '@/lib/db';
import { cartItems, carts, products } from '@/lib/db/schema';

async function testCart() {
  console.log('🔍 Testing cart functionality...\n');

  // 1. Check if products exist
  console.log('1. Checking products in database...');
  const allProducts = await db.select().from(products).limit(5);

  if (allProducts.length === 0) {
    console.error('❌ No products found in database!');
    console.log('   Run: npm run db:seed');
    return;
  }

  console.log(`✅ Found ${allProducts.length} products`);
  console.log(`   First product: ${allProducts[0].name} (ID: ${allProducts[0].id})`);
  console.log(`   Stock: ${allProducts[0].stock}\n`);

  // 2. Test adding to cart
  console.log('2. Testing addToCart function...');
  const testSessionId = `test_session_${Date.now()}`;
  const testProduct = allProducts[0];

  try {
    const result = await addToCart(testProduct.id, 1, undefined, testSessionId);

    if (result.success) {
      console.log('✅ Successfully added to cart');
      console.log(`   Message: ${result.message}\n`);
    } else {
      console.error('❌ Failed to add to cart');
      console.error(`   Error: ${result.message}\n`);
      return;
    }
  } catch (error) {
    console.error('❌ Exception occurred:');
    console.error(error);
    return;
  }

  // 3. Verify cart was created
  console.log('3. Verifying cart in database...');
  const cart = await db.select().from(carts).where(eq(carts.sessionId, testSessionId)).limit(1);

  if (cart.length === 0) {
    console.error('❌ Cart not found in database!');
    return;
  }

  console.log('✅ Cart created successfully');
  console.log(`   Cart ID: ${cart[0].id}\n`);

  // 4. Verify cart item was added
  console.log('4. Verifying cart item...');
  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart[0].id));

  if (items.length === 0) {
    console.error('❌ Cart item not found!');
    return;
  }

  console.log('✅ Cart item added successfully');
  console.log(`   Product ID: ${items[0].productId}`);
  console.log(`   Quantity: ${items[0].quantity}\n`);

  // Cleanup
  console.log('5. Cleaning up test data...');
  await db.delete(carts).where(eq(carts.id, cart[0].id));
  console.log('✅ Test data cleaned up\n');

  console.log('🎉 All tests passed! Cart functionality is working correctly.');
}

// Import eq from drizzle-orm
import { eq } from 'drizzle-orm';

testCart()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
