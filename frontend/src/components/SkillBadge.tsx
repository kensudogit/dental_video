import type { SkillLevel } from '@/lib/generated/graphql'
import { skillLabels } from '@/lib/labels'

export function SkillBadge({ level }: { level: SkillLevel }) {
  return <span className={`badge badge-skill badge-${level.toLowerCase()}`}>{skillLabels[level]}</span>
}
