import { apiClient } from '@/lib/api/client';
import {
  UserItem,
  UserRole,
  InvitationItem,
  InviteUserInput,
  InviteUserResponse,
} from './types';

export async function fetchUsers(): Promise<UserItem[]> {
  return apiClient<UserItem[]>('/users');
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<UserItem> {
  return apiClient<UserItem>(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function updateUserStatus(
  userId: string,
  isActive: boolean,
): Promise<UserItem> {
  return apiClient<UserItem>(`/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}

export async function fetchInvitations(): Promise<InvitationItem[]> {
  return apiClient<InvitationItem[]>('/invitations');
}

export async function inviteUser(
  input: InviteUserInput,
): Promise<InviteUserResponse> {
  return apiClient<InviteUserResponse>('/invitations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function resendInvitation(
  invitationId: string,
): Promise<InviteUserResponse> {
  return apiClient<InviteUserResponse>(`/invitations/${invitationId}/resend`, {
    method: 'POST',
  });
}

export async function revokeInvitation(
  invitationId: string,
): Promise<InvitationItem> {
  return apiClient<InvitationItem>(`/invitations/${invitationId}/revoke`, {
    method: 'POST',
  });
}
