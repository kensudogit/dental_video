/**
 * GraphQL HTTP / WebSocket エンドポイント解決（Gateway BFF 向け）。
 */
import { resolveApiUrl } from '@/lib/resolve-api-url'

export function httpBaseToGraphqlWs(httpBase: string): string {
  const trimmed = httpBase.trim().replace(/\/+$/, '')
  const u = new URL(trimmed.startsWith('http') ? trimmed : `http://${trimmed}`)
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${u.origin}/graphql`
}

export function graphqlHttpUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/graphql`
  }
  return `${resolveApiUrl().replace(/\/+$/, '')}/graphql`
}

export function defaultGraphqlWsUri(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL?.trim()
  if (fromEnv) {
    const trimmed = fromEnv.replace(/\/+$/, '')
    return trimmed.endsWith('/graphql') ? trimmed : `${trimmed}/graphql`
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location
    if (port === '3000' || port === '') {
      return httpBaseToGraphqlWs(resolveApiUrl())
    }
    const wsProto = protocol === 'https:' ? 'wss:' : 'ws:'
    return `${wsProto}//${window.location.host}/graphql`
  }

  return httpBaseToGraphqlWs(process.env.API_URL ?? resolveApiUrl())
}

export type GraphqlRuntimeConfig = {
  graphqlWsUrl: string
  apiBase: string
  unified: boolean
}

export type GraphqlRuntimeContextValue = GraphqlRuntimeConfig & {
  subscriptionReady: boolean
}
