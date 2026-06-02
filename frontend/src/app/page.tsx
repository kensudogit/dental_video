/** ダッシュボード（おすすめ動画・学習パス・統計）。SSR で GraphQL を取得。 */
import Link from 'next/link'
import { LearningLivePanel } from '@/components/LearningLivePanel'
import { StatCard } from '@/components/StatCard'
import { VideoCard } from '@/components/VideoCard'
import { CategoryBadge } from '@/components/CategoryBadge'
import { SkillBadge } from '@/components/SkillBadge'
import { DashboardPageDocument, type DashboardPageQuery } from '@/lib/generated/graphql'
import { gqlRequest } from '@/lib/gql'
import { graphQLErrorHint } from '@/lib/graphql-errors'
import { displayText } from '@/lib/display-text'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let error: string | null = null
  let data: DashboardPageQuery = {
    dashboard: {
      videosTotal: 0,
      learningPathsTotal: 0,
      quizzesTotal: 0,
      completionsThisMonth: 0,
      watchHoursThisMonth: 0,
      activeLearners: 0,
    },
    featuredVideos: [],
    learningPaths: [],
  }

  try {
    data = await gqlRequest(DashboardPageDocument)
  } catch (e) {
    error = e instanceof Error ? e.message : ui.graphqlError
  }

  const d = data.dashboard

  return (
    <>
      <div className="page-head">
        <h1>{ui.dashboardTitle}</h1>
        <p>{ui.dashboardDesc}</p>
      </div>

      {error ? (
        <div className="alert">
          <p>{error}</p>
          <p>{graphQLErrorHint(error)}</p>
        </div>
      ) : null}

      <LearningLivePanel />

      <section className="stat-grid">
        <StatCard label={ui.statVideos} value={`${d.videosTotal} ${ui.unitVideos}`} accent="cyan" />
        <StatCard label={ui.statPaths} value={`${d.learningPathsTotal} ${ui.unitCourses}`} accent="violet" />
        <StatCard label={ui.statQuizzes} value={`${d.quizzesTotal} ${ui.unitItems}`} accent="emerald" />
        <StatCard
          label={ui.statWatch}
          value={`${d.watchHoursThisMonth.toFixed(1)} ${ui.hours}`}
          sub={ui.completionSub(d.completionsThisMonth, d.activeLearners)}
          accent="amber"
        />
      </section>

      <section className="panel">
        <h3>{ui.featured}</h3>
        <div className="video-grid">
          {data.featuredVideos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <Link href="/videos" className="btn">
            {ui.allVideos}
          </Link>
        </p>
      </section>

      <section className="panel">
        <h3>{ui.pathsSection}</h3>
        <div className="path-list">
          {data.learningPaths.map((p) => (
            <Link key={p.id} href={`/paths/${p.id}`} className="path-item">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <CategoryBadge category={p.category} />
                <SkillBadge level={p.skillLevel} />
              </div>
              <h4>{displayText(p.title)}</h4>
              <p>{ui.pathMeta(p.estimatedMinutes, p.enrolledCount)}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
