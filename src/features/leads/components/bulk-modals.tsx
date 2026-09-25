'use client';

import * as React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  bulkUpdateStatus,
  bulkAssignLeads,
  bulkDeleteLeads,
  bulkTagLeads,
  bulkEditLeads,
  BulkEditPayload,
  fetchUsers,
  UserItem,
} from '../api';
import { LeadStatus } from '../types';
import { useToast } from '@/components/ui/toast';
import { AlertTriangle, Tag, SlidersHorizontal, Activity, UserCheck } from 'lucide-react';

interface BulkStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  statuses: LeadStatus[];
  onSuccess: () => void;
}

export function BulkStatusModal({
  open,
  onOpenChange,
  selectedIds,
  statuses,
  onSuccess,
}: BulkStatusModalProps) {
  const [statusId, setStatusId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  const handleUpdate = async () => {
    if (!statusId) return;
    setLoading(true);
    try {
      const res = await bulkUpdateStatus(selectedIds, statusId);
      toast.success(`Updated status for ${res.count} leads`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Update Status for {selectedIds.length} Leads</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 my-2">
        <label className="block text-xs font-medium text-crm-text">
          Select Target Status
        </label>
        <select
          value={statusId}
          onChange={(e) => setStatusId(e.target.value)}
          className="flex h-9 w-full rounded-md border border-crm-border bg-white px-3 py-1.5 text-xs text-crm-text shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-primary"
        >
          <option value="">Choose pipeline stage...</option>
          {statuses.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleUpdate} isLoading={loading} disabled={!statusId}>
          Apply Status
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: BulkDeleteDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await bulkDeleteLeads(selectedIds);
      toast.success(`Successfully deleted ${res.count} leads`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle className="text-rose-600 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          Confirm Bulk Deletion
        </DialogTitle>
      </DialogHeader>
      <p className="text-xs text-crm-muted my-2">
        Are you sure you want to permanently delete{' '}
        <span className="font-bold text-crm-text">{selectedIds.length}</span>{' '}
        selected leads? This action cannot be undone.
      </p>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleDelete} isLoading={loading}>
          Delete {selectedIds.length} Leads
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

interface BulkAssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export function BulkAssignModal({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: BulkAssignModalProps) {
  const [ownerId, setOwnerId] = React.useState('');
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      fetchUsers()
        .then((res) => setUsers(res))
        .catch((err) => toast.error(err?.message || 'Failed to load team members'))
        .finally(() => setLoadingUsers(false));
    }
  }, [open, toast]);

  const handleAssign = async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const res = await bulkAssignLeads(selectedIds, ownerId);
      toast.success(`Assigned ${res.count} leads to team member`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Assign {selectedIds.length} Leads to Team Member</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 my-2">
        <label className="block text-xs font-medium text-crm-text">
          Select Owner
        </label>
        {loadingUsers ? (
          <div className="text-xs text-crm-muted py-2">Loading team members...</div>
        ) : (
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-crm-border bg-white px-3 py-1.5 text-xs text-crm-text shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-primary"
          >
            <option value="">Choose team member...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.role}){u._count?.ownedLeads !== undefined ? ` • ${u._count.ownedLeads} leads` : ''}
              </option>
            ))}
          </select>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleAssign} isLoading={loading} disabled={!ownerId}>
          Assign Leads
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

interface BulkTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export function BulkTagModal({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: BulkTagModalProps) {
  const [tag, setTag] = React.useState('');
  const [action, setAction] = React.useState<'ADD' | 'REMOVE' | 'SET'>('ADD');
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  const handleApply = async () => {
    if (!tag.trim()) return;
    setLoading(true);
    try {
      const res = await bulkTagLeads(selectedIds, tag.trim(), action);
      const actionLabel = action === 'ADD' ? 'Added tag to' : action === 'REMOVE' ? 'Removed tag from' : 'Set tag for';
      toast.success(`${actionLabel} ${res.count} leads`);
      setTag('');
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update tags');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-crm-teal" />
          Bulk Tag {selectedIds.length} Leads
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 my-2 text-xs">
        <div>
          <label className="block font-medium text-crm-text mb-1">
            Tag Name
          </label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. VIP, Hot Lead, Follow-up"
            className="flex h-9 w-full rounded-md border border-crm-border bg-white px-3 py-1.5 text-xs text-crm-text shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-primary"
          />
        </div>

        <div>
          <label className="block font-medium text-crm-text mb-1">
            Tag Action
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAction('ADD')}
              className={`px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
                action === 'ADD'
                  ? 'bg-crm-teal/10 border-crm-teal text-crm-teal'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Add Tag
            </button>
            <button
              type="button"
              onClick={() => setAction('REMOVE')}
              className={`px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
                action === 'REMOVE'
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Remove Tag
            </button>
            <button
              type="button"
              onClick={() => setAction('SET')}
              className={`px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
                action === 'SET'
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Replace Tag
            </button>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleApply} isLoading={loading} disabled={!tag.trim()}>
          Apply Tags
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export interface BulkEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  statuses: LeadStatus[];
  onSuccess: (keepSelection?: boolean) => void;
}

export function BulkEditModal({
  open,
  onOpenChange,
  selectedIds,
  statuses,
  onSuccess,
}: BulkEditModalProps) {
  const [statusId, setStatusId] = React.useState('');
  const [ownerId, setOwnerId] = React.useState('');
  const [tag, setTag] = React.useState('');
  const [tagAction, setTagAction] = React.useState<'ADD' | 'REMOVE' | 'SET'>('ADD');
  const [keepSelection, setKeepSelection] = React.useState(true);
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      fetchUsers()
        .then((res) => setUsers(res))
        .catch((err) => toast.error(err?.message || 'Failed to load team members'))
        .finally(() => setLoadingUsers(false));
    } else {
      setStatusId('');
      setOwnerId('');
      setTag('');
      setTagAction('ADD');
    }
  }, [open, toast]);

  const hasStatusChange = Boolean(statusId);
  const hasOwnerChange = Boolean(ownerId);
  const hasTagChange = Boolean(tag.trim());
  const hasAnyChange = hasStatusChange || hasOwnerChange || hasTagChange;

  const handleApply = async () => {
    if (!hasAnyChange) return;
    setLoading(true);
    try {
      const payload: BulkEditPayload = {
        leadIds: selectedIds,
        ...(hasStatusChange ? { statusId } : {}),
        ...(hasOwnerChange ? { ownerId } : {}),
        ...(hasTagChange ? { tag: tag.trim(), tagAction } : {}),
      };

      const res = await bulkEditLeads(payload);
      const changesCount = [hasStatusChange, hasOwnerChange, hasTagChange].filter(Boolean).length;
      toast.success(
        `Updated ${changesCount} attribute${changesCount > 1 ? 's' : ''} across ${res.count} leads`,
      );
      onOpenChange(false);
      onSuccess(keepSelection);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to apply bulk edit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle className="flex items-center gap-2 text-crm-text text-base">
          <SlidersHorizontal className="h-4 w-4 text-[#16C1C8]" />
          <span>Bulk Edit Leads</span>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 my-2 text-xs">
        {/* Minimalist selection counter */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-crm-border text-crm-muted">
          <span>Editing multiple attributes simultaneously</span>
          <span className="font-semibold text-crm-text">
            <span className="text-[#16C1C8]">{selectedIds.length}</span> leads selected
          </span>
        </div>

        {/* 1. Status Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-crm-text flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-crm-muted" />
              Pipeline Status
            </label>
            {hasStatusChange && (
              <span className="text-[10px] font-semibold text-crm-teal bg-crm-teal/10 px-1.5 py-0.5 rounded">
                Will update
              </span>
            )}
          </div>
          <select
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-crm-border bg-white px-3 py-1.5 text-xs text-crm-text shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-primary"
          >
            <option value="">— Keep current status (No change) —</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Assign Owner Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-crm-text flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-crm-muted" />
              Assign Owner
            </label>
            {hasOwnerChange && (
              <span className="text-[10px] font-semibold text-crm-teal bg-crm-teal/10 px-1.5 py-0.5 rounded">
                Will update
              </span>
            )}
          </div>
          {loadingUsers ? (
            <div className="h-9 flex items-center px-3 text-xs text-crm-muted bg-slate-50 rounded-md border border-crm-border">
              Loading team members...
            </div>
          ) : (
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-crm-border bg-white px-3 py-1.5 text-xs text-crm-text shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-primary"
            >
              <option value="">— Keep current owner (No change) —</option>
              <option value="unassigned">Unassigned (Remove owner)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.role}){u._count?.ownedLeads !== undefined ? ` • ${u._count.ownedLeads} leads` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 3. Tag Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-crm-text flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-crm-muted" />
              Tags
            </label>
            {hasTagChange && (
              <span className="text-[10px] font-semibold text-crm-teal bg-crm-teal/10 px-1.5 py-0.5 rounded">
                {tagAction === 'ADD' ? '+ Add tag' : tagAction === 'REMOVE' ? '- Remove tag' : 'Replace tag'}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Enter tag (leave empty for no change)..."
              className="flex h-9 w-full rounded-md border border-crm-border bg-white px-3 py-1.5 text-xs text-crm-text shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-primary"
            />
            {hasTagChange && (
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTagAction('ADD')}
                  className={`px-2 py-1.5 text-xs rounded border font-medium transition-colors ${
                    tagAction === 'ADD'
                      ? 'bg-crm-teal/10 border-crm-teal text-crm-teal font-semibold'
                      : 'border-crm-border text-crm-muted hover:bg-slate-50'
                  }`}
                >
                  + Add Tag
                </button>
                <button
                  type="button"
                  onClick={() => setTagAction('REMOVE')}
                  className={`px-2 py-1.5 text-xs rounded border font-medium transition-colors ${
                    tagAction === 'REMOVE'
                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold'
                      : 'border-crm-border text-crm-muted hover:bg-slate-50'
                  }`}
                >
                  - Remove Tag
                </button>
                <button
                  type="button"
                  onClick={() => setTagAction('SET')}
                  className={`px-2 py-1.5 text-xs rounded border font-medium transition-colors ${
                    tagAction === 'SET'
                      ? 'bg-amber-50 border-amber-300 text-amber-700 font-semibold'
                      : 'border-crm-border text-crm-muted hover:bg-slate-50'
                  }`}
                >
                  Replace All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Change Preview Summary Pill */}
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-[#F0F6F6] border border-[#16C1C8]/20">
          <span className="text-slate-600">
            {hasAnyChange
              ? `Action: ${[
                  hasStatusChange && 'Update Status',
                  hasOwnerChange && 'Assign Owner',
                  hasTagChange && 'Update Tags',
                ]
                  .filter(Boolean)
                  .join(' + ')}`
              : 'Select at least one attribute to update'}
          </span>
          {hasAnyChange && (
            <span className="font-semibold text-crm-teal">Ready to apply</span>
          )}
        </div>
      </div>

      <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2">
        <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-crm-muted hover:text-crm-text">
          <input
            type="checkbox"
            checked={keepSelection}
            onChange={(e) => setKeepSelection(e.target.checked)}
            className="rounded border-crm-border text-crm-teal focus:ring-crm-teal h-3.5 w-3.5 accent-[#16C1C8]"
          />
          <span>Keep selected</span>
        </label>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            isLoading={loading}
            disabled={!hasAnyChange}
            className="bg-[#16C1C8] hover:bg-[#16C1C8]/90 text-[#071A1D] font-semibold"
          >
            Apply to {selectedIds.length} Leads
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
