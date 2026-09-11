'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  Plus,
  Shield,
  Search,
  CheckCircle2,
  Mail,
  UserPlus,
  RefreshCw,
  MoreVertical,
  ShieldCheck,
  AlertCircle,
  Send,
  XCircle,
  RotateCcw,
  Clock,
  UserX,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth/auth-context';
import { usePermissions } from '@/features/auth/use-permissions';
import {
  fetchUsers,
  fetchInvitations,
  inviteUser,
  resendInvitation,
  revokeInvitation,
  updateUserRole,
  updateUserStatus,
} from '@/features/users/api';
import { UserItem, UserRole, InvitationItem } from '@/features/users/types';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function UsersPage() {
  const { user: currentUser, organization } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeTab, setActiveTab] = React.useState<'members' | 'invitations'>('members');
  const [search, setSearch] = React.useState('');

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<UserRole>('OPERATOR');
  const [isInviting, setIsInviting] = React.useState(false);

  // Invite Success Modal State (displays activation URL)
  const [successUrlModalOpen, setSuccessUrlModalOpen] = React.useState(false);
  const [generatedActivationUrl, setGeneratedActivationUrl] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  // Role Change Modal State
  const [roleModalOpen, setRoleModalOpen] = React.useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = React.useState<UserItem | null>(null);
  const [newRole, setNewRole] = React.useState<UserRole>('OPERATOR');
  const [isUpdatingRole, setIsUpdatingRole] = React.useState(false);

  // Status Confirmation Modal State
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [selectedUserForStatus, setSelectedUserForStatus] = React.useState<UserItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  // Revoke Confirmation Modal State
  const [revokeModalOpen, setRevokeModalOpen] = React.useState(false);
  const [selectedInvitationForRevoke, setSelectedInvitationForRevoke] = React.useState<InvitationItem | null>(null);
  const [isRevoking, setIsRevoking] = React.useState(false);

  // Queries
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['org-users-list'],
    queryFn: fetchUsers,
    staleTime: 1000 * 30,
  });

  const {
    data: invitations = [],
    isLoading: isLoadingInvitations,
    isFetching: isFetchingInvitations,
    refetch: refetchInvitations,
  } = useQuery({
    queryKey: ['org-invitations-list'],
    queryFn: fetchInvitations,
    staleTime: 1000 * 30,
    enabled: isSuperAdmin,
  });

  const filteredUsers = React.useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, search]);

  const filteredInvitations = React.useMemo(() => {
    if (!search.trim()) return invitations;
    const q = search.toLowerCase();
    return invitations.filter(
      (inv) =>
        inv.email.toLowerCase().includes(q) ||
        inv.role.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q),
    );
  }, [invitations, search]);

  // Handlers
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Please provide an email address');
      return;
    }

    setIsInviting(true);
    try {
      const result = await inviteUser({
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      toast.success(`Invitation dispatched to ${inviteEmail}!`);
      queryClient.invalidateQueries({ queryKey: ['org-invitations-list'] });
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('OPERATOR');

      if (result.activationUrl) {
        setGeneratedActivationUrl(result.activationUrl);
        setSuccessUrlModalOpen(true);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispatch invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleResend = async (invitationId: string, email: string) => {
    try {
      const result = await resendInvitation(invitationId);
      toast.success(`Invitation resent to ${email}!`);
      queryClient.invalidateQueries({ queryKey: ['org-invitations-list'] });

      if (result.activationUrl) {
        setGeneratedActivationUrl(result.activationUrl);
        setSuccessUrlModalOpen(true);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend invitation');
    }
  };

  const handleRevokeConfirm = async () => {
    if (!selectedInvitationForRevoke) return;
    setIsRevoking(true);
    try {
      await revokeInvitation(selectedInvitationForRevoke.id);
      toast.success(`Invitation for ${selectedInvitationForRevoke.email} has been revoked.`);
      queryClient.invalidateQueries({ queryKey: ['org-invitations-list'] });
      setRevokeModalOpen(false);
      setSelectedInvitationForRevoke(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke invitation');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRoleChangeConfirm = async () => {
    if (!selectedUserForRole) return;
    setIsUpdatingRole(true);
    try {
      await updateUserRole(selectedUserForRole.id, newRole);
      toast.success(`Updated role for ${selectedUserForRole.email} to ${newRole}.`);
      queryClient.invalidateQueries({ queryKey: ['org-users-list'] });
      setRoleModalOpen(false);
      setSelectedUserForRole(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change user role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleStatusToggleConfirm = async () => {
    if (!selectedUserForStatus) return;
    setIsUpdatingStatus(true);
    try {
      const targetState = !selectedUserForStatus.isActive;
      await updateUserStatus(selectedUserForStatus.id, targetState);
      toast.success(
        `Account for ${selectedUserForStatus.email} is now ${targetState ? 'Active' : 'Deactivated'}.`,
      );
      queryClient.invalidateQueries({ queryKey: ['org-users-list'] });
      setStatusModalOpen(false);
      setSelectedUserForStatus(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update user status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return (
          <Badge variant="teal" className="text-[10px] font-semibold tracking-wider">
            SUPER ADMIN
          </Badge>
        );
      case 'MANAGER':
        return (
          <Badge variant="blue" className="text-[10px] font-semibold tracking-wider">
            MANAGER
          </Badge>
        );
      case 'OPERATOR':
      case 'AGENT':
        return (
          <Badge variant="default" className="text-[10px] font-semibold tracking-wider bg-slate-100 text-slate-700 border-slate-200">
            OPERATOR
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="text-[10px] text-slate-500">
            {r}
          </Badge>
        );
    }
  };

  const getInvitationStatusBadge = (status: string) => {
    switch (status) {
      case 'INVITED':
        return (
          <Badge variant="outline" className="text-[10px] font-semibold text-amber-700 border-amber-300 bg-amber-50">
            Pending
          </Badge>
        );
      case 'ACCEPTED':
        return (
          <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 border-emerald-300 bg-emerald-50">
            Accepted
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 border-slate-300 bg-slate-100">
            Expired
          </Badge>
        );
      case 'REVOKED':
        return (
          <Badge variant="outline" className="text-[10px] font-semibold text-rose-700 border-rose-300 bg-rose-50">
            Revoked
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-crm-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-50 p-2.5 text-crm-teal">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-crm-header">
              Team & Role Management
            </h1>
            <p className="text-xs text-crm-muted">
              Manage workspace members, assign RBAC permissions, and dispatch secure invitations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchUsers();
              if (isSuperAdmin) refetchInvitations();
            }}
            disabled={isFetchingUsers || isFetchingInvitations}
            className="flex items-center gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetchingUsers || isFetchingInvitations ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          {isSuperAdmin && (
            <Button
              size="sm"
              onClick={() => setInviteModalOpen(true)}
              className="bg-crm-teal hover:bg-crm-teal-hover text-white flex items-center gap-1.5 text-xs shadow-sm font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite Member
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'members'
                ? 'border-crm-teal text-crm-teal'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Active Members ({users.length})</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('invitations')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'invitations'
                  ? 'border-crm-teal text-crm-teal'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Pending Invitations ({invitations.filter((i) => i.status === 'INVITED').length})</span>
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-crm-muted" />
          <Input
            placeholder={activeTab === 'members' ? 'Search members...' : 'Search invitations...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-white"
          />
        </div>
      </div>

      {/* Active Members Table Tab */}
      {activeTab === 'members' && (
        <div className="rounded-xl border border-crm-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-crm-text">
              <thead className="border-b border-crm-border bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-crm-muted">
                <tr>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Email Address</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Joined Date</th>
                  {isSuperAdmin && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 6 : 5} className="py-12 text-center text-crm-muted">
                      Loading team members...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 6 : 5} className="py-12 text-center text-crm-muted">
                      No members match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-[11px]">
                              {u.firstName?.[0] || 'U'}
                              {u.lastName?.[0] || ''}
                            </div>
                            <div>
                              <div className="font-semibold text-crm-header flex items-center gap-1.5">
                                <span>
                                  {u.firstName} {u.lastName}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono text-[11px]">
                          {u.email}
                        </td>
                        <td className="px-5 py-3.5">{getRoleBadge(u.role)}</td>
                        <td className="px-5 py-3.5">
                          {u.isActive ? (
                            <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 bg-slate-50">
                              Deactivated
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        {isSuperAdmin && (
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserForRole(u);
                                  setNewRole(u.role);
                                  setRoleModalOpen(true);
                                }}
                                className="h-7 text-[11px] px-2 text-slate-600 hover:text-crm-teal"
                              >
                                Role
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isSelf}
                                onClick={() => {
                                  setSelectedUserForStatus(u);
                                  setStatusModalOpen(true);
                                }}
                                className={`h-7 text-[11px] px-2 ${
                                  u.isActive
                                    ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                                    : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                {u.isActive ? 'Deactivate' : 'Reactivate'}
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Invitations Table Tab */}
      {activeTab === 'invitations' && isSuperAdmin && (
        <div className="rounded-xl border border-crm-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-crm-text">
              <thead className="border-b border-crm-border bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-crm-muted">
                <tr>
                  <th className="px-5 py-3">Invited Email</th>
                  <th className="px-5 py-3">Role Designation</th>
                  <th className="px-5 py-3">Invitation Status</th>
                  <th className="px-5 py-3">Sent At</th>
                  <th className="px-5 py-3">Expires At</th>
                  <th className="px-5 py-3">Invited By</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingInvitations ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-crm-muted">
                      Loading invitations...
                    </td>
                  </tr>
                ) : filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-crm-muted">
                      No invitations found. Use the &quot;Invite Member&quot; button to invite colleagues.
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map((inv) => {
                    const isPending = inv.status === 'INVITED';
                    const isExpired = inv.status === 'EXPIRED';

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-slate-800">
                          {inv.email}
                        </td>
                        <td className="px-5 py-3.5">{getRoleBadge(inv.role)}</td>
                        <td className="px-5 py-3.5">{getInvitationStatusBadge(inv.status)}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                          {new Date(inv.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                          {new Date(inv.expiresAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-[11px]">
                          {inv.invitedBy?.firstName} {inv.invitedBy?.lastName}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(isPending || isExpired) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResend(inv.id, inv.email)}
                                className="h-7 text-[11px] px-2 text-crm-teal hover:bg-teal-50"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Resend
                              </Button>
                            )}

                            {isPending && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvitationForRevoke(inv);
                                  setRevokeModalOpen(true);
                                }}
                                className="h-7 text-[11px] px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Revoke
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Explanation Cards */}
      <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-crm-muted">
          Workspace Role & Permission Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-teal-100 p-3.5 bg-teal-50/40 space-y-1.5">
            <div className="font-bold text-crm-teal flex items-center gap-1.5 text-xs">
              <ShieldCheck className="h-4 w-4 text-crm-teal" />
              SUPER_ADMIN
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Unrestricted administrative authority: invite members, assign roles, deactivate users, manage pipeline settings, audit logs, and manage all leads.
            </p>
          </div>

          <div className="rounded-lg border border-blue-100 p-3.5 bg-blue-50/40 space-y-1.5">
            <div className="font-bold text-blue-700 flex items-center gap-1.5 text-xs">
              <Shield className="h-4 w-4 text-blue-600" />
              MANAGER
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Lead management: view all organization leads, create & edit leads, assign owners, trigger CSV/XLSX imports, export data, and inspect pipeline analytics.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50/50 space-y-1.5">
            <div className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
              <UserCheck className="h-4 w-4 text-slate-500" />
              OPERATOR
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Frontline operational execution: inspect all organization leads, view contact information, log activities, and perform approved communication tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <div>
          <DialogHeader onClose={() => setInviteModalOpen(false)}>
            <div>
              <DialogTitle>Invite Team Member</DialogTitle>
              <p className="text-xs text-crm-muted mt-1">
                An invitation email with a single-use secure activation token will be dispatched.
              </p>
            </div>
          </DialogHeader>

          <form onSubmit={handleInviteSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Recipient Email</label>
              <Input
                required
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Role Designation</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-crm-teal"
              >
                <option value="OPERATOR">Operator (Views all leads & frontline operational access)</option>
                <option value="MANAGER">Manager (Full lead editing, imports & owner assignment)</option>
                <option value="SUPER_ADMIN">Super Admin (Full administrative authority)</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isInviting}
                className="bg-crm-teal hover:bg-crm-teal-hover text-white"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Dispatch Invitation
              </Button>
            </DialogFooter>
          </form>
        </div>
      </Dialog>

      {/* Activation URL Modal (Dev Helper & Confirmation) */}
      <Dialog open={successUrlModalOpen} onOpenChange={setSuccessUrlModalOpen}>
        <div className="space-y-4 py-2">
          <DialogHeader onClose={() => setSuccessUrlModalOpen(false)}>
            <div>
              <DialogTitle className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                Invitation Dispatched Successfully
              </DialogTitle>
              <p className="text-xs text-crm-muted mt-1">
                The invitation was recorded and email delivery triggered. You can also copy the direct activation link below:
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px] break-all text-slate-700 select-all">
              {generatedActivationUrl}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generatedActivationUrl)}
              className="w-full text-xs flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Activation Link</span>
                </>
              )}
            </Button>
          </div>

          <DialogFooter className="pt-2">
            <Button
              size="sm"
              onClick={() => setSuccessUrlModalOpen(false)}
              className="bg-crm-teal hover:bg-crm-teal-hover text-white text-xs w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Role Change Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <div className="space-y-4 py-2">
          <DialogHeader onClose={() => setRoleModalOpen(false)}>
            <div>
              <DialogTitle>Change Role Designation</DialogTitle>
              <p className="text-xs text-crm-muted mt-1">
                Adjust access permissions for <strong>{selectedUserForRole?.email}</strong>.
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Select New Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-crm-teal"
            >
              <option value="OPERATOR">Operator (Operational frontline)</option>
              <option value="MANAGER">Manager (Management operations)</option>
              <option value="SUPER_ADMIN">Super Admin (Full administrative power)</option>
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRoleChangeConfirm}
              isLoading={isUpdatingRole}
              className="bg-crm-teal hover:bg-crm-teal-hover text-white"
            >
              Confirm Role Change
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Deactivate/Reactivate Confirmation Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <div className="space-y-4 py-2">
          <DialogHeader onClose={() => setStatusModalOpen(false)}>
            <div>
              <DialogTitle>
                {selectedUserForStatus?.isActive ? 'Deactivate Member?' : 'Reactivate Member?'}
              </DialogTitle>
              <p className="text-xs text-crm-muted mt-1">
                {selectedUserForStatus?.isActive
                  ? `Are you sure you want to deactivate ${selectedUserForStatus?.firstName} ${selectedUserForStatus?.lastName} (${selectedUserForStatus?.email})? Their active sessions will immediately be terminated.`
                  : `Are you sure you want to reactivate access for ${selectedUserForStatus?.firstName} ${selectedUserForStatus?.lastName}?`}
              </p>
            </div>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleStatusToggleConfirm}
              isLoading={isUpdatingStatus}
              className={
                selectedUserForStatus?.isActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
            >
              {selectedUserForStatus?.isActive ? 'Deactivate Account' : 'Reactivate Account'}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Revoke Invitation Modal */}
      <Dialog open={revokeModalOpen} onOpenChange={setRevokeModalOpen}>
        <div className="space-y-4 py-2">
          <DialogHeader onClose={() => setRevokeModalOpen(false)}>
            <div>
              <DialogTitle>Revoke Invitation?</DialogTitle>
              <p className="text-xs text-crm-muted mt-1">
                Are you sure you want to revoke the pending invitation for{' '}
                <strong>{selectedInvitationForRevoke?.email}</strong>? The invitation token will permanently be invalidated.
              </p>
            </div>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevokeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRevokeConfirm}
              isLoading={isRevoking}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Revoke Invitation
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
