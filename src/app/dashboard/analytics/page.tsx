'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Route temporarily disabled per client request:
 * "nasir you have to get rid of this page at all"
 *
 * Redirects any direct URL visits back to the main dashboard so no analytics queries are invoked.
 * The full original implementation is preserved in:
 * src/app/dashboard/analytics/page.tsx.disabled
 */
export default function AnalyticsPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
