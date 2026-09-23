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


