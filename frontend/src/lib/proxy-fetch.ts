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
