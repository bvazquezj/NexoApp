import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TimelineBucket, HealthCheckResult } from '../../types/deployment.types'

interface Props {
  buckets: TimelineBucket[]
  /** Number of hours represented in the timeline (used for empty padding). Default: 24. */
  hours?: number
}

const RESULT_COLORS: Record<HealthCheckResult, string> = {
  UP: 'bg-green-500',
  DEGRADED: 'bg-yellow-500',
  DOWN: 'bg-red-500',
  TIMEOUT: 'bg-red-700',
}

const RESULT_LABELS: Record<HealthCheckResult, string> = {
  UP: 'Activo',
  DEGRADED: 'Degradado',
  DOWN: 'Caído',
  TIMEOUT: 'Timeout',
}

export function UptimeTimeline({ buckets, hours = 24 }: Props) {
  // Fill empty slots up to `hours` so the bar is always full-width even if backend returned fewer buckets.
  const filled: (TimelineBucket | null)[] = []
  const slots = Math.max(hours, buckets.length)
  for (let i = 0; i < slots; i++) {
    filled.push(buckets[i] ?? null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-stretch gap-0.5 h-10 w-full">
        {filled.map((bucket, idx) => {
          const cls = bucket ? RESULT_COLORS[bucket.result] : 'bg-gray-100'
          const tooltip = bucket
            ? `${format(parseISO(bucket.hour), "d MMM HH:mm", { locale: es })} · ${RESULT_LABELS[bucket.result]} (${bucket.totalChecks} checks)`
            : 'Sin datos'
          return (
            <div
              key={idx}
              className={`flex-1 rounded-sm ${cls} transition-colors hover:opacity-80`}
              title={tooltip}
            />
          )
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span>-{hours}h</span>
        <span>Ahora</span>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-gray-600 pt-1">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> UP
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500" /> Degradado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Caído
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-gray-200" /> Sin datos
        </span>
      </div>
    </div>
  )
}
