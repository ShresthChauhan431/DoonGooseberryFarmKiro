/**
 * Guest wishlist utilities for managing wishlist in localStorage
 * Used for non-authenticated users
 */

const GUEST_WISHLIST_KEY = 'guest_wishlist';

/**
 * Get guest wishlist from localStorage
 */
export function getGuestWishlist(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const wishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error reading guest wishlist:', error);
    return [];
  }
}

/**
 * Save guest wishlist to localStorage
 */
function saveGuestWishlist(wishlist: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
  } catch (error) {
    console.error('Error saving guest wishlist:', error);
  }
}

/**
 * Check if product is in guest wishlist
 */
export function isInGuestWishlist(productId: string): boolean {
  const wishlist = getGuestWishlist();
  return wishlist.includes(productId);
}

/**
 * Add product to guest wishlist
 */
export function addToGuestWishlist(productId: string): void {
  const wishlist = getGuestWishlist();

  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    saveGuestWishlist(wishlist);
  }
}

/**
 * Remove product from guest wishlist
 */
export function removeFromGuestWishlist(productId: string): void {
  const wishlist = getGuestWishlist();
  const filtered = wishlist.filter((id) => id !== productId);
  saveGuestWishlist(filtered);
}

/**
 * Clear guest wishlist
 */
export function clearGuestWishlist(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch (error) {
    console.error('Error clearing guest wishlist:', error);
  }
}
