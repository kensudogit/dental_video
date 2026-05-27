'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ui } from '@/lib/ui'
import { UsageGuidePanel } from '@/components/UsageGuidePanel'

const nav = [
  { href: '/', label: ui.navHome, short: ui.navHome },
  { href: '/board', label: ui.navBoard, short: ui.navBoard },
  { href: '/videos', label: ui.navVideos, short: ui.navVideos },
  { href: '/paths', label: ui.navPaths, short: ui.navPaths },
  { href: '/learning', label: ui.navLearning, short: ui.navLearning },
  { href: '/quizzes', label: ui.navQuizzes, short: ui.navQuizzes },
  { href: '/instructors', label: ui.navInstructors, short: ui.navInstructors },
  { href: '/settings', label: ui.navSettings, short: ui.navSettings },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <div className={`app-shell${navOpen ? ' nav-open' : ''}`}>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="close menu"
        onClick={() => setNavOpen(false)}
      />
      <aside className="sidebar">
        <div className="brand">
          <Image src="/icon.svg" alt="" width={40} height={40} priority />
          <div>
            <div className="brand-title">{ui.appTitle}</div>
            <div className="brand-sub">{ui.appSubtitle}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'nav-link active' : 'nav-link'}
              >
                <span className="nav-full">{item.label}</span>
                <span className="nav-short">{item.short}</span>
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-foot">
          <Link href="/status" className="status-link">
            {ui.apiStatus}
          </Link>
        </div>
      </aside>
      <div className="main-col">
        <header className="topbar">
          <button
            type="button"
            className="menu-btn"
            aria-label="menu"
            onClick={() => setNavOpen((o) => !o)}
          >
            &#9776;
          </button>
          <span className="topbar-title">{ui.topbar}</span>
        </header>
        <main className="main-content">{children}</main>
      </div>
      <UsageGuidePanel />
    </div>
  )
}
