import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { getDeploymentRecords } from '../../../api/deployments.api'
import { RecordFormModal } from '../modals/RecordFormModal'
import type { DeployRecordSource } from '../../../types/deployment.types'

interface Props {
  deploymentId: string
  defaultUrl?: string
  defaultBranch?: string | null
}

const SOURCE_STYLES: Record<DeployRecordSource, string> = {
  MANUAL: 'bg-blue-100 text-blue-700 border-blue-200',
  WEBHOOK: 'bg-purple-100 text-purple-700 border-purple-200',
  API_IMPORT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const SOURCE_LABELS: Record<DeployRecordSource, string> = {
  MANUAL: 'Manual',
  WEBHOOK: 'Webhook',
  API_IMPORT: 'API',
}

function fmtDateTime(iso: string) {
  try {
    return format(parseISO(iso), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return iso
  }
}

export function DeploymentDeploysTab({ deploymentId, defaultUrl, defaultBranch }: Props) {
  const [page, setPage] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const size = 20

  const recordsQuery = useQuery({
    queryKey: ['deployments', deploymentId, 'records', page, size],
    queryFn: () => getDeploymentRecords(deploymentId, page, size),
  })

  const data = recordsQuery.data

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Historial de deploys</h3>
          {data && (
            <p className="text-xs text-gray-400 mt-0.5">
              {data.totalElements} registro{data.totalElements === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Registrar deploy manual
        </button>
      </header>

      {recordsQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      )}

      {recordsQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Error al cargar los deploys.
        </div>
      )}

      {data && data.content.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm">Aún no hay deploys registrados.</p>
        </div>
      )}

      {data && data.content.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-3 font-semibold">Fecha</th>
                  <th className="py-2 pr-3 font-semibold">Versión</th>
                  <th className="py-2 pr-3 font-semibold">Branch</th>
                  <th className="py-2 pr-3 font-semibold">Origen</th>
                  <th className="py-2 pr-3 font-semibold">Notas</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map(rec => (
                  <tr key={rec.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 pr-3 text-gray-800 whitespace-nowrap">{fmtDateTime(rec.deployedAt)}</td>
                    <td className="py-2 pr-3 text-gray-800 font-mono">{rec.version ?? '—'}</td>
                    <td className="py-2 pr-3 text-gray-800 font-mono">{rec.branch ?? '—'}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${SOURCE_STYLES[rec.source]}`}
                      >
                        {SOURCE_LABELS[rec.source]}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-600 max-w-xs truncate" title={rec.notes ?? ''}>
                      {rec.notes ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Página {data.page + 1} de {data.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={data.first}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={data.last}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <RecordFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        deploymentId={deploymentId}
        defaultUrl={defaultUrl}
        defaultBranch={defaultBranch}
      />
    </section>
  )
}
