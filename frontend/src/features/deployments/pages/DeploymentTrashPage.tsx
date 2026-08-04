import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AppLayout } from '../../../components/layout/AppLayout'
import { DeploymentStatusBadge } from '../../../components/deployments/DeploymentStatusBadge'
import { EnvironmentBadge } from '../../../components/deployments/EnvironmentBadge'
import { PlatformIcon } from '../../../components/deployments/PlatformIcon'
import { getDeploymentTrash, restoreDeployment } from '../../../api/deployments.api'

export function DeploymentTrashPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['deployments', 'trash'],
    queryFn: getDeploymentTrash,
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreDeployment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', 'trash'] })
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
    },
  })

  return (
    <AppLayout>
      <div className="p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Papelera de deployments</h1>
            <p className="text-sm text-gray-500 mt-0.5">Deployments eliminados</p>
          </div>
          <Link
            to="/deployments"
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Volver
          </Link>
        </header>

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar la papelera.
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && data?.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <p className="text-sm font-medium">Papelera vacía</p>
            <p className="text-xs mt-1">No hay deployments eliminados</p>
          </div>
        )}

        {!isLoading && data && data.length > 0 && (
          <div className="space-y-3">
            {data.map(d => (
              <div
                key={d.id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <PlatformIcon platform={d.platform} />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-500 line-through truncate block">
                      {d.name}
                    </span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <EnvironmentBadge environment={d.environment} size="sm" />
                      <DeploymentStatusBadge status={d.status} size="sm" />
                      {d.projectName && (
                        <span className="text-xs text-gray-400">· {d.projectName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => restoreMutation.mutate(d.id)}
                  disabled={restoreMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Restaurar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
