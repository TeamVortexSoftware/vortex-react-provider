"use client";

import React, { useCallback, useEffect, useReducer, useRef, useMemo } from 'react';
import { VortexContext } from './VortexContext';
import { validateVortexApiConfiguration } from './utils';
import type {
  VortexProviderProps,
  VortexContextValue,
  VortexConfig,
  AuthenticatedUser,
  InvitationTarget,
  InvitationResult,
  ApiResponse,
} from './types';

// State management for the provider
interface VortexState {
  jwt: string | null;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: Error | null;
}

type VortexAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_JWT'; payload: { jwt: string; user: AuthenticatedUser | null } }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'CLEAR_AUTH' };

const initialState: VortexState = {
  jwt: null,
  user: null,
  isLoading: false,
  error: null,
};

function vortexReducer(state: VortexState, action: VortexAction): VortexState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_JWT':
      return {
        ...state,
        jwt: action.payload.jwt,
        user: action.payload.user,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_AUTH':
      return { ...state, jwt: null, user: null, error: null };
    default:
      return state;
  }
}

export function VortexProvider({ children, config = {} }: VortexProviderProps) {
  const [state, dispatch] = useReducer(vortexReducer, initialState);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Default configuration
  const defaultConfig: VortexConfig = useMemo(() => {
    const finalConfig = {
      apiBaseUrl: '/api/vortex',
      refreshJwtInterval: 30 * 60 * 1000, // 30 minutes
      ...config,
    };

    // Validate API configuration in development
    validateVortexApiConfiguration(finalConfig.apiBaseUrl!);

    return finalConfig;
  }, [config]);

  // Helper function to make API calls
  const apiCall = useCallback(async <T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    try {
      const url = `${defaultConfig.apiBaseUrl}${endpoint}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data.data !== undefined ? data.data : (data as unknown as T);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      defaultConfig.onError?.(err);
      throw err;
    }
  }, [defaultConfig]);

  // JWT management functions
  const refreshJwt = useCallback(async (context?: {
    widgetId?: string;
    groupId?: string;
    groupType?: string;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await apiCall<{ jwt: string }>('/jwt', {
        method: 'POST',
        body: context ? JSON.stringify({ context }) : undefined,
      });

      // Decode JWT to extract user info (basic extraction - in production you might want a proper JWT library)
      let user: AuthenticatedUser | null = null;
      try {
        const payload = JSON.parse(atob(response.jwt.split('.')[1]));
        user = {
          userId: payload.userId,
          identifiers: payload.identifiers || [],
          groups: payload.groups || defaultConfig.defaultGroups || [],
          role: payload.role,
        };
      } catch (decodeError) {
        console.warn('Could not decode JWT payload:', decodeError);
      }

      dispatch({ type: 'SET_JWT', payload: { jwt: response.jwt, user } });
      defaultConfig.onJwtRefresh?.(response.jwt);

      // Schedule next refresh (without context for auto-refresh)
      if (defaultConfig.refreshJwtInterval && refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      if (defaultConfig.refreshJwtInterval) {
        refreshTimerRef.current = setTimeout(() => refreshJwt(), defaultConfig.refreshJwtInterval);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to refresh JWT');
      dispatch({ type: 'SET_ERROR', payload: err });
    }
  }, [apiCall, defaultConfig]);

  const clearAuth = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    dispatch({ type: 'CLEAR_AUTH' });
  }, []);

  // Invitation management functions
  const getInvitationsByTarget = useCallback(async (
    targetType: InvitationTarget['type'],
    targetValue: string
  ): Promise<InvitationResult[]> => {
    const response = await apiCall<{ invitations: InvitationResult[] }>(
      `/invitations?targetType=${encodeURIComponent(targetType)}&targetValue=${encodeURIComponent(targetValue)}`
    );
    return response.invitations;
  }, [apiCall]);

  const getInvitation = useCallback(async (invitationId: string): Promise<InvitationResult> => {
    return apiCall<InvitationResult>(`/invitations/${encodeURIComponent(invitationId)}`);
  }, [apiCall]);

  const revokeInvitation = useCallback(async (invitationId: string): Promise<void> => {
    await apiCall(`/invitations/${encodeURIComponent(invitationId)}`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  const acceptInvitations = useCallback(async (
    invitationIds: string[],
    target: InvitationTarget
  ): Promise<InvitationResult> => {
    return apiCall<InvitationResult>('/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({ invitationIds, target }),
    });
  }, [apiCall]);

  const getInvitationsByGroup = useCallback(async (
    groupType: string,
    groupId: string
  ): Promise<InvitationResult[]> => {
    const response = await apiCall<{ invitations: InvitationResult[] }>(
      `/invitations/by-group/${encodeURIComponent(groupType)}/${encodeURIComponent(groupId)}`
    );
    return response.invitations;
  }, [apiCall]);

  const deleteInvitationsByGroup = useCallback(async (
    groupType: string,
    groupId: string
  ): Promise<void> => {
    await apiCall(`/invitations/by-group/${encodeURIComponent(groupType)}/${encodeURIComponent(groupId)}`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  const reinvite = useCallback(async (invitationId: string): Promise<InvitationResult> => {
    return apiCall<InvitationResult>(`/invitations/${encodeURIComponent(invitationId)}/reinvite`, {
      method: 'POST',
    });
  }, [apiCall]);

  // Cleanup on unmount (no longer fetching JWT on mount - lazy loading)
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const contextValue: VortexContextValue = {
    // Configuration
    config: defaultConfig,

    // Authentication state
    jwt: state.jwt,
    user: state.user,
    isAuthenticated: !!state.jwt,
    isLoading: state.isLoading,
    error: state.error,

    // JWT management
    refreshJwt,
    clearAuth,

    // Invitation management
    getInvitationsByTarget,
    getInvitation,
    revokeInvitation,
    acceptInvitations,
    getInvitationsByGroup,
    deleteInvitationsByGroup,
    reinvite,
  };

  return (
    <VortexContext.Provider value={contextValue}>
      {children}
    </VortexContext.Provider>
  );
}