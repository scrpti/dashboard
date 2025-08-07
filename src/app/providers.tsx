'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/contexts/AppContext';
import { ToastContainer } from '@/components/ui';
import { queryClient } from '@/lib/queryClient';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {children}
        <ToastContainer />
      </AppProvider>
    </QueryClientProvider>
  );
}