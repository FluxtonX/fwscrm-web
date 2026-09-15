'use client';

import * as React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead, LeadNote, LeadActivity, LeadReminder, LeadStatus } from '../types';
import { LeadHealthBadge } from './lead-health-badge';
import {
  Mail,
  Phone,
  Globe,
  Tag,
  Calendar,
  UserCheck,
  MessageSquare,
  Clock,
  PlusCircle,
  TrendingUp,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Send,
  Loader2,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  Bell,
  BellPlus,
  CheckCircle2,
  Circle,
  History,
} from 'lucide-react';
import {
  fetchLeadNotes,
  fetchLeadActivities,
  createLeadNote,
  updateLeadNote,
  deleteLeadNote,
  fetchLeadStatuses,
  updateLead,
  fetchLeadReminders,
  createLeadReminder,
  updateLeadReminder,
  deleteLeadReminder,
  fetchUsers,
  UserItem,
} from '../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-context';

interface LeadDetailModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (lead: Lead) => void;
}

export function LeadDetailModal({
  lead,
  open,
  onOpenChange,
  onEdit,
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    'overview' | 'notes' | 'status-history' | 'reminders' | 'timeline'
  >('overview');

  // Status changer state
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(false);

  // Notes state
  const [newNoteContent, setNewNoteContent] = React.useState('');
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [editingContent, setEditingContent] = React.useState('');
  const [deletingNoteId, setDeletingNoteId] = React.useState<string | null>(null);

  // Reminders state
  const [reminderTitle, setReminderTitle] = React.useState('');
  const [reminderDueDate, setReminderDueDate] = React.useState('');
  const [reminderAssignedUserId, setReminderAssignedUserId] = React.useState('');
  const [reschedulingId, setReschedulingId] = React.useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = React.useState('');
  const [activityFilter, setActivityFilter] = React.useState<'all' | 'status' | 'followup' | 'note' | 'assignment'>('all');

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Role permissions: Only Super Admin, Admin, and Manager may Edit or Delete notes.
  // Operator can View and Add notes, but MUST NOT edit or delete notes.
  const canEditOrDeleteNotes =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER';

  // Fetch reference statuses
  const { data: statuses = [] } = useQuery<LeadStatus[]>({
    queryKey: ['lead-statuses'],
    queryFn: fetchLeadStatuses,
    enabled: open,
  });

  // Fetch Notes
  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<LeadNote[]>({
    queryKey: ['lead-notes', lead?.id],
    queryFn: () => (lead ? fetchLeadNotes(lead.id) : Promise.resolve([])),
    enabled: open && !!lead,
  });

  // Fetch Activities
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery<LeadActivity[]>({
    queryKey: ['lead-activities', lead?.id],
    queryFn: () => (lead ? fetchLeadActivities(lead.id) : Promise.resolve([])),
    enabled: open && !!lead,
  });

  // Fetch Reminders
  const { data: reminders = [], isLoading: isLoadingReminders } = useQuery<LeadReminder[]>({
    queryKey: ['lead-reminders', lead?.id],
    queryFn: () => (lead ? fetchLeadReminders(lead.id) : Promise.resolve([])),
    enabled: open && !!lead,
  });

  // Fetch Team Users for Assignment
  const { data: teamUsers = [] } = useQuery<UserItem[]>({
    queryKey: ['team-users'],
    queryFn: fetchUsers,
    enabled: open,
  });

  // Next scheduled follow-up
  const nextFollowUp = React.useMemo(() => {
    return (reminders || [])
      .filter((r) => !r.isCompleted)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  }, [reminders]);

  // Filtered activities for timeline
  const filteredActivities = React.useMemo(() => {
    return (activities || []).filter((act) => {
      if (activityFilter === 'status') return act.type === 'STATUS_CHANGED';
      if (activityFilter === 'followup') {
        const action = (act.metadata as any)?.action as string | undefined;
        return action && action.startsWith('FOLLOW_UP');
      }
      if (activityFilter === 'note') return act.type === 'NOTE_ADDED';
      if (activityFilter === 'assignment') return act.type === 'OWNER_ASSIGNED';
      return true;
    });
  }, [activities, activityFilter]);

  // Status Change Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (statusId: string) => {
      if (!lead) throw new Error('No lead selected');
      return updateLead(lead.id, { statusId });
    },
    onSuccess: (updated) => {
      setStatusMenuOpen(false);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', lead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', lead?.id] });
      if (lead) {
        lead.statusId = updated.statusId;
        lead.status = updated.status;
      }
    },
  });

  // Create Note Mutation
  const createNoteMutation = useMutation({
    mutationFn: (content: string) => {
      if (!lead) throw new Error('No lead selected');
      return createLeadNote(lead.id, content);
    },
    onSuccess: () => {
      setNewNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['lead-notes', lead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', lead?.id] });
    },
  });

  // Update Note Mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) => {
      if (!lead) throw new Error('No lead selected');
      return updateLeadNote(lead.id, noteId, content);
    },
    onSuccess: () => {
      setEditingNoteId(null);
      setEditingContent('');
      queryClient.invalidateQueries({ queryKey: ['lead-notes', lead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', lead?.id] });
    },
  });

  // Delete Note Mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => {
      if (!lead) throw new Error('No lead selected');
      return deleteLeadNote(lead.id, noteId);
    },
    onSuccess: () => {
      setDeletingNoteId(null);
      queryClient.invalidateQueries({ queryKey: ['lead-notes', lead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', lead?.id] });
    },
  });

  // Create Reminder Mutation
  const createReminderMutation = useMutation({
    mutationFn: (data: { title: string; dueDate: string; assignedUserId?: string }) => {
      if (!lead) throw new Error('No lead selected');
      return createLeadReminder(lead.id, data);
    },
    onSuccess: () => {
      setReminderTitle('');
      setReminderDueDate('');
      setReminderAssignedUserId('');
      queryClient.invalidateQueries({ queryKey: ['lead-reminders', lead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', lead?.id] });
    },
  });

  // Update/Reschedule Reminder Mutation
  const updateReminderMutation = useMutation({
    mutationFn: ({
      reminderId,
      data,
    }: {
      reminderId: string;
      data: Partial<{ title: string; dueDate: string; isCompleted: boolean; assignedUserId?: string }>;
    }) => {
      if (!lead) throw new Error('No lead selected');
      return updateLeadReminder(lead.id, reminderId, data);
    },
    onSuccess: () => {
      setReschedulingId(null);
      setRescheduleDate('');
      queryClient.invalidateQueries({ queryKey: ['lead-reminders', lead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', lead?.id] });
    },
  });

  // Toggle Reminder Completed Mutation
  const toggleReminderMutation = useMutation({
    mutationFn: ({ reminderId, isCompleted }: { reminderId: string; isCompleted: boolean }) => {
      if (!lead) throw new Error('No lead selected');
      return updateLeadReminder(lead.id, reminderId, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-reminders', lead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', lead?.id] });
    },
  });

  // Delete Reminder Mutation
  const deleteReminderMutation = useMutation({
    mutationFn: (reminderId: string) => {
      if (!lead) throw new Error('No lead selected');
      return deleteLeadReminder(lead.id, reminderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-reminders', lead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', lead?.id] });
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || createNoteMutation.isPending) return;
    createNoteMutation.mutate(newNoteContent.trim());
  };

  const handleStartEdit = (note: LeadNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
    setDeletingNoteId(null);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editingContent.trim() || updateNoteMutation.isPending) return;
    updateNoteMutation.mutate({ noteId, content: editingContent.trim() });
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim() || !reminderDueDate || createReminderMutation.isPending) return;
    createReminderMutation.mutate({
      title: reminderTitle.trim(),
      dueDate: reminderDueDate,
      assignedUserId: reminderAssignedUserId || undefined,
    });
  };

  if (!lead) return null;

  const statusHistoryActivities = activities.filter((act) => act.type === 'STATUS_CHANGED');
  const pendingRemindersCount = reminders.filter((r) => !r.isCompleted).length;

  const getActivityIcon = (act: LeadActivity) => {
    const action = (act.metadata as any)?.action as string | undefined;
    if (action === 'FOLLOW_UP_SCHEDULED') {
      return <BellPlus className="h-3.5 w-3.5 text-teal-600" />;
    }
    if (action === 'FOLLOW_UP_COMPLETED') {
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
    }
    if (action === 'FOLLOW_UP_RESCHEDULED') {
      return <Clock className="h-3.5 w-3.5 text-amber-600" />;
    }
    if (action === 'FOLLOW_UP_CANCELLED') {
      return <Trash2 className="h-3.5 w-3.5 text-rose-600" />;
    }

    switch (act.type) {
      case 'CREATED':
        return <PlusCircle className="h-3.5 w-3.5 text-teal-600" />;
      case 'STATUS_CHANGED':
        return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />;
      case 'OWNER_ASSIGNED':
        return <UserCheck className="h-3.5 w-3.5 text-indigo-600" />;
      case 'NOTE_ADDED':
        return <MessageSquare className="h-3.5 w-3.5 text-sky-600" />;
      case 'IMPORTED':
        return <FileSpreadsheet className="h-3.5 w-3.5 text-amber-600" />;
      case 'DELETED':
        return <Trash2 className="h-3.5 w-3.5 text-rose-600" />;
      default:
        return <Edit3 className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle className="flex items-center justify-between gap-2 w-full pr-8">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-slate-900">
              {lead.firstName} {lead.lastName}
            </span>

            {/* Health Score Pill */}
            <LeadHealthBadge lead={lead} />

            {/* Interactive Status Dropdown Button */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:shadow-xs focus:outline-none"
                style={{
                  backgroundColor: lead.status ? `${lead.status.color}15` : '#f1f5f9',
                  color: lead.status ? lead.status.color : '#475569',
                  borderColor: lead.status ? `${lead.status.color}40` : '#cbd5e1',
                }}
                title="Click to change lead status"
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: lead.status ? lead.status.color : '#94a3b8' }}
                  />
                )}
                <span>{lead.status ? lead.status.name : 'Unassigned'}</span>
                <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
              </button>

              {statusMenuOpen && (
                <div className="absolute left-0 mt-1.5 z-50 w-52 rounded-lg border border-crm-border bg-white p-1.5 shadow-xl text-xs animate-in fade-in">
                  <div className="font-semibold text-slate-400 px-2 py-1 text-[10px] uppercase tracking-wider border-b border-slate-100 mb-1">
                    Select Lead Status
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {statuses.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => updateStatusMutation.mutate(st.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors hover:bg-slate-50 ${
                          lead.status?.id === st.id ? 'bg-slate-100 font-semibold' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: st.color }}
                          />
                          <span className="text-slate-700">{st.name}</span>
                        </span>
                        {lead.status?.id === st.id && (
                          <Check className="h-3.5 w-3.5 text-crm-teal" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogTitle>
      </DialogHeader>

      {/* Navigation Tabs */}
      <div className="flex border-b border-crm-border mb-4 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab('overview');
            setStatusMenuOpen(false);
          }}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-crm-teal text-crm-teal'
              : 'border-transparent text-crm-muted hover:text-crm-text'
          }`}
        >
          Profile Overview
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('notes');
            setStatusMenuOpen(false);
          }}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'notes'
              ? 'border-crm-teal text-crm-teal'
              : 'border-transparent text-crm-muted hover:text-crm-text'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Notes & Comments ({notes.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('status-history');
            setStatusMenuOpen(false);
          }}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'status-history'
              ? 'border-crm-teal text-crm-teal'
              : 'border-transparent text-crm-muted hover:text-crm-text'
          }`}
        >
          <History className="h-3.5 w-3.5" /> Status History ({statusHistoryActivities.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('reminders');
            setStatusMenuOpen(false);
          }}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reminders'
              ? 'border-crm-teal text-crm-teal'
              : 'border-transparent text-crm-muted hover:text-crm-text'
          }`}
        >
          <Bell className="h-3.5 w-3.5" /> Reminders
          {pendingRemindersCount > 0 && (
            <span className="ml-0.5 rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[10px] font-bold">
              {pendingRemindersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('timeline');
            setStatusMenuOpen(false);
          }}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-crm-teal text-crm-teal'
              : 'border-transparent text-crm-muted hover:text-crm-text'
          }`}
        >
          <Clock className="h-3.5 w-3.5" /> Full Activity ({activities.length})
        </button>
      </div>

      {/* TAB 1: Profile Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4 text-xs">
          {/* Next Follow-Up Operational Card */}
          <div className="rounded-xl border border-crm-border bg-gradient-to-r from-slate-50 to-teal-50/20 p-3.5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-crm-teal" />
                <span className="text-xs font-bold text-slate-800">Next Scheduled Follow-Up</span>
                {nextFollowUp && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      nextFollowUp.status === 'OVERDUE'
                        ? 'bg-rose-100 text-rose-700'
                        : nextFollowUp.status === 'DUE_TODAY'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {nextFollowUp.status === 'OVERDUE'
                      ? 'Overdue'
                      : nextFollowUp.status === 'DUE_TODAY'
                        ? 'Due Today'
                        : 'Upcoming'}
                  </span>
                )}
              </div>

              {nextFollowUp ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toggleReminderMutation.mutate({
                        reminderId: nextFollowUp.id,
                        isCompleted: true,
                      })
                    }
                    className="h-6 text-[11px] px-2 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                  >
                    <Check className="h-3 w-3 mr-1" /> Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveTab('reminders');
                      setReschedulingId(nextFollowUp.id);
                      setRescheduleDate(new Date(nextFollowUp.dueDate).toISOString().slice(0, 16));
                    }}
                    className="h-6 text-[11px] px-2"
                  >
                    Reschedule
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('reminders')}
                  className="text-[11px] text-crm-teal font-semibold hover:underline flex items-center gap-1"
                >
                  <BellPlus className="h-3 w-3" /> Schedule Follow-Up
                </button>
              )}
            </div>

            {nextFollowUp ? (
              <div className="mt-2.5">
                <div className="text-xs font-semibold text-slate-800">{nextFollowUp.title}</div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                  <span>
                    Due:{' '}
                    {new Date(nextFollowUp.dueDate).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {nextFollowUp.user && (
                    <span>
                      Assigned: {nextFollowUp.user.firstName} {nextFollowUp.user.lastName}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-1.5 text-slate-400 text-[11px]">
                No pending follow-up scheduled. Schedule a date to stay on top of this lead.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-3 border border-crm-border">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-crm-muted shrink-0" />
              <div>
                <div className="text-crm-muted">Email</div>
                <a
                  href={`mailto:${lead.email}`}
                  className="font-semibold text-crm-primary hover:underline"
                >
                  {lead.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-crm-muted shrink-0" />
              <div>
                <div className="text-crm-muted">Phone</div>
                <span className="font-semibold text-crm-text">
                  {lead.phone || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-md border border-crm-border p-2.5">
              <Globe className="h-4 w-4 text-crm-muted" />
              <div>
                <div className="text-crm-muted text-[10px]">Country</div>
                <div className="font-medium text-crm-text">
                  {lead.countryName || 'Unspecified'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-crm-border p-2.5">
              <Tag className="h-4 w-4 text-crm-muted" />
              <div>
                <div className="text-crm-muted text-[10px]">Lead Source</div>
                <div className="font-medium text-crm-text">
                  {lead.sourceName || 'Unspecified'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-md border border-crm-border p-2.5">
              <UserCheck className="h-4 w-4 text-crm-muted" />
              <div>
                <div className="text-crm-muted text-[10px]">Lead Owner</div>
                <div className="font-medium text-crm-text">
                  {lead.owner
                    ? `${lead.owner.firstName} ${lead.owner.lastName}`
                    : 'Unassigned'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-crm-border p-2.5">
              <Calendar className="h-4 w-4 text-crm-muted" />
              <div>
                <div className="text-crm-muted text-[10px]">Created At</div>
                <div className="font-medium text-crm-text">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {(lead.referrer || lead.tag1) && (
            <div className="rounded-md border border-crm-border p-2.5 space-y-1 bg-white">
              {lead.referrer && (
                <div className="flex justify-between">
                  <span className="text-crm-muted">Referrer:</span>
                  <span className="font-medium">{lead.referrer}</span>
                </div>
              )}
              {lead.tag1 && (
                <div className="flex justify-between">
                  <span className="text-crm-muted">Tag 1:</span>
                  <span className="font-medium">{lead.tag1}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Notes & Comments */}
      {activeTab === 'notes' && (
        <div className="space-y-3 text-xs">
          {/* Add Note Input */}
          <form onSubmit={handleAddNote} className="space-y-2">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add an internal note or comment about this prospect..."
              rows={3}
              className="w-full rounded-md border border-crm-border p-2.5 text-xs text-crm-text focus:border-crm-teal focus:outline-none focus:ring-1 focus:ring-crm-teal resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!newNoteContent.trim() || createNoteMutation.isPending}
                className="bg-crm-teal hover:bg-crm-teal-hover text-white flex items-center gap-1.5"
              >
                {createNoteMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Add Note
              </Button>
            </div>
          </form>

          {/* Notes List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pt-2 border-t border-slate-100 pr-1">
            {isLoadingNotes ? (
              <div className="py-6 text-center text-crm-muted">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="py-6 text-center text-crm-muted">
                No notes or comments logged yet for this lead.
              </div>
            ) : (
              notes.map((note) => {
                const isEditing = editingNoteId === note.id;
                const isDeleting = deletingNoteId === note.id;
                const isEdited =
                  note.updatedAt &&
                  new Date(note.updatedAt).getTime() > new Date(note.createdAt).getTime() + 1000;

                return (
                  <div
                    key={note.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 space-y-2 transition-colors hover:bg-slate-50"
                  >
                    {/* Header: Author, Role, Timestamp, Controls */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-crm-header">
                          {note.user.firstName} {note.user.lastName}
                        </span>
                        {note.user.role && (
                          <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 capitalize">
                            {note.user.role.toLowerCase().replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(note.createdAt).toLocaleString()}
                          {isEdited && <span className="ml-1 italic text-slate-400">(edited)</span>}
                        </span>

                        {canEditOrDeleteNotes && !isEditing && !isDeleting && (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(note)}
                              className="p-1 rounded text-slate-400 hover:text-crm-teal hover:bg-slate-200/60 transition-colors"
                              title="Edit note"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingNoteId(note.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors"
                              title="Delete note"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content / Inline Edit Mode */}
                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-crm-teal bg-white p-2 text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-teal resize-none"
                        />
                        <div className="flex justify-end gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={updateNoteMutation.isPending}
                            className="h-7 px-2.5 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSaveEdit(note.id)}
                            disabled={!editingContent.trim() || updateNoteMutation.isPending}
                            className="h-7 px-2.5 text-xs bg-crm-teal hover:bg-crm-teal-hover text-white"
                          >
                            {updateNoteMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : isDeleting ? (
                      <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 space-y-2 text-rose-800 animate-in fade-in">
                        <div className="flex items-center gap-1.5 font-medium text-xs">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                          <span>Delete this note permanently?</span>
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setDeletingNoteId(null)}
                            disabled={deleteNoteMutation.isPending}
                            className="h-7 px-2 text-xs border-rose-300 text-slate-700 bg-white hover:bg-slate-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            disabled={deleteNoteMutation.isPending}
                            className="h-7 px-2.5 text-xs"
                          >
                            {deleteNoteMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Trash2 className="h-3 w-3 mr-1" />
                            )}
                            Confirm Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 whitespace-pre-wrap text-xs leading-relaxed">
                        {note.content}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Status History */}
      {activeTab === 'status-history' && (
        <div className="text-xs space-y-3">
          <div className="text-[11px] text-slate-500">
            Chronological audit log of all status transitions for this lead.
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
            {isLoadingActivities ? (
              <div className="py-6 text-center text-crm-muted">Loading status history...</div>
            ) : statusHistoryActivities.length === 0 ? (
              <div className="py-8 text-center text-crm-muted bg-slate-50 rounded-lg border border-slate-100 p-4">
                <History className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                <div className="font-medium text-slate-600">No status changes recorded yet</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Click the status badge in the header to update this lead&apos;s status.
                </div>
              </div>
            ) : (
              statusHistoryActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="mt-0.5 rounded-md p-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-xs">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">
                        {act.description}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {act.user && (
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <span>Changed by</span>
                        <span className="font-medium text-slate-700">
                          {act.user.firstName} {act.user.lastName}
                        </span>
                        {act.user.role && (
                          <span className="rounded bg-slate-200/80 px-1.5 py-0.2 text-[9px] text-slate-600 capitalize">
                            {act.user.role.toLowerCase().replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Reminders */}
      {activeTab === 'reminders' && (
        <div className="space-y-3 text-xs">
          {/* Add Reminder Form */}
          <form
            onSubmit={handleAddReminder}
            className="p-3 rounded-lg border border-crm-border bg-slate-50/60 space-y-2.5"
          >
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <BellPlus className="h-3.5 w-3.5 text-crm-teal" /> Set a Follow-Up Reminder
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="Action note (e.g. Call back, Send pricing...)"
                  className="w-full h-8 px-2.5 rounded-md border border-crm-border bg-white text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-teal"
                />
              </div>
              <div>
                <input
                  type="datetime-local"
                  value={reminderDueDate}
                  onChange={(e) => setReminderDueDate(e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-crm-border bg-white text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-teal"
                />
              </div>
              <div>
                <select
                  value={reminderAssignedUserId}
                  onChange={(e) => setReminderAssignedUserId(e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-crm-border bg-white text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-teal"
                >
                  <option value="">Assign: Me</option>
                  {teamUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!reminderTitle.trim() || !reminderDueDate || createReminderMutation.isPending}
                className="bg-crm-teal hover:bg-crm-teal-hover text-white h-7 px-3 text-xs flex items-center gap-1.5"
              >
                {createReminderMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <BellPlus className="h-3 w-3" />
                )}
                Schedule Action
              </Button>
            </div>
          </form>

          {/* Reminders List */}
          <div className="max-h-60 overflow-y-auto space-y-2 pt-1 pr-1">
            {isLoadingReminders ? (
              <div className="py-6 text-center text-crm-muted">Loading follow-ups...</div>
            ) : reminders.length === 0 ? (
              <div className="py-6 text-center text-crm-muted bg-slate-50 rounded-lg border border-slate-100">
                No follow-ups scheduled for this lead.
              </div>
            ) : (
              reminders.map((rem) => {
                const dueDate = new Date(rem.dueDate);
                const isOverdue = !rem.isCompleted && rem.status === 'OVERDUE';
                const isDueToday = !rem.isCompleted && rem.status === 'DUE_TODAY';
                const isRescheduling = reschedulingId === rem.id;

                return (
                  <div
                    key={rem.id}
                    className={`flex flex-col gap-2 p-2.5 rounded-lg border transition-colors ${
                      rem.isCompleted
                        ? 'bg-slate-50/50 border-slate-100 opacity-60'
                        : isOverdue
                          ? 'bg-rose-50/60 border-rose-200'
                          : isDueToday
                            ? 'bg-amber-50/60 border-amber-200'
                            : 'bg-white border-crm-border shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            toggleReminderMutation.mutate({
                              reminderId: rem.id,
                              isCompleted: !rem.isCompleted,
                            })
                          }
                          className="mt-0.5 text-slate-400 hover:text-crm-teal transition-colors shrink-0"
                          title={rem.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {rem.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-400" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-xs break-words ${
                              rem.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'
                            }`}
                          >
                            {rem.title}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[10px] flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded font-semibold ${
                                rem.isCompleted
                                  ? 'bg-slate-100 text-slate-500'
                                  : isOverdue
                                    ? 'bg-rose-100 text-rose-700'
                                    : isDueToday
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {rem.isCompleted
                                ? 'Completed'
                                : isOverdue
                                  ? 'Overdue'
                                  : isDueToday
                                    ? 'Due Today'
                                    : 'Upcoming'}
                              : {dueDate.toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>

                            {rem.user && (
                              <span className="text-slate-500">
                                Assigned: {rem.user.firstName} {rem.user.lastName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!rem.isCompleted && (
                          <button
                            type="button"
                            onClick={() => {
                              if (isRescheduling) {
                                setReschedulingId(null);
                              } else {
                                setReschedulingId(rem.id);
                                setRescheduleDate(new Date(rem.dueDate).toISOString().slice(0, 16));
                              }
                            }}
                            className="text-xs text-slate-500 hover:text-crm-teal p-1"
                            title="Reschedule follow-up"
                          >
                            <Clock className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteReminderMutation.mutate(rem.id)}
                          disabled={deleteReminderMutation.isPending}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete reminder"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Reschedule Form */}
                    {isRescheduling && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                          Reschedule to:
                        </span>
                        <input
                          type="datetime-local"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="h-7 px-2 text-xs rounded border border-crm-border bg-white"
                        />
                        <Button
                          size="sm"
                          disabled={!rescheduleDate || updateReminderMutation.isPending}
                          onClick={() =>
                            updateReminderMutation.mutate({
                              reminderId: rem.id,
                              data: { dueDate: rescheduleDate },
                            })
                          }
                          className="h-7 px-2.5 text-xs bg-crm-teal hover:bg-crm-teal-hover text-white"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReschedulingId(null)}
                          className="h-7 px-2 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Activity Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-3 text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
            {[
              { id: 'all', label: `All (${activities.length})` },
              {
                id: 'status',
                label: `Status (${activities.filter((a) => a.type === 'STATUS_CHANGED').length})`,
              },
              {
                id: 'followup',
                label: `Follow-Ups (${
                  activities.filter((a) =>
                    ((a.metadata as any)?.action as string | undefined)?.startsWith('FOLLOW_UP'),
                  ).length
                })`,
              },
              {
                id: 'note',
                label: `Notes (${activities.filter((a) => a.type === 'NOTE_ADDED').length})`,
              },
              {
                id: 'assignment',
                label: `Assigned (${activities.filter((a) => a.type === 'OWNER_ASSIGNED').length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivityFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors shrink-0 ${
                  activityFilter === tab.id
                    ? 'bg-crm-header text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
            {isLoadingActivities ? (
              <div className="py-6 text-center text-crm-muted">Loading activity timeline...</div>
            ) : filteredActivities.length === 0 ? (
              <div className="py-6 text-center text-crm-muted bg-slate-50 rounded-lg border border-slate-100">
                No recorded activities in this category.
              </div>
            ) : (
              filteredActivities.map((act) => {
                const meta = act.metadata as Record<string, any> | undefined;
                return (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-100 p-2.5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="mt-0.5 rounded-md p-1.5 bg-white border border-slate-200 shadow-xs shrink-0">
                      {getActivityIcon(act)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-crm-header text-xs break-words">
                          {act.description}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {new Date(act.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Author & Role */}
                      {act.user && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                          <span>
                            By {act.user.firstName} {act.user.lastName}
                          </span>
                          {act.user.role && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-200/80 text-slate-700 uppercase tracking-wider">
                              {act.user.role.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Metadata Highlights */}
                      {meta && (
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {meta.oldStatusName && meta.newStatusName && (
                            <span className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                              {meta.oldStatusName} → {meta.newStatusName}
                            </span>
                          )}
                          {meta.dueDate && (
                            <span className="text-[10px] font-medium text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded">
                              Scheduled:{' '}
                              {new Date(meta.dueDate).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button
          onClick={() => {
            onOpenChange(false);
            onEdit(lead);
          }}
          className="bg-crm-teal hover:bg-crm-teal-hover text-white"
        >
          Edit Lead
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
