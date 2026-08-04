import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AppLayout } from '../../../components/layout/AppLayout'
import { DeploymentCard } from '../../../components/deployments/DeploymentCard'
import { DeploymentFormModal } from '../../../components/deployments/modals/DeploymentFormModal'
import { useDeploymentStore } from '../../../stores/useDeploymentStore'
import { getDeployments } from '../../../api/deployments.api'
import { getProjects } from '../../../api/projects.api'

function DeploymentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
      <div className="h-3 bg-gray-100 rounded w-full mb-2" />
      <div className="h-3 w-1/3 bg-gray-200 rounded" />
    </div>
  )
}

export function DeploymentListPage() {
  const { projectFilter, setProjectFilter } = useDeploymentStore()
  const [createOpen, setCreateOpen] = useState(false)

  const deploymentsQuery = useQuery({
    queryKey: ['deployments', { projectId: projectFilter }],
    queryFn: () => getDeployments(projectFilter ?? undefined),
  })

  const projectsQuery = useQuery({
    queryKey: ['projects', { status: undefined }],
    queryFn: () => getProjects(),
  })

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deployments</h1>
            {deploymentsQuery.data && (
              <p className="text-sm text-gray-500 mt-0.5">
                {deploymentsQuery.data.length} deployment{deploymentsQuery.data.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={projectFilter ?? ''}
              onChange={e => setProjectFilter(e.target.value || null)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los proyectos</option>
              {projectsQuery.data?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Link
              to="/deployments/trash"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Papelera
            </Link>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo deployment
            </button>
          </div>
        </header>

        {/* Error */}
        {deploymentsQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar los deployments. Intenta recargar la página.
          </div>
        )}

        {/* Loading */}
        {deploymentsQuery.isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <DeploymentCardSkeleton key={i} />)}
          </div>
        )}

        {/* Empty */}
        {deploymentsQuery.data && deploymentsQuery.data.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <p className="text-sm font-medium">No hay deployments</p>
            <p className="text-xs mt-1 mb-4">
              {projectFilter
                ? 'Este proyecto aún no tiene deployments registrados'
                : 'Crea tu primer deployment con el botón "Nuevo deployment"'}
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo deployment
            </button>
          </div>
        )}

        {/* Grid */}
        {deploymentsQuery.data && deploymentsQuery.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deploymentsQuery.data.map((d, i) => (
              <DeploymentCard key={d.id} deployment={d} index={i} />
            ))}
          </div>
        )}

        <DeploymentFormModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          defaultProjectId={projectFilter ?? undefined}
        />
      </div>
    </AppLayout>
  )
}
