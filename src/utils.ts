"use client";

/**
 * Validates that the apiBaseUrl is correctly configured for the expected route structure
 * This helps developers ensure their backend routes match the provider expectations
 */
export function validateVortexApiConfiguration(apiBaseUrl: string, backendApiUrl?: string): void {
  const jwtEndpoints = ['/jwt'];
  const invitationEndpoints = [
    '/invitations',
    '/invitations/accept',
  ];

  // In development mode, we can provide helpful warnings
  if (process.env.NODE_ENV === 'development') {
    console.info('🔍 Vortex React Provider expects these API endpoints:');

    if (backendApiUrl) {
      console.info('\n  JWT endpoints (using backendApiUrl):');
      jwtEndpoints.forEach(path => {
        console.info(`    ${backendApiUrl}${path}`);
      });
      console.info('\n  Invitation endpoints (using apiBaseUrl):');
      invitationEndpoints.forEach(path => {
        console.info(`    ${apiBaseUrl}${path}`);
      });
    } else {
      console.info('  All endpoints (using apiBaseUrl):');
      [...jwtEndpoints, ...invitationEndpoints].forEach(path => {
        console.info(`    ${apiBaseUrl}${path}`);
      });
    }

    console.info('\n📖 See the Vortex SDK documentation for exact API requirements.');
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