'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead, LeadNote, LeadActivity, LeadReminder, LeadStatus } from '../types';
import { LeadHealthBadge } from './lead-health-badge';
import { CountryFlag } from './country-flag';
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  Send,
  Loader2,
  Check,
  ArrowLeft,
  FileText,
  Search,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  Clock,
  Plus,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  fetchLeadNotes,
  fetchLeadActivities,
  createLeadNote,
  updateLeadNote,
  deleteLeadNote,
  fetchLeadStatuses,
  updateLead,
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
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

function formatDateTime(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function formatDateHeader(dateStr?: string | Date | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function LeadDetailModal({
  lead,
  open,
  onOpenChange,
  onEdit,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: LeadDetailDrawerProps) {
  // Cache lead for smooth slide-out transition
  const [cachedLead, setCachedLead] = React.useState<Lead | null>(lead);
  React.useEffect(() => {
    if (lead) setCachedLead(lead);
  }, [lead]);

  const activeLead = lead || cachedLead;

  // View modes: 'overview' (the stacked panel layout) | 'all-activities' | 'all-notes' | 'all-audit-logs'
  const [viewMode, setViewMode] = React.useState<
    'overview' | 'all-activities' | 'all-notes' | 'all-audit-logs'
  >('overview');

  // Reset to overview when active lead changes (Next/Prev navigation)
  React.useEffect(() => {
    setViewMode('overview');
    setEditingField(null);
  }, [activeLead?.id]);

  // Status changer dropdown state
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(false);
  const statusMenuRef = React.useRef<HTMLDivElement>(null);

  // Owner changer dropdown state
  const [ownerMenuOpen, setOwnerMenuOpen] = React.useState(false);
  const ownerMenuRef = React.useRef<HTMLDivElement>(null);

  // Inline edit state for email & phone
  const [editingField, setEditingField] = React.useState<'email' | 'phone' | null>(null);
  const [fieldValue, setFieldValue] = React.useState('');

  // Quick notes state
  const [newNoteContent, setNewNoteContent] = React.useState('');
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = React.useState('');

  // View All search & filter state
  const [viewAllSearch, setViewAllSearch] = React.useState('');
  const [viewAllFilter, setViewAllFilter] = React.useState<string>('all');

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toast = useToast();

  // Escape key & body overflow lock
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode !== 'overview') {
          setViewMode('overview');
          return;
        }
        setStatusMenuOpen(false);
        setOwnerMenuOpen(false);
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
  }, [open, viewMode, onOpenChange]);

  // Click outside to close menus
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
      if (ownerMenuRef.current && !ownerMenuRef.current.contains(e.target as Node)) {
        setOwnerMenuOpen(false);
      }
    };
    if (statusMenuOpen || ownerMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusMenuOpen, ownerMenuOpen]);

  // Role permissions
  const canEditOrDeleteNotes =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER';

  // Fetch reference statuses
  const { data: statuses = [] } = useQuery<LeadStatus[]>({
    queryKey: ['lead-statuses'],
    queryFn: fetchLeadStatuses,
    staleTime: 5 * 60 * 1000,
    enabled: open && !!activeLead,
  });

  // Fetch Team Users for Owner Assignment
  const { data: teamUsers = [] } = useQuery<UserItem[]>({
    queryKey: ['team-users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
    enabled: open && !!activeLead,
  });

  // Fetch Notes
  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<LeadNote[]>({
    queryKey: ['lead-notes', activeLead?.id],
    queryFn: () => (activeLead ? fetchLeadNotes(activeLead.id) : Promise.resolve([])),
    staleTime: 30 * 1000,
    enabled: open && !!activeLead,
  });

  // Fetch Activities
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery<LeadActivity[]>({
    queryKey: ['lead-activities', activeLead?.id],
    queryFn: () => (activeLead ? fetchLeadActivities(activeLead.id) : Promise.resolve([])),
    staleTime: 30 * 1000,
    enabled: open && !!activeLead,
  });

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

  const updateOwnerMutation = useMutation({
    mutationFn: (ownerId: string | undefined) => {
      if (!activeLead) throw new Error('No lead selected');
      return updateLead(activeLead.id, { ownerId });
    },
    onSuccess: (updated) => {
      setOwnerMenuOpen(false);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', activeLead?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', activeLead?.id] });
      if (activeLead) {
        activeLead.ownerId = updated.ownerId;
        activeLead.owner = updated.owner;
      }
      toast.success('Lead owner updated');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update owner');
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: (payload: { email?: string; phone?: string }) => {
      if (!activeLead) throw new Error('No lead selected');
      return updateLead(activeLead.id, payload);
    },
    onSuccess: (updated) => {
      setEditingField(null);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', activeLead?.id] });
      if (activeLead) {
        activeLead.email = updated.email;
        activeLead.phone = updated.phone;
      }
      toast.success('Lead updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update lead');
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
      toast.error(err?.message || 'Failed to add note');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) => {
      if (!activeLead) throw new Error('No lead selected');
      return updateLeadNote(activeLead.id, noteId, content);
    },
    onSuccess: () => {
      setEditingNoteId(null);
      setEditingNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['lead-notes', activeLead?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['lead-notes', activeLead?.id] });
      toast.success('Note deleted');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete note');
    },
  });

  const handleStartFieldEdit = (field: 'email' | 'phone') => {
    setEditingField(field);
    setFieldValue(field === 'email' ? activeLead?.email || '' : activeLead?.phone || '');
  };

  const handleSaveField = () => {
    if (!editingField || !activeLead) return;
    if (editingField === 'email') {
      if (!fieldValue.trim()) {
        toast.error('Email cannot be empty');
        return;
      }
      updateContactMutation.mutate({ email: fieldValue.trim() });
    } else {
      updateContactMutation.mutate({ phone: fieldValue.trim() });
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || createNoteMutation.isPending) return;
    createNoteMutation.mutate(newNoteContent.trim());
  };

  // Group activities for audit log timeline (grouped by date string)
  const auditLogsByDate = React.useMemo(() => {
    const groups: Record<string, LeadActivity[]> = {};
    (activities || []).forEach((act) => {
      const header = formatDateHeader(act.createdAt);
      if (!groups[header]) groups[header] = [];
      groups[header].push(act);
    });
    return groups;
  }, [activities]);

  const callCount = React.useMemo(() => {
    return (activities || []).filter(
      (a) => a.type.includes('CALL') || a.type.includes('FOLLOW_UP') || a.description.toLowerCase().includes('call')
    ).length || 1;
  }, [activities]);

  // Filtered lists for "View All" dedicated pages
  const viewAllFilteredActivities = React.useMemo(() => {
    return (activities || []).filter((act) => {
      const q = viewAllSearch.toLowerCase();
      const matchesSearch =
        !q ||
        act.description?.toLowerCase().includes(q) ||
        act.type?.toLowerCase().includes(q) ||
        `${act.user?.firstName} ${act.user?.lastName}`.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (viewAllFilter === 'status') return act.type === 'STATUS_CHANGED';
      if (viewAllFilter === 'owner') return act.type === 'OWNER_ASSIGNED';
      if (viewAllFilter === 'notes') return act.type === 'NOTE_ADDED';
      return true;
    });
  }, [activities, viewAllSearch, viewAllFilter]);

  const viewAllFilteredNotes = React.useMemo(() => {
    return (notes || []).filter((note) => {
      const q = viewAllSearch.toLowerCase();
      return (
        !q ||
        note.content?.toLowerCase().includes(q) ||
        `${note.user?.firstName} ${note.user?.lastName}`.toLowerCase().includes(q)
      );
    });
  }, [notes, viewAllSearch]);

  if (!open && !lead) return null;
  if (!activeLead) return null;

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
        className={`fixed inset-y-0 right-0 z-50 flex w-full sm:w-[540px] md:w-[620px] lg:w-[680px] xl:w-[740px] bg-white shadow-2xl border-l border-crm-border flex-col h-full transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Lead Details Panel"
      >
        {/* ========================================================================= */}
        {/* CASE A: DEDICATED FULL "VIEW ALL" SUB-VIEW (WITH PROPER BACK BUTTON) */}
        {/* ========================================================================= */}
        {viewMode !== 'overview' ? (
          <div className="flex flex-col h-full overflow-hidden bg-white">
            {/* View All Sticky Header */}
            <div className="px-5 py-4 border-b border-crm-border bg-[#F8FAFC] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('overview')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:text-crm-teal hover:border-crm-teal transition-all shadow-xs cursor-pointer"
                  title="Back to Overview"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Lead</span>
                </button>
                <div className="h-4 w-px bg-slate-200" />
                <h2 className="text-base font-bold text-slate-900">
                  {viewMode === 'all-activities' && `All Activities (${activities.length})`}
                  {viewMode === 'all-notes' && `All Notes (${notes.length})`}
                  {viewMode === 'all-audit-logs' && `Complete Audit Logs (${activities.length})`}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                title="Close Panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* View All Search & Filter Bar */}
            <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center gap-3 shrink-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search historical entries..."
                  value={viewAllSearch}
                  onChange={(e) => setViewAllSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-crm-teal"
                />
              </div>

              {viewMode !== 'all-notes' && (
                <select
                  value={viewAllFilter}
                  onChange={(e) => setViewAllFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-crm-teal"
                >
                  <option value="all">All Events</option>
                  <option value="status">Status Changes</option>
                  <option value="owner">Assignments</option>
                  <option value="notes">Notes</option>
                </select>
              )}
            </div>

            {/* View All Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* SUBVIEW 1: ALL ACTIVITIES */}
              {viewMode === 'all-activities' && (
                <div className="space-y-2.5">
                  {viewAllFilteredActivities.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No activities match your search.
                    </div>
                  ) : (
                    viewAllFilteredActivities.map((act, idx) => (
                      <div
                        key={act.id}
                        className="flex items-start justify-between gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex items-center justify-center h-6 w-6 rounded bg-sky-100 text-sky-700 text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {act.type.replace(/_/g, ' ')}
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              {act.description}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                              <span>{formatDateTime(act.createdAt)}</span>
                              {act.user && (
                                <span>by {act.user.firstName} {act.user.lastName}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SUBVIEW 2: ALL NOTES */}
              {viewMode === 'all-notes' && (
                <div className="space-y-4">
                  {/* Quick Add Form in View All */}
                  <form onSubmit={handleAddNote} className="space-y-2 p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC]">
                    <div className="text-xs font-semibold text-slate-800">Add a new note</div>
                    <textarea
                      rows={2}
                      placeholder="Write your note or comment here..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-crm-teal"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        isLoading={createNoteMutation.isPending}
                        disabled={!newNoteContent.trim()}
                        className="bg-crm-teal hover:bg-[#13A6AC] text-[#071A1D] font-semibold text-xs"
                      >
                        Save Note
                      </Button>
                    </div>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {viewAllFilteredNotes.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        No notes recorded for this lead yet.
                      </div>
                    ) : (
                      viewAllFilteredNotes.map((note) => (
                        <div key={note.id} className="p-4 rounded-lg border border-slate-200 bg-white shadow-xs space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold text-slate-800">
                              {note.user ? `${note.user.firstName} ${note.user.lastName}` : 'System User'}
                            </span>
                            <span>{formatDateTime(note.createdAt)}</span>
                          </div>

                          {editingNoteId === note.id ? (
                            <div className="space-y-2">
                              <textarea
                                rows={2}
                                value={editingNoteContent}
                                onChange={(e) => setEditingNoteContent(e.target.value)}
                                className="w-full rounded border border-slate-300 p-2 text-xs"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateNoteMutation.mutate({ noteId: note.id, content: editingNoteContent })}
                                  isLoading={updateNoteMutation.isPending}
                                  className="bg-crm-teal text-slate-900"
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {note.content}
                            </p>
                          )}

                          {canEditOrDeleteNotes && editingNoteId !== note.id && (
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                              <button
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditingNoteContent(note.content);
                                }}
                                className="text-[11px] text-slate-500 hover:text-crm-teal flex items-center gap-1"
                              >
                                <Edit2 className="h-3 w-3" /> Edit
                              </button>
                              <button
                                onClick={() => deleteNoteMutation.mutate(note.id)}
                                className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SUBVIEW 3: ALL AUDIT LOGS */}
              {viewMode === 'all-audit-logs' && (
                <div className="space-y-6">
                  {Object.keys(auditLogsByDate).length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No audit history available.
                    </div>
                  ) : (
                    Object.entries(auditLogsByDate).map(([dateHeader, acts]) => (
                      <div key={dateHeader} className="space-y-3">
                        <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded w-fit">
                          {dateHeader}
                        </div>
                        <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                          {acts.map((act) => (
                            <div key={act.id} className="relative">
                              <span className="absolute -left-[19px] top-3.5 h-2 w-2 rounded-full bg-crm-teal ring-4 ring-white" />
                              <div className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1">
                                <div className="font-semibold text-slate-800">
                                  {act.user ? `${act.user.firstName} ${act.user.lastName}, ` : ''}
                                  {act.description}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {formatDateTime(act.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* CASE B: DEFAULT STACKED PANEL (MATCHING SCREENSHOT 1:1) */
          /* ========================================================================= */
          <div className="flex flex-col h-full overflow-hidden bg-white">
            {/* Header: Lead Name + External Link + Status + Next/Prev + Close */}
            <div className="px-5 py-3.5 border-b border-crm-border bg-white flex items-center justify-between shrink-0 gap-3">
              {/* Left: Lead Full Name + External Link Icon with yellow dot */}
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-xl font-bold text-[#0D2D32] truncate">
                  {activeLead.firstName} {activeLead.lastName}
                </h1>
                <a
                  href={`/dashboard/leads?leadId=${activeLead.id}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open in new window"
                  className="inline-flex items-center text-crm-teal hover:opacity-80 transition-opacity"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="h-2 w-2 rounded-full bg-amber-400 inline-block -ml-1 -mt-2" />
                </a>
              </div>

              {/* Right: Status Pill Dropdown + [ < ] [ > ] + Close X */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Status Dropdown Pill */}
                <div className="relative" ref={statusMenuRef}>
                  <button
                    type="button"
                    onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                    disabled={updateStatusMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 shadow-xs hover:border-crm-teal cursor-pointer transition-colors"
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin text-crm-teal" />
                    ) : (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: activeLead.status?.color || '#94a3b8' }}
                      />
                    )}
                    <span>Status: {activeLead.status?.name || 'Unassigned'}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
                  </button>

                  {/* Status Dropdown Menu */}
                  {statusMenuOpen && (
                    <div className="absolute right-0 mt-1.5 z-50 w-52 rounded-lg border border-crm-border bg-white p-1.5 shadow-xl text-xs animate-in fade-in">
                      <div className="font-semibold text-slate-400 px-2 py-1 text-[10px] uppercase tracking-wider border-b border-slate-100 mb-1">
                        Select Lead Status
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

                {/* Next / Prev Grouped Buttons */}
                <div className="inline-flex rounded-lg border border-slate-300 bg-white shadow-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={onPrev}
                    disabled={!hasPrev}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous Lead (Prev)"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="w-px bg-slate-200" />
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!hasNext}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next Lead (Next)"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Close Button X */}
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Main Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* TOP INFO HIGHLIGHT BAR (Country, Email, Phone, Owner) */}
              <div className="bg-[#EAF3FA] border border-[#D3E8F5] rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Flag & Country Code */}
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <CountryFlag countryName={activeLead.countryName} isoCode={activeLead.country?.isoCode} />
                    <span>{activeLead.country?.isoCode || activeLead.countryName || 'CAN'}</span>
                  </div>

                  {/* Email with pencil */}
                  <div className="flex items-center gap-1">
                    {editingField === 'email' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="email"
                          value={fieldValue}
                          onChange={(e) => setFieldValue(e.target.value)}
                          className="h-6 px-1.5 rounded border border-crm-teal text-xs"
                          autoFocus
                        />
                        <button onClick={handleSaveField} className="text-emerald-600 hover:text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditingField(null)} className="text-slate-400 hover:text-slate-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <span>{activeLead.email}</span>
                        <button
                          onClick={() => handleStartFieldEdit('email')}
                          title="Edit email"
                          className="text-slate-400 hover:text-crm-teal p-0.5"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Phone with pencil */}
                  <div className="flex items-center gap-1">
                    {editingField === 'phone' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={fieldValue}
                          onChange={(e) => setFieldValue(e.target.value)}
                          className="h-6 px-1.5 rounded border border-crm-teal text-xs"
                          autoFocus
                        />
                        <button onClick={handleSaveField} className="text-emerald-600 hover:text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditingField(null)} className="text-slate-400 hover:text-slate-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <span>{activeLead.phone || 'No phone'}</span>
                        <button
                          onClick={() => handleStartFieldEdit('phone')}
                          title="Edit phone"
                          className="text-slate-400 hover:text-crm-teal p-0.5"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Owner with pencil & dropdown */}
                <div className="relative" ref={ownerMenuRef}>
                  <div
                    onClick={() => setOwnerMenuOpen(!ownerMenuOpen)}
                    className="bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded text-slate-800 font-medium flex items-center gap-1.5 cursor-pointer hover:border-crm-teal transition-colors"
                  >
                    <span>
                      Owner : {activeLead.owner ? `${activeLead.owner.firstName} ${activeLead.owner.lastName}` : 'Unassigned'}
                    </span>
                    <Edit2 className="h-3 w-3 text-slate-400" />
                  </div>

                  {ownerMenuOpen && (
                    <div className="absolute right-0 mt-1 z-50 w-56 rounded-lg border border-crm-border bg-white p-1.5 shadow-xl text-xs animate-in fade-in">
                      <div className="font-semibold text-slate-400 px-2 py-1 text-[10px] uppercase tracking-wider border-b border-slate-100 mb-1">
                        Reassign Lead Owner
                      </div>
                      <div className="max-h-52 overflow-y-auto space-y-0.5">
                        <button
                          type="button"
                          onClick={() => updateOwnerMutation.mutate(undefined)}
                          className="w-full px-2.5 py-1.5 rounded text-left text-slate-500 hover:bg-slate-50"
                        >
                          Unassign
                        </button>
                        {teamUsers.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => updateOwnerMutation.mutate(u.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left hover:bg-slate-50 ${
                              activeLead.ownerId === u.id ? 'bg-slate-100 font-semibold' : ''
                            }`}
                          >
                            <span>{u.firstName} {u.lastName}</span>
                            {activeLead.ownerId === u.id && <Check className="h-3.5 w-3.5 text-crm-teal" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* METADATA PROPERTY GRID (Lead Source, Type, Created On, Modified On, Call Count) */}
              <div className="space-y-2 py-1">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 font-medium">Lead Source</span>
                    <span className="text-slate-600">{activeLead.sourceName || 'Impact 2'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 font-medium">Type</span>
                    <span className="text-slate-600">Lead</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 font-medium">Created On</span>
                    <span className="text-slate-600">{formatDateTime(activeLead.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 font-medium">Modified On</span>
                    <span className="text-slate-600">{formatDateTime(activeLead.updatedAt)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 font-medium">Call Count</span>
                    <span className="text-slate-600">{callCount}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              {/* ========================================================================= */}
              {/* SECTION 1: ACTIVITIES */}
              {/* ========================================================================= */}
              <div className="rounded-lg border border-[#CFE1F1] overflow-hidden bg-white shadow-xs">
                {/* Header Bar */}
                <div className="bg-[#E2EDF7] px-4 py-2.5 flex items-center justify-between border-b border-[#CFE1F1]">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span>Activities</span>
                    <span className="text-slate-500">
                      <FileText className="h-3.5 w-3.5 text-crm-teal inline" />
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('all-activities');
                      setViewAllSearch('');
                      setViewAllFilter('all');
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-crm-teal transition-colors cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {/* Items */}
                <div className="p-3 space-y-2 bg-white">
                  {activities.length === 0 ? (
                    <div className="py-3 text-center text-xs text-slate-400">
                      No activities logged yet.
                    </div>
                  ) : (
                    activities.slice(0, 3).map((act, index) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-[#F8FAFC] border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center h-5 w-5 rounded bg-sky-100 text-sky-700 text-xs font-bold shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {act.type === 'STATUS_CHANGED'
                              ? (act.metadata as any)?.newStatus || 'Status Update'
                              : act.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDateTime(act.createdAt)}, by {act.user ? `${act.user.firstName} ${act.user.lastName}` : 'System'}
                          </span>
                        </div>
                        {canEditOrDeleteNotes && (
                          <button
                            type="button"
                            title="Delete activity"
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION 2: NOTES */}
              {/* ========================================================================= */}
              <div className="rounded-lg border border-[#CFE1F1] overflow-hidden bg-white shadow-xs">
                {/* Header Bar */}
                <div className="bg-[#E2EDF7] px-4 py-2.5 flex items-center justify-between border-b border-[#CFE1F1]">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span>Notes</span>
                    <span className="text-slate-500">
                      <FileText className="h-3.5 w-3.5 text-crm-teal inline" />
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('all-notes');
                      setViewAllSearch('');
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-crm-teal transition-colors cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 bg-white space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-xs text-slate-500 py-1">
                      No data available
                    </div>
                  ) : (
                    notes.slice(0, 2).map((note) => (
                      <div key={note.id} className="p-2.5 rounded-md bg-[#F8FAFC] border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-700">
                            {note.user ? `${note.user.firstName} ${note.user.lastName}` : 'System'}
                          </span>
                          <span>{formatDateTime(note.createdAt)}</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))
                  )}

                  {/* Quick Add Note Form */}
                  <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add a quick note..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-crm-teal"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={createNoteMutation.isPending}
                      disabled={!newNoteContent.trim()}
                      className="bg-crm-teal hover:bg-[#13A6AC] text-[#071A1D] font-semibold text-xs h-8 px-3"
                    >
                      <Send className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </form>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION 3: AUDIT LOGS */}
              {/* ========================================================================= */}
              <div className="rounded-lg border border-[#CFE1F1] overflow-hidden bg-white shadow-xs">
                {/* Header Bar */}
                <div className="bg-[#E2EDF7] px-4 py-2.5 flex items-center justify-between border-b border-[#CFE1F1]">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span>Audit Logs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('all-audit-logs');
                      setViewAllSearch('');
                      setViewAllFilter('all');
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-crm-teal transition-colors cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {/* Timeline Content */}
                <div className="p-4 bg-white space-y-4">
                  {Object.keys(auditLogsByDate).length === 0 ? (
                    <div className="text-xs text-slate-500 py-1">
                      No audit logs recorded yet.
                    </div>
                  ) : (
                    Object.entries(auditLogsByDate).slice(0, 2).map(([dateHeader, acts]) => (
                      <div key={dateHeader} className="space-y-3">
                        <div className="text-xs font-semibold text-slate-800">
                          {dateHeader}
                        </div>
                        {/* Vertical line with timeline nodes */}
                        <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
                          {acts.slice(0, 4).map((act) => (
                            <div key={act.id} className="relative">
                              <span className="absolute -left-[17px] top-3 h-2.5 w-2.5 rounded-full bg-[#0D2D32] ring-4 ring-white" />
                              <div className="p-3 rounded-lg border border-slate-100 bg-[#F8FAFC] text-xs">
                                <div className="font-semibold text-slate-800">
                                  {act.user ? `${act.user.firstName} ${act.user.lastName}, ` : ''}
                                  {act.description}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {formatDateTime(act.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
