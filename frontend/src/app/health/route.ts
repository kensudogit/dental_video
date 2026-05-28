// Liveness probe for Railway (does not call the Go API).
export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    ok: true,
    service: 'dental-video-web',
    unified: process.env.UNIFIED_DEPLOY === '1',
  })
}
