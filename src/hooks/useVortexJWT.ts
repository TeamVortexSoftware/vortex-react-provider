"use client";

import { useCallback } from 'react';
import { useVortexContext } from '../VortexContext';

/**
 * Hook specifically for JWT management
 * Useful when you only need JWT functionality
 */
export function useVortexJWT() {
  const context = useVortexContext();

  const isExpiringSoon = useCallback((bufferMinutes: number = 5): boolean => {
    if (!context.jwt) return true;

    try {
      // Decode JWT payload to check expiration
      const payload = JSON.parse(atob(context.jwt.split('.')[1]));
      const exp = payload.exp || payload.expires;

      if (!exp) return false;

      const expirationTime = typeof exp === 'number' ? exp * 1000 : new Date(exp).getTime();
      const bufferTime = bufferMinutes * 60 * 1000;

      return Date.now() + bufferTime >= expirationTime;
    } catch {
      return true; // If we can't decode, assume it's expiring
    }
  }, [context.jwt]);

  const refreshIfNeeded = useCallback(async (bufferMinutes: number = 5) => {
    if (isExpiringSoon(bufferMinutes)) {
      await context.refreshJwt();
    }
  }, [context, isExpiringSoon]);

  return {
    // JWT state
    jwt: context.jwt,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    error: context.error,

    // JWT utilities
    isExpiringSoon,
    refreshIfNeeded,

    // JWT management
    refreshJwt: context.refreshJwt,
    clearAuth: context.clearAuth,
  };
}