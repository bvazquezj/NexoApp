import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import { HabitsSubNav } from '../../../components/habits/HabitsSubNav'
import {
  getRoutines,
  createRoutine,
  getRoutineTemplates,
  applyTemplate,
  deleteTemplate,
} from '../../../api/habits.api'
import type {
  RoutineDayResponse,
  RoutineTemplateResponse,
  CreateRoutineDayRequest,
} from '../../../types/habit.types'

const DAYS = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
]

function formatHm(time: string): string {
  return time.slice(0, 5)
}

// ── Create Routine Modal ──────────────────────────────────────────────────────

interface CreateRoutineModalProps {
  open: boolean
  onClose: () => void
  presetDay?: number
}

function CreateRoutineModal({ open, onClose, presetDay }: CreateRoutineModalProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState<number>(presetDay ?? 1)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName('')
      setDayOfWeek(presetDay ?? 1)
      setErrorMessage(null)
    }
  }, [open, presetDay])

  const createMutation = useMutation({
    mutationFn: (data: CreateRoutineDayRequest) => createRoutine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      onClose()
    },
    onError: () => {
      setErrorMessage('No se pudo crear la rutina. Quizás ya existe una para ese día.')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    createMutation.mutate({ dayOfWeek, name: name.trim() })
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
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nueva rutina</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Día de la semana
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dayOfWeek}
                    onChange={e => setDayOfWeek(Number(e.target.value))}
                  >
                    {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej: Mi rutina entre semana"
                  />
                </div>
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !name.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Creando...' : 'Crear'}
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

// ── Apply Template Modal ──────────────────────────────────────────────────────

interface ApplyTemplateModalProps {
  open: boolean
  onClose: () => void
  template: RoutineTemplateResponse | null
  routines: RoutineDayResponse[]
}

function ApplyTemplateModal({ open, onClose, template, routines }: ApplyTemplateModalProps) {
  const queryClient = useQueryClient()
  const [routineDayId, setRoutineDayId] = useState('')
  const [replace, setReplace] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setRoutineDayId(routines[0]?.id ?? '')
      setReplace(false)
      setErrorMessage(null)
    }
  }, [open, routines])

  const applyMutation = useMutation({
    mutationFn: () => applyTemplate(template!.id, { routineDayId, replace }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      onClose()
    },
    onError: () => {
      setErrorMessage('No se pudo aplicar la plantilla.')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!routineDayId) return
    applyMutation.mutate()
  }

  return (
    <AnimatePresence>
      {open && template && (
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
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Aplicar plantilla</h2>
              <p className="text-xs text-gray-500 mb-4">{template.name}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aplicar a rutina
                  </label>
                  {routines.length === 0 ? (
                    <p className="text-sm text-gray-500">Primero crea una rutina.</p>
                  ) : (
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={routineDayId}
                      onChange={e => setRoutineDayId(e.target.value)}
                    >
                      {routines.map(r => (
                        <option key={r.id} value={r.id}>
                          {DAYS[r.dayOfWeek].label} - {r.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
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
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={applyMutation.isPending || !routineDayId}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {applyMutation.isPending ? 'Aplicando...' : 'Aplicar'}
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

// ── Day Card ──────────────────────────────────────────────────────────────────

interface DayCardProps {
  dayValue: number
  routine?: RoutineDayResponse
  onCreate: (day: number) => void
}

function DayCard({ dayValue, routine, onCreate }: DayCardProps) {
  const day = DAYS[dayValue]
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">{day.label}</h3>
        {routine && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            routine.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {routine.isActive ? 'Activa' : 'Inactiva'}
          </span>
        )}
      </div>
      {routine ? (
        <>
          <p className="text-xs text-gray-500 mb-2 truncate">{routine.name}</p>
          <div className="space-y-1 mb-3 flex-1 min-h-[80px]">
            {routine.blocks.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Sin bloques aún</p>
            ) : (
              routine.blocks.slice(0, 4).map(b => (
                <div key={b.id} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: b.color ?? '#6366f1' }}
                  />
                  <span className="text-gray-500 font-mono">{formatHm(b.startTime)}</span>
                  <span className="text-gray-700 truncate">{b.title}</span>
                </div>
              ))
            )}
            {routine.blocks.length > 4 && (
              <p className="text-xs text-gray-400">+ {routine.blocks.length - 4} más</p>
            )}
          </div>
          <Link
            to={`/habits/routines/${routine.id}/edit`}
            className="block text-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Editar
          </Link>
        </>
      ) : (
        <>
          <div className="flex-1 min-h-[80px] flex items-center justify-center">
            <p className="text-xs text-gray-400 italic">Sin rutina</p>
          </div>
          <button
            type="button"
            onClick={() => onCreate(dayValue)}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            + Crear
          </button>
        </>
      )}
    </motion.div>
  )
}

// ── Templates Section ─────────────────────────────────────────────────────────

interface TemplatesSectionProps {
  routines: RoutineDayResponse[]
}

function TemplatesSection({ routines }: TemplatesSectionProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [applyTarget, setApplyTarget] = useState<RoutineTemplateResponse | null>(null)

  const templatesQuery = useQuery({
    queryKey: ['routines', 'templates'],
    queryFn: getRoutineTemplates,
    enabled: open,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', 'templates'] })
    },
  })

  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3"
      >
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>Plantillas</span>
      </button>

      {open && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {templatesQuery.isLoading && (
            <p className="text-sm text-gray-400">Cargando plantillas...</p>
          )}
          {templatesQuery.isError && (
            <p className="text-sm text-red-600">Error al cargar plantillas.</p>
          )}
          {templatesQuery.data && (
            templatesQuery.data.length === 0 ? (
              <p className="text-sm text-gray-400">No hay plantillas disponibles.</p>
            ) : (
              <div className="space-y-2">
                {templatesQuery.data.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                      {t.description && (
                        <p className="text-xs text-gray-500 truncate">{t.description}</p>
                      )}
                    </div>
                    {t.isSystem && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        Sistema
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setApplyTarget(t)}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Aplicar a...
                    </button>
                    {!t.isSystem && (
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(t.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                        aria-label="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      <ApplyTemplateModal
        open={Boolean(applyTarget)}
        onClose={() => setApplyTarget(null)}
        template={applyTarget}
        routines={routines}
      />
    </section>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DayCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
      <div className="space-y-1.5 mb-3">
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
      <div className="h-7 bg-gray-200 rounded" />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function RoutineListPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [presetDay, setPresetDay] = useState<number | undefined>(undefined)

  const routinesQuery = useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines,
  })

  function openCreate(day?: number) {
    setPresetDay(day)
    setCreateOpen(true)
  }

  function closeCreate() {
    setCreateOpen(false)
    setPresetDay(undefined)
  }

  const routinesByDay = new Map<number, RoutineDayResponse>()
  if (routinesQuery.data) {
    for (const r of routinesQuery.data) {
      // Prefer active routines over inactive ones if duplicates exist
      const existing = routinesByDay.get(r.dayOfWeek)
      if (!existing || (r.isActive && !existing.isActive)) {
        routinesByDay.set(r.dayOfWeek, r)
      }
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">Rutinas semanales</h1>
            <button
              onClick={() => openCreate()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva rutina
            </button>
          </div>
          <HabitsSubNav active="routines" />
        </header>

        {routinesQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar las rutinas.
          </div>
        )}

        {routinesQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => <DayCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {DAYS.map(d => (
              <DayCard
                key={d.value}
                dayValue={d.value}
                routine={routinesByDay.get(d.value)}
                onCreate={openCreate}
              />
            ))}
          </div>
        )}

        {/* Templates */}
        <TemplatesSection routines={routinesQuery.data ?? []} />

        {/* Modals */}
        <CreateRoutineModal open={createOpen} onClose={closeCreate} presetDay={presetDay} />
      </div>
    </AppLayout>
  )
}
