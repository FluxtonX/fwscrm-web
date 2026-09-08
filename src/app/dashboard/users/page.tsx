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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth/auth-context';
import { fetchUsers, createUser } from '@/features/users/api';
import { UserItem, UserRole } from '@/features/users/types';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function UsersPage() {
  const { user: currentUser, organization } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = React.useState('');
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);

  // Invite Form State
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('AGENT');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    data: users = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['org-users-list'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60,
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

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
      });
      toast.success(`Team member ${firstName} ${lastName} invited successfully!`);
      queryClient.invalidateQueries({ queryKey: ['org-users-list'] });
      setInviteModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('AGENT');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to invite team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return (
          <Badge variant="teal" className="text-[10px] font-semibold tracking-wider">
            {r}
          </Badge>
        );
      case 'MANAGER':
        return (
          <Badge variant="blue" className="text-[10px] font-semibold tracking-wider">
            MANAGER
          </Badge>
        );
      case 'AGENT':
        return (
          <Badge variant="default" className="text-[10px] font-semibold tracking-wider bg-slate-100 text-slate-700 border-slate-200">
            SALES AGENT
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
      {/* Top Header */}
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
              Manage organization members, assign roles, and audit access permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 px-2.5"
            title="Refresh users"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-crm-teal' : 'text-crm-muted'}`} />
          </Button>

          <Button
            size="sm"
            onClick={() => setInviteModalOpen(true)}
            className="h-8 bg-crm-teal hover:bg-crm-teal-hover text-white"
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Roster & Filter */}
      <div className="rounded-xl border border-crm-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-crm-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search members by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Workspace:</span>
            <strong className="text-crm-header font-semibold">
              {organization?.name || 'My CRM'}
            </strong>
            <span className="text-slate-300">•</span>
            <span className="font-mono">{filteredUsers.length} Members</span>
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-crm-muted">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-crm-teal" />
            Loading team roster...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-crm-muted">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">No team members match query</p>
            <p className="text-[11px] text-slate-400 mt-1">Try another search term or invite a new member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Access Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-crm-header">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-teal-50 text-crm-teal border border-teal-200 flex items-center justify-center font-bold text-[11px]">
                            {u.firstName.charAt(0)}
                          </div>
                          <div>
                            <span>{u.firstName} {u.lastName}</span>
                            {isCurrent && (
                              <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Permission Matrix Guide */}
      <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-crm-border">
          <ShieldCheck className="h-4 w-4 text-crm-teal" />
          <h2 className="text-sm font-bold text-crm-header">Role-Based Access Control (RBAC) Matrix</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50/50 space-y-1.5">
            <div className="font-bold text-crm-header flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-crm-teal" />
              SUPER_ADMIN / ADMIN
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Full workspace authority: user invitations, security policies, billing, bulk exports, pipeline setup, and CSV ingestion.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50/50 space-y-1.5">
            <div className="font-bold text-crm-header flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-sky-600" />
              MANAGER
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Team oversight: lead assignment, pipeline transitions, representative performance analytics, and audit logging.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50/50 space-y-1.5">
            <div className="font-bold text-crm-header flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-slate-600" />
              SALES AGENT
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Lead execution: manage assigned leads, update deal stages, log interaction notes, and conduct direct follow-ups.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50/50 space-y-1.5">
            <div className="font-bold text-crm-header flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-slate-400" />
              VIEWER
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Read-only visibility: inspect pipeline metrics, view lead directories and analytics without modification privileges.
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
                Add a new collaborator to {organization?.name || 'your workspace'}.
              </p>
            </div>
          </DialogHeader>

          <form onSubmit={handleInviteUser} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">First Name</label>
                <Input
                  required
                  placeholder="e.g. Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Last Name</label>
                <Input
                  required
                  placeholder="e.g. Jenkins"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <Input
                required
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Role Designation</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-crm-teal"
              >
                <option value="AGENT">Sales Agent (Standard execution)</option>
                <option value="MANAGER">Sales Manager (Team management)</option>
                <option value="ADMIN">Administrator (Full authority)</option>
                <option value="VIEWER">Viewer (Read-only)</option>
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
                isLoading={isSubmitting}
                className="bg-crm-teal hover:bg-crm-teal-hover text-white"
              >
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
