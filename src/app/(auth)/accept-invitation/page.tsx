'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AcceptInvitationPage() {
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-crm-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-crm-border bg-white p-8 shadow-sm text-center">
        <Link
          href="/"
          className="inline-block text-2xl font-semibold tracking-tight text-crm-header hover:opacity-90 transition-opacity"
        >
          <span className="text-[#16C1C8] font-bold">FWS</span> CRM
        </Link>

        <div className="rounded-lg bg-teal-50 border border-teal-200 p-4 space-y-2">
          <Info className="h-6 w-6 text-crm-teal mx-auto" />
          <h2 className="text-base font-bold text-slate-800">Direct Sign-In Workspace</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Team member invitations have been replaced with direct account creation. Your administrator has created your account directly. Please sign in with your credentials.
          </p>
        </div>

        <p className="text-xs text-slate-400">
          Redirecting to sign in page...
        </p>

        <Button
          onClick={() => router.replace('/login')}
          className="w-full bg-crm-teal hover:bg-crm-teal-hover text-white text-xs font-semibold h-10"
        >
          <span>Go to Sign In</span>
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}

