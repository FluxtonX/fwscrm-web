'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  Plus,
  Shield,
  Search,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth/auth-context';
import { usePermissions } from '@/features/auth/use-permissions';
import {
  fetchUsers,
  createMember,
  updateUserRole,
  updateUserStatus,
} from '@/features/users/api';
import { UserItem, UserRole } from '@/features/users/types';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = React.useState('');

  // Add Member Modal State
  const [addMemberModalOpen, setAddMemberModalOpen] = React.useState(false);
  const [memberEmail, setMemberEmail] = React.useState('');
  const [memberPassword, setMemberPassword] = React.useState('');
  const [memberConfirmPassword, setMemberConfirmPassword] = React.useState('');
  const [memberRole, setMemberRole] = React.useState<'MANAGER' | 'OPERATOR'>('OPERATOR');
  const [memberFirstName, setMemberFirstName] = React.useState('');
  const [memberLastName, setMemberLastName] = React.useState('');
  const [isCreatingMember, setIsCreatingMember] = React.useState(false);
  const [createMemberError, setCreateMemberError] = React.useState<string | null>(null);

  // Role Change Modal State
  const [roleModalOpen, setRoleModalOpen] = React.useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = React.useState<UserItem | null>(null);
  const [newRole, setNewRole] = React.useState<UserRole>('OPERATOR');
  const [isUpdatingRole, setIsUpdatingRole] = React.useState(false);

  // Status Confirmation Modal State
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [selectedUserForStatus, setSelectedUserForStatus] = React.useState<UserItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

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

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMemberError(null);

    const emailTrimmed = memberEmail.trim();
    if (!emailTrimmed) {
      setCreateMemberError('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setCreateMemberError('Please enter a valid email address');
      return;
    }

    if (!memberPassword || memberPassword.length < 8) {
      setCreateMemberError('Password must be at least 8 characters long');
      return;
    }

    if (memberPassword !== memberConfirmPassword) {
      setCreateMemberError('Passwords do not match');
      return;
    }

    if (memberRole !== 'MANAGER' && memberRole !== 'OPERATOR') {
      setCreateMemberError('Role must be either Manager or Operator');
      return;
    }

    setIsCreatingMember(true);
    try {
      const created = await createMember({
        email: emailTrimmed,
        password: memberPassword,
        confirmPassword: memberConfirmPassword,
        role: memberRole,
        firstName: memberFirstName.trim() || undefined,
        lastName: memberLastName.trim() || undefined,
      });

      toast.success(`Account for ${created.email} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['org-users-list'] });

      // Reset form and close modal
      setAddMemberModalOpen(false);
      setMemberEmail('');
      setMemberPassword('');
      setMemberConfirmPassword('');
      setMemberRole('OPERATOR');
      setMemberFirstName('');
      setMemberLastName('');
      setCreateMemberError(null);
    } catch (err: any) {
      setCreateMemberError(err?.message || 'Failed to create team member account');
    } finally {
      setIsCreatingMember(false);
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
              Manage workspace members, assign RBAC roles, and create member accounts directly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchUsers()}
            disabled={isFetchingUsers}
            className="flex items-center gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetchingUsers ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          {isSuperAdmin && (
            <Button
              size="sm"
              onClick={() => {
                setCreateMemberError(null);
                setAddMemberModalOpen(true);
              }}
              className="bg-crm-teal hover:bg-crm-teal-hover text-white flex items-center gap-1.5 text-xs shadow-sm font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Search & Members summary bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 border-b border-slate-200">
          <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 border-crm-teal text-crm-teal">
            <UserCheck className="h-4 w-4" />
            <span>Active Members ({users.length})</span>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-crm-muted" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-white"
          />
        </div>
      </div>

      {/* Active Members Table */}
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
              Unrestricted administrative authority: create team members, assign roles, deactivate users, manage pipeline settings, audit logs, and manage all leads.
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

      {/* Add Member Modal (Super Admin Direct Creation) */}
      <Dialog open={addMemberModalOpen} onOpenChange={setAddMemberModalOpen}>
        <div className="space-y-4 py-1">
          <DialogHeader onClose={() => setAddMemberModalOpen(false)}>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>

          {createMemberError && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{createMemberError}</span>
            </div>
          )}

          <form onSubmit={handleAddMemberSubmit} className="space-y-3">
            {/* Role Selector: Minimal & Visually Clear */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMemberRole('OPERATOR')}
                  className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    memberRole === 'OPERATOR'
                      ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Operator
                </button>
                <button
                  type="button"
                  onClick={() => setMemberRole('MANAGER')}
                  className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    memberRole === 'MANAGER'
                      ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Manager
                </button>
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Email</label>
              <Input
                required
                type="email"
                placeholder="name@company.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                disabled={isCreatingMember}
                className="h-9 text-xs"
              />
            </div>

            {/* Names (compact 2 columns) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">First Name</label>
                <Input
                  placeholder="First name"
                  value={memberFirstName}
                  onChange={(e) => setMemberFirstName(e.target.value)}
                  disabled={isCreatingMember}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Last Name</label>
                <Input
                  placeholder="Last name"
                  value={memberLastName}
                  onChange={(e) => setMemberLastName(e.target.value)}
                  disabled={isCreatingMember}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Passwords (compact 2 columns with show/hide toggle) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <PasswordInput
                  required
                  placeholder="••••••••"
                  value={memberPassword}
                  onChange={(e) => setMemberPassword(e.target.value)}
                  disabled={isCreatingMember}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Confirm Password</label>
                <PasswordInput
                  required
                  placeholder="••••••••"
                  value={memberConfirmPassword}
                  onChange={(e) => setMemberConfirmPassword(e.target.value)}
                  disabled={isCreatingMember}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddMemberModalOpen(false)}
                disabled={isCreatingMember}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isCreatingMember}
                className="bg-crm-teal hover:bg-crm-teal-hover text-white h-9 text-xs px-4 font-semibold shadow-sm"
              >
                Add Member
              </Button>
            </DialogFooter>
          </form>
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
    </div>
  );
}
