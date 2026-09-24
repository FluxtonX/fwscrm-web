'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Loader2,
  Mail,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  validateInvitationToken,
  acceptInvitation,
} from '@/features/invitations/api';
import { ValidateInvitationResponse } from '@/features/invitations/types';

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const token = searchParams.get('token');

  const [isLoadingToken, setIsLoadingToken] = React.useState(true);
  const [tokenError, setTokenError] = React.useState<string | null>(null);
  const [invitationData, setInvitationData] =
    React.useState<ValidateInvitationResponse | null>(null);

  // Form State
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      setIsLoadingToken(false);
      setTokenError(
        'Missing invitation token. Please check the link from your invitation email or contact your administrator.',
      );
      return;
    }

    let isMounted = true;
    validateInvitationToken(token)
      .then((data) => {
        if (isMounted) {
          setInvitationData(data);
          setIsLoadingToken(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setTokenError(
            err?.message ||
              'This invitation is invalid, has expired, or was revoked.',
          );
          setIsLoadingToken(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitError(null);

    const fName = firstName.trim();
    const lName = lastName.trim();

    if (!fName || !lName) {
      setSubmitError('First name and last name are required');
      return;
    }

    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await acceptInvitation({
        token,
        firstName: fName,
        lastName: lName,
        password,
        confirmPassword,
      });

      toast.success(
        `Welcome to ${result.organization.name}! Your account has been activated.`,
      );
      // Navigate directly into dashboard
      router.replace('/dashboard');
    } catch (err: any) {
      setSubmitError(
        err?.message || 'Failed to activate account. Please try again.',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-crm-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-crm-border bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block text-2xl font-bold tracking-tight text-crm-header hover:opacity-90 transition-opacity"
          >
            <span className="text-[#16C1C8] font-bold">FWS</span> CRM
          </Link>
          <p className="text-xs text-crm-muted">
            Workspace Account Activation & Access Establishment
          </p>
        </div>

        {/* Loading Token Validation */}
        {isLoadingToken && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-crm-teal mx-auto" />
            <p className="text-xs font-medium text-slate-600">
              Validating secure invitation token...
            </p>
          </div>
        )}

        {/* Invalid / Expired / Revoked Error State */}
        {!isLoadingToken && tokenError && (
          <div className="space-y-5 animate-fadeIn">
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 space-y-2.5 text-center">
              <AlertTriangle className="h-7 w-7 text-rose-600 mx-auto" />
              <h3 className="text-sm font-bold text-rose-950">
                Invitation Invalid or Expired
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed">
                {tokenError}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="button"
                onClick={() => router.replace('/login')}
                className="w-full bg-crm-teal hover:bg-crm-teal-hover text-white text-xs font-semibold h-10 shadow-sm"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Valid Invitation Form */}
        {!isLoadingToken && invitationData && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
            {submitError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Workspace & Role Card */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Workspace
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {invitationData.organizationName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Assigned Role
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold tracking-wider bg-teal-50 text-teal-800 border-teal-200"
                >
                  {invitationData.role}
                </Badge>
              </div>

              <div className="pt-1 border-t border-slate-200/70 text-[11px] text-slate-500">
                Invited by <strong>{invitationData.inviterName}</strong>
              </div>
            </div>

            {/* Verified Email (Read-only) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              </label>
              <div className="relative">
                <Input
                  disabled
                  value={invitationData.email}
                  className="h-9 text-xs font-mono bg-slate-100/80 text-slate-700 pl-8 cursor-not-allowed border-slate-200"
                />
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  First Name
                </label>
                <Input
                  required
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Last Name
                </label>
                <Input
                  required
                  placeholder="e.g. Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Create Password
              </label>
              <PasswordInput
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-xs"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Confirm Password
              </label>
              <PasswordInput
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-xs"
              />
              <p className="text-[10px] text-slate-400">
                Must be at least 8 characters.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full bg-crm-teal hover:bg-crm-teal-hover text-white text-xs font-semibold h-10 shadow-sm flex items-center justify-center gap-1.5"
              >
                <UserCheck className="h-4 w-4" />
                <span>Activate Account & Sign In</span>
              </Button>
            </div>

            <div className="text-center pt-1">
              <Link
                href="/login"
                className="text-[11px] text-crm-muted hover:text-crm-teal transition-colors"
              >
                Already have an active account? Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-crm-background">
          <Loader2 className="h-8 w-8 animate-spin text-crm-teal" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </React.Suspense>
  );
}
