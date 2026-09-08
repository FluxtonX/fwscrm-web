'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/features/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { AlertCircle } from 'lucide-react';

const registerSchema = z
  .object({
    organizationName: z
      .string()
      .min(2, 'Organization name must be at least 2 characters'),
    organizationSlug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug must only contain lowercase letters, numbers, and hyphens',
      ),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerOrg } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('organizationSlug', slug, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerOrg({
        organizationName: data.organizationName,
        organizationSlug: data.organizationSlug,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
    } catch (err: any) {
      setServerError(
        err?.message ||
          'Failed to register organization. Please try a different slug or email.',
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-crm-background px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-xl border border-crm-border bg-white p-8 shadow-sm">
        <div className="text-center">
          <Link
            href="/"
            className="inline-block text-2xl font-semibold tracking-tight text-crm-header hover:opacity-90 transition-opacity"
          >
            <span className="text-[#16C1C8] font-bold">FWS</span> CRM
          </Link>
          <h2 className="mt-3 text-lg font-semibold text-crm-header">
            Create your CRM Organization
          </h2>
          <p className="mt-1 text-xs text-crm-muted">
            Set up your organization workspace and Super Administrator account
          </p>
        </div>

        {serverError && (
          <div className="flex items-center gap-2 rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-crm-text mb-1">
                Organization Name
              </label>
              <Input
                placeholder="Acme Corporation"
                disabled={isSubmitting}
                error={errors.organizationName?.message}
                {...register('organizationName', {
                  onChange: handleOrgNameChange,
                })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-crm-text mb-1">
                Workspace Slug
              </label>
              <Input
                placeholder="acme-corp"
                disabled={isSubmitting}
                error={errors.organizationSlug?.message}
                {...register('organizationSlug')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-crm-text mb-1">
                First Name
              </label>
              <Input
                placeholder="John"
                disabled={isSubmitting}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-crm-text mb-1">
                Last Name
              </label>
              <Input
                placeholder="Doe"
                disabled={isSubmitting}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              Work Email
            </label>
            <Input
              type="email"
              placeholder="admin@company.com"
              autoComplete="email"
              disabled={isSubmitting}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-crm-text mb-1">
                Password
              </label>
              <PasswordInput
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-crm-text mb-1">
                Confirm Password
              </label>
              <PasswordInput
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 font-semibold bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] transition-all"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Creating Workspace & Signing In...'
              : 'Create Workspace & Sign In'}
          </Button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-crm-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#16C1C8] hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
