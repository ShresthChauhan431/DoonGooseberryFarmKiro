/**
 * Shipping calculation utilities
 * Separated from cart.ts to allow server-side database access
 */

import { getDeliverySettings } from '@/lib/queries/settings';

/**
 * Calculate shipping cost based on subtotal and delivery settings
 * Returns shipping cost in paise
 */
export async function calculateShipping(subtotal: number): Promise<number> {
  const settings = await getDeliverySettings();

  // If subtotal meets or exceeds free delivery threshold, shipping is free
  if (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold) {
    return 0;
  }

  // Otherwise, charge standard delivery fee
  return settings.standardDeliveryCharge;
}

/**
 * Get delivery settings for display purposes
 */
export async function getShippingInfo() {
  const settings = await getDeliverySettings();

  return {
    standardCharge: settings.standardDeliveryCharge,
    freeThreshold: settings.freeDeliveryThreshold,
    expressEnabled: settings.expressDeliveryEnabled,
    expressCharge: settings.expressDeliveryCharge,
    hasFreeDelivery: settings.freeDeliveryThreshold > 0,
  };
}
