'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { toggleWishlist } from '@/lib/actions/wishlist';
import {
  addToGuestWishlist,
  isInGuestWishlist,
  removeFromGuestWishlist,
} from '@/lib/utils/guest-wishlist';

interface WishlistButtonProps {
  productId: string;
  initialIsInWishlist: boolean;
  isAuthenticated?: boolean;
  className?: string;
}

export function WishlistButton({
  productId,
  initialIsInWishlist,
  isAuthenticated = false,
  className = '',
}: WishlistButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const [isPending, startTransition] = useTransition();

  // For guest users, check localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setIsInWishlist(isInGuestWishlist(productId));
    }
  }, [productId, isAuthenticated]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation();

    const newState = !isInWishlist;

    // Optimistic update wrapped in transition
    startTransition(() => {
      setIsInWishlist(newState);
    });

    try {
      if (isAuthenticated) {
        // Authenticated user - use server action
        const result = await toggleWishlist(productId);

        if (result.success) {
          // Update confirmed by server
          setIsInWishlist(result.state === 'added');
          toast({
            title: 'Success',
            description: result.message,
          });
        } else {
          // Revert optimistic update on error
          setIsInWishlist(!newState);

          // Check if user needs to login
          if (result.message.includes('logged in')) {
            toast({
              title: 'Error',
              description: result.message,
              variant: 'destructive',
            });
            router.push('/login');
          } else {
            toast({
              title: 'Error',
              description: result.message,
              variant: 'destructive',
            });
          }
        }
      } else {
        // Guest user - use localStorage
        if (newState) {
          addToGuestWishlist(productId);
          toast({
            title: 'Success',
            description: 'Added to wishlist',
          });
        } else {
          removeFromGuestWishlist(productId);
          toast({
            title: 'Success',
            description: 'Removed from wishlist',
          });
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsInWishlist(!newState);
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        variant: 'destructive',
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-2 transition-colors hover:bg-gray-100 ${className}`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
        }`}
      />
    </button>
  );
}
