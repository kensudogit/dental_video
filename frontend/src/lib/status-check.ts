import { isUnifiedDeploy, resolveApiUrl } from '@/lib/resolve-api-url'

export type StatusPayload = {
  service: string
  ok: boolean
  apiUrl: string
  apiUrlNote?: string
  graphqlProxy: string
  unified: boolean
  postgres?: boolean
  health: { ok?: boolean; service?: string; version?: string }
  error?: string
}

export async function fetchApiStatus(): Promise<StatusPayload> {
  const apiUrl = resolveApiUrl()
  const unified = isUnifiedDeploy()

  let health: StatusPayload['health'] = {}
  let apiReachable = false
  let postgres: boolean | undefined
  let error: string | undefined

  try {
    const res = await fetch(`${apiUrl}/health`, { cache: 'no-store' })
    health = (await res.json()) as StatusPayload['health']
    apiReachable = res.ok && health.ok === true

    const statusRes = await fetch(`${apiUrl}/status`, { cache: 'no-store' })
    if (statusRes.ok) {
      const statusJson = (await statusRes.json()) as { postgres?: boolean }
      postgres = statusJson.postgres
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  const payload: StatusPayload = {
    service: 'dental-video-web',
    ok: apiReachable,
    apiUrl,
    graphqlProxy: '/graphql',
    unified,
    postgres,
    health,
    error,
  }

  if (unified && apiUrl.includes('127.0.0.1')) {
    payload.apiUrlNote =
      'Unified deploy: API runs inside the same container. Browsers use /graphql and /auth on this site (not 127.0.0.1).'
  }

  if (apiReachable && postgres === false) {
    payload.apiUrlNote =
      (payload.apiUrlNote ? payload.apiUrlNote + ' ' : '') +
      'PostgreSQL is not connected. Set DATABASE_URL on Railway for SaaS login.'
  }

  return payload
}
