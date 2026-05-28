import Link from 'next/link'
import { fetchApiStatus } from '@/lib/status-check'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function StatusPage() {
  const s = await fetchApiStatus()

  return (
    <div className="page-head">
      <h1>{ui.statusPageTitle}</h1>
      <p>{ui.statusPageDesc}</p>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <p>
          <strong>{ui.statusApiLabel}</strong>{' '}
          <span className={s.ok ? 'text-ok' : 'text-bad'}>{s.ok ? ui.statusOk : ui.statusNg}</span>
        </p>
        {s.apiUrlNote ? <p className="muted small">{s.apiUrlNote}</p> : null}
        <ul className="metric-list" style={{ marginTop: '0.75rem' }}>
          <li>
            <span>{ui.statusGraphql}</span>
            <code>/graphql</code> {s.ok ? '? OK' : ''}
          </li>
          <li>
            <span>{ui.statusAuth}</span>
            <code>/auth/login</code>
          </li>
          <li>
            <span>API (internal)</span>
            <code>{s.apiUrl}</code>
          </li>
          {s.health?.version ? (
            <li>
              <span>API version</span>
              <code>{s.health.version}</code>
            </li>
          ) : null}
        </ul>
        {s.error ? <p className="alert">{s.error}</p> : null}
        {!s.ok ? <p className="muted small">{ui.statusFailHint}</p> : null}
        {s.ok ? (
          <p className="muted small" style={{ marginTop: '0.75rem' }}>
            {ui.statusLoginHint}
          </p>
        ) : null}
        <p style={{ marginTop: '1rem' }}>
          <Link href="/login" className="btn">
            {ui.loginSubmit}
          </Link>{' '}
          <Link href="/">{ui.backHome}</Link>
        </p>
        <p className="muted small" style={{ marginTop: '0.75rem' }}>
          JSON: <Link href="/api/status">/api/status</Link>
        </p>
      </section>
    </div>
  )
}
