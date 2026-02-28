'use client';

import { useEffect } from 'react';
import { mergeGuestWishlist } from '@/lib/actions/wishlist';
import { clearGuestWishlist, getGuestWishlist } from '@/lib/utils/guest-wishlist';

/**
 * Component that merges guest wishlist with user wishlist on mount
 * Should be rendered when user is authenticated
 */
export function WishlistMerge() {
  useEffect(() => {
    const mergeWishlist = async () => {
      const guestWishlist = getGuestWishlist();

      if (guestWishlist.length > 0) {
        const result = await mergeGuestWishlist(guestWishlist);

        if (result.success) {
          // Clear guest wishlist after successful merge
          clearGuestWishlist();
        }
      }
    };

    mergeWishlist();
  }, []);

  return null; // This component doesn't render anything
}
