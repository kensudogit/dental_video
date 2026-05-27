'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiBase } from '@/lib/api-base'
import { ui } from '@/lib/ui'

export default function LoginPage() {
  const router = useRouter()
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
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { error?: string }).error ?? 'Login failed')
      }
      router.push('/settings')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
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
        {error ? <p className="alert">{error}</p> : null}
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
