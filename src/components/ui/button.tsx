import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary:
        'bg-[#16C1C8] text-[#071A1D] hover:bg-[#22D3DA] font-semibold focus-visible:ring-[#16C1C8] shadow-sm',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 font-medium focus-visible:ring-slate-400',
      outline:
        'border border-crm-border bg-white text-crm-text hover:bg-[#F0F6F6] hover:border-[#16C1C8]/40 font-medium focus-visible:ring-[#16C1C8]',
      ghost:
        'text-crm-text hover:bg-[#F0F6F6] hover:text-[#16C1C8] font-medium focus-visible:ring-slate-400',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 font-semibold focus-visible:ring-red-600 shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2 h-9 gap-2',
      lg: 'text-base px-5 py-2.5 h-11 gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
