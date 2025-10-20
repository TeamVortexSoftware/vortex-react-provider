export interface AuthenticatedUser {
  userId: string;
  identifiers: { type: 'email' | 'sms'; value: string }[];
  groups: { type: string; id: string; name: string }[];
  role?: string;
}

export interface InvitationTarget {
  type: 'email' | 'username' | 'phoneNumber';
  value: string;
}

export interface InvitationGroup {
  id: string;
  type: string;
  name: string;
}

export interface InvitationResult {
  id: string;
  accountId: string;
  clickThroughs: number;
  configurationAttributes: Record<string, unknown> | null;
  attributes: Record<string, unknown> | null;
  createdAt: string;
  deactivated: boolean;
  deliveryCount: number;
  deliveryTypes: ('email' | 'sms' | 'share')[];
  foreignCreatorId: string;
  invitationType: 'single_use' | 'multi_use';
  modifiedAt: string | null;
  status: 'queued' | 'sending' | 'delivered' | 'accepted' | 'shared' | 'unfurled' | 'accepted_elsewhere';
  target: InvitationTarget[];
  views: number;
  widgetConfigurationId: string;
  projectId: string;
  groups: InvitationGroup[];
  accepts: unknown[];
}

export interface VortexConfig {
  apiBaseUrl?: string;
  refreshJwtInterval?: number;
  defaultGroups?: InvitationGroup[];
  onError?: (error: Error) => void;
  onJwtRefresh?: (jwt: string) => void;
}

export interface JwtContext {
  widgetId?: string;
  groupId?: string;
  groupType?: string;
}

export interface VortexContextValue {
  // Configuration
  config: VortexConfig;

  // Authentication state
  jwt: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;

  // JWT management
  refreshJwt: (context?: JwtContext) => Promise<void>;
  clearAuth: () => void;

  // Invitation management
  getInvitationsByTarget: (targetType: InvitationTarget['type'], targetValue: string) => Promise<InvitationResult[]>;
  getInvitation: (invitationId: string) => Promise<InvitationResult>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  acceptInvitations: (invitationIds: string[], target: InvitationTarget) => Promise<InvitationResult>;
  getInvitationsByGroup: (groupType: string, groupId: string) => Promise<InvitationResult[]>;
  deleteInvitationsByGroup: (groupType: string, groupId: string) => Promise<void>;
  reinvite: (invitationId: string) => Promise<InvitationResult>;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

export interface VortexProviderProps {
  children: React.ReactNode;
  config?: VortexConfig;
}