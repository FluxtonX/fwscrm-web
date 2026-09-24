import { apiClient } from '@/lib/api/client';
import { UserItem, UserRole, CreateMemberInput } from './types';

export async function fetchUsers(): Promise<UserItem[]> {
  return apiClient<UserItem[]>('/users');
}

export async function createMember(
  input: CreateMemberInput,
): Promise<UserItem> {
  return apiClient<UserItem>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
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

export async function deleteUser(
  userId: string,
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>(`/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function updateUserIp(
  userId: string,
  input: {
    allowedIp?: string | null;
    accessType?: 'PERMANENT' | 'TEMPORARY' | null;
    accessExpiresAt?: string | null;
  },
): Promise<UserItem> {
  return apiClient<UserItem>(`/users/${userId}/ip`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function adminResetPassword(
  userId: string,
  password: string,
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>(`/users/${userId}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  });
}


