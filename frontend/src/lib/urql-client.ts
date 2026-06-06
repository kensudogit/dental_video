'use client'

import { cacheExchange, Client, fetchExchange, subscriptionExchange } from '@urql/core'
import { createClient as createWSClient, type Client as WSClient } from 'graphql-ws'
import { defaultGraphqlWsUri, graphqlHttpUri } from '@/lib/graphql-endpoints'

function buildWsClient(wsUrl: string): WSClient {
  return createWSClient({
    url: wsUrl,
    retryAttempts: 12,
    retryWait: async (retries) => {
      await new Promise((r) => setTimeout(r, Math.min(800 + retries * 400, 5000)))
    },
    shouldRetry: () => true,
  })
}

export function createUrqlClient(wsUrl?: string): Client {
  const resolvedWs = wsUrl ?? defaultGraphqlWsUri()
  const wsClient = typeof window !== 'undefined' ? buildWsClient(resolvedWs) : null

  return new Client({
    url: graphqlHttpUri(),
    fetchOptions: { credentials: 'include' },
    exchanges: [
      cacheExchange,
      fetchExchange,
      subscriptionExchange({
        forwardSubscription(request) {
          if (!wsClient) {
            throw new Error('WebSocket subscriptions are only available in the browser')
          }
          const input = { ...request, query: request.query ?? '' }
          return {
            subscribe(sink) {
              const dispose = wsClient.subscribe(input, sink)
              return { unsubscribe: dispose }
            },
          }
        },
      }),
    ],
  })
}

let urql: Client | null = null
let wsUrlUsed = ''

/** @deprecated Prefer createUrqlClient after /api/runtime-config */
export function getUrqlClient(): Client {
  const ws = defaultGraphqlWsUri()
  if (!urql || wsUrlUsed !== ws) {
    urql = createUrqlClient(ws)
    wsUrlUsed = ws
  }
  return urql
}
