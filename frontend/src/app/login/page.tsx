'use client'

import Link from 'next/link'
import { useState } from 'react'
import { apiBase } from '@/lib/api-base'
import { ui } from '@/lib/ui'

const LOGIN_TIMEOUT_MS = 20000

export default function LoginPage() {
  const [email, setEmail] = useState('demo@sakura-dental.jp')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { error?: string }).error ?? 'Login failed')
      }
      // Full navigation avoids Apollo/router hangs after login.
      window.location.assign('/settings')
    } catch (err) {
      if (err instanceof Error && err.name === 'TimeoutError') {
        setError('Login timed out. Check /status and DATABASE_URL on Railway, then retry.')
      } else {
        setError(err instanceof Error ? err.message : 'Login failed')
      }
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="panel auth-card">
        <h1>{ui.loginTitle}</h1>
        <p className="muted">{ui.loginDesc}</p>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? ui.loginBusy : ui.loginSubmit}
          </button>
        </form>
        {error ? (
          <div className="alert">
            <p>{error}</p>
            {error.includes('postgresql') || error.includes('DATABASE_URL') ? (
              <p className="muted small" style={{ marginTop: '0.5rem' }}>
                Railway: Variables → add DATABASE_URL (Postgres Reference). Then check{' '}
                <Link href="/status">/status</Link>.
              </p>
            ) : error.includes('timed out') || error.includes('Timeout') ? (
              <p className="muted small" style={{ marginTop: '0.5rem' }}>
                <Link href="/status">/status</Link> で PostgreSQL: connected を確認してください。
              </p>
            ) : error === 'invalid credentials' ? (
              <p className="muted small" style={{ marginTop: '0.5rem' }}>
                Demo: demo@sakura-dental.jp / demo1234 — redeploy after DATABASE_URL is set so the demo account is seeded.
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="muted small" style={{ marginTop: '1rem' }}>
          {ui.loginDemoHint}
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          <Link href="/">{ui.backHome}</Link>
        </p>
      </div>
    </div>
  )
}
