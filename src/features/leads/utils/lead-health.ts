import { Lead } from '../types';

export type LeadHealthCategory = 'HOT' | 'WARM' | 'NEEDS_ATTENTION' | 'INACTIVE';

export interface LeadHealthInfo {
  category: LeadHealthCategory;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconType: 'flame' | 'sun' | 'alert' | 'clock';
  reason: string;
}

export function computeLeadHealth(lead: Lead): LeadHealthInfo {
  const now = new Date().getTime();
  const createdTime = new Date(lead.createdAt).getTime();
  const updatedTime = new Date(lead.updatedAt).getTime();

  const daysSinceCreated = (now - createdTime) / (1000 * 60 * 60 * 24);
  const daysSinceUpdated = (now - updatedTime) / (1000 * 60 * 60 * 24);

  // Check reminders if present
  let hasOverdueReminder = false;
  let hasDueTodayReminder = false;
  let hasUpcomingReminder = false;

  if (lead.reminders && lead.reminders.length > 0) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    for (const r of lead.reminders) {
      if (r.isCompleted) continue;
      const due = new Date(r.dueDate).getTime();
      if (due < startOfToday.getTime()) {
        hasOverdueReminder = true;
      } else if (due <= endOfToday.getTime()) {
        hasDueTodayReminder = true;
      } else {
        hasUpcomingReminder = true;
      }
    }
  }

  // 1. NEEDS ATTENTION
  if (hasOverdueReminder) {
    return {
      category: 'NEEDS_ATTENTION',
      label: 'Needs Attention',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      iconType: 'alert',
      reason: 'Overdue follow-up pending action',
    };
  }

  if (!lead.ownerId && daysSinceCreated >= 2) {
    return {
      category: 'NEEDS_ATTENTION',
      label: 'Needs Attention',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-200',
      iconType: 'alert',
      reason: 'Unassigned lead for over 48 hours',
    };
  }

  // 2. HOT
  if (hasDueTodayReminder) {
    return {
      category: 'HOT',
      label: 'Hot Lead',
      badgeBg: 'bg-rose-100/70',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-300',
      iconType: 'flame',
      reason: 'Follow-up scheduled for today',
    };
  }

  if (daysSinceCreated <= 3) {
    return {
      category: 'HOT',
      label: 'Hot Lead',
      badgeBg: 'bg-teal-50',
      badgeText: 'text-teal-700',
      badgeBorder: 'border-teal-200',
      iconType: 'flame',
      reason: 'Newly created lead (last 3 days)',
    };
  }

  if (daysSinceUpdated <= 2) {
    return {
      category: 'HOT',
      label: 'Hot Lead',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      iconType: 'flame',
      reason: 'Recent activity within 48 hours',
    };
  }

  // 3. WARM
  if (hasUpcomingReminder) {
    return {
      category: 'WARM',
      label: 'Warm Lead',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-700',
      badgeBorder: 'border-sky-200',
      iconType: 'sun',
      reason: 'Upcoming follow-up scheduled',
    };
  }

  if (daysSinceUpdated <= 7) {
    return {
      category: 'WARM',
      label: 'Warm Lead',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-200',
      iconType: 'sun',
      reason: 'Active engagement in past 7 days',
    };
  }

  // 4. INACTIVE
  return {
    category: 'INACTIVE',
    label: 'Inactive',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    badgeBorder: 'border-slate-200',
    iconType: 'clock',
    reason: `No activity recorded for ${Math.max(1, Math.floor(daysSinceUpdated))} days`,
  };
}
