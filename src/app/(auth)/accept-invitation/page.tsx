'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth/auth-context';
import {
  validateInvitationToken,
  acceptInvitation,
} from '@/features/invitations/api';
import { ValidatedInvitation } from '@/features/invitations/types';
import {
  AlertCircle,
  CheckCircle2,
  Building2,
  Shield,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useAuth();

  const [isValidating, setIsValidating] = React.useState(true);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [invitation, setInvitation] = React.useState<ValidatedInvitation | null>(null);

  // Account creation form state
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!token || !token.trim()) {
      setIsValidating(false);
      setValidationError(
        'No invitation token was provided in the link. Please verify your invitation email link.',
      );
      return;
    }

    let isMounted = true;

    async function checkToken() {
      try {
        const data = await validateInvitationToken(token!.trim());
        if (isMounted) {
          setInvitation(data);
          setValidationError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setValidationError(
            err?.message ||
              'This invitation link is invalid, expired, or has already been used.',
          );
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    }

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!firstName.trim()) {
      setFormError('First name is required');
      return;
    }

    if (!lastName.trim()) {
      setFormError('Last name is required');
      return;
    }

    if (!password || password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await acceptInvitation({
        token: token!.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      toast.success('Account activated successfully! Logging you in...');
      await refresh();
      router.push('/dashboard');
    } catch (err: any) {
      setFormError(
        err?.message || 'Failed to activate account. Please try again or request a new invitation.',
      );
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Spinner size="lg" />
        <p className="text-xs text-crm-muted font-medium">
          Verifying secure invitation...
        </p>
      </div>
    );
  }

  if (validationError || !invitation) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-center space-y-2">
          <AlertCircle className="h-6 w-6 text-rose-600 mx-auto" />
          <h3 className="text-sm font-bold text-rose-900">
            Invitation Link Not Valid
          </h3>
          <p className="text-xs text-rose-700 leading-relaxed max-w-sm mx-auto">
            {validationError}
          </p>
        </div>

        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-crm-teal hover:underline"
          >
            <span>Return to Sign In</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Invitation Info Box */}
      <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Building2 className="h-4 w-4 text-crm-teal" />
            <span>{invitation.organization.name}</span>
          </div>
          <Badge variant="teal" className="text-[10px] uppercase font-bold">
            {invitation.role}
          </Badge>
        </div>
        <div className="text-[11px] text-slate-500">
          Invited email: <strong className="text-slate-700">{invitation.email}</strong>
        </div>
      </div>

      {formError && (
        <div className="flex items-center gap-2 rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 animate-fadeIn">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Name Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">First Name</label>
          <Input
            required
            placeholder="e.g. Sarah"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isSubmitting}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Last Name</label>
          <Input
            required
            placeholder="e.g. Connor"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isSubmitting}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Password Inputs */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">
          Create Password <span className="text-slate-400 font-normal">(min 8 characters)</span>
        </label>
        <PasswordInput
          required
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          className="h-9 text-xs"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
        <PasswordInput
          required
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isSubmitting}
          className="h-9 text-xs"
        />
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full bg-crm-teal hover:bg-crm-teal-hover text-white text-xs font-semibold h-10 mt-2"
      >
        <UserCheck className="h-4 w-4 mr-1.5" />
        Activate Account & Join Workspace
      </Button>

      <p className="text-center text-[11px] text-slate-400 pt-1">
        By clicking activate, you accept access to {invitation.organization.name}.
      </p>
    </form>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-crm-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-crm-border bg-white p-8 shadow-sm transition-all">
        <div className="text-center">
          <Link
            href="/"
            className="inline-block text-2xl font-semibold tracking-tight text-crm-header hover:opacity-90 transition-opacity"
          >
            <span className="text-[#16C1C8] font-bold">FWS</span> CRM
          </Link>
          <h2 className="mt-3 text-lg font-semibold text-crm-header">
            Complete Account Activation
          </h2>
          <p className="mt-1 text-xs text-crm-muted">
            Set up your credentials to activate your organization membership
          </p>
        </div>

        <React.Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Spinner size="lg" />
              <p className="text-xs text-crm-muted font-medium">Loading invitation...</p>
            </div>
          }
        >
          <AcceptInvitationContent />
        </React.Suspense>
      </div>
    </div>
  );
}
