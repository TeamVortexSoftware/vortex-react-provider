"use client";

import { useVortexContext } from './VortexContext';

/**
 * Main hook to access all Vortex functionality
 * Provides authentication state, JWT management, and invitation operations
 */
export function useVortex() {
  return useVortexContext();
}