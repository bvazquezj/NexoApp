import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { AppLayout } from '../../../components/layout/AppLayout'
import {
  getRoutine,
  getRoutines,
  getHabits,
  createBlock,
  updateBlock,
  deleteBlock,
  copyRoutine,
  getBlockTaskLinks,
  linkTaskToBlock,
  unlinkTaskFromBlock,
} from '../../../api/habits.api'
import { getTasks } from '../../../api/tasks.api'
import type {
  RoutineBlockResponse,
  BlockType,
  BlockPriority,
  CreateRoutineBlockRequest,
  UpdateRoutineBlockRequest,
  HabitSummaryResponse,
  BlockTaskLinkResponse,
} from '../../../types/habit.types'
import type { TaskResponse } from '../../../types/task.types'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const BLOCK_TYPES: { value: BlockType; label: string; defaultColor: string }[] = [
  { value: 'HABIT', label: 'Hábito', defaultColor: '#a855f7' },
  { value: 'PRODUCTIVE', label: 'Productivo', defaultColor: '#3b82f6' },
  { value: 'SLEEP', label: 'Sueño', defaultColor: '#6366f1' },
  { value: 'BREAK', label: 'Descanso', defaultColor: '#f59e0b' },
  { value: 'FREE', label: 'Libre', defaultColor: '#9ca3af' },
]

const BLOCK_TYPE_COLOR: Record<BlockType, string> = {
  HABIT: 'bg-purple-100 text-purple-700',
  PRODUCTIVE: 'bg-blue-100 text-blue-700',
  SLEEP: 'bg-indigo-100 text-indigo-700',
  BREAK: 'bg-amber-100 text-amber-700',
  FREE: 'bg-gray-100 text-gray-700',
}

const PRIORITY_COLOR: Record<BlockPriority, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-gray-100 text-gray-700',
}

const PRIORITIES: { value: BlockPriority; label: string }[] = [
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'LOW', label: 'Baja' },
]

function formatHm(time: string): string {
  return time.slice(0, 5)
}

function toApiTime(hhmm: string): string {
  // input "HH:mm" -> "HH:mm:ss"
  return hhmm.length === 5 ? `${hhmm}:00` : hhmm
}

function toInputTime(time: string): string {
  // "HH:mm:ss" -> "HH:mm"
  return time.slice(0, 5)
}

// ── Block Task Links Section ──────────────────────────────────────────────────

interface BlockTaskLinksSectionProps {
  blockId: string
}

function BlockTaskLinksSection({ blockId }: BlockTaskLinksSectionProps) {
  const queryClient = useQueryClient()
  const [showSelector, setShowSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const linksQuery = useQuery({
    queryKey: ['routines', 'blocks', blockId, 'tasks'],
    queryFn: () => getBlockTaskLinks(blockId),
  })

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'autocomplete', 'available'],
    queryFn: async () => {
      const result = await getTasks(
        { status: ['PENDING', 'READY', 'REVIEW'], priority: [], typeId: [], dueDate: null, rootOnly: false },
        0,
        100,
      )
      return result.content
    },
    enabled: showSelector,
  })

  const linkMutation = useMutation({
    mutationFn: (taskId: string) => linkTaskToBlock(blockId, { taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', 'blocks', blockId, 'tasks'] })
      setSearchTerm('')
      setShowSelector(false)
    },
  })

  const unlinkMutation = useMutation({
    mutationFn: (linkId: string) => unlinkTaskFromBlock(blockId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', 'blocks', blockId, 'tasks'] })
    },
  })

  const linkedIds = new Set((linksQuery.data ?? []).map(l => l.taskId))
  const filteredTasks = (tasksQuery.data ?? []).filter(t =>
    !linkedIds.has(t.id) &&
    (searchTerm.trim() === '' || t.title.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Tareas vinculadas</h3>
        <button
          type="button"
          onClick={() => setShowSelector(s => !s)}
          className="text-xs text-blue-600 font-medium hover:underline"
        >
          {showSelector ? 'Cerrar' : '+ Vincular tarea'}
        </button>
      </div>

      {linksQuery.isLoading && (
        <p className="text-xs text-gray-400">Cargando...</p>
      )}
      {linksQuery.data && linksQuery.data.length === 0 && !showSelector && (
        <p className="text-xs text-gray-400">Sin tareas vinculadas.</p>
      )}
      {linksQuery.data && linksQuery.data.length > 0 && (
        <ul className="space-y-1.5 mb-2">
          {linksQuery.data.map((link: BlockTaskLinkResponse) => (
            <li
              key={link.id}
              className="flex items-center gap-2 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                link.taskAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className="flex-1 min-w-0 truncate text-gray-800">
                {link.taskTitle ?? 'Tarea sin título'}
              </span>
              {link.taskStatus && (
                <span className="text-xs text-gray-500">{link.taskStatus}</span>
              )}
              <button
                type="button"
                onClick={() => unlinkMutation.mutate(link.id)}
                className="p-0.5 rounded text-gray-400 hover:text-red-600"
                aria-label="Desvincular"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showSelector && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-2">
          <input
            type="text"
            placeholder="Buscar tarea..."
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {tasksQuery.isLoading && (
            <p className="text-xs text-gray-400">Cargando tareas...</p>
          )}
          {tasksQuery.data && filteredTasks.length === 0 && (
            <p className="text-xs text-gray-400">Sin tareas disponibles.</p>
          )}
          {filteredTasks.length > 0 && (
            <ul className="max-h-40 overflow-y-auto space-y-1">
              {filteredTasks.slice(0, 20).map((t: TaskResponse) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => linkMutation.mutate(t.id)}
                    disabled={linkMutation.isPending}
                    className="w-full text-left px-2 py-1.5 text-sm bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
                  >
                    <span className="truncate">{t.title}</span>
                    <span className="text-xs text-gray-400 ml-2">{t.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ── Block Form Modal ──────────────────────────────────────────────────────────

interface BlockFormModalProps {
  open: boolean
  onClose: () => void
  routineId: string
  block?: RoutineBlockResponse
  habits: HabitSummaryResponse[]
}

function BlockFormModal({ open, onClose, routineId, block, habits }: BlockFormModalProps) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(block)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<BlockType>('PRODUCTIVE')
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime] = useState('08:00')
  const [habitId, setHabitId] = useState<string>('')
  const [priority, setPriority] = useState<BlockPriority>('MEDIUM')
  const [isFlexible, setIsFlexible] = useState(false)
  const [color, setColor] = useState('#3b82f6')
  const [notifyStart, setNotifyStart] = useState(false)
  const [notifyEnd, setNotifyEnd] = useState(false)
  const [notifyMinutesBefore, setNotifyMinutesBefore] = useState(10)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTitle(block?.title ?? '')
      setType(block?.type ?? 'PRODUCTIVE')
      setStartTime(block ? toInputTime(block.startTime) : '07:00')
      setEndTime(block ? toInputTime(block.endTime) : '08:00')
      setHabitId(block?.habitId ?? '')
      setPriority(block?.priority ?? 'MEDIUM')
      setIsFlexible(block?.isFlexible ?? false)
      setColor(block?.color ?? BLOCK_TYPES.find(t => t.value === (block?.type ?? 'PRODUCTIVE'))?.defaultColor ?? '#3b82f6')
      setNotifyStart(block?.notifyStart ?? false)
      setNotifyEnd(block?.notifyEnd ?? false)
      setNotifyMinutesBefore(block?.notifyMinutesBefore ?? 10)
      setErrorMessage(null)
    }
  }, [open, block])

  function handleTypeChange(newType: BlockType) {
    setType(newType)
    // Auto-update color if it matches a default
    const oldDefault = BLOCK_TYPES.find(t => t.value === type)?.defaultColor
    if (color === oldDefault || !color) {
      setColor(BLOCK_TYPES.find(t => t.value === newType)?.defaultColor ?? color)
    }
    if (newType !== 'HABIT') setHabitId('')
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateRoutineBlockRequest) => createBlock(routineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', routineId] })
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      onClose()
    },
    onError: (err: unknown) => {
      handleApiError(err)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateRoutineBlockRequest) => updateBlock(routineId, block!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', routineId] })
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      onClose()
    },
    onError: (err: unknown) => {
      handleApiError(err)
    },
  })

  function handleApiError(err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      const data = err.response.data as { message?: string; error?: string }
      setErrorMessage(
        data?.message ?? data?.error ?? 'El bloque se solapa con otro existente.',
      )
    } else if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data as { message?: string }
      setErrorMessage(data?.message ?? 'Error al guardar el bloque.')
    } else {
      setErrorMessage('Error al guardar el bloque.')
    }
  }

  const mutation = isEdit ? updateMutation : createMutation
  const isValid =
    title.trim().length > 0 &&
    startTime &&
    endTime &&
    startTime < endTime &&
    (type !== 'HABIT' || Boolean(habitId))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setErrorMessage(null)
    const payload: CreateRoutineBlockRequest = {
      title: title.trim(),
      startTime: toApiTime(startTime),
      endTime: toApiTime(endTime),
      type,
      habitId: type === 'HABIT' ? habitId : undefined,
      priority,
      flexible: isFlexible,
      color,
      notifyStart,
      notifyEnd,
      notifyMinutesBefore,
    }
    if (isEdit) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
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
              className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isEdit ? 'Editar bloque' : 'Nuevo bloque'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                {/* Type segmented */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {BLOCK_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => handleTypeChange(t.value)}
                        className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                          type === t.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                {startTime >= endTime && (
                  <p className="text-xs text-red-500">El fin debe ser después del inicio.</p>
                )}

                {/* Habit (if HABIT type) */}
                {type === 'HABIT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hábito asociado <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={habitId}
                      onChange={e => setHabitId(e.target.value)}
                    >
                      <option value="">Seleccionar hábito</option>
                      {habits.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                          priority === p.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color + Flexible */}
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <span className="text-xs text-gray-500 font-mono">{color.toUpperCase()}</span>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={isFlexible}
                      onChange={e => setIsFlexible(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Bloque flexible</span>
                  </label>
                </div>

                {/* Notifications */}
                <div className="space-y-2 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700">Notificaciones</h3>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={notifyStart}
                      onChange={e => setNotifyStart(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Avisar al inicio</span>
                  </label>
                  <br />
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={notifyEnd}
                      onChange={e => setNotifyEnd(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Avisar al final</span>
                  </label>
                  {notifyStart && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Minutos antes</label>
                      <select
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={notifyMinutesBefore}
                        onChange={e => setNotifyMinutesBefore(Number(e.target.value))}
                      >
                        <option value={5}>5 min</option>
                        <option value={10}>10 min</option>
                        <option value={15}>15 min</option>
                      </select>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                {/* Task Links - only when editing */}
                {isEdit && block && <BlockTaskLinksSection blockId={block.id} />}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending || !isValid}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {mutation.isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear bloque'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Copy Routine Modal ────────────────────────────────────────────────────────

interface CopyRoutineModalProps {
  open: boolean
  onClose: () => void
  routineId: string
}

function CopyRoutineModal({ open, onClose, routineId }: CopyRoutineModalProps) {
  const queryClient = useQueryClient()
  const [targetDay, setTargetDay] = useState(1)
  const [replace, setReplace] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setReplace(false)
      setErrorMessage(null)
    }
  }, [open])

  const copyMutation = useMutation({
    mutationFn: () => copyRoutine(routineId, { targetDayOfWeek: targetDay, replace }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      onClose()
    },
    onError: () => {
      setErrorMessage('No se pudo copiar la rutina.')
    },
  })

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40" onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Copiar a otro día</h2>
              <div className="space-y-3">
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={targetDay}
                  onChange={e => setTargetDay(Number(e.target.value))}
                >
                  {DAYS.map((label, i) => <option key={i} value={i}>{label}</option>)}
                </select>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={replace}
                    onChange={e => setReplace(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Reemplazar bloques existentes</span>
                </label>
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{errorMessage}</div>
                )}
                <div className="flex gap-3 justify-end">
                  <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Cancelar
                  </button>
                  <button
                    onClick={() => copyMutation.mutate()}
                    disabled={copyMutation.isPending}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {copyMutation.isPending ? 'Copiando...' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Timeline ──────────────────────────────────────────────────────────────────

interface TimelineProps {
  blocks: RoutineBlockResponse[]
  onSelectBlock: (b: RoutineBlockResponse) => void
}

function Timeline({ blocks, onSelectBlock }: TimelineProps) {
  // 24 hours, each hour = 60px
  const HOURS = Array.from({ length: 24 }, (_, i) => i)
  const HOUR_HEIGHT = 60

  function timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
      <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT, minWidth: 480 }}>
        {/* Hour grid */}
        {HOURS.map(h => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-gray-100 flex items-start"
            style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }}
          >
            <span className="text-xs text-gray-400 font-mono w-12 flex-shrink-0 -mt-1.5 pl-1">
              {String(h).padStart(2, '0')}:00
            </span>
          </div>
        ))}

        {/* Blocks */}
        {blocks.map(block => {
          const startMin = timeToMinutes(block.startTime.slice(0, 5))
          const endMin = timeToMinutes(block.endTime.slice(0, 5))
          const top = (startMin / 60) * HOUR_HEIGHT
          const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 22)
          const color = block.color ?? '#6366f1'
          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onSelectBlock(block)}
              className="absolute left-14 right-2 rounded-lg p-2 text-left shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              style={{
                top,
                height,
                backgroundColor: `${color}33`,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-mono font-medium text-gray-700">{formatHm(block.startTime)}</span>
                <span className="text-gray-400">-</span>
                <span className="font-mono text-gray-500">{formatHm(block.endTime)}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{block.title}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Block List ────────────────────────────────────────────────────────────────

interface BlockListProps {
  routineId: string
  blocks: RoutineBlockResponse[]
  onEdit: (b: RoutineBlockResponse) => void
}

function BlockList({ routineId, blocks, onEdit }: BlockListProps) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (blockId: string) => deleteBlock(routineId, blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', routineId] })
      queryClient.invalidateQueries({ queryKey: ['routines'] })
    },
  })

  if (blocks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-400">Aún no hay bloques en esta rutina.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {blocks.map(b => (
        <motion.div
          key={b.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 relative overflow-hidden"
        >
          <span
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: b.color ?? '#6366f1' }}
          />
          <div className="ml-1 flex flex-col items-center text-xs text-gray-500 w-14 flex-shrink-0">
            <span className="font-mono font-medium text-gray-700">{formatHm(b.startTime)}</span>
            <span className="text-gray-400">{formatHm(b.endTime)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{b.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${BLOCK_TYPE_COLOR[b.type]}`}>
                {BLOCK_TYPES.find(t => t.value === b.type)?.label}
              </span>
              {b.priority && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[b.priority]}`}>
                  {PRIORITIES.find(p => p.value === b.priority)?.label}
                </span>
              )}
              {b.isFlexible && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700">Flexible</span>
              )}
            </div>
          </div>
          <button
            onClick={() => onEdit(b)}
            className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
          >
            Editar
          </button>
          <button
            onClick={() => {
              if (confirm('¿Eliminar este bloque?')) deleteMutation.mutate(b.id)
            }}
            className="text-xs text-red-600 hover:underline"
            disabled={deleteMutation.isPending}
          >
            Eliminar
          </button>
        </motion.div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function RoutineEditorPage() {
  const { routineId } = useParams<{ routineId: string }>()
  const navigate = useNavigate()
  const id = routineId ?? ''
  const [blockFormOpen, setBlockFormOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<RoutineBlockResponse | undefined>()
  const [copyOpen, setCopyOpen] = useState(false)

  const routineQuery = useQuery({
    queryKey: ['routines', id],
    queryFn: () => getRoutine(id),
    enabled: Boolean(id),
  })

  // Sometimes a freshly-created routine isn't in `routines` cache yet, but we always need habits
  const habitsQuery = useQuery({
    queryKey: ['habits'],
    queryFn: getHabits,
  })

  // Routines list (for ensuring cache freshness on copy / nav)
  useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines,
  })

  const sortedBlocks = useMemo(() => {
    if (!routineQuery.data) return []
    return [...routineQuery.data.blocks].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    )
  }, [routineQuery.data])

  function openCreateBlock() {
    setEditingBlock(undefined)
    setBlockFormOpen(true)
  }

  function openEditBlock(b: RoutineBlockResponse) {
    setEditingBlock(b)
    setBlockFormOpen(true)
  }

  function closeBlockForm() {
    setBlockFormOpen(false)
    setEditingBlock(undefined)
  }

  if (!id) {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-sm text-red-600">Rutina inválida.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-4">
        {/* Header */}
        <header className="bg-white rounded-xl border border-gray-200 p-5">
          {routineQuery.isLoading && (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          )}
          {routineQuery.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              Error al cargar la rutina.
            </div>
          )}
          {routineQuery.data && (
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{routineQuery.data.name}</h1>
                <p className="text-sm text-gray-500">
                  {DAYS[routineQuery.data.dayOfWeek]} ·{' '}
                  <span className={routineQuery.data.isActive ? 'text-green-600' : 'text-gray-400'}>
                    {routineQuery.data.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCopyOpen(true)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Copiar a otro día
                </button>
                <Link
                  to="/habits/routines"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Volver
                </Link>
                <button
                  onClick={() => navigate('/habits/routines')}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Listo
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Block list and Add */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Bloques de la rutina</h2>
            <button
              onClick={openCreateBlock}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar bloque
            </button>
          </div>
          {routineQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <BlockList routineId={id} blocks={sortedBlocks} onEdit={openEditBlock} />
          )}
        </section>

        {/* Timeline */}
        {routineQuery.data && sortedBlocks.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Vista de línea de tiempo</h2>
            <Timeline blocks={sortedBlocks} onSelectBlock={openEditBlock} />
          </section>
        )}

        {/* Modals */}
        <BlockFormModal
          open={blockFormOpen}
          onClose={closeBlockForm}
          routineId={id}
          block={editingBlock}
          habits={habitsQuery.data ?? []}
        />
        <CopyRoutineModal open={copyOpen} onClose={() => setCopyOpen(false)} routineId={id} />
      </div>
    </AppLayout>
  )
}
