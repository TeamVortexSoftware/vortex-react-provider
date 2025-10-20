"use client";

import { useVortexContext } from '../VortexContext';

/**
 * Hook focused on authentication state and JWT management
 */
export function useVortexAuth() {
  const context = useVortexContext();

  return {
    // Authentication state
    jwt: context.jwt,
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    error: context.error,

    // JWT management
    refreshJwt: context.refreshJwt,
    clearAuth: context.clearAuth,
  };
}