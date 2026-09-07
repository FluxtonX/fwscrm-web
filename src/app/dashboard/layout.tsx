'use client';

import * as React from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Spinner } from '@/components/ui/spinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-crm-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-crm-muted font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen w-full bg-crm-background flex flex-col overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-crm-background">
          {children}
        </main>
      </div>
    </div>
  );
}
