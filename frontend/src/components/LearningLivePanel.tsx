'use client'

/**
 * urql Subscription で学習進捗・ダッシュボード更新をリアルタイム表示。
 */
import { useEffect, useState } from 'react'
import { useSubscription } from 'urql'
import {
  DashboardUpdatedDocument,
  LearningActivityDocument,
  ProgressUpdatedDocument,
} from '@/lib/generated/graphql'
import { DEMO_LEARNER_ID } from '@/lib/learner'
import { ui } from '@/lib/ui'

type ActivityRow = {
  kind: string
  message: string
  occurredAt: string
}

export function LearningLivePanel() {
  const [stats, setStats] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [feed, setFeed] = useState<ActivityRow[]>([])

  const [dash] = useSubscription({ query: DashboardUpdatedDocument })
  const [prog] = useSubscription({
    query: ProgressUpdatedDocument,
    variables: { learnerId: DEMO_LEARNER_ID },
  })
  const [activity] = useSubscription({
    query: LearningActivityDocument,
    variables: { learnerId: DEMO_LEARNER_ID },
  })

  const wsError = dash.error ?? prog.error ?? activity.error

  useEffect(() => {
    const d = dash.data?.dashboardUpdated
    if (d) {
      setStats(
        `\u52d5\u753b ${d.videosTotal} \u00b7 \u5b66\u7fd2\u30d1\u30b9 ${d.learningPathsTotal} \u00b7 \u8996\u8074 ${d.watchHoursThisMonth.toFixed(1)}h`,
      )
    }
  }, [dash.data])

  useEffect(() => {
    const p = prog.data?.progressUpdated
    if (p) {
      setProgress(`\u52d5\u753b ${p.videoId}: ${p.positionSec}s ${p.completed ? '(\u5b8c\u4e86)' : ''}`)
    }
  }, [prog.data])

  useEffect(() => {
    const ev = activity.data?.learningActivity
    if (ev) {
      // 最新 8 件のみ保持
      setFeed((rows) => [{ kind: ev.kind, message: ev.message, occurredAt: ev.occurredAt }, ...rows].slice(0, 8))
    }
  }, [activity.data])

  const wsState = wsError ? ui.liveOffline : dash.fetching ? ui.liveConnecting : ui.liveActive

  return (
    <section className="live-panel" aria-live="polite">
      <header className="live-panel-head">
        <h2>{ui.livePanelTitle}</h2>
        <span className={`live-badge${wsError ? ' live-badge--offline' : ''}`}>{wsState}</span>
      </header>
      {wsError ? <p className="muted small">{ui.liveOfflineHint}</p> : null}
      {stats ? <p className="live-stat">{stats}</p> : null}
      {progress ? <p className="live-progress">{progress}</p> : null}
      <ul className="live-feed">
        {feed.map((row, i) => (
          <li key={`${row.occurredAt}-${i}`}>
            <span className="live-kind">{row.kind}</span>
            <span>{row.message}</span>
          </li>
        ))}
      </ul>
      {feed.length === 0 && !wsError ? <p className="muted small">{ui.liveEmpty}</p> : null}
    </section>
  )
}
