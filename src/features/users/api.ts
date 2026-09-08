import { apiClient } from '@/lib/api/client';
import { UserItem, CreateUserInput } from './types';

export async function fetchUsers(): Promise<UserItem[]> {
  return apiClient<UserItem[]>('/users');
}

export async function createUser(data: CreateUserInput): Promise<UserItem> {
  return apiClient<UserItem>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
