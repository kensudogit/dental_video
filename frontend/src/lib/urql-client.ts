'use client'

import { cacheExchange, Client, fetchExchange, subscriptionExchange } from '@urql/core'
import { createClient as createWSClient } from 'graphql-ws'

function graphqlHttpUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/graphql`
  }
  return 'http://localhost:8080/graphql'
}

function graphqlWsUri(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL?.trim()
  if (fromEnv) {
    const trimmed = fromEnv.replace(/\/+$/, '')
    return trimmed.endsWith('/graphql') ? trimmed : `${trimmed}/graphql`
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location
    if (port === '3000' || port === '') {
      const wsProto = protocol === 'https:' ? 'wss:' : 'ws:'
      return `${wsProto}//${hostname}:8080/graphql`
    }
    const wsProto = protocol === 'https:' ? 'wss:' : 'ws:'
    return `${wsProto}//${window.location.host}/graphql`
  }
  const base = process.env.API_URL?.replace(/\/+$/, '') ?? 'http://localhost:8080'
  const url = new URL(base)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${url.origin}/graphql`
}

let urql: Client | null = null

export function getUrqlClient(): Client {
  if (!urql) {
    const wsClient =
      typeof window !== 'undefined'
        ? createWSClient({ url: graphqlWsUri(), retryAttempts: 5 })
        : null

    urql = new Client({
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
  return urql
}
