'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead, LeadNote, LeadActivity, LeadReminder, LeadStatus } from '../types';
import { LeadHealthBadge } from './lead-health-badge';
import { CountryFlag } from './country-flag';
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
  Copy,
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
import { useToast } from '@/components/ui/toast';

export interface LeadDetailDrawerProps {
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
}: LeadDetailDrawerProps) {
  // Cache lead for smooth slide-out transition
  const [cachedLead, setCachedLead] = React.useState<Lead | null>(lead);
  React.useEffect(() => {
    if (lead) setCachedLead(lead);
  }, [lead]);

  const activeLead = lead || cachedLead;

  const [activeTab, setActiveTab] = React.useState<
    'overview' | 'notes' | 'status-history' | 'reminders' | 'timeline'
  >('overview');

  // Status changer dropdown state
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(false);
  const statusMenuRef = React.useRef<HTMLDivElement>(null);

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
  const [activityFilter, setActivityFilter] = React.useState<
    'all' | 'status' | 'followup' | 'note' | 'assignment'
  >('all');

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toast = useToast();

  // Escape key & body overflow lock
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStatusMenuOpen(false);
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  // Click outside to close status dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    };
    if (statusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusMenuOpen]);

  // Role permissions
  const canEditOrDeleteNotes =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER';

  // Fetch reference statuses
  const { data: statuses = [] } = useQuery<LeadStatus[]>({
    queryKey: ['lead-statuses'],
    queryFn: fetchLeadStatuses,
    enabled: open && !!activeLead,
  });

  // Fetch Notes
  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<LeadNote[]>({
    queryKey: ['lead-notes', activeLead?.id],
    queryFn: () => (activeLead ? fetchLeadNotes(activeLead.id) : Promise.resolve([])),
    enabled: open && !!activeLead,
  });

  // Fetch Activities
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery<LeadActivity[]>({
    queryKey: ['lead-activities', activeLead?.id],
    queryFn: () => (activeLead ? fetchLeadActivities(activeLead.id) : Promise.resolve([])),
    enabled: open && !!activeLead,
  });

  // Fetch Reminders
  const { data: reminders = [], isLoading: isLoadingReminders } = useQuery<LeadReminder[]>({
    queryKey: ['lead-reminders', activeLead?.id],
    queryFn: () => (activeLead ? fetchLeadReminders(activeLead.id) : Promise.resolve([])),
    enabled: open && !!activeLead,
  });

  // Fetch Team Users for Assignment
  const { data: teamUsers = [] } = useQuery<UserItem[]>({
    queryKey: ['team-users'],
    queryFn: fetchUsers,
    enabled: open && !!activeLead,
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

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: (statusId: string) => {
      if (!activeLead) throw new Error('No lead selected');
      return updateLead(activeLead.id, { statusId });
    },
    onSuccess: (updated) => {
      setStatusMenuOpen(false);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', activeLead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', activeLead?.id] });
      if (activeLead) {
        activeLead.statusId = updated.statusId;
        activeLead.status = updated.status;
      }
      toast.success('Lead status updated');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update status');
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (content: string) => {
      if (!activeLead) throw new Error('No lead selected');
      return createLeadNote(activeLead.id, content);
    },
    onSuccess: () => {
      setNewNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['lead-notes', activeLead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', activeLead?.id] });
      toast.success('Note added');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create note');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) => {
      if (!activeLead) throw new Error('No lead selected');
      return updateLeadNote(activeLead.id, noteId, content);
    },
    onSuccess: () => {
      setEditingNoteId(null);
      setEditingContent('');
      queryClient.invalidateQueries({ queryKey: ['lead-notes', activeLead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', activeLead?.id] });
      toast.success('Note updated');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update note');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => {
      if (!activeLead) throw new Error('No lead selected');
      return deleteLeadNote(activeLead.id, noteId);
    },
    onSuccess: () => {
      setDeletingNoteId(null);
      queryClient.invalidateQueries({ queryKey: ['lead-notes', activeLead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', activeLead?.id] });
      toast.success('Note deleted');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete note');
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: (data: { title: string; dueDate: string; assignedUserId?: string }) => {
      if (!activeLead) throw new Error('No lead selected');
      return createLeadReminder(activeLead.id, data);
    },
    onSuccess: () => {
      setReminderTitle('');
      setReminderDueDate('');
      setReminderAssignedUserId('');
      queryClient.invalidateQueries({ queryKey: ['lead-reminders', activeLead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', activeLead?.id] });
      toast.success('Follow-up scheduled');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to schedule follow-up');
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: ({
      reminderId,
      data,
    }: {
      reminderId: string;
      data: Partial<{ title: string; dueDate: string; isCompleted: boolean; assignedUserId?: string }>;
    }) => {
      if (!activeLead) throw new Error('No lead selected');
      return updateLeadReminder(activeLead.id, reminderId, data);
    },
    onSuccess: () => {
      setReschedulingId(null);
      setRescheduleDate('');
      queryClient.invalidateQueries({ queryKey: ['lead-reminders', activeLead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', activeLead?.id] });
      toast.success('Reminder updated');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update reminder');
    },
  });

  const toggleReminderMutation = useMutation({
    mutationFn: ({ reminderId, isCompleted }: { reminderId: string; isCompleted: boolean }) => {
      if (!activeLead) throw new Error('No lead selected');
      return updateLeadReminder(activeLead.id, reminderId, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-reminders', activeLead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', activeLead?.id] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update reminder status');
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (reminderId: string) => {
      if (!activeLead) throw new Error('No lead selected');
      return deleteLeadReminder(activeLead.id, reminderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-reminders', activeLead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', activeLead?.id] });
      toast.success('Reminder removed');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete reminder');
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

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim() || !reminderDueDate || createReminderMutation.isPending) return;
    createReminderMutation.mutate({
      title: reminderTitle.trim(),
      dueDate: reminderDueDate,
      assignedUserId: reminderAssignedUserId || undefined,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  if (!open && !lead) return null;
  if (!activeLead) return null;

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

  const initials = `${activeLead.firstName?.[0] || ''}${activeLead.lastName?.[0] || ''}`.toUpperCase();

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* 2. Slide-Over Right Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full sm:w-[540px] md:w-[600px] lg:w-[660px] xl:w-[720px] bg-white shadow-2xl border-l border-crm-border flex-col h-full transform transition-transform duration-300 ease-in-out select-none ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Lead Details Panel"
      >
        {/* Sticky Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-crm-border bg-white sticky top-0 z-20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Avatar + Name + Country */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#0A2428] border border-[#0D2D32] text-[#16C1C8] font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs">
                {initials || 'LD'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {activeLead.firstName} {activeLead.lastName}
                  </h2>
                  <CountryFlag
                    countryName={activeLead.countryName}
                    isoCode={activeLead.country?.isoCode}
                  />
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {activeLead.email}
                </div>
              </div>
            </div>

            {/* Right: Quick Edit & Close buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(activeLead);
                }}
                className="h-8 px-2 sm:px-2.5 text-xs text-slate-700 hover:text-crm-teal hover:border-crm-teal/40"
                title="Edit Lead Details"
              >
                <Edit3 className="h-3.5 w-3.5 sm:mr-1 text-crm-muted" />
                <span className="hidden sm:inline">Edit</span>
              </Button>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-lg border border-crm-border text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                aria-label="Close lead panel"
                title="Close (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sub-bar: Status Pill + Health Score */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Interactive Status Dropdown Button */}
              <div className="relative inline-block text-left" ref={statusMenuRef}>
                <button
                  type="button"
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                  disabled={updateStatusMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:shadow-xs focus:outline-none cursor-pointer"
                  style={{
                    backgroundColor: activeLead.status ? `${activeLead.status.color}15` : '#f1f5f9',
                    color: activeLead.status ? activeLead.status.color : '#475569',
                    borderColor: activeLead.status ? `${activeLead.status.color}40` : '#cbd5e1',
                  }}
                  title="Click to update status"
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: activeLead.status ? activeLead.status.color : '#94a3b8' }}
                    />
                  )}
                  <span>{activeLead.status ? activeLead.status.name : 'Unassigned'}</span>
                  <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                </button>

                {statusMenuOpen && (
                  <div className="absolute left-0 mt-1.5 z-50 w-52 rounded-lg border border-crm-border bg-white p-1.5 shadow-xl text-xs animate-in fade-in">
                    <div className="font-semibold text-slate-400 px-2 py-1 text-[10px] uppercase tracking-wider border-b border-slate-100 mb-1">
                      Change Lead Status
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-0.5">
                      {statuses.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => updateStatusMutation.mutate(st.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                            activeLead.status?.id === st.id ? 'bg-slate-100 font-semibold' : ''
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: st.color }}
                            />
                            <span className="text-slate-700">{st.name}</span>
                          </span>
                          {activeLead.status?.id === st.id && (
                            <Check className="h-3.5 w-3.5 text-crm-teal" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Health Score Pill */}
              <LeadHealthBadge lead={activeLead} />
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <a
                href={`mailto:${activeLead.email}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-crm-border bg-slate-50 text-slate-600 hover:text-crm-teal hover:bg-slate-100 transition-colors"
                title="Send Email"
              >
                <Mail className="h-3.5 w-3.5 text-crm-muted" />
                <span className="hidden sm:inline">Email</span>
              </a>
              {activeLead.phone && (
                <a
                  href={`tel:${activeLead.phone}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded border border-crm-border bg-slate-50 text-slate-600 hover:text-crm-teal hover:bg-slate-100 transition-colors"
                  title="Call Lead"
                >
                  <Phone className="h-3.5 w-3.5 text-crm-muted" />
                  <span className="hidden sm:inline">Call</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Segmented Tabs Navigation */}
        <div className="px-3 sm:px-5 border-b border-crm-border bg-slate-50/70 sticky top-[105px] z-10 flex overflow-x-auto gap-1 sm:gap-1.5 shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveTab('overview');
              setStatusMenuOpen(false);
            }}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#16C1C8] text-[#071A1D] font-bold bg-white/70'
                : 'border-transparent text-crm-muted hover:text-crm-text hover:bg-white/40'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('notes');
              setStatusMenuOpen(false);
            }}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'notes'
                ? 'border-[#16C1C8] text-[#071A1D] font-bold bg-white/70'
                : 'border-transparent text-crm-muted hover:text-crm-text hover:bg-white/40'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Notes</span>
            <span className="rounded-full bg-slate-200/80 text-slate-700 px-1.5 py-0.2 text-[10px] font-bold">
              {notes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('status-history');
              setStatusMenuOpen(false);
            }}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'status-history'
                ? 'border-[#16C1C8] text-[#071A1D] font-bold bg-white/70'
                : 'border-transparent text-crm-muted hover:text-crm-text hover:bg-white/40'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Status</span>
            <span className="rounded-full bg-slate-200/80 text-slate-700 px-1.5 py-0.2 text-[10px] font-bold">
              {statusHistoryActivities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('reminders');
              setStatusMenuOpen(false);
            }}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'reminders'
                ? 'border-[#16C1C8] text-[#071A1D] font-bold bg-white/70'
                : 'border-transparent text-crm-muted hover:text-crm-text hover:bg-white/40'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Reminders</span>
            {pendingRemindersCount > 0 && (
              <span className="rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[10px] font-bold">
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
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-[#16C1C8] text-[#071A1D] font-bold bg-white/70'
                : 'border-transparent text-crm-muted hover:text-crm-text hover:bg-white/40'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Activity</span>
            <span className="rounded-full bg-slate-200/80 text-slate-700 px-1.5 py-0.2 text-[10px] font-bold">
              {activities.length}
            </span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs select-text">
          {/* TAB 1: Profile Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Next Scheduled Follow-Up Hero Card */}
              <div className="rounded-xl border border-crm-border bg-gradient-to-r from-slate-50 to-teal-50/20 p-3.5 sm:p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-crm-teal shrink-0" />
                    <span className="text-xs font-bold text-slate-800">
                      Next Follow-Up
                    </span>
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
                        className="h-7 text-[11px] px-2.5 text-emerald-700 hover:bg-emerald-50 border-emerald-200 font-medium"
                      >
                        <Check className="h-3 w-3 mr-1" /> Mark Done
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveTab('reminders');
                          setReschedulingId(nextFollowUp.id);
                          setRescheduleDate(new Date(nextFollowUp.dueDate).toISOString().slice(0, 16));
                        }}
                        className="h-7 text-[11px] px-2.5"
                      >
                        Reschedule
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('reminders')}
                      className="text-[11px] text-crm-teal font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BellPlus className="h-3.5 w-3.5" /> Schedule Follow-Up
                    </button>
                  )}
                </div>

                {nextFollowUp ? (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/50">
                    <div className="text-xs font-semibold text-slate-800">{nextFollowUp.title}</div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
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
                    No pending follow-up scheduled. Set a reminder to keep this lead warm.
                  </div>
                )}
              </div>

              {/* Contact Information Cards (Responsive 2-Col Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-crm-border">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-md bg-white border border-slate-200 text-crm-muted shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-crm-muted font-medium">Email Address</div>
                      <a
                        href={`mailto:${activeLead.email}`}
                        className="font-semibold text-crm-primary hover:underline truncate block"
                        title={activeLead.email}
                      >
                        {activeLead.email}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeLead.email, 'email')}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                    title="Copy email"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-crm-border">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-md bg-white border border-slate-200 text-crm-muted shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-crm-muted font-medium">Phone Number</div>
                      <span className="font-semibold text-crm-text truncate block">
                        {activeLead.phone || 'N/A'}
                      </span>
                    </div>
                  </div>
                  {activeLead.phone && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeLead.phone || '', 'phone')}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                      title="Copy phone"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lead Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2.5 rounded-lg border border-crm-border p-3 bg-white">
                  <div className="p-2 rounded-md bg-slate-50 border border-slate-100 text-crm-muted shrink-0">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-crm-muted text-[10px] font-medium">Country / Region</div>
                    <div className="font-medium text-crm-text mt-0.5">
                      <CountryFlag
                        countryName={activeLead.countryName}
                        isoCode={activeLead.country?.isoCode}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg border border-crm-border p-3 bg-white">
                  <div className="p-2 rounded-md bg-slate-50 border border-slate-100 text-crm-muted shrink-0">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-crm-muted text-[10px] font-medium">Lead Source</div>
                    <div className="font-medium text-crm-text mt-0.5">
                      {activeLead.sourceName ? (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {activeLead.sourceName}
                        </span>
                      ) : (
                        'Unspecified'
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg border border-crm-border p-3 bg-white">
                  <div className="p-2 rounded-md bg-slate-50 border border-slate-100 text-crm-muted shrink-0">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-crm-muted text-[10px] font-medium">Assigned Owner</div>
                    <div className="font-medium text-crm-text mt-0.5">
                      {activeLead.owner
                        ? `${activeLead.owner.firstName} ${activeLead.owner.lastName}`
                        : 'Unassigned'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg border border-crm-border p-3 bg-white">
                  <div className="p-2 rounded-md bg-slate-50 border border-slate-100 text-crm-muted shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-crm-muted text-[10px] font-medium">Created Date</div>
                    <div className="font-medium text-crm-text mt-0.5">
                      {new Date(activeLead.createdAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata: Referrer and Tag */}
              {(activeLead.referrer || activeLead.tag1) && (
                <div className="rounded-lg border border-crm-border p-3 space-y-2 bg-slate-50/50">
                  {activeLead.referrer && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-crm-muted font-medium">Referrer:</span>
                      <span className="font-semibold text-slate-700 font-mono text-[11px]">
                        {activeLead.referrer}
                      </span>
                    </div>
                  )}
                  {activeLead.tag1 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-crm-muted font-medium">Tag:</span>
                      <span className="rounded bg-teal-50 text-crm-teal border border-teal-100 px-2 py-0.5 text-[11px] font-medium">
                        {activeLead.tag1}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Notes & Comments */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note Input Box */}
              <form onSubmit={handleAddNote} className="space-y-2 rounded-lg border border-crm-border bg-slate-50/60 p-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Add Note or Internal Comment
                </label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record call summary, meeting notes, customer preferences..."
                  rows={3}
                  className="w-full rounded-md border border-crm-border p-2.5 text-xs text-crm-text bg-white focus:border-crm-teal focus:outline-none focus:ring-1 focus:ring-crm-teal resize-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Visible to team members with lead access
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newNoteContent.trim() || createNoteMutation.isPending}
                    className="bg-crm-teal hover:bg-crm-teal-hover text-white h-7 px-3 text-xs flex items-center gap-1.5 font-medium"
                  >
                    {createNoteMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    Post Note
                  </Button>
                </div>
              </form>

              {/* Notes Feed */}
              <div className="space-y-2.5">
                {isLoadingNotes ? (
                  <div className="py-8 text-center text-crm-muted flex flex-col items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-crm-teal" />
                    <span>Loading notes...</span>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="py-8 text-center text-crm-muted bg-slate-50 rounded-lg border border-slate-100 p-4">
                    <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                    <div className="font-semibold text-slate-600">No notes logged yet</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Use the box above to log your first comment or call memo.
                    </div>
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
                        className="rounded-lg border border-slate-200/80 bg-white p-3 space-y-2 transition-all hover:shadow-2xs"
                      >
                        {/* Header: Author + Role + Timestamp + Controls */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-crm-header text-xs">
                              {note.user.firstName} {note.user.lastName}
                            </span>
                            {note.user.role && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 uppercase tracking-wider">
                                {note.user.role.toLowerCase().replace('_', ' ')}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(note.createdAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {isEdited && ' (edited)'}
                            </span>

                            {canEditOrDeleteNotes && !isEditing && !isDeleting && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(note)}
                                  className="p-1 text-slate-400 hover:text-sky-600 rounded transition-colors"
                                  title="Edit note"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingNoteId(note.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                  title="Delete note"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content or Edit/Delete states */}
                        {isEditing ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              rows={2}
                              className="w-full rounded border border-crm-border p-2 text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-teal"
                            />
                            <div className="flex justify-end gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingNoteId(null)}
                                className="h-7 px-2.5 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSaveEdit(note.id)}
                                disabled={!editingContent.trim() || updateNoteMutation.isPending}
                                className="h-7 px-2.5 text-xs bg-crm-teal hover:bg-crm-teal-hover text-white font-medium"
                              >
                                {updateNoteMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Check className="h-3 w-3 mr-1" />
                                )}
                                Save Note
                              </Button>
                            </div>
                          </div>
                        ) : isDeleting ? (
                          <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 space-y-2 text-rose-800 animate-in fade-in">
                            <div className="flex items-center gap-1.5 font-medium text-xs">
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                              <span>Permanently delete this note?</span>
                            </div>
                            <div className="flex justify-end gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setDeletingNoteId(null)}
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
            <div className="space-y-4">
              {/* Interactive Status Editor Card */}
              <div className="rounded-xl border border-crm-border bg-slate-50/80 p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] text-crm-muted font-bold uppercase tracking-wider block">
                      Current Stage
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: activeLead.status?.color || '#94a3b8' }}
                      />
                      <span className="font-bold text-slate-900 text-sm">
                        {activeLead.status?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Change Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                      Change to:
                    </span>
                    <select
                      value={activeLead.status?.id || ''}
                      onChange={(e) => {
                        if (e.target.value && e.target.value !== activeLead.status?.id) {
                          updateStatusMutation.mutate(e.target.value);
                        }
                      }}
                      disabled={updateStatusMutation.isPending}
                      className="h-8 px-2.5 text-xs rounded-md border border-crm-border bg-white text-slate-700 font-semibold shadow-xs focus:outline-none focus:ring-1 focus:ring-crm-teal cursor-pointer"
                    >
                      <option value="" disabled>Select new status...</option>
                      {statuses.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} {st.id === activeLead.status?.id ? '✓' : ''}
                        </option>
                      ))}
                    </select>
                    {updateStatusMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin text-crm-teal shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Chronological pipeline transition log:
              </div>

              {/* Status History Feed */}
              <div className="space-y-2.5">
                {isLoadingActivities ? (
                  <div className="py-8 text-center text-crm-muted flex flex-col items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-crm-teal" />
                    <span>Loading history...</span>
                  </div>
                ) : statusHistoryActivities.length === 0 ? (
                  <div className="py-8 text-center text-crm-muted bg-slate-50 rounded-lg border border-slate-100 p-4">
                    <History className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                    <div className="font-semibold text-slate-600">No status changes yet</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Use the status dropdown above to change this lead&apos;s stage.
                    </div>
                  </div>
                ) : (
                  statusHistoryActivities.map((act, idx) => {
                    const meta = act.metadata as Record<string, any> | undefined;
                    const toName = meta?.toStatusName;
                    const fromName = meta?.fromStatusName;

                    const isBulk =
                      act.description.includes('bulk operation') ||
                      act.description.includes('bulk edit') ||
                      act.description.toLowerCase().includes('in bulk');

                    let displayTitle = act.description;
                    let targetStatusName = toName;

                    if (toName) {
                      targetStatusName = toName;
                      displayTitle = fromName ? `${fromName} → ${toName}` : `Status changed to "${toName}"`;
                    } else if (isBulk) {
                      if (activeLead.status?.name) {
                        targetStatusName = activeLead.status.name;
                        displayTitle = `Status changed to "${activeLead.status.name}"`;
                      } else {
                        displayTitle = 'Status updated';
                      }
                    }

                    const matchedStatus = statuses.find(
                      (s) =>
                        s.name.toLowerCase() === (targetStatusName || '').toLowerCase() ||
                        s.id === meta?.toStatusId,
                    );

                    return (
                      <div
                        key={act.id}
                        className="flex items-start gap-3 rounded-lg border border-slate-200/80 p-3 bg-white hover:bg-slate-50/70 transition-colors shadow-2xs"
                      >
                        <div
                          className="mt-0.5 rounded-md p-1.5 shrink-0 shadow-xs"
                          style={{
                            backgroundColor: matchedStatus ? `${matchedStatus.color}15` : '#ecfdf5',
                            color: matchedStatus ? matchedStatus.color : '#059669',
                            borderColor: matchedStatus ? `${matchedStatus.color}35` : '#a7f3d0',
                            borderWidth: '1px',
                          }}
                        >
                          <TrendingUp className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900 text-xs">
                                {displayTitle}
                              </span>
                              {matchedStatus && (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
                                  style={{
                                    backgroundColor: `${matchedStatus.color}15`,
                                    color: matchedStatus.color,
                                    borderColor: `${matchedStatus.color}35`,
                                    borderWidth: '1px',
                                  }}
                                >
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: matchedStatus.color }}
                                  />
                                  {matchedStatus.name}
                                </span>
                              )}
                              {isBulk && (
                                <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                  Batch update
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {new Date(act.createdAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {act.user && (
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span>By</span>
                              <span className="font-medium text-slate-700">
                                {act.user.firstName} {act.user.lastName}
                              </span>
                              {act.user.role && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-600 uppercase">
                                  {act.user.role.toLowerCase().replace('_', ' ')}
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

          {/* TAB 4: Reminders */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              {/* Add Reminder Form */}
              <form
                onSubmit={handleAddReminder}
                className="p-3.5 rounded-lg border border-crm-border bg-slate-50/60 space-y-3"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                  <BellPlus className="h-3.5 w-3.5 text-crm-teal" /> Schedule a Follow-Up Reminder
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] text-slate-500 font-medium mb-1">
                      Action Note
                    </label>
                    <input
                      type="text"
                      value={reminderTitle}
                      onChange={(e) => setReminderTitle(e.target.value)}
                      placeholder="e.g. Call back, Send proposal..."
                      className="w-full h-8 px-2.5 rounded-md border border-crm-border bg-white text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-teal"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] text-slate-500 font-medium mb-1">
                      Due Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={reminderDueDate}
                      onChange={(e) => setReminderDueDate(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-crm-border bg-white text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-teal"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-slate-500 font-medium mb-1">
                      Assignee
                    </label>
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

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!reminderTitle.trim() || !reminderDueDate || createReminderMutation.isPending}
                    className="bg-crm-teal hover:bg-crm-teal-hover text-white h-7 px-3 text-xs flex items-center gap-1.5 font-medium"
                  >
                    {createReminderMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <BellPlus className="h-3 w-3" />
                    )}
                    Set Reminder
                  </Button>
                </div>
              </form>

              {/* Reminders Feed */}
              <div className="space-y-2">
                {isLoadingReminders ? (
                  <div className="py-8 text-center text-crm-muted flex flex-col items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-crm-teal" />
                    <span>Loading reminders...</span>
                  </div>
                ) : reminders.length === 0 ? (
                  <div className="py-8 text-center text-crm-muted bg-slate-50 rounded-lg border border-slate-100 p-4">
                    <Bell className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                    <div className="font-semibold text-slate-600">No follow-ups scheduled</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Schedule a call or email reminder to keep deals moving forward.
                    </div>
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
                        className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${
                          rem.isCompleted
                            ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
                            : isOverdue
                              ? 'bg-rose-50/70 border-rose-200 shadow-2xs'
                              : isDueToday
                                ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                                : 'bg-white border-slate-200 shadow-2xs'
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
                              className="mt-0.5 text-slate-400 hover:text-crm-teal transition-colors shrink-0 cursor-pointer"
                              title={rem.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {rem.isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-slate-400 hover:text-crm-teal" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div
                                className={`font-semibold text-xs break-words ${
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
                                className="text-xs text-slate-400 hover:text-crm-teal p-1 rounded"
                                title="Reschedule"
                              >
                                <Clock className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteReminderMutation.mutate(rem.id)}
                              disabled={deleteReminderMutation.isPending}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded"
                              title="Delete reminder"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Reschedule Form */}
                        {isRescheduling && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                            <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                              Reschedule:
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
                              className="h-7 px-2.5 text-xs bg-crm-teal hover:bg-crm-teal-hover text-white font-medium"
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
            <div className="space-y-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none scrollbar-none">
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
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                      activityFilter === tab.id
                        ? 'bg-[#0A2428] text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Activity Stream */}
              <div className="space-y-2">
                {isLoadingActivities ? (
                  <div className="py-8 text-center text-crm-muted flex flex-col items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-crm-teal" />
                    <span>Loading activity log...</span>
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="py-8 text-center text-crm-muted bg-slate-50 rounded-lg border border-slate-100 p-4">
                    No activities recorded in this category.
                  </div>
                ) : (
                  filteredActivities.map((act) => {
                    const meta = act.metadata as Record<string, any> | undefined;
                    return (
                      <div
                        key={act.id}
                        className="flex items-start gap-3 rounded-lg border border-slate-200/80 p-2.5 sm:p-3 bg-white hover:bg-slate-50/70 transition-colors shadow-2xs"
                      >
                        <div className="mt-0.5 rounded-md p-1.5 bg-slate-50 border border-slate-200 shadow-xs shrink-0">
                          {getActivityIcon(act)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
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
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 flex-wrap">
                              <span>
                                By {act.user.firstName} {act.user.lastName}
                              </span>
                              {act.user.role && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 uppercase">
                                  {act.user.role.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Metadata Highlights */}
                          {meta && (
                            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                              {meta.oldStatusName && meta.newStatusName && (
                                <span className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
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
        </div>

        {/* Sticky Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-crm-border bg-slate-50/80 sticky bottom-0 z-20 flex items-center justify-between gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            Close Panel
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onEdit(activeLead);
            }}
            className="bg-[#16C1C8] hover:bg-[#16C1C8]/90 text-[#071A1D] font-bold text-xs shadow-xs"
          >
            Edit Lead
          </Button>
        </div>
      </div>
    </>
  );
}

// Named alias export for explicit naming
export const LeadDetailDrawer = LeadDetailModal;
