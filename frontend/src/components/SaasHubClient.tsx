'use client'

import Link from 'next/link'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  SaasModulesDocument,
  SetSaasModuleEnabledDocument,
  SaasModuleCode,
} from '@/lib/generated/graphql'
import { isAuthRequiredGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

const links = [
  { href: '/saas/dx', code: SaasModuleCode.Dx, label: ui.saasDx },
  { href: '/saas/crm', code: SaasModuleCode.Crm, label: ui.saasCrm },
  { href: '/saas/attendance', code: SaasModuleCode.Attendance, label: ui.saasAttendance },
  { href: '/saas/contracts', code: SaasModuleCode.Econtract, label: ui.saasContracts },
  { href: '/saas/chat', code: SaasModuleCode.Chatbot, label: ui.saasChat },
  { href: '/saas/rag', code: SaasModuleCode.DocRag, label: ui.saasRag },
] as const

export function SaasHubClient() {
  const { data, loading, error, refetch } = useQuery(SaasModulesDocument, {
    fetchPolicy: 'network-only',
  })
  const [setEnabled, { loading: toggling }] = useMutation(SetSaasModuleEnabledDocument)

  const modules = data?.saasModules ?? []

  async function toggle(code: SaasModuleCode, enabled: boolean) {
    await setEnabled({ variables: { code, enabled } })
    await refetch()
  }

  if (loading) return <p className="muted">{ui.boardLoading}</p>

  if (error) {
    const authRequired = isAuthRequiredGraphQLError(error)
    return (
      <div className="alert">
        <p>{authRequired ? ui.saasLoginHint : error.message}</p>
        {authRequired && (
          <Link href="/login" className="btn">
            {ui.loginSubmit}
          </Link>
        )}
      </div>
    )
  }

  const enabledCodes = new Set(modules.filter((m) => m.enabled).map((m) => m.code))

  return (
    <>
      <p className="muted saas-hub-hint">{ui.saasToggleHint}</p>
      <div className="saas-grid">
        {links.map((item) => {
          const mod = modules.find((m) => m.code === item.code)
          const on = enabledCodes.has(item.code)
          return (
            <article key={item.href} className={`saas-card${on ? '' : ' disabled'}`}>
              <div className="saas-card-head">
                <Link href={on ? item.href : '/saas'} className="saas-card-link">
                  <h3>{item.label}</h3>
                  <p>{mod?.description ?? ''}</p>
                </Link>
                <label className="saas-toggle" title={on ? ui.saasDisable : ui.saasEnable}>
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={toggling}
                    onChange={(e) => toggle(item.code, e.target.checked)}
                  />
                  <span className="saas-toggle-ui" aria-hidden />
                </label>
              </div>
              <div className="saas-card-foot">
                <span className={`saas-badge${on ? ' on' : ''}`}>
                  {on ? ui.saasEnabled : ui.saasDisabled}
                </span>
                {on && (
                  <Link href={item.href} className="saas-open-link">
                    {ui.saasOpen}
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
