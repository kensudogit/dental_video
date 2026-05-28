'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import Link from 'next/link'
import {
  OrganizationSettingsDocument,
  UpdateOrganizationDocument,
} from '@/lib/generated/graphql'

export default function SettingsPage() {
  const { data, loading, error, refetch } = useQuery(OrganizationSettingsDocument, {
    fetchPolicy: 'network-only',
  })
  const [updateOrg, { loading: saving }] = useMutation(UpdateOrganizationDocument)

  const org = data?.organization
  const usage = data?.usageSummary

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await updateOrg({
      variables: {
        input: {
          name: String(fd.get('name') ?? ''),
          slug: String(fd.get('slug') ?? ''),
          seatCount: Number(fd.get('seatCount') ?? 0),
          timezone: String(fd.get('timezone') ?? ''),
        },
      },
    })
    refetch()
  }

  if (loading) return <p className="muted">Loading...</p>

  return (
    <>
      <div className="page-head">
        <h1>Organization settings (SaaS)</h1>
        <p>Manage tenant isolation, plan, and usage.</p>
      </div>

      {error ? (
        <div className="panel">
          <p className="alert">{error.message}</p>
          <p className="muted small">
            API connection failed. Check <Link href="/status">/status</Link> first, then redeploy.
          </p>
        </div>
      ) : !org ? (
        <div className="panel">
          <p>PostgreSQL mode: sign in to manage your organization.</p>
          <p className="muted small">
            API is connected when <Link href="/status">/status</Link> shows OK. Demo: demo@sakura-dental.jp / demo1234
          </p>
          <Link href="/login" className="btn">
            Login
          </Link>
        </div>
      ) : (
        <>
          <form className="panel auth-form" onSubmit={save}>
            <label>
              Clinic name
              <input name="name" defaultValue={org.name} required />
            </label>
            <label>
              Slug
              <input name="slug" defaultValue={org.slug} required />
            </label>
            <label>
              Seats
              <input name="seatCount" type="number" defaultValue={org.seatCount} min={1} />
            </label>
            <label>
              Timezone
              <input name="timezone" defaultValue={org.timezone} />
            </label>
            <p className="muted small">
              Plan: {org.planTier} / {org.subscriptionStatus} / members {org.memberCount}
            </p>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>

          {usage ? (
            <section className="stat-grid" style={{ marginTop: '1rem' }}>
              <div className="stat-card">
                <div className="stat-label">Members</div>
                <div className="stat-value">
                  {usage.members} / {usage.membersLimit}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Videos</div>
                <div className="stat-value">
                  {usage.videos} / {usage.videosLimit}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">API (month)</div>
                <div className="stat-value">
                  {usage.apiCallsThisMonth} / {usage.apiCallsLimit}
                </div>
              </div>
            </section>
          ) : null}

          <section className="panel" style={{ marginTop: '1rem' }}>
            <h3>Team</h3>
            <ul className="metric-list">
              {data?.teamMembers?.map((m) => (
                <li key={m.id}>
                  <span>
                    {m.user.name} ({m.user.email}) - {m.role}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  )
}
