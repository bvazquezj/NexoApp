import { format, isToday, isPast, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  dueDate: string | null
}

export function DueDateChip({ dueDate }: Props) {
  if (!dueDate) return null

  const date = parseISO(dueDate)
  const overdue = isPast(date) && !isToday(date)
  const today = isToday(date)

  const colorClass = overdue
    ? 'text-red-600 bg-red-50'
    : today
    ? 'text-amber-600 bg-amber-50'
    : 'text-slate-500 bg-slate-50'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {format(date, 'd MMM', { locale: es })}
    </span>
  )
}
