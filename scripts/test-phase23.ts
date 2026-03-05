/**
 * Test script for Phase 23 features
 * Tests: Coupons, Sales Banner, Delivery Charges, 404 Pages
 */

import { getDeliverySettings } from '../lib/queries/settings';
import { calculateCartTotalsWithShipping } from '../lib/utils/cart';
import { calculateShipping } from '../lib/utils/shipping';

async function testPhase23() {
  console.log('🧪 Testing Phase 23 Features\n');
  console.log('='.repeat(60));

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Delivery Settings Query
  console.log('\n1️⃣ Testing Delivery Settings Query...');
  try {
    const deliverySettings = await getDeliverySettings();
    console.log('   ✅ Delivery settings retrieved successfully');
    console.log(`   - Standard Charge: ₹${deliverySettings.standardDeliveryCharge / 100}`);
    console.log(`   - Free Threshold: ₹${deliverySettings.freeDeliveryThreshold / 100}`);
    console.log(`   - Express Enabled: ${deliverySettings.expressDeliveryEnabled}`);
    console.log(`   - Express Charge: ₹${deliverySettings.expressDeliveryCharge / 100}`);
    passedTests++;
  } catch (error) {
    console.log('   ❌ Failed to retrieve delivery settings');
    console.error('   Error:', error);
    failedTests++;
  }

  // Test 2: Shipping Calculation - Below Threshold
  console.log('\n2️⃣ Testing Shipping Calculation (Below Threshold)...');
  try {
    const subtotal = 30000; // ₹300
    const shipping = await calculateShipping(subtotal);
    const settings = await getDeliverySettings();

    if (shipping === settings.standardDeliveryCharge) {
      console.log(`   ✅ Correct: ₹${subtotal / 100} cart → ₹${shipping / 100} shipping`);
      passedTests++;
    } else {
      console.log(
        `   ❌ Expected ₹${settings.standardDeliveryCharge / 100}, got ₹${shipping / 100}`
      );
      failedTests++;
    }
  } catch (error) {
    console.log('   ❌ Shipping calculation failed');
    console.error('   Error:', error);
    failedTests++;
  }

  // Test 3: Shipping Calculation - Above Threshold
  console.log('\n3️⃣ Testing Shipping Calculation (Above Threshold)...');
  try {
    const subtotal = 60000; // ₹600
    const shipping = await calculateShipping(subtotal);

    if (shipping === 0) {
      console.log(`   ✅ Correct: ₹${subtotal / 100} cart → FREE shipping`);
      passedTests++;
    } else {
      console.log(`   ❌ Expected FREE (₹0), got ₹${shipping / 100}`);
      failedTests++;
    }
  } catch (error) {
    console.log('   ❌ Shipping calculation failed');
    console.error('   Error:', error);
    failedTests++;
  }

  // Test 4: Cart Totals with Custom Shipping
  console.log('\n4️⃣ Testing Cart Totals with Custom Shipping...');
  try {
    const mockCartItems = [
      {
        id: 'item1',
        cartId: 'cart1',
        productId: 'prod1',
        quantity: 2,
        product: {
          id: 'prod1',
          name: 'Test Product',
          slug: 'test-product',
          price: 20000, // ₹200
          stock: 10,
          images: [],
          category: null,
        },
      },
    ];

    const shippingCost = 5000; // ₹50
    const totals = calculateCartTotalsWithShipping(mockCartItems, shippingCost);

    const expectedSubtotal = 40000; // 2 × ₹200
    const expectedTotal = 45000; // ₹400 + ₹50

    if (
      totals.subtotal === expectedSubtotal &&
      totals.shipping === shippingCost &&
      totals.total === expectedTotal
    ) {
      console.log('   ✅ Cart totals calculated correctly');
      console.log(`   - Subtotal: ₹${totals.subtotal / 100}`);
      console.log(`   - Shipping: ₹${totals.shipping / 100}`);
      console.log(`   - Total: ₹${totals.total / 100}`);
      passedTests++;
    } else {
      console.log('   ❌ Cart totals incorrect');
      console.log(
        `   Expected: Subtotal ₹${expectedSubtotal / 100}, Total ₹${expectedTotal / 100}`
      );
      console.log(`   Got: Subtotal ₹${totals.subtotal / 100}, Total ₹${totals.total / 100}`);
      failedTests++;
    }
  } catch (error) {
    console.log('   ❌ Cart totals calculation failed');
    console.error('   Error:', error);
    failedTests++;
  }

  // Test 5: Cart Totals with Coupon
  console.log('\n5️⃣ Testing Cart Totals with Coupon...');
  try {
    const mockCartItems = [
      {
        id: 'item1',
        cartId: 'cart1',
        productId: 'prod1',
        quantity: 1,
        product: {
          id: 'prod1',
          name: 'Test Product',
          slug: 'test-product',
          price: 100000, // ₹1000
          stock: 10,
          images: [],
          category: null,
        },
      },
    ];

    const shippingCost = 0; // Free shipping
    const mockCoupon = {
      id: 'coupon1',
      code: 'TEST20',
      discountType: 'PERCENTAGE' as const,
      discountValue: 20, // 20%
      minOrderValue: 50000,
    };

    const totals = calculateCartTotalsWithShipping(mockCartItems, shippingCost, mockCoupon);

    const expectedDiscount = 20000; // 20% of ₹1000
    const expectedTotal = 80000; // ₹1000 - ₹200

    if (totals.discount === expectedDiscount && totals.total === expectedTotal) {
      console.log('   ✅ Coupon discount applied correctly');
      console.log(`   - Subtotal: ₹${totals.subtotal / 100}`);
      console.log(`   - Discount (20%): -₹${totals.discount / 100}`);
      console.log(`   - Shipping: ₹${totals.shipping / 100}`);
      console.log(`   - Total: ₹${totals.total / 100}`);
      passedTests++;
    } else {
      console.log('   ❌ Coupon discount incorrect');
      console.log(
        `   Expected: Discount ₹${expectedDiscount / 100}, Total ₹${expectedTotal / 100}`
      );
      console.log(`   Got: Discount ₹${totals.discount / 100}, Total ₹${totals.total / 100}`);
      failedTests++;
    }
  } catch (error) {
    console.log('   ❌ Coupon calculation failed');
    console.error('   Error:', error);
    failedTests++;
  }

  // Test 6: File Structure Check
  console.log('\n6️⃣ Testing File Structure...');
  try {
    const fs = require('fs');
    const requiredFiles = [
      'app/admin/coupons/page.tsx',
      'app/admin/coupons/new/page.tsx',
      'app/admin/coupons/[id]/edit/page.tsx',
      'app/admin/delivery/page.tsx',
      'components/admin/coupon-form.tsx',
      'components/admin/delete-coupon-button.tsx',
      'components/admin/delivery-charges-form.tsx',
      'components/sales-banner.tsx',
      'components/admin/settings/sales-banner-form.tsx',
      'components/ui/switch.tsx',
      'lib/queries/coupons.ts',
      'lib/utils/shipping.ts',
      'app/not-found.tsx',
      'app/(shop)/not-found.tsx',
      'app/admin/not-found.tsx',
      'app/account/not-found.tsx',
    ];

    let allFilesExist = true;
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        console.log(`   ❌ Missing file: ${file}`);
        allFilesExist = false;
      }
    }

    if (allFilesExist) {
      console.log(`   ✅ All ${requiredFiles.length} required files exist`);
      passedTests++;
    } else {
      failedTests++;
    }
  } catch (error) {
    console.log('   ❌ File structure check failed');
    console.error('   Error:', error);
    failedTests++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(
    `   📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`
  );

  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Phase 23 features are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }

  console.log('\n' + '='.repeat(60));
}

// Run tests
testPhase23().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
