/**
 * Convert paise to rupees for display
 * @param paise - Price in paise (integer)
 * @returns Formatted price string with ₹ symbol (e.g., "₹123.45")
 */
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toFixed(2)}`;
}

/**
 * Convert rupees to paise for storage
 * @param rupees - Price in rupees (can be decimal)
 * @returns Price in paise (integer)
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees (for calculations)
 * @param paise - Price in paise (integer)
 * @returns Price in rupees (number)
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}
