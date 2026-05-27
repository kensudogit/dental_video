export function apiBase(): string {
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '') || 'http://localhost:8080'
  }
  return (process.env.API_URL ?? 'http://localhost:8080').replace(/\/+$/, '')
}
