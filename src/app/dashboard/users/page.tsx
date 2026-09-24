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
  Trash2,
  AlertTriangle,
  Clock,
  Eye,
  Key,
  Globe,
  Calendar,
  Briefcase,
  Lock,
  User,
  Mail,
  Copy,
  Check,
  Send,
  RotateCcw,
  Ban,
  Link2,
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
  deleteUser,
  updateUserIp,
  adminResetPassword,
} from '@/features/users/api';
import { UserItem, UserRole } from '@/features/users/types';
import {
  createInvitation,
  listPendingInvitations,
  resendInvitation,
  revokeInvitation,
} from '@/features/invitations/api';
import { InvitationItem } from '@/features/invitations/types';
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
  const [memberAccessType, setMemberAccessType] = React.useState<'PERMANENT' | 'TEMPORARY'>('PERMANENT');
  const [memberAllowedIp, setMemberAllowedIp] = React.useState('');
  const [memberExpiresAt, setMemberExpiresAt] = React.useState('');
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

  // Delete Member Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = React.useState<UserItem | null>(null);
  const [isDeletingUser, setIsDeletingUser] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Super Admin User Details & Management Modal State
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = React.useState<UserItem | null>(null);
  const [detailTab, setDetailTab] = React.useState<'overview' | 'ip' | 'password' | 'danger'>('overview');

  // IP Renewal State
  const [ipAllowedIp, setIpAllowedIp] = React.useState('');
  const [ipAccessType, setIpAccessType] = React.useState<'PERMANENT' | 'TEMPORARY'>('PERMANENT');
  const [ipExpiresAt, setIpExpiresAt] = React.useState('');
  const [isUpdatingIp, setIsUpdatingIp] = React.useState(false);
  const [ipError, setIpError] = React.useState<string | null>(null);

  // Password Reset State
  const [resetPassword, setResetPassword] = React.useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = React.useState('');
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  // View Tab: Active Members vs Pending Invitations
  const [viewTab, setViewTab] = React.useState<'members' | 'invitations'>('members');

  // Add / Invite Member Modal Mode
  const [addMemberMode, setAddMemberMode] = React.useState<'invite' | 'direct'>('invite');
  const [isSendingInvite, setIsSendingInvite] = React.useState(false);
  const [isCopyingInvite, setIsCopyingInvite] = React.useState(false);
  const [resendingInviteId, setResendingInviteId] = React.useState<string | null>(null);
  const [revokingInviteId, setRevokingInviteId] = React.useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = React.useState<string | null>(null);

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
    data: pendingInvitations = [],
    isLoading: isLoadingInvitations,
    refetch: refetchInvitations,
  } = useQuery({
    queryKey: ['org-pending-invitations'],
    queryFn: listPendingInvitations,
    enabled: isSuperAdmin,
    staleTime: 1000 * 30,
  });

  const filteredInvitations = React.useMemo(() => {
    if (!search.trim()) return pendingInvitations;
    const q = search.toLowerCase();
    return pendingInvitations.filter(
      (inv) =>
        inv.email.toLowerCase().includes(q) ||
        inv.role.toLowerCase().includes(q) ||
        (inv.allowedIp && inv.allowedIp.toLowerCase().includes(q)),
    );
  }, [pendingInvitations, search]);

  const filteredUsers = React.useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) => {
      const isExpired = Boolean(
        u.accessExpiresAt && new Date(u.accessExpiresAt).getTime() <= Date.now(),
      );
      return (
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (isExpired && 'expired'.includes(q)) ||
        (u.allowedIp && u.allowedIp.toLowerCase().includes(q))
      );
    });
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

    // IP format validation
    const trimmedIp = memberAllowedIp.trim();
    if (trimmedIp) {
      const isValidIp = (ipStr: string) => {
        if (ipStr.includes('.')) {
          const parts = ipStr.split('.');
          if (parts.length !== 4) return false;
          return parts.every((p) => /^\d+$/.test(p) && parseInt(p, 10) >= 0 && parseInt(p, 10) <= 255);
        }
        if (ipStr.includes(':')) {
          return /^[0-9a-fA-F:]+$/.test(ipStr);
        }
        return false;
      };

      if (!isValidIp(trimmedIp)) {
        setCreateMemberError('Please enter a valid IPv4 or IPv6 address (e.g. 203.0.113.25)');
        return;
      }
    }

    // Expiration validation for Temporary access
    if (memberAccessType === 'TEMPORARY') {
      if (!memberExpiresAt) {
        setCreateMemberError('Expiration date & time is required for temporary access');
        return;
      }
      const expDate = new Date(memberExpiresAt);
      if (isNaN(expDate.getTime()) || expDate <= new Date()) {
        setCreateMemberError('Expiration date must be a valid date in the future');
        return;
      }
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
        accessType: memberAccessType,
        allowedIp: trimmedIp || undefined,
        accessExpiresAt:
          memberAccessType === 'TEMPORARY' && memberExpiresAt
            ? new Date(memberExpiresAt).toISOString()
            : undefined,
      });

      toast.success(`Account for ${created.email} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['org-users-list'] });
      setAddMemberModalOpen(false);
      resetAddMemberForm();
    } catch (err: any) {
      setCreateMemberError(err?.message || 'Failed to create member');
    } finally {
      setIsCreatingMember(false);
    }
  };

  const resetAddMemberForm = () => {
    setMemberEmail('');
    setMemberPassword('');
    setMemberConfirmPassword('');
    setMemberRole('OPERATOR');
    setMemberFirstName('');
    setMemberLastName('');
    setMemberAccessType('PERMANENT');
    setMemberAllowedIp('');
    setMemberExpiresAt('');
    setCreateMemberError(null);
  };

  const validateIpOrCidr = (str: string) => {
    const parts = str.split('/');
    if (parts.length > 2) return false;
    const ipStr = parts[0].trim();
    if (parts.length === 2) {
      const bits = parseInt(parts[1].trim(), 10);
      if (isNaN(bits) || bits < 0 || bits > 128) return false;
    }
    if (ipStr.includes('.')) {
      const octets = ipStr.split('.');
      if (octets.length !== 4) return false;
      return octets.every(
        (p) => /^\d+$/.test(p) && parseInt(p, 10) >= 0 && parseInt(p, 10) <= 255,
      );
    }
    if (ipStr.includes(':')) {
      return /^[0-9a-fA-F:]+$/.test(ipStr);
    }
    return false;
  };

  const handleSendInviteSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

    if (memberRole !== 'MANAGER' && memberRole !== 'OPERATOR') {
      setCreateMemberError('Role must be either Manager or Operator');
      return;
    }

    const trimmedIp = memberAllowedIp.trim();
    if (trimmedIp) {
      const entries = trimmedIp
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (entries.some((entry) => !validateIpOrCidr(entry))) {
        setCreateMemberError(
          'Please enter valid IPv4, IPv6, or CIDR notations (e.g. 203.0.113.0/24)',
        );
        return;
      }
    }

    if (memberAccessType === 'TEMPORARY') {
      if (!memberExpiresAt) {
        setCreateMemberError('Expiration date & time is required for temporary access');
        return;
      }
      const expDate = new Date(memberExpiresAt);
      if (isNaN(expDate.getTime()) || expDate <= new Date()) {
        setCreateMemberError('Expiration date must be a valid date in the future');
        return;
      }
    }

    setIsSendingInvite(true);
    try {
      const res = await createInvitation({
        email: emailTrimmed,
        role: memberRole,
        accessType: memberAccessType,
        allowedIp: trimmedIp || undefined,
        accessExpiresAt:
          memberAccessType === 'TEMPORARY' && memberExpiresAt
            ? new Date(memberExpiresAt).toISOString()
            : undefined,
      });

      if (res.emailDelivery.success) {
        toast.success(`Invitation sent via Brevo to ${res.invitation.email}!`);
      } else {
        toast.warning(
          `Invitation created. Delivery note: ${res.emailDelivery.error || 'Development fallback active'}`,
        );
      }

      queryClient.invalidateQueries({ queryKey: ['org-pending-invitations'] });
      setAddMemberModalOpen(false);
      resetAddMemberForm();
      setViewTab('invitations');
    } catch (err: any) {
      setCreateMemberError(err?.message || 'Failed to send invitation');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleCopyInviteLinkClick = async () => {
    setCreateMemberError(null);

    const emailTrimmed = memberEmail.trim();
    if (!emailTrimmed) {
      setCreateMemberError('Email address is required to generate invitation link');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setCreateMemberError('Please enter a valid email address');
      return;
    }

    const trimmedIp = memberAllowedIp.trim();
    if (trimmedIp) {
      const entries = trimmedIp
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (entries.some((entry) => !validateIpOrCidr(entry))) {
        setCreateMemberError(
          'Please enter valid IPv4, IPv6, or CIDR notations (e.g. 203.0.113.0/24)',
        );
        return;
      }
    }

    if (memberAccessType === 'TEMPORARY') {
      if (!memberExpiresAt) {
        setCreateMemberError('Expiration date & time is required for temporary access');
        return;
      }
      const expDate = new Date(memberExpiresAt);
      if (isNaN(expDate.getTime()) || expDate <= new Date()) {
        setCreateMemberError('Expiration date must be a valid date in the future');
        return;
      }
    }

    setIsCopyingInvite(true);
    try {
      const res = await createInvitation({
        email: emailTrimmed,
        role: memberRole,
        accessType: memberAccessType,
        allowedIp: trimmedIp || undefined,
        accessExpiresAt:
          memberAccessType === 'TEMPORARY' && memberExpiresAt
            ? new Date(memberExpiresAt).toISOString()
            : undefined,
      });

      await navigator.clipboard.writeText(res.activationUrl);
      toast.success('Invitation created & activation link copied to clipboard!');
      queryClient.invalidateQueries({ queryKey: ['org-pending-invitations'] });
      setAddMemberModalOpen(false);
      resetAddMemberForm();
      setViewTab('invitations');
    } catch (err: any) {
      setCreateMemberError(err?.message || 'Failed to create invitation link');
    } finally {
      setIsCopyingInvite(false);
    }
  };

  const handleResendInvitation = async (inv: InvitationItem) => {
    setResendingInviteId(inv.id);
    try {
      await resendInvitation(inv.id);
      toast.success(`Invitation resent to ${inv.email} via Brevo!`);
      queryClient.invalidateQueries({ queryKey: ['org-pending-invitations'] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend invitation');
    } finally {
      setResendingInviteId(null);
    }
  };

  const handleCopyPendingLink = async (inv: InvitationItem) => {
    setCopiedInviteId(inv.id);
    try {
      const res = await resendInvitation(inv.id);
      await navigator.clipboard.writeText(res.activationUrl);
      toast.success(`Fresh activation link copied to clipboard for ${inv.email}!`);
      queryClient.invalidateQueries({ queryKey: ['org-pending-invitations'] });
      setTimeout(() => setCopiedInviteId(null), 2500);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to copy activation link');
      setCopiedInviteId(null);
    }
  };

  const handleRevokeInvitation = async (inv: InvitationItem) => {
    setRevokingInviteId(inv.id);
    try {
      await revokeInvitation(inv.id);
      toast.success(`Invitation for ${inv.email} has been revoked.`);
      queryClient.invalidateQueries({ queryKey: ['org-pending-invitations'] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke invitation');
    } finally {
      setRevokingInviteId(null);
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

  const handleDeleteUserClick = (u: UserItem) => {
    setSelectedUserForDelete(u);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!selectedUserForDelete) return;
    setIsDeletingUser(true);
    setDeleteError(null);
    try {
      await deleteUser(selectedUserForDelete.id);
      toast.success(
        `User ${selectedUserForDelete.email} has been permanently deleted from the database`,
      );
      setDeleteModalOpen(false);
      setSelectedUserForDelete(null);
      if (selectedUserForDetail?.id === selectedUserForDelete.id) {
        setDetailModalOpen(false);
        setSelectedUserForDetail(null);
      }
      queryClient.invalidateQueries({ queryKey: ['org-users-list'] });
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete user');
      toast.error(err?.message || 'Failed to delete user');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleOpenMemberDetail = (
    u: UserItem,
    initialTab: 'overview' | 'ip' | 'password' | 'danger' = 'overview',
  ) => {
    setSelectedUserForDetail(u);
    setDetailTab(initialTab);
    setIpAllowedIp(u.allowedIp || '');
    setIpAccessType(u.accessType === 'TEMPORARY' ? 'TEMPORARY' : 'PERMANENT');
    if (u.accessExpiresAt) {
      const d = new Date(u.accessExpiresAt);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setIpExpiresAt(localISOTime);
    } else {
      setIpExpiresAt('');
    }
    setIpError(null);
    setResetPassword('');
    setResetConfirmPassword('');
    setPasswordError(null);
    setDetailModalOpen(true);
  };

  const handleUpdateIpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForDetail) return;
    setIpError(null);

    const trimmedIp = ipAllowedIp.trim();
    if (trimmedIp) {
      const isValidIp = (ipStr: string) => {
        if (ipStr.includes('.')) {
          const parts = ipStr.split('.');
          if (parts.length !== 4) return false;
          return parts.every(
            (p) => /^\d+$/.test(p) && parseInt(p, 10) >= 0 && parseInt(p, 10) <= 255,
          );
        }
        if (ipStr.includes(':')) {
          return /^[0-9a-fA-F:]+$/.test(ipStr);
        }
        return false;
      };

      if (!isValidIp(trimmedIp)) {
        setIpError('Please enter a valid IPv4 or IPv6 address (e.g. 203.0.113.25)');
        return;
      }
    }

    if (ipAccessType === 'TEMPORARY') {
      if (!ipExpiresAt) {
        setIpError('Expiration date & time is required for temporary access');
        return;
      }
      const expDate = new Date(ipExpiresAt);
      if (isNaN(expDate.getTime()) || expDate <= new Date()) {
        setIpError('Expiration date must be a valid date in the future');
        return;
      }
    }

    setIsUpdatingIp(true);
    try {
      const updated = await updateUserIp(selectedUserForDetail.id, {
        allowedIp: trimmedIp || null,
        accessType: ipAccessType,
        accessExpiresAt:
          ipAccessType === 'TEMPORARY' && ipExpiresAt
            ? new Date(ipExpiresAt).toISOString()
            : null,
      });

      toast.success(`Network IP settings updated for ${selectedUserForDetail.email}`);
      setSelectedUserForDetail(updated);
      queryClient.invalidateQueries({ queryKey: ['org-users-list'] });
    } catch (err: any) {
      setIpError(err?.message || 'Failed to update IP access settings');
    } finally {
      setIsUpdatingIp(false);
    }
  };

  const handleSetIpPreset = (hours: number) => {
    const d = new Date(Date.now() + hours * 60 * 60 * 1000);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    setIpExpiresAt(localISOTime);
    setIpAccessType('TEMPORARY');
  };

  const handleClearIpRestriction = async () => {
    if (!selectedUserForDetail) return;
    setIsUpdatingIp(true);
    setIpError(null);
    try {
      const updated = await updateUserIp(selectedUserForDetail.id, {
        allowedIp: null,
        accessType: 'PERMANENT',
        accessExpiresAt: null,
      });
      setIpAllowedIp('');
      setIpAccessType('PERMANENT');
      setIpExpiresAt('');
      setSelectedUserForDetail(updated);
      toast.success(
        `Cleared IP restrictions for ${selectedUserForDetail.email}. User can now log in from any IP.`,
      );
      queryClient.invalidateQueries({ queryKey: ['org-users-list'] });
    } catch (err: any) {
      setIpError(err?.message || 'Failed to clear IP restrictions');
    } finally {
      setIsUpdatingIp(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForDetail) return;
    setPasswordError(null);

    if (!resetPassword || resetPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsResettingPassword(true);
    try {
      await adminResetPassword(selectedUserForDetail.id, resetPassword);
      toast.success(`Password successfully updated for ${selectedUserForDetail.email}`);
      setResetPassword('');
      setResetConfirmPassword('');
      setPasswordError(null);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to update user password');
    } finally {
      setIsResettingPassword(false);
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
              Invite / Add Member
            </Button>
          )}
        </div>
      </div>

      {/* View Tabs & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setViewTab('members')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 ${
              viewTab === 'members'
                ? 'border-crm-teal text-crm-teal'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Active Members ({users.length})</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setViewTab('invitations')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 ${
                viewTab === 'invitations'
                  ? 'border-crm-teal text-crm-teal'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Pending Invitations</span>
              {pendingInvitations.length > 0 && (
                <span className="ml-1 rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                  {pendingInvitations.length}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-crm-muted" />
          <Input
            placeholder={viewTab === 'members' ? 'Search members...' : 'Search invitations...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-white"
          />
        </div>
      </div>

      {/* Tables: Pending Invitations or Active Members */}
      {viewTab === 'invitations' && isSuperAdmin ? (
        <div className="rounded-xl border border-crm-border bg-white shadow-sm overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-crm-text">
              <thead className="border-b border-crm-border bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-crm-muted">
                <tr>
                  <th className="px-5 py-3">Invitee Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Network IP / Subnet</th>
                  <th className="px-5 py-3">Access Duration</th>
                  <th className="px-5 py-3">Token Expiration</th>
                  <th className="px-5 py-3">Sent Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingInvitations ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-crm-muted">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-crm-teal" />
                      Loading invitations...
                    </td>
                  </tr>
                ) : filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-crm-muted">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Mail className="h-6 w-6 text-slate-300" />
                        <p className="font-medium text-slate-600">No pending invitations found</p>
                        <p className="text-[11px] text-slate-400">
                          Click &ldquo;Invite / Add Member&rdquo; above to invite colleagues via Brevo automated email and activation link.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map((inv) => {
                    const isExpiringSoon =
                      new Date(inv.expiresAt).getTime() - Date.now() < 24 * 3600 * 1000;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-crm-teal text-[11px]">
                              <Mail className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold text-crm-header">{inv.email}</div>
                              <div className="text-[10px] text-slate-400">
                                Single-use secure token
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">{getRoleBadge(inv.role)}</td>
                        <td className="px-5 py-3.5">
                          {inv.allowedIp ? (
                            <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {inv.allowedIp}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              Any Public IP
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {inv.accessType === 'TEMPORARY' ? (
                            <div className="flex flex-col gap-0.5">
                              <Badge
                                variant="outline"
                                className="w-fit text-[10px] font-semibold bg-amber-50 text-amber-700 border-amber-200"
                              >
                                Temporary
                              </Badge>
                              {inv.accessExpiresAt && (
                                <span className="text-[10px] text-slate-400">
                                  Until {new Date(inv.accessExpiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge
                              variant="outline"
                              className="w-fit text-[10px] font-semibold bg-slate-50 text-slate-600 border-slate-200"
                            >
                              Permanent
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[11px] font-medium flex items-center gap-1 ${
                              isExpiringSoon ? 'text-amber-600' : 'text-slate-600'
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {new Date(inv.expiresAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={resendingInviteId === inv.id}
                              onClick={() => handleResendInvitation(inv)}
                              className="h-7 px-2 text-[11px] flex items-center gap-1 text-slate-700 hover:text-crm-teal"
                              title="Resend invitation email via Brevo"
                            >
                              <RotateCcw
                                className={`h-3 w-3 ${
                                  resendingInviteId === inv.id ? 'animate-spin' : ''
                                }`}
                              />
                              Resend
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyPendingLink(inv)}
                              className="h-7 px-2 text-[11px] flex items-center gap-1 text-slate-700 hover:text-crm-teal"
                              title="Generate fresh activation link & copy to clipboard"
                            >
                              {copiedInviteId === inv.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-600" />
                                  <span className="text-emerald-600 font-semibold">Copied ✓</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  Copy Link
                                </>
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={revokingInviteId === inv.id}
                              onClick={() => handleRevokeInvitation(inv)}
                              className="h-7 px-2 text-[11px] flex items-center gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                              title="Revoke invitation"
                            >
                              <Ban className="h-3 w-3" />
                              Revoke
                            </Button>
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
      ) : (
        /* Active Members Table */
        <div className="rounded-xl border border-crm-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-crm-text">
            <thead className="border-b border-crm-border bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-crm-muted">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">IP Address</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined Date</th>
                {isSuperAdmin && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="py-12 text-center text-crm-muted">
                    Loading team members...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="py-12 text-center text-crm-muted">
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
                      <td className="px-5 py-3.5 text-[11px]">
                        {(() => {
                          const isExpired = Boolean(
                            u.accessExpiresAt && new Date(u.accessExpiresAt).getTime() <= Date.now(),
                          );
                          if (isExpired) {
                            return (
                              <span
                                title={
                                  u.allowedIp
                                    ? `IP: ${u.allowedIp} (Expired on ${new Date(u.accessExpiresAt!).toLocaleString()})`
                                    : `Access expired on ${new Date(u.accessExpiresAt!).toLocaleString()}`
                                }
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-sans text-[11px] font-semibold shadow-xs"
                              >
                                <Clock className="h-3 w-3 text-rose-500" />
                                Expired
                              </span>
                            );
                          }
                          if (u.allowedIp) {
                            return (
                              <span
                                title={
                                  u.accessExpiresAt
                                    ? `Expires on ${new Date(u.accessExpiresAt).toLocaleString()}`
                                    : 'Permanent access'
                                }
                                className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]"
                              >
                                {u.allowedIp}
                              </span>
                            );
                          }
                          return <span className="text-slate-400 font-sans text-[11px]">Any</span>;
                        })()}
                      </td>
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
                              title="View user details, renew IP, reset password, or manage account"
                              onClick={() => handleOpenMemberDetail(u, 'overview')}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-crm-teal hover:bg-teal-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

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
      {/* Add / Invite Member Modal (Super Admin) */}
      <Dialog
        open={addMemberModalOpen}
        onOpenChange={setAddMemberModalOpen}
        className="max-w-md p-0 overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-crm-border bg-white shrink-0">
          <DialogHeader onClose={() => setAddMemberModalOpen(false)} className="mb-0 pb-0 border-b-0">
            <DialogTitle>
              {addMemberMode === 'invite' ? 'Invite Team Member' : 'Direct Account Creation'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Mode Switcher */}
          <div className="px-6 pt-3 pb-1 bg-slate-50 border-b border-slate-100">
            <div className="flex rounded-lg bg-slate-200/70 p-1">
              <button
                type="button"
                onClick={() => {
                  setAddMemberMode('invite');
                  setCreateMemberError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  addMemberMode === 'invite'
                    ? 'bg-white text-crm-teal shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                Invite Member (Recommended)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddMemberMode('direct');
                  setCreateMemberError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  addMemberMode === 'direct'
                    ? 'bg-white text-crm-teal shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Direct Creation
              </button>
            </div>
          </div>

          {createMemberError && (
            <div className="mx-6 mt-3 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{createMemberError}</span>
            </div>
          )}

          {/* Form Content */}
          {addMemberMode === 'invite' ? (
            <form
              onSubmit={handleSendInviteSubmit}
              className="flex flex-col flex-1 overflow-hidden min-h-0"
            >
              <div className="px-6 py-4 overflow-y-auto flex-1 space-y-3.5">
                <div className="rounded-lg bg-teal-50/60 border border-teal-100 p-2.5 text-[11px] text-teal-800 leading-relaxed">
                  Sends an automated invitation email via Brevo with a secure, single-use account setup link. The invitee can establish their own password.
                </div>

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Role Designation</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMemberRole('OPERATOR')}
                      className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        memberRole === 'OPERATOR'
                          ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-xs'
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
                          ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-xs'
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
                  <label className="text-xs font-medium text-slate-700">
                    Invitee Email Address <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="colleague@company.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    disabled={isSendingInvite || isCopyingInvite}
                    className="h-9 text-xs"
                  />
                </div>

                {/* Access Duration */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-medium text-slate-700">Access Duration</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMemberAccessType('PERMANENT')}
                      className={`h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                        memberAccessType === 'PERMANENT'
                          ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Permanent
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberAccessType('TEMPORARY')}
                      className={`h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                        memberAccessType === 'TEMPORARY'
                          ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Temporary
                    </button>
                  </div>
                </div>

                {/* Allowed IP / Subnet */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700">
                      Allowed IP / Subnet CIDR
                    </label>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>
                  <Input
                    type="text"
                    placeholder="e.g. 203.0.113.0/24 or 198.51.100.5"
                    value={memberAllowedIp}
                    onChange={(e) => setMemberAllowedIp(e.target.value)}
                    disabled={isSendingInvite || isCopyingInvite}
                    className="h-9 text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    Supports individual IPs, CIDR blocks (/24, /32), or comma-separated lists. Leave blank for unrestricted access.
                  </p>
                </div>

                {/* Expires (Only for Temporary) */}
                {memberAccessType === 'TEMPORARY' && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="text-xs font-medium text-slate-700">Account Expiration</label>
                    <Input
                      type="datetime-local"
                      required
                      value={memberExpiresAt}
                      onChange={(e) => setMemberExpiresAt(e.target.value)}
                      disabled={isSendingInvite || isCopyingInvite}
                      className="h-9 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="px-6 py-3.5 border-t border-crm-border bg-slate-50/80 shrink-0">
                <DialogFooter className="mt-0 pt-0 border-t-0 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddMemberModalOpen(false)}
                    disabled={isSendingInvite || isCopyingInvite}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyInviteLinkClick}
                      disabled={isSendingInvite || isCopyingInvite}
                      className="h-9 text-xs flex items-center gap-1.5 text-slate-700 hover:text-crm-teal"
                    >
                      <Copy className={`h-3.5 w-3.5 ${isCopyingInvite ? 'animate-spin' : ''}`} />
                      Copy Link
                    </Button>

                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSendingInvite || isCopyingInvite}
                      className="bg-crm-teal hover:bg-crm-teal-hover text-white h-9 text-xs px-4 font-semibold shadow-xs flex items-center gap-1.5"
                    >
                      <Send className={`h-3.5 w-3.5 ${isSendingInvite ? 'animate-spin' : ''}`} />
                      Send Invitation
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleAddMemberSubmit}
              className="flex flex-col flex-1 overflow-hidden min-h-0"
            >
              <div className="px-6 py-4 overflow-y-auto flex-1 space-y-3.5">
                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMemberRole('OPERATOR')}
                      className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        memberRole === 'OPERATOR'
                          ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-xs'
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
                          ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-xs'
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

                {/* Names */}
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

                {/* Passwords */}
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

                {/* Access Type */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-medium text-slate-700">Access</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMemberAccessType('PERMANENT')}
                      className={`h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                        memberAccessType === 'PERMANENT'
                          ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Permanent
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberAccessType('TEMPORARY')}
                      className={`h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                        memberAccessType === 'TEMPORARY'
                          ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Temporary
                    </button>
                  </div>
                </div>

                {/* Allowed IP */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Allowed IP</label>
                  <Input
                    type="text"
                    placeholder="e.g. 203.0.113.25"
                    value={memberAllowedIp}
                    onChange={(e) => setMemberAllowedIp(e.target.value)}
                    disabled={isCreatingMember}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                {/* Expires */}
                {memberAccessType === 'TEMPORARY' && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="text-xs font-medium text-slate-700">Expires</label>
                    <Input
                      type="datetime-local"
                      required
                      value={memberExpiresAt}
                      onChange={(e) => setMemberExpiresAt(e.target.value)}
                      disabled={isCreatingMember}
                      className="h-9 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="px-6 py-3.5 border-t border-crm-border bg-slate-50/80 shrink-0">
                <DialogFooter className="mt-0 pt-0 border-t-0">
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
                    className="bg-crm-teal hover:bg-crm-teal-hover text-white h-9 text-xs px-4 font-semibold shadow-xs"
                  >
                    Add Member
                  </Button>
                </DialogFooter>
              </div>
            </form>
          )}
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

      {/* Delete User Permanent Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <div className="space-y-4 py-2">
          <DialogHeader onClose={() => setDeleteModalOpen(false)}>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base text-rose-950 font-bold">
                  Permanently Delete Member?
                </DialogTitle>
                <p className="text-xs text-slate-600 mt-1">
                  This action is <strong>irreversible</strong>. The user will be completely purged from the database.
                </p>
              </div>
            </div>
          </DialogHeader>

          {deleteError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">User:</span>
              <span className="font-semibold text-slate-900">
                {selectedUserForDelete?.firstName} {selectedUserForDelete?.lastName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Email:</span>
              <span className="font-mono text-slate-800 text-[11px]">
                {selectedUserForDelete?.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Role:</span>
              <span>{selectedUserForDelete && getRoleBadge(selectedUserForDelete.role)}</span>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5">
              <span>⚠️ Data Safety Guarantee:</span>
            </p>
            <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5 ml-1">
              <li>All customer leads assigned to this user will remain safe and become <strong>unassigned</strong>.</li>
              <li>Historical audit logs and import records will be <strong>preserved</strong>.</li>
              <li>The member&apos;s login credentials and account will be <strong>permanently deleted</strong>.</li>
            </ul>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeletingUser}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteUserConfirm}
              isLoading={isDeletingUser}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Permanently Delete</span>
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Super Admin User Details & Management Modal */}
      <Dialog
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        className="max-w-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
      >
        {selectedUserForDetail && (
          <div className="flex flex-col h-full min-h-0">
            {/* Header banner */}
            <div className="px-6 py-4 border-b border-crm-border bg-slate-50/70 shrink-0">
              <DialogHeader onClose={() => setDetailModalOpen(false)} className="mb-0 pb-0 border-b-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-100/80 border border-teal-200 flex items-center justify-center font-bold text-crm-teal text-sm">
                    {selectedUserForDetail.firstName?.[0] || 'U'}
                    {selectedUserForDetail.lastName?.[0] || ''}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-base font-bold text-crm-header">
                        {selectedUserForDetail.firstName} {selectedUserForDetail.lastName}
                      </DialogTitle>
                      {getRoleBadge(selectedUserForDetail.role)}
                      {selectedUserForDetail.isActive ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 bg-slate-50">
                          Deactivated
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-mono text-crm-muted mt-0.5">
                      {selectedUserForDetail.email}
                    </p>
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-crm-border bg-white px-6 shrink-0 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setDetailTab('overview')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  detailTab === 'overview'
                    ? 'border-crm-teal text-crm-teal'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailTab('ip')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  detailTab === 'ip'
                    ? 'border-crm-teal text-crm-teal'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Renew IP</span>
                {Boolean(
                  selectedUserForDetail.accessExpiresAt &&
                    new Date(selectedUserForDetail.accessExpiresAt).getTime() <= Date.now(),
                ) && (
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setDetailTab('password')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  detailTab === 'password'
                    ? 'border-crm-teal text-crm-teal'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Key className="h-3.5 w-3.5" />
                <span>Update Password</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailTab('danger')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ml-auto whitespace-nowrap ${
                  detailTab === 'danger'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-slate-400 hover:text-rose-600'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Danger Zone</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {/* Tab 1: Overview */}
              {detailTab === 'overview' && (
                <div className="space-y-4">
                  {/* Account Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Full Name
                      </div>
                      <div className="text-xs font-semibold text-crm-header">
                        {selectedUserForDetail.firstName} {selectedUserForDetail.lastName}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Email Address
                      </div>
                      <div className="text-xs font-mono text-slate-800">
                        {selectedUserForDetail.email}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Role & Permissions
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getRoleBadge(selectedUserForDetail.role)}
                        <span className="text-[11px] text-slate-500">
                          {selectedUserForDetail.role === 'SUPER_ADMIN'
                            ? 'Full Administrator'
                            : selectedUserForDetail.role === 'MANAGER'
                            ? 'Leads Manager'
                            : 'Frontline Operator'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Assigned Customer Leads
                      </div>
                      <div className="text-xs font-bold text-crm-header flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-crm-teal" />
                        <span>{selectedUserForDetail._count?.ownedLeads ?? 0} Leads</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Member Since
                      </div>
                      <div className="text-xs text-slate-700">
                        {new Date(selectedUserForDetail.createdAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        User ID
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate" title={selectedUserForDetail.id}>
                        {selectedUserForDetail.id}
                      </div>
                    </div>
                  </div>

                  {/* Network Access Security Card */}
                  <div className="rounded-lg border border-slate-200 p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-crm-teal" />
                        <h4 className="text-xs font-bold text-crm-header">
                          Network & IP Access Status
                        </h4>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailTab('ip')}
                        className="h-6 text-[11px] text-crm-teal hover:text-crm-teal-hover px-2 font-semibold"
                      >
                        Configure IP →
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Allowed IP
                        </span>
                        <div>
                          {selectedUserForDetail.allowedIp ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]">
                              {selectedUserForDetail.allowedIp}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Any IP (Unrestricted)</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Access Type
                        </span>
                        <div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              selectedUserForDetail.accessType === 'TEMPORARY'
                                ? 'border-amber-300 text-amber-800 bg-amber-50'
                                : 'border-slate-300 text-slate-700 bg-slate-50'
                            }`}
                          >
                            {selectedUserForDetail.accessType || 'PERMANENT'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Expiration Posture
                        </span>
                        <div>
                          {(() => {
                            const isExpired = Boolean(
                              selectedUserForDetail.accessExpiresAt &&
                                new Date(selectedUserForDetail.accessExpiresAt).getTime() <= Date.now(),
                            );
                            if (isExpired) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                                  <Clock className="h-3 w-3 text-rose-500" />
                                  Expired
                                </span>
                              );
                            }
                            if (selectedUserForDetail.accessExpiresAt) {
                              return (
                                <span className="text-xs text-slate-700 font-medium">
                                  {new Date(selectedUserForDetail.accessExpiresAt).toLocaleString('en-US', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                  })}
                                </span>
                              );
                            }
                            return <span className="text-xs text-slate-400">Never expires</span>;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Renew / Update IP */}
              {detailTab === 'ip' && (
                <form onSubmit={handleUpdateIpSubmit} className="space-y-4">
                  {ipError && (
                    <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      <span>{ipError}</span>
                    </div>
                  )}

                  {/* Current Status banner */}
                  {(() => {
                    const isExpired = Boolean(
                      selectedUserForDetail.accessExpiresAt &&
                        new Date(selectedUserForDetail.accessExpiresAt).getTime() <= Date.now(),
                    );
                    if (isExpired) {
                      return (
                        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2.5">
                          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">User IP Access has Expired</p>
                            <p className="text-[11px] text-rose-700 mt-0.5">
                              Login attempts from IP <strong>{selectedUserForDetail.allowedIp || 'configured IP'}</strong> are blocked. Enter a new expiration date or switch to permanent to renew access.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Access Type selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Access Duration Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIpAccessType('PERMANENT')}
                        className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                          ipAccessType === 'PERMANENT'
                            ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Permanent Access
                      </button>
                      <button
                        type="button"
                        onClick={() => setIpAccessType('TEMPORARY')}
                        className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                          ipAccessType === 'TEMPORARY'
                            ? 'bg-[#16C1C8] border-[#16C1C8] text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Temporary Access
                      </button>
                    </div>
                  </div>

                  {/* Allowed IP input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Allowed IP Address</label>
                      <button
                        type="button"
                        onClick={() => setIpAllowedIp('')}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Clear input
                      </button>
                    </div>
                    <Input
                      type="text"
                      placeholder="e.g. 203.0.113.25 (Leave empty for Any IP)"
                      value={ipAllowedIp}
                      onChange={(e) => setIpAllowedIp(e.target.value)}
                      disabled={isUpdatingIp}
                      className="h-9 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-500">
                      Specify an IPv4 or IPv6 address. Leave blank to allow login from any location.
                    </p>
                  </div>

                  {/* Temporary Expiration Controls */}
                  {ipAccessType === 'TEMPORARY' && (
                    <div className="space-y-2.5 p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 animate-fadeIn">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-crm-teal" />
                        <span>Access Expiration Date & Time</span>
                      </label>
                      <Input
                        type="datetime-local"
                        required
                        value={ipExpiresAt}
                        onChange={(e) => setIpExpiresAt(e.target.value)}
                        disabled={isUpdatingIp}
                        className="h-9 text-xs bg-white"
                      />

                      {/* Quick duration presets */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          Quick Presets:
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetIpPreset(24)}
                            className="h-7 text-[11px] px-2.5 bg-white text-slate-700 hover:border-crm-teal hover:text-crm-teal"
                          >
                            +24 Hours
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetIpPreset(24 * 7)}
                            className="h-7 text-[11px] px-2.5 bg-white text-slate-700 hover:border-crm-teal hover:text-crm-teal"
                          >
                            +7 Days
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetIpPreset(24 * 30)}
                            className="h-7 text-[11px] px-2.5 bg-white text-slate-700 hover:border-crm-teal hover:text-crm-teal"
                          >
                            +30 Days
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Clear / Reset to unrestricted button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearIpRestriction}
                      disabled={isUpdatingIp}
                      className="h-8 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Allow Any IP (Unrestricted)
                    </Button>

                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isUpdatingIp}
                      className="bg-crm-teal hover:bg-crm-teal-hover text-white h-8 text-xs px-4 font-semibold shadow-sm"
                    >
                      Save IP Settings
                    </Button>
                  </div>
                </form>
              )}

              {/* Tab 3: Update Password */}
              {detailTab === 'password' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {passwordError && (
                    <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-3 text-xs text-blue-900 flex items-start gap-2.5">
                    <Lock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Super Admin Password Override</p>
                      <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                        This action directly resets the user&apos;s password with secure bcrypt encryption without requiring their current password. The user can log in immediately with the new credentials.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">New Password</label>
                    <PasswordInput
                      required
                      placeholder="Enter minimum 8 characters"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      disabled={isResettingPassword}
                      className="h-9 text-xs"
                    />
                    <p className="text-[10px] text-slate-400">Must be at least 8 characters.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                    <PasswordInput
                      required
                      placeholder="Re-enter new password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      disabled={isResettingPassword}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isResettingPassword}
                      className="bg-crm-teal hover:bg-crm-teal-hover text-white h-8 text-xs px-4 font-semibold shadow-sm"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              )}

              {/* Tab 4: Danger Zone / Delete */}
              {detailTab === 'danger' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-rose-950">
                          Permanently Delete Member Account
                        </h4>
                        <p className="text-[11px] text-rose-800 leading-relaxed">
                          Once deleted, this user account and their credentials will be completely purged from the system.
                        </p>
                      </div>
                    </div>

                    <div className="rounded border border-rose-200 bg-white p-3 space-y-1 text-[11px] text-rose-900">
                      <p className="font-semibold text-rose-950">Safety Protection Rules:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-rose-800">
                        <li>All customer leads assigned to this user will become <strong>unassigned</strong> safely.</li>
                        <li>Audit logs, timeline events, and history remain intact.</li>
                        <li>Self-deletion is forbidden (Super Admins cannot delete their own account).</li>
                      </ul>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      {currentUser?.id === selectedUserForDetail.id ? (
                        <div className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4" />
                          <span>You cannot delete your own account</span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUserForDelete(selectedUserForDetail);
                            setDeleteError(null);
                            setDeleteModalOpen(true);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Permanently Delete User</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with close */}
            <div className="px-6 py-3 border-t border-crm-border bg-slate-50/80 shrink-0 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDetailModalOpen(false)}
                className="h-8 text-xs text-slate-600"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
