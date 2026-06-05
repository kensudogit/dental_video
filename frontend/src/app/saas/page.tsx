import { SaasHubClient } from '@/components/SaasHubClient'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default function SaasHubPage() {
  return (
    <>
      <div className="page-head">
        <h1>{ui.saasHubTitle}</h1>
        <p>{ui.saasHubDesc}</p>
      </div>
      <SaasHubClient />
    </>
  )
}
