import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from 'axios'
import { TaskCard } from '../../tasks/TaskCard'
import { IterationFormModal } from '../IterationFormModal'
import { CreateProjectTaskModal } from '../CreateProjectTaskModal'
import {
  getProjectIterations,
  updateIteration,
  deleteIteration,
} from '../../../api/projects.api'
import { getTasks } from '../../../api/tasks.api'
import type {
  ProjectIterationResponse,
  IterationStatus,
  ProjectResponse,
} from '../../../types/project.types'
import type { TaskFilterState } from '../../../types/task.types'

interface Props {
  project: ProjectResponse
}

const STATUS_COLORS: Record<IterationStatus, string> = {
  PLANNED: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
}

const STATUS_LABELS: Record<IterationStatus, string> = {
  PLANNED: 'Planeada',
  ACTIVE: 'Activa',
  COMPLETED: 'Completada',
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return format(parseISO(iso), "d MMM yyyy", { locale: es })
}

// ── Backlog Section ──────────────────────────────────────────────────────────

function BacklogSection({ project }: { project: ProjectResponse }) {
  const [createOpen, setCreateOpen] = useState(false)
  const filters: TaskFilterState = {
    status: [],
    priority: [],
    typeId: [],
    dueDate: null,
    rootOnly: false,
    projectId: project.id,
    backlogOnly: true,
  }
  const tasksQuery = useQuery({
    queryKey: ['tasks', { projectId: project.id, backlogOnly: true }],
    queryFn: () => getTasks(filters, 0, 100),
  })

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Backlog</h3>
          <p className="text-xs text-gray-500">Tareas sin iteración asignada</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          + Tarea
        </button>
      </div>
      {tasksQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      )}
      {tasksQuery.data && tasksQuery.data.content.length === 0 && (
        <p className="text-xs text-gray-400 py-3 text-center">Sin tareas en el backlog</p>
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
    </section>
  )
}

// ── Iteration Tasks Drawer ───────────────────────────────────────────────────

function IterationTasks({ projectId, iterationId }: { projectId: string; iterationId: string }) {
  const filters: TaskFilterState = {
    status: [],
    priority: [],
    typeId: [],
    dueDate: null,
    rootOnly: false,
    projectId,
    iterationId,
  }
  const tasksQuery = useQuery({
    queryKey: ['tasks', { projectId, iterationId }],
    queryFn: () => getTasks(filters, 0, 100),
  })

  if (tasksQuery.isLoading) {
    return (
      <div className="mt-3 space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }
  if (!tasksQuery.data || tasksQuery.data.content.length === 0) {
    return <p className="text-xs text-gray-400 mt-3">Sin tareas en esta iteración</p>
  }
  return (
    <div className="mt-3 space-y-2">
      {tasksQuery.data.content.map(t => <TaskCard key={t.id} task={t} />)}
    </div>
  )
}

// ── Iteration Card ───────────────────────────────────────────────────────────

interface IterationCardProps {
  iteration: ProjectIterationResponse
  project: ProjectResponse
  hasActive: boolean
  expanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
}

function IterationCard({ iteration, project, hasActive, expanded, onToggleExpand, onEdit }: IterationCardProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)

  const activateMutation = useMutation({
    mutationFn: () => updateIteration(project.id, iteration.id, { status: 'ACTIVE' }),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['projects', project.id, 'iterations'] })
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError('Ya existe una iteración activa. Complétala antes de activar otra.')
      } else {
        setError('Error al activar la iteración.')
      }
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => updateIteration(project.id, iteration.id, { status: 'COMPLETED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', project.id, 'iterations'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteIteration(project.id, iteration.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', project.id, 'iterations'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'kanban'] })
    },
  })

  function handleDelete() {
    if (window.confirm('¿Eliminar esta iteración?\n\nLas tareas volverán al backlog.')) {
      deleteMutation.mutate()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-xl border border-gray-200 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900">
              #{iteration.number} {iteration.name ?? 'Sin nombre'}
            </h4>
            <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[iteration.status]}`}>
              {STATUS_LABELS[iteration.status]}
            </span>
          </div>
          {iteration.goal && (
            <p className="text-sm text-gray-600 mt-1">{iteration.goal}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {fmt(iteration.startDate)} → {fmt(iteration.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
            aria-label="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
            aria-label="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">{iteration.completedTasks}/{iteration.totalTasks} tareas</span>
          <span className="font-semibold text-gray-700">{iteration.progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${iteration.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3">
        {iteration.status === 'PLANNED' && (
          <button
            type="button"
            onClick={() => activateMutation.mutate()}
            disabled={activateMutation.isPending || hasActive}
            title={hasActive ? 'Ya existe una iteración activa' : 'Activar iteración'}
            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            Activar
          </button>
        )}
        {iteration.status === 'ACTIVE' && (
          <>
            <button
              type="button"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
            >
              Completar
            </button>
            <button
              type="button"
              onClick={() => setCreateTaskOpen(true)}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              + Tarea
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onToggleExpand}
          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg ml-auto"
        >
          {expanded ? 'Ocultar tareas' : 'Ver tareas'}
        </button>
      </div>

      {error && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {expanded && <IterationTasks projectId={project.id} iterationId={iteration.id} />}

      <CreateProjectTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projectId={project.id}
        iterationId={iteration.id}
      />
    </motion.div>
  )
}

// ── Main Tab Component ───────────────────────────────────────────────────────

export function ProjectIterationsTab({ project }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectIterationResponse | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const iterationsQuery = useQuery({
    queryKey: ['projects', project.id, 'iterations'],
    queryFn: () => getProjectIterations(project.id),
  })

  const hasActive = iterationsQuery.data?.some(i => i.status === 'ACTIVE') ?? false

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(it: ProjectIterationResponse) {
    setEditing(it)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <BacklogSection project={project} />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Iteraciones</h2>
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva iteración
          </button>
        </div>

        {iterationsQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 bg-white border border-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {iterationsQuery.data && iterationsQuery.data.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-sm font-medium">Sin iteraciones</p>
            <p className="text-xs mt-1">Crea la primera iteración del proyecto</p>
          </div>
        )}

        {iterationsQuery.data && iterationsQuery.data.length > 0 && (
          <AnimatePresence initial={false}>
            <div className="space-y-3">
              {iterationsQuery.data.map(it => (
                <IterationCard
                  key={it.id}
                  iteration={it}
                  project={project}
                  hasActive={hasActive}
                  expanded={expandedId === it.id}
                  onToggleExpand={() => setExpandedId(prev => prev === it.id ? null : it.id)}
                  onEdit={() => openEdit(it)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </section>

      <IterationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        projectId={project.id}
        iteration={editing}
      />
    </div>
  )
}
