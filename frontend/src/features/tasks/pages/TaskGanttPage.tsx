import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Gantt, ViewMode } from 'gantt-task-react'
import type { Task as GanttTask } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { AppLayout } from '../../../components/layout/AppLayout'
import { getTasks } from '../../../api/tasks.api'
import type { TaskPriority, TaskFilterState } from '../../../types/task.types'

const defaultFilters: TaskFilterState = {
  status: [],
  priority: [],
  typeId: [],
  dueDate: null,
  rootOnly: false,
}

function priorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'HIGH': return '#ef4444'
    case 'MEDIUM': return '#f59e0b'
    case 'LOW': return '#22c55e'
  }
}

export function TaskGanttPage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId') ?? undefined

  const filters: TaskFilterState = { ...defaultFilters }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', 'gantt', projectId],
    queryFn: async () => {
      const result = await getTasks(filters, 0, 200)
      // The backend filters by projectId via TaskSpecification.projectId, but the API helper
      // doesn't expose it yet. Filter client-side as a stop-gap until projectId is added to TaskFilterState.
      if (!projectId) return result
      return {
        ...result,
        content: result.content.filter(t => t.projectId === projectId),
      }
    },
  })

  const tasksWithDates = (data?.content ?? []).filter(t => !!t.dueDate)

  const ganttTasks: GanttTask[] = tasksWithDates.map(task => ({
    id: task.id,
    name: task.title,
    start: task.startDate ? new Date(task.startDate) : new Date(task.createdAt),
    end: task.dueDate ? new Date(task.dueDate) : new Date(),
    progress:
      task.subtaskCount > 0
        ? (task.completedSubtaskCount / task.subtaskCount) * 100
        : task.status === 'COMPLETED'
        ? 100
        : 0,
    type: task.parentTaskId ? 'task' : 'project',
    project: task.parentTaskId ?? undefined,
    isDisabled: task.status === 'COMPLETED',
    styles: { progressColor: priorityColor(task.priority) },
  }))

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Gantt</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/tasks"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Lista
            </Link>
            <Link
              to="/tasks/kanban"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Kanban
            </Link>
            <Link
              to="/tasks/gantt"
              className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg"
            >
              Gantt
            </Link>
            <Link
              to="/tasks/trash"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Papelera
            </Link>
          </div>
        </header>

        {isError && (
          <div className="m-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            Error al cargar las tareas.
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : ganttTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium">Sin tareas para mostrar</p>
            <p className="text-xs mt-1">Las tareas necesitan fecha limite para aparecer aqui</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            <Gantt
              tasks={ganttTasks}
              viewMode={ViewMode.Week}
              listCellWidth="200px"
              columnWidth={60}
            />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
