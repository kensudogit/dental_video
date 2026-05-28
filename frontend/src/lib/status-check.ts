import { isUnifiedDeploy, resolveApiUrl } from '@/lib/resolve-api-url'

export type StatusPayload = {
  service: string
  ok: boolean
  apiUrl: string
  apiUrlNote?: string
  graphqlProxy: string
  unified: boolean
  health: { ok?: boolean; service?: string; version?: string }
  error?: string
}

export async function fetchApiStatus(): Promise<StatusPayload> {
  const apiUrl = resolveApiUrl()
  const unified = isUnifiedDeploy()

  let health: StatusPayload['health'] = {}
  let apiReachable = false
  let error: string | undefined

  try {
    const res = await fetch(`${apiUrl}/health`, { cache: 'no-store' })
    health = (await res.json()) as StatusPayload['health']
    apiReachable = res.ok && health.ok === true
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  const payload: StatusPayload = {
    service: 'dental-video-web',
    ok: apiReachable,
    apiUrl,
    graphqlProxy: '/graphql',
    unified,
    health,
    error,
  }

  if (unified && apiUrl.includes('127.0.0.1')) {
    payload.apiUrlNote =
      'Unified deploy: API runs inside the same container. Browsers use /graphql and /auth on this site (not 127.0.0.1).'
  }

  return payload
}
