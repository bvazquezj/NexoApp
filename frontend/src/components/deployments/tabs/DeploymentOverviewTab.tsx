import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getDeploymentMetrics, updateDeployment } from '../../../api/deployments.api'
import { PlatformIcon, PLATFORM_LABELS } from '../PlatformIcon'
import { buildWebhookUrl, copyToClipboard, relativeTime } from '../../../utils/deployment'
import type { DeploymentResponse } from '../../../types/deployment.types'

interface Props {
  deployment: DeploymentResponse
}

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return '—'
  }
}

function fmtPercent(p: number | null | undefined) {
  if (p === null || p === undefined) return '—'
  return `${(p * 100).toFixed(2)}%`
}

function fmtMs(ms: number | null | undefined) {
  if (ms === null || ms === undefined) return '—'
  return `${Math.round(ms)} ms`
}

export function DeploymentOverviewTab({ deployment }: Props) {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const metricsQuery = useQuery({
    queryKey: ['deployments', deployment.id, 'metrics'],
    queryFn: () => getDeploymentMetrics(deployment.id),
  })

  const toggleHealthCheck = useMutation({
    mutationFn: (enabled: boolean) =>
      updateDeployment(deployment.id, { healthCheckEnabled: enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', deployment.id] })
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
    },
  })

  const webhookUrl = buildWebhookUrl(deployment.hookToken)

  async function handleCopyWebhook() {
    const ok = await copyToClipboard(webhookUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {/* General info */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Información general</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <dt className="text-gray-500">Platform</dt>
            <dd className="text-gray-800 inline-flex items-center gap-2">
              <PlatformIcon platform={deployment.platform} size="sm" />
              {PLATFORM_LABELS[deployment.platform]}
              {deployment.platformLabel && (
                <span className="text-gray-400">· {deployment.platformLabel}</span>
              )}
            </dd>
            <dt className="text-gray-500">Branch</dt>
            <dd className="text-gray-800 font-mono">{deployment.branch ?? '—'}</dd>
            <dt className="text-gray-500">Version</dt>
            <dd className="text-gray-800 font-mono">{deployment.version ?? '—'}</dd>
            {deployment.repoUrl && (
              <>
                <dt className="text-gray-500">Repo</dt>
                <dd className="text-blue-600 truncate">
                  <a href={deployment.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {deployment.repoUrl}
                  </a>
                </dd>
              </>
            )}
            <dt className="text-gray-500">Último deploy</dt>
            <dd className="text-gray-800">{fmtDateTime(deployment.lastDeployedAt)}</dd>
            <dt className="text-gray-500">Último check</dt>
            <dd className="text-gray-800">
              {fmtDateTime(deployment.lastHealthCheckAt)}{' '}
              <span className="text-gray-400">({relativeTime(deployment.lastHealthCheckAt)})</span>
            </dd>
            <dt className="text-gray-500">Service ID</dt>
            <dd className="text-gray-800 font-mono">{deployment.platformServiceId ?? '—'}</dd>
            <dt className="text-gray-500">Token API</dt>
            <dd className={deployment.hasPlatformApiToken ? 'text-green-700' : 'text-gray-400'}>
              {deployment.hasPlatformApiToken ? 'Configurado' : 'No configurado'}
            </dd>
          </dl>
        </section>

        {/* Notes */}
        {deployment.notes && (
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Notas</h3>
            <div className="markdown-body text-sm text-gray-700 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{deployment.notes}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* Webhook URL */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Webhook URL</h3>
          <p className="text-xs text-gray-500 mb-3">
            Configura este URL en tu plataforma para registrar deploys automáticamente.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 truncate">
              {webhookUrl}
            </code>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </section>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Quick metrics */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Métricas (24h)</h3>
          {metricsQuery.isLoading && (
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          )}
          {metricsQuery.data && (
            <div className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-gray-500">Uptime 24h</span>
                <span className="font-semibold text-gray-900">
                  {fmtPercent(metricsQuery.data.uptime24h)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-gray-500">Latencia p95</span>
                <span className="font-semibold text-gray-900">
                  {fmtMs(metricsQuery.data.p95LatencyMs24h)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-gray-500">Último incidente</span>
                <span className="font-medium text-gray-800 text-xs text-right">
                  {metricsQuery.data.lastIncident
                    ? `${relativeTime(metricsQuery.data.lastIncident.startedAt)}${
                        metricsQuery.data.lastIncident.recoveredAt
                          ? ` (${metricsQuery.data.lastIncident.durationMinutes ?? '?'} min)`
                          : ' · activo'
                      }`
                    : 'Sin incidentes'}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Health check toggle */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Health check</h3>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-800">Habilitado</p>
              <p className="text-xs text-gray-500">
                Intervalo: {deployment.healthCheckIntervalMinutes} min
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={deployment.healthCheckEnabled}
              disabled={toggleHealthCheck.isPending}
              onClick={() => toggleHealthCheck.mutate(!deployment.healthCheckEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                deployment.healthCheckEnabled ? 'bg-blue-600' : 'bg-gray-300'
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  deployment.healthCheckEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </section>

        {/* Notifications summary */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Notificaciones</h3>
          <ul className="text-sm space-y-1.5">
            <li className={deployment.notifyOnDown ? 'text-gray-800' : 'text-gray-400 line-through'}>
              Caída (DOWN)
            </li>
            <li className={deployment.notifyOnRecovery ? 'text-gray-800' : 'text-gray-400 line-through'}>
              Recuperación
            </li>
            <li className={deployment.notifyOnDegraded ? 'text-gray-800' : 'text-gray-400 line-through'}>
              Degradado
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
