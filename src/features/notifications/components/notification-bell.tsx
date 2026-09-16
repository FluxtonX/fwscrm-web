'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { useNotifications } from '../use-notifications';
import { Notification } from '../types';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);

    if (notification.type === 'FOLLOW_UP_ASSIGNED') {
      const targetUrl = notification.relatedLeadId
        ? `/dashboard/leads?preset=upcoming&leadId=${notification.relatedLeadId}`
        : '/dashboard/leads?preset=upcoming';
      router.push(targetUrl);
    } else if (notification.type === 'FOLLOW_UP_DUE') {
      const targetUrl = notification.relatedLeadId
        ? `/dashboard/leads?preset=follow_up_today&leadId=${notification.relatedLeadId}`
        : '/dashboard/leads?preset=follow_up_today';
      router.push(targetUrl);
    } else if (notification.relatedLeadId) {
      router.push(`/dashboard/leads?leadId=${notification.relatedLeadId}`);
    } else {
      router.push('/dashboard/leads');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center justify-center h-8 w-8 rounded-md text-slate-300 hover:bg-[#0D2D32] hover:text-[#22D3DA] transition-colors focus:outline-none"
        title="Follow-Up Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#16C1C8] px-1 text-[10px] font-bold text-[#071A1D] shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-[#071A1D] border border-[#0D2D32] shadow-2xl z-50 overflow-hidden text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#0D2D32] bg-[#0A2428]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#16C1C8]" />
              <span className="font-semibold text-sm tracking-tight text-white">
                Follow-Up Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#16C1C8]/10 text-[#16C1C8] border border-[#16C1C8]/20 px-2 py-0.5 text-[10px] font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-[11px] text-[#16C1C8] hover:text-[#22D3DA] transition-colors font-medium"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#0D2D32]/60 scrollbar-thin scrollbar-thumb-[#0D2D32]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                <Clock className="h-8 w-8 text-slate-500/50" />
                <p className="text-xs">No follow-up notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex gap-3 p-3 text-xs cursor-pointer transition-colors ${
                    notif.isRead
                      ? 'bg-[#071A1D] text-slate-400 hover:bg-[#0A2428]/60'
                      : 'bg-[#0A2428] text-slate-100 hover:bg-[#0D2D32]/80'
                  }`}
                >
                  {/* Unread Cyan Dot */}
                  <div className="flex flex-col items-center pt-1">
                    {!notif.isRead ? (
                      <span className="h-2 w-2 rounded-full bg-[#16C1C8] shadow-[0_0_8px_#16C1C8]" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-white tracking-tight">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-slate-300 line-clamp-2 text-[11px]">
                      {notif.message}
                    </p>

                    {notif.relatedLeadId && (
                      <div className="flex items-center gap-1 text-[10px] text-[#16C1C8] font-medium pt-0.5">
                        <span>View Lead details</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
