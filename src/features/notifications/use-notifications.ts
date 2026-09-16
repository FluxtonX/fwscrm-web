'use client';

import * as React from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth/auth-context';
import { Notification } from './types';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './api';

function getWsUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const cleanUrl = rawUrl.replace(/\/+$/, '');
  // Extract origin (e.g. http://localhost:4000)
  const origin = cleanUrl.replace(/\/api$/, '');
  return `${origin}/notifications`;
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const socketRef = React.useRef<Socket | null>(null);

  // Sync state from server REST API
  const syncNotifications = React.useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const [listRes, countRes] = await Promise.all([
        fetchNotifications({ page: 1, limit: 20 }),
        fetchUnreadNotificationCount(),
      ]);
      setNotifications(listRes.data);
      setUnreadCount(countRes.unreadCount);
    } catch (err) {
      console.warn('Failed to sync notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Handle Socket.IO connection & events
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    // Initial fetch from REST API
    syncNotifications();

    const wsUrl = getWsUrl();
    const socket = io(wsUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Real-time notifications socket connected');
      syncNotifications();
    });

    socket.on('notification:new', (newNotif: Notification) => {
      setNotifications((prev) => {
        // Idempotent deduplication by notification ID
        if (prev.some((n) => n.id === newNotif.id)) {
          return prev;
        }
        return [newNotif, ...prev];
      });
      if (!newNotif.isRead) {
        setUnreadCount((c) => c + 1);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Notifications socket disconnected:', reason);
    });

    return () => {
      socket.off('connect');
      socket.off('notification:new');
      socket.off('disconnect');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user, syncNotifications]);

  const markRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Rollback on error
      syncNotifications();
    }
  };

  const markAllRead = async () => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      // Rollback on error
      syncNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markRead,
    markAllAsRead: markAllRead,
    refresh: syncNotifications,
  };
}
