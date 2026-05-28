import { fetchApiStatus } from '@/lib/status-check'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await fetchApiStatus()
  return Response.json(payload)
}
