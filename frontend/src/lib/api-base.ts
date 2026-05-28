/**
 * API base URL for REST (auth). Browser always uses same origin so Next.js can proxy to Go.
 */
export function apiBase(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return (process.env.API_URL ?? 'http://localhost:8080').replace(/\/+$/, '')
}
