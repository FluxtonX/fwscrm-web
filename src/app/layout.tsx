import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/features/auth/auth-context';

export const metadata: Metadata = {
  title: 'FWS CRM - Production Lead Management',
  description:
    'Scalable, high-performance CRM platform for enterprise lead lifecycle management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-crm-background text-crm-text">
        <QueryProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
