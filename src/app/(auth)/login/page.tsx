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
import { AlertCircle, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setServerError(
        err?.message || 'Invalid credentials. Please check your email and password.',
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-crm-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-crm-border bg-white p-8 shadow-sm transition-all">
        <div className="text-center">
          <Link href="/" className="inline-block text-2xl font-semibold tracking-tight text-crm-header hover:opacity-90 transition-opacity">
            <span className="text-[#16C1C8] font-bold">FWS</span> CRM
          </Link>
          <h2 className="mt-3 text-lg font-semibold text-crm-header">
            Sign in to your account
          </h2>
          <p className="mt-1 text-xs text-crm-muted">
            Enter your credentials to access your organization workspace
          </p>
        </div>

        {serverError && (
          <div className="flex items-center gap-2 rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        <form
          method="POST"
          action="#"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              Email Address
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-crm-text">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-[#16C1C8] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] font-semibold"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-crm-muted">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-[#16C1C8] hover:underline"
          >
            Register Organization
          </Link>
        </div>
      </div>
    </div>
  );
}
