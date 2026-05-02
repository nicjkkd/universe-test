'use client'

import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { useState, type PropsWithChildren } from 'react'

export function Providers({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000 } },
        queryCache: new QueryCache({
          onError: (err) => console.error('[query]', err),
        }),
        mutationCache: new MutationCache({
          onError: (err) => console.error('[mutation]', err),
        }),
      }),
  )
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster richColors closeButton position="bottom-right" />
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
