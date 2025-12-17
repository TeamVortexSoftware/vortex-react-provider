# Vortex React Provider

> ⚠️ **NOTICE**: This package is in maintenance mode. For new projects, we recommend using the simpler standalone pattern with `@teamvortexsoftware/vortex-react` directly. This provider adds unnecessary complexity for most use cases (single widget per app). See [Migration Guide](#migration-to-standalone-pattern) below.

React provider for seamless Vortex integration with Next.js SDK. This package provides React components and hooks that work in conjunction with the Vortex Next.js SDK to simplify invitation management and JWT authentication in your React applications.

**Use this package only if:**
- ✅ You have multiple Vortex widgets across your app
- ✅ You need centralized JWT management and automatic refresh
- ✅ You're already using this package and don't want to migrate

**For most users:** Use `@teamvortexsoftware/vortex-react` with manual JWT fetching instead.

## Installation

```bash
npm install @teamvortexsoftware/vortex-react-provider
# or
pnpm add @teamvortexsoftware/vortex-react-provider
# or
yarn add @teamvortexsoftware/vortex-react-provider
```

## Prerequisites

This package is designed to work with the Vortex Next.js SDK (`@teamvortexsoftware/vortex-nextjs-15-sdk`).

**⚠️ IMPORTANT**: Use the `createVortexRoutes()` helper from the Next.js SDK to ensure perfect path compatibility:

```typescript
// In your Next.js backend setup
import { createVortexRoutes } from '@teamvortexsoftware/vortex-nextjs-15-sdk';

const routes = createVortexRoutes();
// Create the exact file structure shown in the Next.js SDK README
```

This ensures the API paths match exactly what this React provider expects.

## Quick Start

### 1. Wrap your app with VortexProvider

```jsx
// app/layout.tsx or pages/_app.tsx
import { VortexProvider } from '@teamvortexsoftware/vortex-react-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <VortexProvider
          config={{
            apiBaseUrl: '/api/vortex',
            refreshJwtInterval: 30 * 60 * 1000, // 30 minutes
            onError: (error) => console.error('Vortex error:', error),
            onJwtRefresh: (jwt) => console.log('JWT refreshed'),
          }}
        >
          {children}
        </VortexProvider>
      </body>
    </html>
  );
}
```

### 2. Use hooks in your components

```jsx
// components/UserProfile.tsx
import { useVortexAuth } from '@teamvortexsoftware/vortex-react-provider';

export function UserProfile() {
  const { user, isAuthenticated, isLoading, error } = useVortexAuth();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <h2>Welcome, {user.userId}!</h2>
      <p>Email: {user.userEmail}</p>
      {user.adminScopes?.includes('autojoin') && <p>Autojoin Admin: Yes</p>}
      {/* Legacy fields still available for backward compatibility */}
      {user.groups && <p>Groups: {user.groups.map((g) => g.name).join(', ')}</p>}
    </div>
  );
}
```

```jsx
// components/InvitationManager.tsx
import { useState } from 'react';
import { useInvitations } from '@teamvortexsoftware/vortex-react-provider';

export function InvitationManager() {
  const [invitations, setInvitations] = useState([]);
  const { getInvitationsByTarget, revokeInvitation, isLoading, getError } = useInvitations();

  const loadInvitations = async () => {
    try {
      const result = await getInvitationsByTarget('email', 'user@example.com');
      setInvitations(result);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  };

  const handleRevoke = async (invitationId) => {
    try {
      await revokeInvitation(invitationId);
      // Reload invitations
      await loadInvitations();
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
    }
  };

  return (
    <div>
      <button onClick={loadInvitations} disabled={isLoading('getByTarget-email-user@example.com')}>
        Load Invitations
      </button>

      {invitations.map((invitation) => (
        <div key={invitation.id}>
          <p>{invitation.status}</p>
          <button
            onClick={() => handleRevoke(invitation.id)}
            disabled={isLoading(`revoke-${invitation.id}`)}
          >
            Revoke
          </button>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### VortexProvider

Main provider component that manages authentication state and API communication.

**Props:**

- `children: React.ReactNode` - Child components
- `config?: VortexConfig` - Optional configuration object

**Configuration Options:**

- `apiBaseUrl?: string` - Base URL for API calls (default: '/api/vortex')
- `refreshJwtInterval?: number` - JWT refresh interval in milliseconds (default: 30 minutes)
- `defaultGroups?: InvitationGroup[]` - Default groups for new users
- `onError?: (error: Error) => void` - Error callback
- `onJwtRefresh?: (jwt: string) => void` - JWT refresh callback

### Hooks

#### useVortex()

Main hook providing access to all functionality.

**Returns:** Full VortexContextValue

#### useVortexAuth()

Hook focused on authentication state.

**Returns:**

- `jwt: string | null` - Current JWT token
- `user: AuthenticatedUser | null` - Current user data
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state
- `error: Error | null` - Current error
- `refreshJwt: () => Promise<void>` - Refresh JWT manually
- `clearAuth: () => void` - Clear authentication data

#### useVortexJWT()

Hook for JWT-specific utilities.

**Returns:**

- All authentication state from useVortexAuth
- `isExpiringSoon: (bufferMinutes?: number) => boolean` - Check if JWT is expiring
- `refreshIfNeeded: (bufferMinutes?: number) => Promise<void>` - Refresh if expiring soon

#### useInvitations()

Hook for invitation management with built-in loading states.

**Returns:**

- `loading: Record<string, boolean>` - Loading states by operation
- `errors: Record<string, Error | null>` - Error states by operation
- `isAuthenticated: boolean` - Authentication status
- `getInvitationsByTarget: (targetType, targetValue) => Promise<InvitationResult[]>`
- `getInvitation: (invitationId) => Promise<InvitationResult>`
- `revokeInvitation: (invitationId) => Promise<void>`
- `acceptInvitations: (invitationIds, target) => Promise<InvitationResult>`
- `getInvitationsByGroup: (groupType, groupId) => Promise<InvitationResult[]>`
- `deleteInvitationsByGroup: (groupType, groupId) => Promise<void>`
- `reinvite: (invitationId) => Promise<InvitationResult>`
- `isLoading: (key) => boolean` - Check loading state for specific operation
- `getError: (key) => Error | null` - Get error for specific operation
- `clearError: (key) => void` - Clear error for specific operation

## Types

The package exports all necessary TypeScript types:

```typescript
import type {
  VortexConfig,
  VortexContextValue,
  VortexProviderProps,
  AuthenticatedUser,
  InvitationTarget,
  InvitationResult,
  InvitationGroup,
  ApiResponse,
} from '@teamvortexsoftware/vortex-react-provider';
```

### AuthenticatedUser Type

The `AuthenticatedUser` type supports both the new simplified JWT format and the legacy format for backward compatibility:

**New Format (Recommended):**

```typescript
interface AuthenticatedUser {
  userId: string;
  userEmail?: string; // User's email address
  adminScopes?: string[]; // Admin scopes (e.g., ['autojoin'])
  // Legacy fields (optional for backward compatibility)
  identifiers?: { type: 'email' | 'sms'; value: string }[];
  groups?: { type: string; id?: string; groupId?: string; name: string }[];
  role?: string;
}
```

The new format is simpler and more straightforward. When your backend SDK generates JWTs with `userEmail` and `adminScopes`, the React provider will automatically extract these fields and make them available through the hooks.

**Legacy Format Support:**

For backward compatibility, the provider still supports JWTs with the legacy format containing `identifiers`, `groups`, and `role` fields. These will be automatically extracted and available on the user object.

## Integration with Vortex Invite Component

This provider works seamlessly with the existing VortexInvite component:

```jsx
// components/InvitePage.tsx
import { VortexInvite } from '@teamvortexsoftware/vortex-react';
import { useVortexAuth } from '@teamvortexsoftware/vortex-react-provider';

export function InvitePage() {
  const { isAuthenticated, user } = useVortexAuth();

  return (
    <div>
      {isAuthenticated ? (
        <VortexInvite
        // The VortexInvite component can now access authentication
        // state from the provider context automatically
        />
      ) : (
        <div>Please authenticate to send invitations</div>
      )}
    </div>
  );
}
```

## Error Handling

The provider includes comprehensive error handling:

```jsx
import { useVortex } from '@teamvortexsoftware/vortex-react-provider';

function MyComponent() {
  const { error } = useVortex();

  if (error) {
    return <div>Application Error: {error.message}</div>;
  }

  // Component logic
}
```

For invitation-specific errors:

```jsx
import { useInvitations } from '@teamvortexsoftware/vortex-react-provider';

function InvitationComponent() {
  const { getError, clearError } = useInvitations();

  const invitationError = getError('revoke-invitation-123');

  return (
    <div>
      {invitationError && (
        <div className="error">
          {invitationError.message}
          <button onClick={() => clearError('revoke-invitation-123')}>Clear Error</button>
        </div>
      )}
    </div>
  );
}
```

## Security Considerations

- JWT tokens are automatically managed and refreshed
- All API calls go through the configured backend routes
- Access control is handled by your Next.js SDK configuration
- Tokens are not persisted between browser sessions for security

## Development

This package follows the security principles established by the Vortex Next.js SDK:

1. **Server-side authentication**: JWT generation happens server-side only
2. **Access control**: All invitation operations respect your configured access control hooks
3. **Input sanitization**: All API calls are properly sanitized
4. **Error boundaries**: Errors are contained and don't leak sensitive information

## Migration to Standalone Pattern

**Recommended for new projects and most existing projects.**

### Before (with Provider):

```tsx
// app/layout.tsx
import { VortexProvider } from '@teamvortexsoftware/vortex-react-provider';

export default function RootLayout({ children }) {
  return (
    <VortexProvider config={{ apiBaseUrl: '/api/vortex' }}>
      {children}
    </VortexProvider>
  );
}

// components/TeamInvite.tsx
import { VortexInvite } from '@teamvortexsoftware/vortex-react';
import { useVortexJWT } from '@teamvortexsoftware/vortex-react-provider';

export function TeamInvite({ teamId }) {
  const { jwt, isLoading } = useVortexJWT();

  return (
    <VortexInvite
      componentId="team-widget"
      jwt={jwt || ''}
      isLoading={isLoading}
      scope={teamId}
      scopeType="team"
    />
  );
}
```

### After (standalone - simpler):

```tsx
// No provider needed in layout!

// components/TeamInvite.tsx
import { VortexInvite } from '@teamvortexsoftware/vortex-react';
import { useState, useEffect } from 'react';

export function TeamInvite({ teamId }) {
  const [jwt, setJwt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vortex/jwt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        setJwt(data.jwt);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch JWT:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <VortexInvite
      componentId="team-widget"
      jwt={jwt}
      isLoading={isLoading}
      scope={teamId}
      scopeType="team"
    />
  );
}
```

### Migration Steps:

1. **Remove provider dependency:**
   ```bash
   npm uninstall @teamvortexsoftware/vortex-react-provider
   ```

2. **Remove provider wrapper** from your layout/app file

3. **Replace `useVortexJWT()` hook** with simple `useState` + `useEffect` pattern shown above

4. **Test your widget** - it should work exactly the same

### Benefits of Standalone Pattern:

- ✅ **Simpler** - No provider, no context, just props
- ✅ **Fewer dependencies** - One less package
- ✅ **More explicit** - Clear data flow
- ✅ **Easier to debug** - No magic behind the scenes
- ✅ **Less cognitive load** - Standard React patterns

### When to Keep Provider:

Only keep the provider if you have **multiple widgets** that need to share JWT state across different parts of your app. For 90% of users with a single widget, the standalone pattern is better.

## Next Steps

1. Set up the Vortex Next.js SDK backend routes
2. Configure authentication and access control hooks
3. ~~Wrap your app with VortexProvider~~ Use standalone pattern instead
4. Implement JWT fetching in your component
5. Handle errors appropriately for your UX
