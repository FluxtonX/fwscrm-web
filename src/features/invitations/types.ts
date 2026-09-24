import { UserRole, AccessType } from '../users/types';

export type InvitationStatus = 'INVITED' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface InvitationItem {
  id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  accessType?: AccessType | null;
  allowedIp?: string | null;
  accessExpiresAt?: string | null;
  expiresAt: string;
  createdAt: string;
  invitedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateInvitationInput {
  email: string;
  role: 'MANAGER' | 'OPERATOR';
  accessType?: AccessType;
  allowedIp?: string;
  accessExpiresAt?: string;
}

export interface CreateInvitationResponse {
  invitation: InvitationItem;
  rawToken: string;
  activationUrl: string;
  emailDelivery: {
    success: boolean;
    provider: string;
    messageId?: string;
    error?: string;
  };
}

export interface ValidateInvitationResponse {
  valid: boolean;
  email: string;
  organizationName: string;
  role: UserRole;
  inviterName: string;
  expiresAt: string;
}

export interface AcceptInvitationInput {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}
