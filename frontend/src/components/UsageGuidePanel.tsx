'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'dental-video-usage-guide-v3'
const PANEL_WIDTH = 380

type GuideStep = {
  title: string
  body: string
  items?: readonly string[]
}

const L = {
  title: '\u5229\u7528\u624b\u9806',
  dragHint: '\u30c9\u30e9\u30c3\u30b0\u3067\u79fb\u52d5',
  expand: '\u958b\u304f',
  collapse: '\u9589\u3058\u308b',
  footer:
    '\u25bc\u25b2 \u3067\u958b\u9589\u3001\u30d8\u30c3\u30c0\u30fc\u3092\u30c9\u30e9\u30c3\u30b0\u3057\u3066\u4f55\u3067\u3082\u597d\u304d\u306a\u4f4d\u7f6e\u306b\u79fb\u52d5\u3067\u304d\u307e\u3059\u3002\u8868\u793a\u4f4d\u7f6e\u306f\u81ea\u52d5\u4fdd\u5b58\u3055\u308c\u307e\u3059\u3002',
  steps: [
    {
      title: '1. \u307e\u305a\u78ba\u8a8d\u3059\u308b',
      body: '\u63a5\u7d9a\u72b6\u614b\u3068\u30a8\u30f3\u30c9\u30dd\u30a4\u30f3\u30c8\u3092\u78ba\u8a8d\u3057\u3066\u304b\u3089\u5b66\u7fd2\u3092\u59cb\u3081\u307e\u3057\u3087\u3046\u3002',
      items: [
        '/status \u2192 API \u63a5\u7d9a\u3068 apiUrl \u3092\u78ba\u8a8d',
        '\u53f3\u4e0b\u306e\u672c\u30d1\u30cd\u30eb\uFF08\u25bc\u25b2\uFF09\u3067\u5229\u7528\u624b\u9806\u3092\u958b\u9589\u30fb\u79fb\u52d5',
        '\u30ca\u30d3: \u30db\u30fc\u30e0 / \u52d5\u753b / \u30d1\u30b9 / \u30de\u30a4\u5b66\u7fd2 / AI Board / \u8a2d\u5b9a',
      ],
    },
    {
      title: '2. Docker \u74b0\u5883\uFF08\u63a8\u5968\uFF09',
      body: 'PostgreSQL + MinIO + API + Web \u3092\u4e00\u62ec\u8d77\u52d5\u3057\u307e\u3059\u3002SaaS \u30fb AI Board \u306e\u52d5\u4f5c\u78ba\u8a8d\u306b\u6700\u9069\u3067\u3059\u3002',
      items: [
        'cp .env.example .env \u2192 OPENAI_API_KEY \u3092\u8a2d\u5b9a\uFF08AI Board \u7528\uFF09',
        'npm run docker:up\uFF08\u307e\u305f\u306f docker compose up --build\uFF09',
        'Web http://localhost:3000 \u00b7 GraphiQL http://localhost:8080/graphiql',
        '\u30c7\u30e2\u30ed\u30b0\u30a4\u30f3: demo@sakura-dental.jp / demo1234',
        '\u505c\u6b62: npm run docker:down',
      ],
    },
    {
      title: '3. Railway \uFF08\u672c\u756a\u30c7\u30d7\u30ed\u30a4\uFF09',
      body: 'Go API + Next.js \u3092 1 \u30b5\u30fc\u30d3\u30b9\u3067\u516c\u958b\u3067\u304d\u307e\u3059\u3002\u8a73\u7d30\u306f docs/RAILWAY.md \u3092\u53c2\u7167\u3002',
      items: [
        'Root Directory \u7a7a\u6b04 + Config /railway.toml\uFF08Dockerfile.unified\uFF09',
        'PostgreSQL \u30d7\u30e9\u30b0\u30a4\u30f3 + DATABASE_URL \u53c2\u7167',
        'JWT_SECRET \u5fc5\u9808\uFF08\u4e00\u4f53\u578b\u3067 API_URL \u306f\u4e0d\u8981\uFF09',
        '/status \u3067 ok: true \u2192 \u30c9\u30e1\u30a4\u30f3\u3067 /login \u2192 /settings',
        'CLI: railway login \u2192 railway init \u2192 railway up',
      ],
    },
    {
      title: '4. \u30ed\u30fc\u30ab\u30eb\u958b\u767a (npm)',
      body: 'DB \u306a\u3057\u3067\u306f\u30e1\u30e2\u30ea\u30b9\u30c8\u30a2\u3002DATABASE_URL \u3092\u8a2d\u5b9a\u3059\u308c\u3070 PostgreSQL \u306b\u5207\u308a\u66ff\u308f\u308a\u307e\u3059\u3002',
      items: [
        'npm run install:all \u2192 cd backend; go mod tidy',
        'npm run dev\uFF08API :8080 + Web :3000\uFF09',
        '\u30dd\u30fc\u30c8\u7af6\u5408\u6642\u306f npm run stop:api',
        'backend: go generate ./... \uFF08gqlgen \u518d\u751f\u6210\uFF09',
      ],
    },
    {
      title: '5. SaaS \u30ed\u30b0\u30a4\u30f3\u30fb\u7d44\u7e54\u8a2d\u5b9a',
      body: '\u30af\u30ea\u30cb\u30c3\u30af\u5358\u4f4d\u3067\u30c7\u30fc\u30bf\u304c\u9694\u96e2\u3055\u308c\u307e\u3059\u3002',
      items: [
        '/login \u3067\u30af\u30ea\u30cb\u30c3\u30af\u30aa\u30fc\u30ca\u30fc\u30ed\u30b0\u30a4\u30f3',
        '/settings \u3067\u7d44\u7e54\u540d\u30fb\u5e2d\u6570\u30fb\u5229\u7528\u91cf\u30fb\u30c1\u30fc\u30e0\u3092\u7ba1\u7406',
        'JWT \u30af\u30c3\u30ad\u30fc (dv_token) \u3067 GraphQL \u304c\u30c6\u30ca\u30f3\u30c8\u5225\u3051',
      ],
    },
    {
      title: '6. AI Board\uFF08\u533b\u7642\u7d4c\u55b6\u5206\u6790\uFF09',
      body: '\u5b66\u7fd2KPI\u3092\u96c6\u7d04\u3057\u3001OpenAI \u3067\u7d4c\u55b6\u30a4\u30f3\u30b5\u30a4\u30c8\u3092\u751f\u6210\u3057\u307e\u3059\u3002',
      items: [
        '/board \u3067\u671f\u9593\u3092\u9078\u629e\u3057 KPI \u3092\u78ba\u8a8d',
        '\u300cAI \u7d4c\u55b6\u30a4\u30f3\u30b5\u30a4\u30c8\u751f\u6210\u300d\u3067\u5f37\u307f\u30fb\u30ea\u30b9\u30af\u30fb\u63d0\u6848',
        'OPENAI_API_KEY \u672a\u8a2d\u5b9a\u6642\u306f\u30eb\u30fc\u30eb\u30d9\u30fc\u30b9\u8868\u793a',
      ],
    },
    {
      title: '7. \u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9\u30fb\u30e9\u30a4\u30d6\u30d5\u30a3\u30fc\u30c9',
      body: '\u52d5\u753b\u6570\u30fb\u5b66\u7fd2\u30d1\u30b9\u30fb\u8996\u8074\u6642\u9593\u306e\u6982\u8981\u3068\u3001\u9032\u6377\u306e\u30e9\u30a4\u30d6\u66f4\u65b0\u30d5\u30a3\u30fc\u30c9\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002',
      items: [
        '\u30e9\u30a4\u30d6\u5b66\u7fd2\u30d5\u30a3\u30fc\u30c9\u3067\u9032\u6377\u30fb\u30a2\u30af\u30c6\u30a3\u30d3\u30c6\u30a3\u3092\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u8868\u793a',
        'urql \u30b5\u30d6\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3\uFF08ws://localhost:8080/graphql\uFF09',
      ],
    },
    {
      title: '8. \u52d5\u753b\u30e9\u30a4\u30d6\u30e9\u30ea',
      body: '\u51e6\u7f6e\u30fb\u5206\u91ce\u30fb\u96e3\u6613\u5ea6\u30fb\u30ad\u30fc\u30ef\u30fc\u30c9\u3067\u52d5\u753b\u3092\u691c\u7d22\u3057\u307e\u3059\u3002',
      items: [
        '\u4e0a\u90e8\u306e\u30d5\u30a3\u30eb\u30bf\u3067\u5206\u91ce\uff08\u6b6f\u5185\u7642\u6cd5\u30fb\u6b6f\u5468\u306a\u3069\uff09\u3092\u7d5e\u308a\u8fbc\u307f',
        '\u96e3\u6613\u5ea6\uff08\u521d\u7d1a\u30fb\u4e2d\u7d1a\u30fb\u4e0a\u7d1a\uff09\u3067\u5b66\u7fd2\u30ec\u30d9\u30eb\u3092\u9078\u629e',
        '\u30ab\u30fc\u30c9\u3092\u30af\u30ea\u30c3\u30af\u3059\u308b\u3068\u52d5\u753b\u8a73\u7d30\u3078\u9077\u79fb',
        '\u30da\u30fc\u30b8\u4e0b\u90e8\u3067\u6b21\u306e\u4e00\u89a7\u3078\u9032\u3081\u307e\u3059',
      ],
    },
    {
      title: '9. \u52d5\u753b\u8996\u8074\u30fb\u5b66\u7fd2\u8a18\u9332',
      body: '\u52d5\u753b\u3092\u8996\u8074\u3057\u306a\u304c\u3089\u9032\u6377\u30fb\u30e1\u30e2\u30fb\u30d6\u30c3\u30af\u30de\u30fc\u30af\u3092\u4fdd\u5b58\u3067\u304d\u307e\u3059\u3002',
      items: [
        '\u518d\u751f\u4f4d\u7f6e\uff08\u79d2\uff09\u3092\u5165\u529b\u3057\u300c\u9032\u6377\u3092\u4fdd\u5b58\u300d',
        '\u8996\u8074\u5b8c\u4e86\u306b\u3059\u308b\u3068\u30ab\u30ea\u30ad\u30e5\u30e9\u30e0\u5b8c\u4e86\u306b\u8fd1\u3065\u304d\u307e\u3059',
        '\u30bf\u30a4\u30e0\u30b9\u30bf\u30f3\u30d7\u30e1\u30e2\u3067\u624b\u6280\u306e\u30dd\u30a4\u30f3\u30c8\u3092\u8a18\u9332',
        '\u30d6\u30c3\u30af\u30de\u30fc\u30af\u3067\u5f8c\u304b\u3089\u3059\u3050\u306b\u518d\u8996\u8074\u3067\u304d\u307e\u3059',
        '\u95a2\u9023\u30c6\u30b9\u30c8\u304c\u3042\u308c\u3070\u7406\u89e3\u5ea6\u30c1\u30a7\u30c3\u30af\u3078\u9032\u3081\u307e\u3059',
      ],
    },
    {
      title: '10. \u5b66\u7fd2\u30d1\u30b9',
      body: '\u5206\u91ce\u5225\u306e\u30ab\u30ea\u30ad\u30e5\u30e9\u30e0\u3067\u6bb5\u968e\u7684\u306b\u624b\u6280\u3092\u7fd2\u5f97\u3057\u307e\u3059\u3002',
      items: [
        '\u30d1\u30b9\u3092\u958b\u304f\u3068\u52d5\u753b\u30ea\u30b9\u30c8\u3068\u4fee\u4e86\u8a3c\u30bf\u30a4\u30c8\u30eb\u3092\u78ba\u8a8d',
        '\u300c\u3053\u306e\u30d1\u30b9\u306b\u767b\u9332\u300d\u3067\u53d7\u8b16\u30b9\u30c6\u30fc\u30bf\u30b9\u3092\u8a18\u9332',
        '\u30ab\u30ea\u30ad\u30e5\u30e9\u30e0\u5185\u306e\u52d5\u753b\u3092\u9806\u306b\u8996\u8074\u3057\u3066\u5b8c\u4e86\u3057\u307e\u3059',
      ],
    },
    {
      title: '11. \u30de\u30a4\u5b66\u7fd2',
      body: '\u500b\u4eba\u306e\u8996\u8074\u9032\u6377\u30fb\u30d6\u30c3\u30af\u30de\u30fc\u30af\u30fb\u4fee\u4e86\u8a3c\u3092\u307e\u3068\u3081\u3066\u78ba\u8a8d\u3057\u307e\u3059\u3002',
      items: [
        '\u5b8c\u4e86\u3057\u305f\u52d5\u753b\u306f\u7dd1\u8272\u3067\u8868\u793a',
        '\u4fee\u4e86\u8a3c\u306f\u30d1\u30b9\u5b8c\u4e86\u5f8c\u306b\u767a\u884c\u3055\u308c\u307e\u3059',
        '\u672a\u5b8c\u4e86\u306e\u52d5\u753b\u306f\u518d\u751f\u4f4d\u7f6e\u304b\u3089\u518d\u958b\u3067\u304d\u307e\u3059',
      ],
    },
    {
      title: '12. \u7406\u89e3\u5ea6\u30c6\u30b9\u30c8',
      body: '\u52d5\u753b\u8996\u8074\u5f8c\u306e\u77e5\u8b58\u5b9a\u7740\u3092\u30af\u30a4\u30ba\u3067\u78ba\u8a8d\u3057\u307e\u3059\u3002',
      items: [
        '\u5408\u683c\u30e9\u30a4\u30f3\u3092\u8d85\u3048\u308b\u3068\u5408\u683c\u8868\u793a',
        '\u518d\u53d7\u9a13\u3067\u7406\u89e3\u3092\u6df1\u3081\u3089\u308c\u307e\u3059',
        '\u52d5\u753b\u306b\u7d10\u3065\u3044\u30c6\u30b9\u30c8\u306f\u52d5\u753b\u8a73\u7d30\u304b\u3089\u3082\u76f4\u63a5\u30a2\u30af\u30bb\u30b9',
      ],
    },
    {
      title: '13. \u8b1b\u5e2b\u30fb\u76e3\u4fee\u8005',
      body: '\u5404\u5206\u91ce\u306e\u5c02\u9580\u5bb6\u304c\u76e3\u4fee\u3057\u305f\u52d5\u753b\u306e\u6982\u8981\u3092\u78ba\u8a8d\u3067\u304d\u307e\u3059\u3002',
    },
    {
      title: '14. GraphQL / \u958b\u767a\u8005\u5411\u3051',
      body: 'gqlgen\uFF08Go\uFF09+ Codegen\uFF08TypedDocumentNode\uFF09+ Apollo\uFF08\u30af\u30e9\u30a4\u30a2\u30f3\u30c8 Mutation\uFF09+ urql\uFF08Subscription\uFF09\u3067\u69cb\u7bc9\u3055\u308c\u3066\u3044\u307e\u3059\u3002',
      items: [
        'GraphiQL: http://localhost:8080/graphiql',
        'npm run codegen\uFF08graphql/schema.graphql \u5909\u66f4\u5f8c\uFF09',
        'SSR \u30da\u30fc\u30b8\u306f gqlRequest\u3001\u30a4\u30f3\u30bf\u30e9\u30af\u30c6\u30a3\u30d6\u306f @apollo/client/react',
        'WebSocket: /graphql \u30d7\u30ed\u30ad\u30b7\uFF08\u672c\u756a\u306f wss://\u30c9\u30e1\u30a4\u30f3/graphql\uFF09',
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
            {'\u2630'}
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
          {expanded ? '\u25BC' : '\u25B2'}
        </button>
      </header>

      {expanded ? (
        <div className="usage-guide-body">
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
