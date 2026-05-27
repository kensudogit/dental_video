/**
 * Go API base URL (no trailing slash).
 *
 * Unified deploy: UNIFIED_DEPLOY=1, API on 127.0.0.1:8081 in same container.
 * Two-service Railway: set API_URL on the Web service to the api public HTTPS URL.
 */

function isRailway(): boolean {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_ID,
  )
}

export function isUnifiedDeploy(): boolean {
  return process.env.UNIFIED_DEPLOY === '1' || process.env.UNIFIED_DEPLOY === 'true'
}

export function readApiUrlFromEnv(): string | undefined {
  const keys = ['API_URL', 'API URL', 'NEXT_PUBLIC_API_URL'] as const
  for (const key of keys) {
    const v = process.env[key]?.trim()
    if (v) return v
  }
  return undefined
}

export function isUnresolvedRailwayReference(value: string): boolean {
  return value.includes('${{')
}

function isInvalidApiUrlEnv(value: string): boolean {
  const v = value.trim()
  if (!v) return true
  if (isUnresolvedRailwayReference(v)) return true
  const broken = ['https://', 'http://', 'https:', 'http:']
  if (broken.includes(v)) return true
  try {
    const u = new URL(v.startsWith('http') ? v : `https://${v}`)
    if (!u.hostname || u.hostname.length < 2) return true
    if (u.hostname === 'https' || u.hostname === 'http') return true
    return false
  } catch {
    return true
  }
}

function isLocalhostApi(value: string): boolean {
  try {
    const u = new URL(value.startsWith('http') ? value : `http://${value}`)
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1'
  } catch {
    return value.includes('127.0.0.1') || value.includes('localhost')
  }
}

function pointsToThisWebService(url: string): boolean {
  const own = process.env.RAILWAY_PUBLIC_DOMAIN?.trim()
  if (!own) return false
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    return host === own
  } catch {
    return url.includes(own)
  }
}

function normalizeApiUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (isInvalidApiUrlEnv(trimmed)) {
    return ''
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  if (trimmed.includes('.railway.internal') || trimmed.includes('localhost')) {
    return `http://${trimmed}`
  }
  return `https://${trimmed}`
}

function unifiedInternalApiUrl(): string {
  const port = process.env.API_INTERNAL_PORT?.trim() || '8081'
  return `http://127.0.0.1:${port}`
}

function railwayInternalApiUrl(): string {
  const host =
    process.env.API_INTERNAL_HOST?.trim() ||
    process.env.RAILWAY_SERVICE_API_HOST?.trim() ||
    'api.railway.internal'
  const port =
    process.env.API_INTERNAL_PORT?.trim() ||
    process.env.API_PORT?.trim() ||
    '8080'
  return `http://${host}:${port}`
}

function externalApiUrlFromEnv(): string | undefined {
  const explicit = readApiUrlFromEnv()
  if (!explicit) return undefined
  const normalized = normalizeApiUrl(explicit)
  if (!normalized || pointsToThisWebService(normalized)) return undefined
  if (isLocalhostApi(normalized)) return undefined
  return normalized
}

export function listApiBaseCandidates(): string[] {
  const seen = new Set<string>()
  const add = (raw: string) => {
    const trimmed = raw.trim().replace(/\/+$/, '')
    if (trimmed) seen.add(trimmed)
  }

  const external = externalApiUrlFromEnv()
  if (external) {
    add(external)
  } else if (isUnifiedDeploy()) {
    add(unifiedInternalApiUrl())
    add(`http://localhost:${process.env.API_INTERNAL_PORT?.trim() || '8081'}`)
  }

  const explicit = readApiUrlFromEnv()
  if (explicit) {
    const normalized = normalizeApiUrl(explicit)
    if (normalized && !pointsToThisWebService(normalized)) {
      if (!(isRailway() && isLocalhostApi(normalized) && !isUnifiedDeploy())) {
        add(normalized)
      }
    }
  }

  if (isRailway()) {
    add(railwayInternalApiUrl())
  }

  add(resolveApiUrl())
  add('http://localhost:8080')
  return [...seen]
}

export function resolveApiUrl(): string {
  const external = externalApiUrlFromEnv()
  if (external) {
    return external
  }

  if (isUnifiedDeploy()) {
    return unifiedInternalApiUrl()
  }

  const explicit = readApiUrlFromEnv()
  if (explicit) {
    const normalized = normalizeApiUrl(explicit)
    if (normalized && !pointsToThisWebService(normalized)) {
      if (isRailway() && isLocalhostApi(normalized)) {
        return railwayInternalApiUrl()
      }
      return normalized
    }
  }

  if (isRailway()) {
    return railwayInternalApiUrl()
  }

  return 'http://localhost:8080'
}

export function isProductionDeploy(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function graphQLConnectionHint(): string {
  const raw = readApiUrlFromEnv()
  const target = resolveApiUrl()

  if (isUnifiedDeploy()) {
    return (
      'Unified deploy: Go API is not reachable at ' +
      target +
      '. Check Railway deploy logs for "[unified] API ready". ' +
      'Remove API_URL from Railway Variables (not needed for unified).'
    )
  }

  if (isProductionDeploy() && isRailway() && raw && isLocalhostApi(raw)) {
    return (
      'This container runs Next.js only. Delete API_URL=' +
      JSON.stringify(raw) +
      ' and redeploy with unified Dockerfile, ' +
      'OR set API_URL to your api service public HTTPS URL.'
    )
  }

  if (raw && pointsToThisWebService(normalizeApiUrl(raw) || raw)) {
    return (
      'API_URL points to this Web app (' +
      raw +
      '). Set API_URL to the api service URL instead.'
    )
  }

  if (raw && process.env['API URL'] && !process.env.API_URL) {
    return 'Rename variable "API URL" to API_URL (underscore) on the Web service.'
  }

  if (raw && isInvalidApiUrlEnv(raw) && !isUnresolvedRailwayReference(raw)) {
    return 'API_URL is invalid (' + JSON.stringify(raw) + '). Use full https URL.'
  }

  if (raw && isUnresolvedRailwayReference(raw)) {
    return 'API_URL is still a Railway template. Set it via Add Reference with https:// prefix.'
  }

  if (isProductionDeploy() && isRailway()) {
    return 'Tried ' + target + '. Recreate the api service or use unified deploy (see docs/RAILWAY.md).'
  }

  if (isProductionDeploy()) {
    return 'Tried ' + target + '. Set API_URL to the API public HTTPS URL.'
  }

  return 'Local: run npm run dev from repository root so api (:8080) and web (:3000) both start.'
}
