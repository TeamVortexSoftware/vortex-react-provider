"use client";

import { useVortexContext } from '../VortexContext';

/**
 * Main hook that provides access to the full Vortex context
 * Use this when you need access to all functionality
 */
export function useVortex() {
  return useVortexContext();
}