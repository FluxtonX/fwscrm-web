export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'OPERATOR'
  | 'AGENT'
  | 'VIEWER';

export type InvitationStatus = 'INVITED' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface UserItem {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationItem {
  id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  organizationName?: string;
  invitedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface InviteUserInput {
  email: string;
  role: UserRole;
}

export interface InviteUserResponse {
  invitation: InvitationItem;
  activationUrl: string;
  emailDelivery?: {
    success: boolean;
    provider: string;
    messageId?: string;
  };
}
