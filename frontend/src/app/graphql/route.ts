import { listApiBaseCandidates } from '@/lib/resolve-api-url'
import { fetchUpstream } from '@/lib/proxy-fetch'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function forwardAuthHeaders(request: Request, headers: Headers) {
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const accept = request.headers.get('accept')
  if (accept) headers.set('accept', accept)
  const cookie = request.headers.get('cookie')
  if (cookie) headers.set('cookie', cookie)
  const authorization = request.headers.get('authorization')
  if (authorization) headers.set('authorization', authorization)
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) headers.set('x-api-key', apiKey)
}

async function proxy(request: Request): Promise<Response> {
  const bases = listApiBaseCandidates()
  const search = new URL(request.url).search

  const headers = new Headers()
  forwardAuthHeaders(request, headers)

  const bodyText =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()

  const failures: string[] = []
  for (const base of bases) {
    const target = `${base}/graphql${search}`
    try {
      const upstream = await fetchUpstream(target, {
        method: request.method,
        headers,
        body: bodyText,
        cache: 'no-store',
      })
      if (!upstream.ok && (upstream.status === 502 || upstream.status === 503)) {
        failures.push(`${base}: HTTP ${upstream.status}`)
        continue
      }
      const text = await upstream.text()
      const outHeaders = new Headers()
      const upstreamType = upstream.headers.get('content-type')
      if (upstreamType) outHeaders.set('content-type', upstreamType)
      const setCookies =
        typeof upstream.headers.getSetCookie === 'function'
          ? upstream.headers.getSetCookie()
          : upstream.headers.get('set-cookie')
            ? [upstream.headers.get('set-cookie')!]
            : []
      for (const value of setCookies) {
        outHeaders.append('set-cookie', value)
      }
      return new Response(text, { status: upstream.status, headers: outHeaders })
    } catch (err) {
      failures.push(`${base}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return Response.json(
    { errors: [{ message: `Cannot reach API (${failures.join('; ')})` }] },
    { status: 502 },
  )
}

export async function GET(request: Request) {
  return proxy(request)
}

export async function POST(request: Request) {
  return proxy(request)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, accept, authorization, cookie, x-api-key',
    },
  })
}
