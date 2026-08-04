import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO, subHours } from 'date-fns'
import { es } from 'date-fns/locale'
import { getDeploymentMetrics, getDeploymentTimeline } from '../../../api/deployments.api'
import { UptimeTimeline } from '../UptimeTimeline'

interface Props {
  deploymentId: string
}

function fmtPercent(p: number | null | undefined) {
  if (p === null || p === undefined) return '—'
  return `${(p * 100).toFixed(2)}%`
}

function fmtMs(ms: number | null | undefined) {
  if (ms === null || ms === undefined) return '—'
  return `${Math.round(ms)} ms`
}

function fmtDateTime(iso: string) {
  try {
    return format(parseISO(iso), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return iso
  }
}

export function DeploymentHealthTab({ deploymentId }: Props) {
  const metricsQuery = useQuery({
    queryKey: ['deployments', deploymentId, 'metrics'],
    queryFn: () => getDeploymentMetrics(deploymentId),
  })

  // Compute the time window once per render but stable enough for the query key.
  const { from, to } = useMemo(() => {
    const now = new Date()
    return {
      from: subHours(now, 24).toISOString(),
      to: now.toISOString(),
    }
  }, [])

  const timelineQuery = useQuery({
    queryKey: ['deployments', deploymentId, 'timeline', from, to],
    queryFn: () => getDeploymentTimeline(deploymentId, from, to),
  })

  const metrics = metricsQuery.data

  return (
    <div className="space-y-4">
      {/* Uptime cards */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Uptime</h3>
        {metricsQuery.isLoading && (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        {metricsQuery.isError && (
          <p className="text-sm text-red-600">Error al cargar métricas.</p>
        )}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-1">Últimas 24h</p>
              <p className="text-2xl font-bold text-gray-900">{fmtPercent(metrics.uptime24h)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-1">Últimos 7 días</p>
              <p className="text-2xl font-bold text-gray-900">{fmtPercent(metrics.uptime7d)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-1">Últimos 30 días</p>
              <p className="text-2xl font-bold text-gray-900">{fmtPercent(metrics.uptime30d)}</p>
              <p className="text-[10px] text-gray-400 mt-1">{metrics.totalChecks30d} checks</p>
            </div>
          </div>
        )}
      </section>

      {/* Latency */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Latencia (24h)</h3>
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-1">Promedio</p>
              <p className="text-xl font-bold text-gray-900">{fmtMs(metrics.avgLatencyMs24h)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-1">p95</p>
              <p className="text-xl font-bold text-gray-900">{fmtMs(metrics.p95LatencyMs24h)}</p>
            </div>
          </div>
        )}
      </section>

      {/* Last incident */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Último incidente</h3>
        {metrics?.lastIncident ? (
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-gray-500 text-xs">Inició</dt>
              <dd className="text-gray-900 font-medium">{fmtDateTime(metrics.lastIncident.startedAt)}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs">Recuperado</dt>
              <dd className={metrics.lastIncident.recoveredAt ? 'text-gray-900 font-medium' : 'text-red-700 font-semibold'}>
                {metrics.lastIncident.recoveredAt
                  ? fmtDateTime(metrics.lastIncident.recoveredAt)
                  : 'Aún caído'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs">Duración</dt>
              <dd className="text-gray-900 font-medium">
                {metrics.lastIncident.durationMinutes !== null
                  ? `${metrics.lastIncident.durationMinutes} min`
                  : '—'}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-gray-400">No hay incidentes registrados.</p>
        )}
      </section>

      {/* Timeline */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline 24h</h3>
        {timelineQuery.isLoading && (
          <div className="h-16 bg-gray-100 rounded animate-pulse" />
        )}
        {timelineQuery.isError && (
          <p className="text-sm text-red-600">Error al cargar el timeline.</p>
        )}
        {timelineQuery.data && (
          <UptimeTimeline buckets={timelineQuery.data.buckets} hours={24} />
        )}
      </section>
    </div>
  )
}
