"use client";

import { createContext, useContext } from 'react';
import type { VortexContextValue } from './types';

export const VortexContext = createContext<VortexContextValue | null>(null);

export const useVortexContext = () => {
  const context = useContext(VortexContext);
  if (!context) {
    throw new Error('useVortexContext must be used within a VortexProvider');
  }
  return context;
};