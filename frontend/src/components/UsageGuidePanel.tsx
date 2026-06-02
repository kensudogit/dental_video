'use client'

/**
 * 画面右下のドラッグ可能な利用手順パネル（localStorage で位置・開閉を保存）。
 */
import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'dental-video-usage-guide-v7'
const PANEL_WIDTH = 380

type GuideStep = {
  title: string
  body: string
  items?: readonly string[]
}

const orgSettingsGuide = {
  title: 'Organization settings (SaaS) / 組織設定',
  body: '/settings でクリニック（テナント）の管理画面。PostgreSQL 接続 + ログインが必要です。',
  items: [
    '左メニュー「組織設定」または /settings',
    'デモ: demo@sakura-dental.jp / demo1234',
    '【編集可】クリニック名・slug・席数・タイムゾーン → Save',
    '【参照のみ】プラン・契約状態・メンバー数',
    '【利用量】Members / Videos / API（今月）の上限対比',
    '【Team】メンバー一覧（OWNER / ADMIN / MEMBER / VIEWER）',
    'テナント分離: ログイン org の org_id でデータを分離',
  ],
} as const

const L = {
  title: '利用手順',
  dragHint: 'ドラッグで移動',
  expand: '開く',
  collapse: '閉じる',
  scrollHint: '↓ スクロールでデプロイ・開発手順も表示されます',
  orgSettingsLabel: 'SaaS',
  footer:
    '▼▲ で開閉、ヘッダーをドラッグして好きな位置に移動できます。表示位置は自動保存されます。',
  steps: [
    {
      title: '1. 接続確認（最初に）',
      body: '本番・ローカル共通。エラー時は /status の PostgreSQL と JWT を確認します。',
      items: [
        '/health → Web 生存確認（Railway ヘルスチェック）',
        '/status → PostgreSQL: connected / API 接続 OK',
        '左下メニュー「API 接続確認」からも同じ内容を確認',
      ],
    },
    {
      title: '2. Railway 本番デプロイ',
      body: 'Go API + Next.js を 1 サービスで公開。詳細は docs/RAILWAY.md。',
      items: [
        'GitHub: kensudogit/dental_video → Root 空欄 + /railway.toml',
        'PostgreSQL 追加 → dental_video Variables → DATABASE_URL = Reference → Postgres → DATABASE_URL',
        'JWT_SECRET = ランダム文字列（API キー不可）・OPENAI_API_KEY = 任意',
        'API_URL は設定しない（統合デプロイ）',
        'Redeploy → /status OK → /login',
      ],
    },
    {
      title: '3. デモログイン',
      body: 'PostgreSQL 接続時はクリニック（テナント）単位でデータが分離されます。',
      items: [
        '/login → demo@sakura-dental.jp / demo1234',
        'ログイン後 JWT クッキー (dv_token) が発行され GraphQL がテナント別に',
        '組織管理の詳細 → 上部「Organization settings (SaaS) / 組織設定」',
      ],
    },
    {
      title: '4. 組織設定 (Organization settings · SaaS)',
      body: orgSettingsGuide.body,
      items: [...orgSettingsGuide.items],
    },
    {
      title: '5. Docker ローカル（推奨）',
      body: 'PostgreSQL + MinIO + API + Web を一括起動。SaaS・AI Board の確認に最適。',
      items: [
        'cp .env.example .env → OPENAI_API_KEY を設定（AI Board 用）',
        'npm run docker:up',
        'Web http://localhost:3000 · GraphiQL http://localhost:8080/graphiql',
        '停止: npm run docker:down',
      ],
    },
    {
      title: '6. npm ローカル開発',
      body: 'DATABASE_URL 未設定時はメモリストア。設定すれば PostgreSQL に切り替わります。',
      items: [
        'npm run install:all → cd backend; go mod tidy',
        'npm run dev（API :8080 + Web :3000）',
        'npm run codegen（schema 変更後）',
      ],
    },
    {
      title: '7. 学習コンテンツ',
      body: '動画・学習パス・テスト・マイ学習で段階的に習得します。',
      items: [
        '動画ライブラリ → 分野・難易度・キーワードで検索',
        '学習パス → カリキュラム順に視聴・修了証',
        '理解度テスト → 動画視聴後の確認',
        'マイ学習 → 進捗・ブックマーク・修了証一覧',
      ],
    },
    {
      title: '8. AI Board',
      body: '学習 KPI を集約し、OpenAI で経営インサイトを生成します。',
      items: [
        '/board → 期間を選んで KPI 確認',
        '「AI 経営インサイト生成」→ 強み・リスク・提案',
        'OPENAI_API_KEY 未設定時はルールベース表示',
      ],
    },
    {
      title: '9. 開発者向け',
      body: 'gqlgen + Codegen + Apollo + urql（Subscription）構成。',
      items: [
        'GraphiQL: http://localhost:8080/graphiql',
        '本番 GraphQL: /graphql（同一オリジン）',
        'SSR: gqlRequest · クライアント: @apollo/client/react',
      ],
    },
  ] satisfies readonly GuideStep[],
} as const

type SavedState = {
  x: number
  y: number
  expanded: boolean
}

function defaultPosition() {
  if (typeof window === 'undefined') return { x: 24, y: 24 }
  const x = Math.max(16, window.innerWidth - PANEL_WIDTH - 24)
  const y = Math.max(72, window.innerHeight - 440)
  return { x, y }
}

function clampPosition(x: number, y: number, width: number, height: number) {
  const maxX = Math.max(8, window.innerWidth - width - 8)
  const maxY = Math.max(8, window.innerHeight - height - 8)
  return {
    x: Math.min(Math.max(8, x), maxX),
    y: Math.min(Math.max(8, y), maxY),
  }
}

export function UsageGuidePanel() {
  const panelRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const [ready, setReady] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [pos, setPos] = useState({ x: 24, y: 24 })
  const [dragging, setDragging] = useState(false)

  // 初回マウント時に保存済み位置を復元（SSR 不一致回避のため ready まで非表示）
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedState
        setPos({ x: parsed.x, y: parsed.y })
        setExpanded(parsed.expanded)
      } catch {
        setPos(defaultPosition())
      }
    } else {
      setPos(defaultPosition())
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const payload: SavedState = { ...pos, expanded }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [pos, expanded, ready])

  useEffect(() => {
    if (!ready) return
    const onResize = () => {
      const el = panelRef.current
      if (!el) return
      setPos((current) => clampPosition(current.x, current.y, el.offsetWidth, el.offsetHeight))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [ready])

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if ((e.target as HTMLElement).closest('.usage-guide-toggle')) return
      // 開閉ボタン上ではドラッグ開始しない
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: pos.x,
        originY: pos.y,
      }
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [pos.x, pos.y],
  )

  const onHeaderPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const el = panelRef.current
    const width = el?.offsetWidth ?? PANEL_WIDTH
    const height = el?.offsetHeight ?? 120
    setPos(
      clampPosition(
        drag.originX + (e.clientX - drag.startX),
        drag.originY + (e.clientY - drag.startY),
        width,
        height,
      ),
    )
  }, [])

  const onHeaderPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    dragRef.current = null
    setDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  if (!ready) return null

  return (
    <div
      ref={panelRef}
      className={`usage-guide-panel${expanded ? ' is-expanded' : ' is-collapsed'}${dragging ? ' is-dragging' : ''}`}
      style={{ left: pos.x, top: pos.y, width: PANEL_WIDTH }}
      role="dialog"
      aria-label={L.title}
      aria-modal="false"
    >
      <header
        className="usage-guide-header"
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        onPointerCancel={onHeaderPointerUp}
      >
        <div className="usage-guide-header-text">
          <span className="usage-guide-drag-icon" aria-hidden>
            ☰
          </span>
          <strong>{L.title}</strong>
          <span className="usage-guide-drag-hint">{L.dragHint}</span>
        </div>
        <button
          type="button"
          className="usage-guide-toggle"
          aria-label={expanded ? L.collapse : L.expand}
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? '▼' : '▲'}
        </button>
      </header>

      {expanded ? (
        <div className="usage-guide-body">
          <section className="usage-guide-featured" aria-label={orgSettingsGuide.title}>
            <div className="usage-guide-featured-head">
              <span className="usage-guide-featured-badge">{L.orgSettingsLabel}</span>
              <strong>{orgSettingsGuide.title}</strong>
            </div>
            <p>{orgSettingsGuide.body}</p>
            <ul className="usage-guide-items">
              {orgSettingsGuide.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <p className="usage-guide-scroll-hint">{L.scrollHint}</p>
          <ol className="usage-guide-steps">
            {L.steps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
                {step.items?.length ? (
                  <ul className="usage-guide-items">
                    {step.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="usage-guide-footer">{L.footer}</p>
        </div>
      ) : null}
    </div>
  )
}
