import type { TaskPriority } from '../../types/task.types'

interface Props {
  priority: TaskPriority
}

const styles: Record<TaskPriority, { chip: string; dot: string }> = {
  HIGH: { chip: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  MEDIUM: { chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  LOW: { chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
}

const labels: Record<TaskPriority, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
}

export function PriorityBadge({ priority }: Props) {
  const s = styles[priority]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {labels[priority]}
    </span>
  )
}
