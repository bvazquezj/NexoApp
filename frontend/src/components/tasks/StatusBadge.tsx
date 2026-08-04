import type { TaskStatus } from '../../types/task.types'

interface Props {
  status: TaskStatus
  color?: string
}

const defaultStyles: Record<string, { chip: string; dot: string }> = {
  PENDING: { chip: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  READY: { chip: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  REVIEW: { chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  COMPLETED: { chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
}

const defaultLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  READY: 'Listo',
  REVIEW: 'Revision',
  COMPLETED: 'Completada',
}

export function StatusBadge({ status, color }: Props) {
  if (defaultStyles[status]) {
    const s = defaultStyles[status]
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.chip}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
        {defaultLabels[status] ?? status}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: color ? `${color}20` : '#f1f5f9',
        color: color ?? '#64748b',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color ?? '#94a3b8' }} />
      {status}
    </span>
  )
}
