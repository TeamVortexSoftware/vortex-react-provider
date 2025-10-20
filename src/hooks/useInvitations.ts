"use client";

import { useState, useCallback } from 'react';
import { useVortexContext } from '../VortexContext';
import type { InvitationTarget } from '../types';

/**
 * Hook for managing invitations with built-in state management
 */
export function useInvitations() {
  const context = useVortexContext();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error | null>>({});

  const setLoadingState = (key: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  };

  const setErrorState = (key: string, error: Error | null) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  };

  const getInvitationsByTarget = useCallback(async (
    targetType: InvitationTarget['type'],
    targetValue: string
  ) => {
    const key = `getByTarget-${targetType}-${targetValue}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      const result = await context.getInvitationsByTarget(targetType, targetValue);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get invitations');
      setErrorState(key, err);
      throw err;
    } finally {
      setLoadingState(key, false);
    }
  }, [context]);

  const getInvitation = useCallback(async (invitationId: string) => {
    const key = `get-${invitationId}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      const result = await context.getInvitation(invitationId);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get invitation');
      setErrorState(key, err);
      throw err;
    } finally {
      setLoadingState(key, false);
    }
  }, [context]);

  const revokeInvitation = useCallback(async (invitationId: string) => {
    const key = `revoke-${invitationId}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      await context.revokeInvitation(invitationId);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to revoke invitation');
      setErrorState(key, err);
      throw err;
    } finally {
      setLoadingState(key, false);
    }
  }, [context]);

  const acceptInvitations = useCallback(async (
    invitationIds: string[],
    target: InvitationTarget
  ) => {
    const key = `accept-${invitationIds.join(',')}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      const result = await context.acceptInvitations(invitationIds, target);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to accept invitations');
      setErrorState(key, err);
      throw err;
    } finally {
      setLoadingState(key, false);
    }
  }, [context]);

  const getInvitationsByGroup = useCallback(async (groupType: string, groupId: string) => {
    const key = `getByGroup-${groupType}-${groupId}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      const result = await context.getInvitationsByGroup(groupType, groupId);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get group invitations');
      setErrorState(key, err);
      throw err;
    } finally {
      setLoadingState(key, false);
    }
  }, [context]);

  const deleteInvitationsByGroup = useCallback(async (groupType: string, groupId: string) => {
    const key = `deleteByGroup-${groupType}-${groupId}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      await context.deleteInvitationsByGroup(groupType, groupId);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delete group invitations');
      setErrorState(key, err);
      throw err;
    } finally {
      setLoadingState(key, false);
    }
  }, [context]);

  const reinvite = useCallback(async (invitationId: string) => {
    const key = `reinvite-${invitationId}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      const result = await context.reinvite(invitationId);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to reinvite');
      setErrorState(key, err);
      throw err;
    } finally {
      setLoadingState(key, false);
    }
  }, [context]);

  return {
    // State
    loading,
    errors,
    isAuthenticated: context.isAuthenticated,

    // Actions
    getInvitationsByTarget,
    getInvitation,
    revokeInvitation,
    acceptInvitations,
    getInvitationsByGroup,
    deleteInvitationsByGroup,
    reinvite,

    // Utilities
    isLoading: (key: string) => loading[key] || false,
    getError: (key: string) => errors[key] || null,
    clearError: (key: string) => setErrorState(key, null),
  };
}