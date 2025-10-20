"use client";

/**
 * Validates that the apiBaseUrl is correctly configured for the expected Next.js route structure
 * This helps developers ensure their backend routes match the provider expectations
 */
export function validateVortexApiConfiguration(apiBaseUrl: string): void {
  const expectedPaths = [
    '/jwt',
    '/invitations',
    '/invitations/accept',
  ];

  // In development mode, we can provide helpful warnings
  if (process.env.NODE_ENV === 'development') {
    console.info('🔍 Vortex React Provider expects these API endpoints:');
    expectedPaths.forEach(path => {
      console.info(`  ${apiBaseUrl}${path}`);
    });
    console.info('📖 See the Next.js SDK README for exact file structure requirements.');
  }
}

/**
 * Helper to check if an error indicates a missing route
 */
export function isMissingRouteError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('404') ||
           message.includes('not found') ||
           message.includes('cannot find');
  }
  return false;
}