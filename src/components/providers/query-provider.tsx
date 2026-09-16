'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute default staleTime
            gcTime: 10 * 60 * 1000, // 10 minutes cache retention
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false, // Prevent refetch storm on temporary disconnect
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
