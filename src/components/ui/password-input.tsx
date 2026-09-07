'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="w-full">
        <div className="relative flex items-center">
          <input
            type={showPassword ? 'text' : 'password'}
            disabled={disabled}
            className={cn(
              'flex h-9 w-full rounded-md border border-crm-border bg-white px-3 py-1.5 pr-10 text-sm text-crm-text placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crm-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm',
              error && 'border-red-500 focus-visible:ring-red-500',
              className,
            )}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-crm-teal disabled:opacity-50 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
