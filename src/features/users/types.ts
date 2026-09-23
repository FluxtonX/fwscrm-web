export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'OPERATOR'
  | 'AGENT'
  | 'VIEWER';

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

export interface CreateMemberInput {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'MANAGER' | 'OPERATOR';
  firstName?: string;
  lastName?: string;
}


