import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEnvVars, deleteEnvVar, exportEnvVars } from '../../../api/deployments.api'
import { EnvVarFormModal } from '../modals/EnvVarFormModal'
import { ImportEnvVarsModal } from '../modals/ImportEnvVarsModal'
import { RevealEnvVarModal } from '../modals/RevealEnvVarModal'
import type { DeploymentEnvVarResponse, EnvVarType } from '../../../types/deployment.types'

interface Props {
  deploymentId: string
  deploymentName: string
}

const TYPE_STYLES: Record<EnvVarType, string> = {
  PUBLIC: 'bg-gray-100 text-gray-700 border-gray-200',
  SECRET: 'bg-amber-100 text-amber-800 border-amber-200',
}

export function DeploymentVariablesTab({ deploymentId, deploymentName }: Props) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<DeploymentEnvVarResponse | null>(null)
  const [revealing, setRevealing] = useState<DeploymentEnvVarResponse | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const varsQuery = useQuery({
    queryKey: ['deployments', deploymentId, 'env-vars'],
    queryFn: () => getEnvVars(deploymentId),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEnvVar(deploymentId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', deploymentId, 'env-vars'] })
    },
  })

  async function handleExport() {
    setDownloadError(null)
    try {
      const blob = await exportEnvVars(deploymentId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = deploymentName.replace(/[^A-Za-z0-9._-]/g, '_')
      a.download = `${safeName}.env`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setDownloadError('No se pudo exportar el .env.')
    }
  }

  function handleDelete(v: DeploymentEnvVarResponse) {
    if (
      window.confirm(
        `Eliminar la variable "${v.key}"?\n\nEsta acción es PERMANENTE (hard delete) y no se puede deshacer.`
      )
    ) {
      deleteMutation.mutate(v.id)
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <header className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Variables de entorno</h3>
          {varsQuery.data && (
            <p className="text-xs text-gray-400 mt-0.5">
              {varsQuery.data.length} variable{varsQuery.data.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Exportar .env
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Importar .env
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Agregar variable
          </button>
        </div>
      </header>

      {downloadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-3">
          {downloadError}
        </div>
      )}

      {varsQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      )}

      {varsQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Error al cargar las variables.
        </div>
      )}

      {varsQuery.data && varsQuery.data.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm">No hay variables configuradas.</p>
        </div>
      )}

      {varsQuery.data && varsQuery.data.length > 0 && (
        <div className="divide-y divide-gray-100">
          {varsQuery.data.map(v => (
            <div key={v.id} className="py-2.5 flex items-center gap-3">
              <span
                className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${TYPE_STYLES[v.type]} flex-shrink-0`}
              >
                {v.type}
              </span>
              <code className="text-sm font-mono text-gray-900 truncate flex-shrink-0 min-w-0 max-w-xs" title={v.key}>
                {v.key}
              </code>
              <span className="text-gray-300 select-none">=</span>
              <code
                className={`text-sm font-mono truncate flex-1 min-w-0 ${
                  v.type === 'SECRET' ? 'text-amber-700' : 'text-gray-700'
                }`}
                title={v.type === 'SECRET' ? 'Valor oculto' : v.value}
              >
                {v.value}
              </code>
              <div className="flex items-center gap-1 flex-shrink-0">
                {v.type === 'SECRET' && (
                  <button
                    type="button"
                    onClick={() => setRevealing(v)}
                    className="px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded"
                    title="Revelar valor"
                  >
                    Revelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(v)}
                  className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(v)}
                  disabled={deleteMutation.isPending}
                  className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EnvVarFormModal
        open={createOpen || editing !== null}
        onClose={() => {
          setCreateOpen(false)
          setEditing(null)
        }}
        deploymentId={deploymentId}
        envVar={editing}
      />
      <ImportEnvVarsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        deploymentId={deploymentId}
      />
      <RevealEnvVarModal
        open={revealing !== null}
        onClose={() => setRevealing(null)}
        deploymentId={deploymentId}
        varId={revealing?.id ?? null}
        varKey={revealing?.key ?? ''}
      />
    </section>
  )
}
