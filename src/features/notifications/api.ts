import { apiClient } from '@/lib/api/client';
import {
  Notification,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
} from './types';

export async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<PaginatedNotificationsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');

  const query = searchParams.toString();
  const endpoint = `/notifications${query ? `?${query}` : ''}`;
  return apiClient<PaginatedNotificationsResponse>(endpoint);
}

export async function fetchUnreadNotificationCount(): Promise<UnreadCountResponse> {
  return apiClient<UnreadCountResponse>('/notifications/unread-count');
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  return apiClient<Notification>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsAsRead(): Promise<{ updatedCount: number }> {
  return apiClient<{ updatedCount: number }>('/notifications/read-all', {
    method: 'PATCH',
  });
}
