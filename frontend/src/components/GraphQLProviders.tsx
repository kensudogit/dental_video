'use client'

/**
 * Apollo（Query/Mutation）と urql（Subscription）を併用する Provider ラッパー。
 */
import { ApolloProvider } from '@apollo/client/react'
import { createContext, useEffect, useMemo, useState } from 'react'
import { Provider as UrqlProvider, type Client } from 'urql'
import { getApolloClient } from '@/lib/apollo-client'
import type { GraphqlRuntimeConfig, GraphqlRuntimeContextValue } from '@/lib/graphql-endpoints'
import { createUrqlClient } from '@/lib/urql-client'

const defaultRuntime: GraphqlRuntimeContextValue = {
  graphqlWsUrl: '',
  apiBase: '',
  unified: false,
  subscriptionReady: false,
}

export const GraphqlRuntimeContext = createContext<GraphqlRuntimeContextValue>(defaultRuntime)

export function GraphQLProviders({ children }: { children: React.ReactNode }) {
  const [runtime, setRuntime] = useState<GraphqlRuntimeConfig | null>(null)
  const [urqlClient, setUrqlClient] = useState<Client | null>(null)
  const apollo = useMemo(() => getApolloClient(), [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/runtime-config', { cache: 'no-store' })
        if (!res.ok) throw new Error('runtime-config failed')
        const cfg = (await res.json()) as GraphqlRuntimeConfig
        if (cancelled) return
        setRuntime(cfg)
        setUrqlClient(createUrqlClient(cfg.graphqlWsUrl))
      } catch {
        if (cancelled) return
        setUrqlClient(createUrqlClient())
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const contextValue: GraphqlRuntimeContextValue = {
    graphqlWsUrl: runtime?.graphqlWsUrl ?? '',
    apiBase: runtime?.apiBase ?? '',
    unified: runtime?.unified ?? false,
    subscriptionReady: urqlClient != null,
  }

  return (
    <ApolloProvider client={apollo}>
      <GraphqlRuntimeContext.Provider value={contextValue}>
        {urqlClient ? (
          <UrqlProvider value={urqlClient}>{children}</UrqlProvider>
        ) : (
          children
        )}
      </GraphqlRuntimeContext.Provider>
    </ApolloProvider>
  )
}
