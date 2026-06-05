import { SaasModuleClient } from '@/components/SaasModuleClient'
import { notFound } from 'next/navigation'

const allowed = new Set(['dx', 'crm', 'attendance', 'contracts', 'chat', 'rag'])

export const dynamic = 'force-dynamic'

export default async function SaasModulePage({
  params,
}: {
  params: Promise<{ module: string }>
}) {
  const { module } = await params
  if (!allowed.has(module)) notFound()
  return (
    <SaasModuleClient
      module={module as 'dx' | 'crm' | 'attendance' | 'contracts' | 'chat' | 'rag'}
    />
  )
}
