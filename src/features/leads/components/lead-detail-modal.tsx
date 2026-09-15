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
import { Lead, LeadNote, LeadActivity } from '../types';
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
} from 'lucide-react';
import {
  fetchLeadNotes,
  fetchLeadActivities,
  createLeadNote,
  updateLeadNote,
  deleteLeadNote,
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
  const [activeTab, setActiveTab] = React.useState<'overview' | 'notes' | 'timeline'>('overview');
  const [newNoteContent, setNewNoteContent] = React.useState('');
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [editingContent, setEditingContent] = React.useState('');
  const [deletingNoteId, setDeletingNoteId] = React.useState<string | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Role permissions: Only Super Admin, Admin, and Manager may Edit or Delete notes.
  // Operator can View and Add notes, but MUST NOT edit or delete notes.
  const canEditOrDeleteNotes =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER';

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

  if (!lead) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
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
        <DialogTitle className="flex items-center gap-2">
          <span>
            {lead.firstName} {lead.lastName}
          </span>
          {lead.status && (
            <Badge
              variant="default"
              style={{
                backgroundColor: `${lead.status.color}20`,
                color: lead.status.color,
                borderColor: `${lead.status.color}40`,
              }}
            >
              {lead.status.name}
            </Badge>
          )}
        </DialogTitle>
      </DialogHeader>

      {/* Tabs */}
      <div className="flex border-b border-crm-border mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-crm-teal text-crm-teal'
              : 'border-transparent text-crm-muted hover:text-crm-text'
          }`}
        >
          Profile Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'border-crm-teal text-crm-teal'
              : 'border-transparent text-crm-muted hover:text-crm-text'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Notes ({notes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'border-crm-teal text-crm-teal'
              : 'border-transparent text-crm-muted hover:text-crm-text'
          }`}
        >
          <Clock className="h-3.5 w-3.5" /> Activity Timeline ({activities.length})
        </button>
      </div>

      {/* TAB 1: Profile Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4 text-xs">
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

      {/* TAB 2: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-3 text-xs">
          {/* Add Note Input */}
          <form onSubmit={handleAddNote} className="space-y-2">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add an internal note about this prospect..."
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
                No notes logged yet for this lead.
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

                        {/* Edit / Delete Buttons (Visible ONLY for Super Admin, Admin, Manager; Hidden for Operator) */}
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

      {/* TAB 3: Activity Timeline */}
      {activeTab === 'timeline' && (
        <div className="text-xs">
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
            {isLoadingActivities ? (
              <div className="py-6 text-center text-crm-muted">Loading activity timeline...</div>
            ) : activities.length === 0 ? (
              <div className="py-6 text-center text-crm-muted">
                No recorded activities yet.
              </div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 p-2.5 bg-slate-50/50"
                >
                  <div className="mt-0.5 rounded-md p-1 bg-white border border-slate-200 shadow-xs">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-crm-header line-clamp-1">
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
                    {act.user && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        By {act.user.firstName} {act.user.lastName} ({act.user.email})
                      </div>
                    )}
                  </div>
                </div>
              ))
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
