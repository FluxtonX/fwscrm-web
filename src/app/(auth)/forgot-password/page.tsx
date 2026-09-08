'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { apiClient } from '@/lib/api/client';
import { CheckCircle2, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    try {
      await apiClient('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          newPassword: data.newPassword,
        }),
      });
      setIsSuccess(true);
    } catch (err: any) {
      setServerError(
        err?.message ||
          'Failed to reset password. Please verify the email address exists in the system.',
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-crm-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-crm-border bg-white p-8 shadow-sm">
        <div className="text-center">
          <Link
            href="/"
            className="inline-block text-2xl font-semibold tracking-tight text-crm-header hover:opacity-90 transition-opacity"
          >
            <span className="text-[#16C1C8] font-bold">FWS</span> CRM
          </Link>
          <h2 className="mt-3 text-lg font-semibold text-crm-header flex items-center justify-center gap-2">
            <KeyRound className="h-5 w-5 text-[#16C1C8]" />
            Direct Password Reset
          </h2>
          <p className="mt-1 text-xs text-crm-muted">
            Manage your credentials directly without waiting for external emails
          </p>
        </div>

        {serverError && (
          <div className="flex items-center gap-2 rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-5 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-semibold text-emerald-900">
              Password Reset Successfully
            </h3>
            <p className="text-xs text-emerald-700 leading-relaxed font-normal">
              Your account password has been updated securely. You can now sign in with your new credentials.
            </p>
            <div className="pt-2">
              <Link href="/login" className="block w-full">
                <Button className="w-full bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] font-semibold">
                  Sign In with New Password
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-crm-text mb-1">
                Account Email Address
              </label>
              <Input
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                disabled={isSubmitting}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-crm-text mb-1">
                New Password (Min. 8 characters)
              </label>
              <PasswordInput
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-crm-text mb-1">
                Confirm New Password
              </label>
              <PasswordInput
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 font-semibold bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] transition-all"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        )}

        <div className="border-t border-slate-100 pt-4 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-crm-muted hover:text-crm-text transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
