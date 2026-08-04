import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { AppLayout } from '../../../components/layout/AppLayout'
import { getTrashTasks, restoreTask } from '../../../api/tasks.api'

export function TaskTrashPage() {
  const queryClient = useQueryClient()

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['tasks-trash'],
    queryFn: getTrashTasks,
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-trash'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'kanban'] })
    },
  })

  return (
    <AppLayout>
      <div className="p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Papelera</h1>
            <p className="text-sm text-gray-500 mt-0.5">Tareas eliminadas</p>
          </div>
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

        {!isLoading && tasks?.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <p className="text-sm font-medium">Papelera vacia</p>
            <p className="text-xs mt-1">No hay tareas eliminadas</p>
          </div>
        )}

        {!isLoading && tasks && tasks.length > 0 && (
          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-gray-500 line-through">{task.title}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">
                      Eliminada el {task.deletedAt ? format(parseISO(task.deletedAt), "d MMM yyyy", { locale: es }) : '—'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => restoreMutation.mutate(task.id)}
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
