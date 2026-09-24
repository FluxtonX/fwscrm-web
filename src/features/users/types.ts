export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'OPERATOR'
  | 'AGENT'
  | 'VIEWER';

export type AccessType = 'PERMANENT' | 'TEMPORARY';

export interface UserItem {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  accessType?: AccessType | null;
  allowedIp?: string | null;
  accessExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    ownedLeads?: number;
  };
}

export interface CreateMemberInput {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'MANAGER' | 'OPERATOR';
  firstName?: string;
  lastName?: string;
  accessType?: AccessType;
  allowedIp?: string;
  accessExpiresAt?: string;
}
