import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import { TaskCard } from '../../../components/tasks/TaskCard'
import { TaskTypeCreateModal } from '../../../components/tasks/TaskTypeCreateModal'
import { useTaskUIStore } from '../../../stores/useTaskUIStore'
import { getTasks, createTask, getTaskTypes } from '../../../api/tasks.api'
import type { TaskStatus, TaskPriority, CreateTaskRequest } from '../../../types/task.types'

// ---- Filter Bar ----

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'READY', label: 'Listo' },
  { value: 'REVIEW', label: 'Revision' },
  { value: 'COMPLETED', label: 'Completada' },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'LOW', label: 'Baja' },
]

const DUE_OPTIONS: { value: 'TODAY' | 'THIS_WEEK' | 'OVERDUE'; label: string }[] = [
  { value: 'TODAY', label: 'Hoy' },
  { value: 'THIS_WEEK', label: 'Esta semana' },
  { value: 'OVERDUE', label: 'Vencida' },
]

function TaskFilterBar() {
  const { filters, setFilters, resetFilters } = useTaskUIStore()

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.dueDate !== null

  function toggleStatus(value: TaskStatus) {
    const next = filters.status.includes(value)
      ? filters.status.filter(s => s !== value)
      : [...filters.status, value]
    setFilters({ status: next })
  }

  function togglePriority(value: TaskPriority) {
    const next = filters.priority.includes(value)
      ? filters.priority.filter(p => p !== value)
      : [...filters.priority, value]
    setFilters({ priority: next })
  }

  function toggleDueDate(value: 'TODAY' | 'THIS_WEEK' | 'OVERDUE') {
    setFilters({ dueDate: filters.dueDate === value ? null : value })
  }

  return (
    <div className="flex flex-wrap gap-2 items-center py-3">
      <span className="text-xs font-medium text-gray-500 mr-1">Estado:</span>
      {STATUS_OPTIONS.map(opt => {
        const active = filters.status.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => toggleStatus(opt.value)}
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

      <span className="text-xs font-medium text-gray-500 ml-2 mr-1">Prioridad:</span>
      {PRIORITY_OPTIONS.map(opt => {
        const active = filters.priority.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => togglePriority(opt.value)}
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

      <span className="text-xs font-medium text-gray-500 ml-2 mr-1">Fecha:</span>
      {DUE_OPTIONS.map(opt => {
        const active = filters.dueDate === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => toggleDueDate(opt.value)}
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

      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="ml-2 px-3 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

// ---- Create Task Modal ----

interface CreateModalProps {
  open: boolean
  onClose: () => void
}

function CreateTaskModal({ open, onClose }: CreateModalProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<{
    title: string
    description: string
    priority: TaskPriority
    typeId: string
    dueDate: string
  }>({ title: '', description: '', priority: 'MEDIUM', typeId: '', dueDate: '' })
  const [typeCreateOpen, setTypeCreateOpen] = useState(false)

  const typesQuery = useQuery({
    queryKey: ['task-types'],
    queryFn: getTaskTypes,
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'kanban'] })
      onClose()
      setForm({ title: '', description: '', priority: 'MEDIUM', typeId: '', dueDate: '' })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.typeId) return
    const payload: CreateTaskRequest = {
      title: form.title.trim(),
      priority: form.priority,
      typeId: form.typeId,
    }
    if (form.description.trim()) payload.description = form.description.trim()
    if (form.dueDate) payload.dueDate = form.dueDate
    mutation.mutate(payload)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nueva tarea</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titulo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={255}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Titulo de la tarea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripcion
                  </label>
                  <textarea
                    maxLength={2000}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Descripcion opcional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.priority}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
                    >
                      <option value="HIGH">Alta</option>
                      <option value="MEDIUM">Media</option>
                      <option value="LOW">Baja</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        required
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.typeId}
                        onChange={e => setForm(f => ({ ...f, typeId: e.target.value }))}
                      >
                        <option value="">Seleccionar tipo</option>
                        {typesQuery.data?.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setTypeCreateOpen(true)}
                        className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                        title="Crear nuevo tipo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha limite
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>

                {mutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    Error al crear la tarea. Intenta de nuevo.
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {mutation.isPending ? 'Creando...' : 'Crear tarea'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          <TaskTypeCreateModal
            open={typeCreateOpen}
            onClose={() => setTypeCreateOpen(false)}
            onCreated={(typeId) => setForm(f => ({ ...f, typeId }))}
          />
        </>
      )}
    </AnimatePresence>
  )
}

// ---- Pagination ----

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function TaskListPagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Anterior
      </button>
      <span className="text-sm text-gray-600 px-2">
        Pagina {page + 1} de {totalPages}
      </span>
      <button
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Siguiente
      </button>
    </div>
  )
}

// ---- Skeleton ----

function TaskSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-5 w-14 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  )
}

// ---- Main Page ----

export function TaskListPage() {
  const [page, setPage] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const { filters } = useTaskUIStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', filters, page],
    queryFn: () => getTasks(filters, page, 20),
  })

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
            {data && (
              <p className="text-sm text-gray-500 mt-0.5">{data.totalElements} tareas en total</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* View toggles */}
            <Link
              to="/tasks"
              className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg"
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
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Gantt
            </Link>
            <Link
              to="/tasks/trash"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Papelera
            </Link>
            <button
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva tarea
            </button>
          </div>
        </header>

        <TaskFilterBar />

        {/* Error state */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar las tareas. Intenta recargar la pagina.
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <TaskSkeleton key={i} />)}
          </div>
        )}

        {/* Task list */}
        {data && !isLoading && (
          <>
            {data.content.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-medium">No hay tareas</p>
                <p className="text-xs mt-1">Crea tu primera tarea con el boton de arriba</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.content.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
            <TaskListPagination
              page={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </>
        )}

        <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)} />
      </div>
    </AppLayout>
  )
}
