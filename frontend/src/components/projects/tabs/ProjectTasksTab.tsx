import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TaskCard } from '../../tasks/TaskCard'
import { CreateProjectTaskModal } from '../CreateProjectTaskModal'
import { getTasks } from '../../../api/tasks.api'
import type { ProjectResponse } from '../../../types/project.types'
import type { TaskFilterState } from '../../../types/task.types'

interface Props {
  project: ProjectResponse
}

export function ProjectTasksTab({ project }: Props) {
  const [createOpen, setCreateOpen] = useState(false)

  const filters: TaskFilterState = {
    status: [],
    priority: [],
    typeId: [],
    dueDate: null,
    rootOnly: false,
    projectId: project.id,
  }

  const tasksQuery = useQuery({
    queryKey: ['tasks', { projectId: project.id }],
    queryFn: () => getTasks(filters, 0, 50),
  })

  const isInProgress = project.status === 'IN_PROGRESS'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Tareas del proyecto</h2>
          {tasksQuery.data && (
            <p className="text-xs text-gray-500 mt-0.5">
              {tasksQuery.data.totalElements} tarea{tasksQuery.data.totalElements === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          disabled={isInProgress}
          title={
            isInProgress
              ? 'Este proyecto está en ejecución. Vuelve a ACTIVE para agregar tareas.'
              : 'Crear nueva tarea'
          }
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva tarea
        </button>
      </div>

      {tasksQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Error al cargar las tareas.
        </div>
      )}

      {tasksQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {tasksQuery.data && tasksQuery.data.content.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-sm font-medium">Sin tareas</p>
          <p className="text-xs mt-1">Crea la primera tarea de este proyecto</p>
        </div>
      )}

      {tasksQuery.data && tasksQuery.data.content.length > 0 && (
        <div className="space-y-2">
          {tasksQuery.data.content.map(t => <TaskCard key={t.id} task={t} />)}
        </div>
      )}

      <CreateProjectTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projectId={project.id}
      />
    </div>
  )
}
