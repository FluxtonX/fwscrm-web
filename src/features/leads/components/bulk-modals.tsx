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
  fetchUsers,
  UserItem,
} from '../api';
import { LeadStatus } from '../types';
import { useToast } from '@/components/ui/toast';
import { AlertTriangle, Tag } from 'lucide-react';

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
