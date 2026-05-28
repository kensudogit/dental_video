/** Server-side upstream fetch with timeout (auth/graphql proxies). */
export async function fetchUpstream(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response> {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
  })
}

function forwardSetCookies(upstream: Response, outHeaders: Headers) {
  const setCookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : upstream.headers.get('set-cookie')
        ? [upstream.headers.get('set-cookie')!]
        : []
  for (const value of setCookies) {
    outHeaders.append('set-cookie', value)
  }
}

/** Pass through the first upstream that responds (incl. 401/503 app errors). */
export async function proxyUpstreamResponse(upstream: Response): Promise<Response> {
  const text = await upstream.text()
  const outHeaders = new Headers()
  const upstreamType = upstream.headers.get('content-type')
  if (upstreamType) outHeaders.set('content-type', upstreamType)
  forwardSetCookies(upstream, outHeaders)
  return new Response(text, { status: upstream.status, headers: outHeaders })
}

export async function proxyToApiBases(
  bases: string[],
  buildTarget: (base: string) => string,
  init: RequestInit,
): Promise<Response> {
  const failures: string[] = []
  for (const base of bases) {
    const target = buildTarget(base)
    try {
      const upstream = await fetchUpstream(target, init)
      return proxyUpstreamResponse(upstream)
    } catch (err) {
      failures.push(`${base}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  return Response.json({ error: `Cannot reach API (${failures.join('; ')})` }, { status: 502 })
}
