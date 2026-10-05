'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({ children }: { children: ReactNode }) {
  // useState ensures each client session keeps a stable QueryClient instance across re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data remains fresh for 1 minute before background refetch
            gcTime: 5 * 60 * 1000, // Unused cached data is garbage collected after 5 minutes
            retry: 1, // Auto-retry once on network failure
            refetchOnWindowFocus: false, // Prevent jarring refetches on window blur/focus
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
