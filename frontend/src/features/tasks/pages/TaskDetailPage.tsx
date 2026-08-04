import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { AppLayout } from '../../../components/layout/AppLayout'
import { PriorityBadge } from '../../../components/tasks/PriorityBadge'
import { StatusBadge } from '../../../components/tasks/StatusBadge'
import { TypeBadge } from '../../../components/tasks/TypeBadge'
import { useTaskUIStore } from '../../../stores/useTaskUIStore'
import {
  getTask,
  updateTask,
  changeTaskStatus,
  getTaskSubtasks,
  getTaskComments,
  getTaskTypes,
  createTask,
  generateAiSubtasks,
  deleteTask,
} from '../../../api/tasks.api'
import type {
  TaskResponse,
  TaskStatus,
  TaskPriority,
  SubtaskSuggestionResponse,
} from '../../../types/task.types'

// ---- Valid transitions ----

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  PENDING: ['READY'],
  READY: ['PENDING', 'REVIEW'],
  REVIEW: ['READY', 'COMPLETED'],
  COMPLETED: [],
}

const STATUS_STEPS: TaskStatus[] = ['PENDING', 'READY', 'REVIEW', 'COMPLETED']
const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pendiente',
  READY: 'Listo',
  REVIEW: 'Revision',
  COMPLETED: 'Completada',
}

// ---- Status Stepper ----

interface StepperProps {
  current: TaskStatus
  onTransition: (status: TaskStatus) => void
}

function StatusStepper({ current, onTransition }: StepperProps) {
  const currentIdx = STATUS_STEPS.indexOf(current)

  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, idx) => {
        const isActive = step === current
        const isPassed = idx < currentIdx
        const canTransition = VALID_TRANSITIONS[current].includes(step)

        return (
          <div key={step} className="flex items-center">
            <button
              onClick={() => canTransition && onTransition(step)}
              disabled={!canTransition}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white cursor-default'
                  : isPassed
                  ? 'bg-gray-100 text-gray-500 cursor-default'
                  : canTransition
                  ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 cursor-pointer'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isActive ? 'bg-white text-blue-600' : isPassed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {isPassed ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : idx + 1}
              </span>
              {STATUS_LABELS[step]}
            </button>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${idx < currentIdx ? 'bg-blue-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---- Description Editor ----

interface DescEditorProps {
  taskId: string
  initialValue: string | null
  typeId: string
  title: string
  priority: TaskPriority
}

function TaskDescriptionEditor({ taskId, initialValue, typeId, title, priority }: DescEditorProps) {
  const [value, setValue] = useState(initialValue ?? '')
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()

  async function handleBlur() {
    if (value === (initialValue ?? '')) return
    setSaving(true)
    try {
      await updateTask(taskId, {
        title,
        description: value || undefined,
        priority,
        typeId,
      })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Descripcion</h3>
        {saving && <span className="text-xs text-gray-400">Guardando...</span>}
      </div>
      <textarea
        className="w-full text-sm text-gray-700 resize-none focus:outline-none min-h-[100px]"
        placeholder="Agregar una descripcion..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        maxLength={2000}
      />
    </div>
  )
}

// ---- Subtask Panel ----

interface SubtaskPanelProps {
  taskId: string
  parentTypeId: string
}

function SubtaskPanel({ taskId, parentTypeId }: SubtaskPanelProps) {
  const queryClient = useQueryClient()
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM')
  const [aiSuggestions, setAiSuggestions] = useState<SubtaskSuggestionResponse[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const subtasksQuery = useQuery({
    queryKey: ['tasks', taskId, 'subtasks'],
    queryFn: () => getTaskSubtasks(taskId),
  })

  const typesQuery = useQuery({
    queryKey: ['task-types'],
    queryFn: getTaskTypes,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      changeTaskStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'subtasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (title: string) =>
      createTask({ title, priority: newPriority, typeId: parentTypeId, parentTaskId: taskId }),
    onSuccess: () => {
      setNewTitle('')
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'subtasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })

  async function handleGenerateAi() {
    setAiLoading(true)
    setAiError(null)
    try {
      const result = await generateAiSubtasks(taskId)
      setAiSuggestions(result.suggestions)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 503) {
        setAiError('Servicio de IA no disponible. Intenta de nuevo más tarde.')
      } else {
        setAiError('Error al generar sugerencias de IA.')
      }
    } finally {
      setAiLoading(false)
    }
  }

  async function handleCreateFromSuggestions() {
    const promises = aiSuggestions.map(s =>
      createTask({ title: s.title, priority: s.priority, typeId: parentTypeId, parentTaskId: taskId }),
    )
    await Promise.allSettled(promises)
    setAiSuggestions([])
    queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'subtasks'] })
    queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
  }

  function handleSubtaskCheck(subtask: TaskResponse) {
    const nextStatus: TaskStatus =
      subtask.status === 'PENDING'
        ? 'READY'
        : subtask.status === 'READY'
        ? 'REVIEW'
        : subtask.status === 'REVIEW'
        ? 'COMPLETED'
        : 'COMPLETED'

    if (subtask.status === 'COMPLETED') return
    statusMutation.mutate({ id: subtask.id, status: nextStatus })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Subtareas ({subtasksQuery.data?.length ?? 0})
        </h3>
        <button
          onClick={handleGenerateAi}
          disabled={aiLoading}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {aiLoading ? 'Generando...' : 'Generar con IA'}
        </button>
      </div>

      {aiError && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">{aiError}</div>
      )}

      {aiSuggestions.length > 0 && (
        <div className="mb-4 border border-purple-200 rounded-lg p-3 bg-purple-50">
          <p className="text-xs font-medium text-purple-700 mb-2">Sugerencias de IA</p>
          <div className="space-y-2">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={s.title}
                  onChange={e => {
                    const updated = [...aiSuggestions]
                    updated[i] = { ...updated[i], title: e.target.value }
                    setAiSuggestions(updated)
                  }}
                  className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                <select
                  value={s.priority}
                  onChange={e => {
                    const updated = [...aiSuggestions]
                    updated[i] = { ...updated[i], priority: e.target.value as TaskPriority }
                    setAiSuggestions(updated)
                  }}
                  className="text-xs border border-gray-300 rounded px-1 py-1 focus:outline-none"
                >
                  <option value="HIGH">Alta</option>
                  <option value="MEDIUM">Media</option>
                  <option value="LOW">Baja</option>
                </select>
                <button
                  onClick={() => setAiSuggestions(aiSuggestions.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleCreateFromSuggestions}
            className="mt-3 w-full text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded py-1.5 transition-colors"
          >
            Crear subtareas ({aiSuggestions.length})
          </button>
        </div>
      )}

      {/* Subtask list */}
      {subtasksQuery.isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 mb-3">
          {subtasksQuery.data?.map(subtask => (
            <div
              key={subtask.id}
              className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-gray-50 group"
            >
              <button
                onClick={() => handleSubtaskCheck(subtask)}
                disabled={subtask.status === 'COMPLETED'}
                className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-colors flex items-center justify-center ${
                  subtask.status === 'COMPLETED'
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {subtask.status === 'COMPLETED' && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`text-sm flex-1 ${subtask.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {subtask.title}
              </span>
              <PriorityBadge priority={subtask.priority} />
              <StatusBadge status={subtask.status} />
            </div>
          ))}
          {subtasksQuery.data?.length === 0 && (
            <p className="text-xs text-gray-400 py-2">Sin subtareas</p>
          )}
        </div>
      )}

      {/* Add subtask */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <input
          type="text"
          placeholder="Agregar subtarea..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && newTitle.trim()) {
              createMutation.mutate(newTitle.trim())
            }
          }}
          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value as TaskPriority)}
          className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none"
        >
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Media</option>
          <option value="LOW">Baja</option>
        </select>
        <button
          onClick={() => newTitle.trim() && createMutation.mutate(newTitle.trim())}
          disabled={!newTitle.trim() || createMutation.isPending}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Agregar
        </button>
      </div>

      {/* Suppress unused var warning */}
      {typesQuery.data && null}
    </div>
  )
}

// ---- Comment Section ----

function TaskCommentSection({ taskId }: { taskId: string }) {
  const commentsQuery = useQuery({
    queryKey: ['tasks', taskId, 'comments'],
    queryFn: () => getTaskComments(taskId),
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Comentarios ({commentsQuery.data?.length ?? 0})
      </h3>
      {commentsQuery.isLoading && (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
        </div>
      )}
      {commentsQuery.data?.length === 0 && (
        <p className="text-xs text-gray-400">Sin comentarios</p>
      )}
      <div className="space-y-3">
        {commentsQuery.data?.map(comment => (
          <div key={comment.id} className={`p-3 rounded-lg text-sm ${comment.closingComment ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            {comment.closingComment && (
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium mb-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Comentario de cierre
              </div>
            )}
            <p className="text-gray-700">{comment.body}</p>
            <p className="text-xs text-gray-400 mt-1">
              {format(parseISO(comment.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Meta Panel ----

interface MetaPanelProps {
  task: TaskResponse
}

function TaskMetaPanel({ task }: MetaPanelProps) {
  const queryClient = useQueryClient()
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [typeId, setTypeId] = useState(task.type.id)
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const [startDate, setStartDate] = useState(task.startDate ?? '')
  const [dirty, setDirty] = useState(false)

  const dateRangeError = startDate && dueDate && startDate > dueDate
    ? 'La fecha de inicio no puede ser posterior a la fecha límite'
    : null

  const typesQuery = useQuery({ queryKey: ['task-types'], queryFn: getTaskTypes })

  const mutation = useMutation({
    mutationFn: () =>
      updateTask(task.id, {
        title: task.title,
        description: task.description ?? undefined,
        priority,
        typeId,
        dueDate: dueDate || null,
        startDate: startDate || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', task.id] })
      setDirty(false)
    },
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Detalles</h3>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Prioridad</label>
        <select
          value={priority}
          onChange={e => { setPriority(e.target.value as TaskPriority); setDirty(true) }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Media</option>
          <option value="LOW">Baja</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
        <select
          value={typeId}
          onChange={e => { setTypeId(e.target.value); setDirty(true) }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {typesQuery.data?.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Fecha inicio</label>
        <input
          type="date"
          value={startDate}
          onChange={e => { setStartDate(e.target.value); setDirty(true) }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Fecha limite</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => { setDueDate(e.target.value); setDirty(true) }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 space-y-1">
        <p>Creada: {format(parseISO(task.createdAt), "d MMM yyyy", { locale: es })}</p>
        {task.completedAt && (
          <p>Completada: {format(parseISO(task.completedAt), "d MMM yyyy", { locale: es })}</p>
        )}
      </div>

      {dateRangeError && (
        <p className="text-xs text-red-600">{dateRangeError}</p>
      )}

      {dirty && (
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !!dateRangeError}
          className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      )}
      {mutation.isError && (
        <p className="text-xs text-red-600">Error al guardar</p>
      )}
    </div>
  )
}

// ---- Main Page ----

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { openClosingModal } = useTaskUIStore()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => getTask(id!),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: ({ status, comment }: { status: TaskStatus; comment?: string }) =>
      changeTaskStatus(id!, { status, closingComment: comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'kanban'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(id!),
    onSuccess: () => navigate('/tasks'),
  })

  const titleMutation = useMutation({
    mutationFn: (title: string) =>
      updateTask(id!, {
        title,
        description: task?.description ?? undefined,
        priority: task!.priority,
        typeId: task!.type.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'kanban'] })
      setEditingTitle(false)
    },
  })

  function handleStatusClick(status: TaskStatus) {
    if (status === 'COMPLETED') {
      openClosingModal(id!, status, (comment) => {
        statusMutation.mutate({ status, comment })
      })
    } else {
      statusMutation.mutate({ status })
    }
  }

  function handleTitleClick() {
    if (!task) return
    setTitleValue(task.title)
    setEditingTitle(true)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }

  function handleTitleSave() {
    if (!titleValue.trim() || titleValue.trim() === task?.title) {
      setEditingTitle(false)
      return
    }
    titleMutation.mutate(titleValue.trim())
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isError || !task) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            No se pudo cargar la tarea.
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          {/* Title */}
          <div className="flex items-start justify-between gap-4 mb-4">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleTitleSave()
                  if (e.key === 'Escape') setEditingTitle(false)
                }}
                className="flex-1 text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                maxLength={255}
              />
            ) : (
              <h1
                className="flex-1 text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-700 transition-colors"
                onClick={handleTitleClick}
                title="Click para editar"
              >
                {task.title}
              </h1>
            )}
            <div className="flex items-center gap-2">
              <TypeBadge type={task.type} />
              <PriorityBadge priority={task.priority} />
              <button
                onClick={() => {
                  if (window.confirm('¿Eliminar esta tarea?')) deleteMutation.mutate()
                }}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                title="Eliminar tarea"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Status stepper */}
          <StatusStepper current={task.status} onTransition={handleStatusClick} />
        </div>

        {/* Body */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <TaskDescriptionEditor
              taskId={task.id}
              initialValue={task.description}
              typeId={task.type.id}
              title={task.title}
              priority={task.priority}
            />
            <SubtaskPanel
              taskId={task.id}
              parentTypeId={task.type.id}
            />
            <TaskCommentSection taskId={task.id} />
          </div>
          <div>
            <TaskMetaPanel task={task} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
