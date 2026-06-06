/**
 * ブラウザ向け Gateway 接続情報（WebSocket URL 等）。
 * HTTP プロキシと同じ候補から WS URL を導出する。
 */
import { httpBaseToGraphqlWs } from '@/lib/graphql-endpoints'
import { isUnifiedDeploy, listApiBaseCandidates } from '@/lib/resolve-api-url'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isLoopbackBase(base: string): boolean {
  try {
    const host = new URL(base.startsWith('http') ? base : `http://${base}`).hostname.toLowerCase()
    return host === 'localhost' || host === '127.0.0.1' || host === '::1'
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const bases = listApiBaseCandidates()
  const apiBase = bases[0] ?? 'http://localhost:8080'
  const unified = isUnifiedDeploy()

  // 統合デプロイ: ブラウザからは同一オリジン WS（Railway エッジ → 内部 Go API）
  if (unified && isLoopbackBase(apiBase)) {
    const reqUrl = new URL(request.url)
    const wsProto = reqUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    return Response.json({
      graphqlWsUrl: `${wsProto}//${reqUrl.host}/graphql`,
      apiBase,
      unified: true,
    })
  }

  return Response.json({
    graphqlWsUrl: httpBaseToGraphqlWs(apiBase),
    apiBase,
    unified,
  })
}
