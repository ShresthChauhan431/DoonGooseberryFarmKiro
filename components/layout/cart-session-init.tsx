'use client';

import { useEffect } from 'react';

/**
 * Initialize cart session ID on client side
 * Ensures session ID exists before any cart operations
 */
export function CartSessionInit() {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Migrate old sessionId to cart_session_id if exists
    const oldSessionId = localStorage.getItem('sessionId');
    if (oldSessionId && !localStorage.getItem('cart_session_id')) {
      console.log('[CartSessionInit] Migrating old session ID:', oldSessionId);
      localStorage.setItem('cart_session_id', oldSessionId);
      localStorage.removeItem('sessionId');
    }

    // Check if session ID already exists in cookie
    const cookieMatch = document.cookie.match(/cart_session_id=([^;]+)/);
    if (cookieMatch) {
      console.log('[CartSessionInit] Session ID already exists:', cookieMatch[1]);
      // Ensure localStorage is in sync
      localStorage.setItem('cart_session_id', cookieMatch[1]);
      return;
    }

    // Check localStorage
    let sessionId = localStorage.getItem('cart_session_id');

    if (!sessionId) {
      // Create new session ID
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('[CartSessionInit] Created new session ID:', sessionId);
      localStorage.setItem('cart_session_id', sessionId);
    } else {
      console.log('[CartSessionInit] Found session ID in localStorage:', sessionId);
    }

    // Set cookie for server-side rendering
    document.cookie = `cart_session_id=${sessionId}; path=/; max-age=2592000`; // 30 days
    console.log('[CartSessionInit] Set session ID cookie');
  }, []);

  return null;
}
