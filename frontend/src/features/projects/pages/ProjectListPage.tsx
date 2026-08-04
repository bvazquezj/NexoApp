import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AppLayout } from '../../../components/layout/AppLayout'
import { ProjectCard } from '../../../components/projects/ProjectCard'
import { ProjectFormModal } from '../../../components/projects/ProjectFormModal'
import { ProjectCategoryManagerModal } from '../../../components/projects/ProjectCategoryManagerModal'
import { PROJECT_STATUS_LABELS } from '../../../components/projects/ProjectStatusBadge'
import { useProjectStore } from '../../../stores/useProjectStore'
import { getProjects } from '../../../api/projects.api'
import type { ProjectStatus } from '../../../types/project.types'

const STATUS_OPTIONS: { value: ProjectStatus | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'ACTIVE', label: PROJECT_STATUS_LABELS.ACTIVE },
  { value: 'IN_PROGRESS', label: PROJECT_STATUS_LABELS.IN_PROGRESS },
  { value: 'PAUSED', label: PROJECT_STATUS_LABELS.PAUSED },
  { value: 'COMPLETED', label: PROJECT_STATUS_LABELS.COMPLETED },
]

function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 w-14 bg-gray-200 rounded" />
      </div>
      <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
      <div className="h-2 bg-gray-100 rounded w-full mb-2" />
      <div className="h-3 w-1/3 bg-gray-200 rounded" />
    </div>
  )
}

export function ProjectListPage() {
  const { statusFilter, setStatusFilter } = useProjectStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  const projectsQuery = useQuery({
    queryKey: ['projects', { status: statusFilter }],
    queryFn: () => getProjects(statusFilter ?? undefined),
  })

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
            {projectsQuery.data && (
              <p className="text-sm text-gray-500 mt-0.5">
                {projectsQuery.data.length} proyecto{projectsQuery.data.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/projects/trash"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Papelera
            </Link>
            <button
              type="button"
              onClick={() => setCategoriesOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Categorías
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo proyecto
            </button>
          </div>
        </header>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {STATUS_OPTIONS.map(opt => {
            const active = statusFilter === opt.value
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Error */}
        {projectsQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar los proyectos. Intenta recargar la página.
          </div>
        )}

        {/* Loading */}
        {projectsQuery.isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {projectsQuery.data && projectsQuery.data.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            <p className="text-sm font-medium">No hay proyectos</p>
            <p className="text-xs mt-1">
              {statusFilter
                ? 'No hay proyectos con este estado'
                : 'Crea tu primer proyecto con el botón "Nuevo proyecto"'}
            </p>
          </div>
        )}

        {/* Project grid */}
        {projectsQuery.data && projectsQuery.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsQuery.data.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        )}

        {/* Modals */}
        <ProjectFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
        <ProjectCategoryManagerModal open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
      </div>
    </AppLayout>
  )
}
