export type NotificationType = 'FOLLOW_UP_DUE' | 'FOLLOW_UP_ASSIGNED' | 'SYSTEM';

export interface Notification {
  id: string;
  organizationId: string;
  recipientUserId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedLeadId?: string | null;
  relatedFollowUpId?: string | null;
  dueOccurrence?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface PaginatedNotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}
