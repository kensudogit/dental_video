import { resolveApiUrl } from '@/lib/resolve-api-url'

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiUrl = resolveApiUrl()
  let health: { ok?: boolean; service?: string; version?: string } = {}
  let apiReachable = false
  let error: string | undefined

  try {
    const res = await fetch(`${apiUrl}/health`, { cache: 'no-store' })
    health = (await res.json()) as typeof health
    apiReachable = res.ok && health.ok === true
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  return Response.json({
    service: 'dental-video-web',
    ok: apiReachable,
    apiUrl,
    health,
    error,
  })
}
