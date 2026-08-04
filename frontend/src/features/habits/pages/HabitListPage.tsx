import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { AppLayout } from '../../../components/layout/AppLayout'
import { HabitsSubNav } from '../../../components/habits/HabitsSubNav'
import {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  setHabitActive,
  getHabitCategories,
  createHabitCategory,
  updateHabitCategory,
  deleteHabitCategory,
} from '../../../api/habits.api'
import type {
  HabitSummaryResponse,
  HabitResponse,
  HabitCategoryResponse,
  HabitFrequency,
  CreateHabitRequest,
  UpdateHabitRequest,
} from '../../../types/habit.types'

// ── Day chips constants ───────────────────────────────────────────────────────

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function frequencyText(habit: HabitSummaryResponse | HabitResponse): string {
  // HabitSummaryResponse doesn't include frequency — only show if available
  const full = habit as HabitResponse
  if (!full.frequency) return ''
  if (full.frequency === 'DAILY') return 'Diario'
  const days = full.frequencyDays ?? []
  if (days.length === 7) return 'Diario'
  if (days.length === 0) return 'Sin días'
  return days.map(d => DAY_LABELS[d]).join(', ')
}

// ── Habit Form Modal ──────────────────────────────────────────────────────────

interface HabitFormModalProps {
  open: boolean
  onClose: () => void
  habit?: HabitResponse
  categories: HabitCategoryResponse[]
}

function HabitFormModal({ open, onClose, habit, categories }: HabitFormModalProps) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(habit)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [icon, setIcon] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('DAILY')
  const [frequencyDays, setFrequencyDays] = useState<number[]>([])

  useEffect(() => {
    if (open) {
      setName(habit?.name ?? '')
      setDescription(habit?.description ?? '')
      setColor(habit?.color ?? '#3b82f6')
      setIcon(habit?.icon ?? '')
      setCategoryId(habit?.category.id ?? categories[0]?.id ?? '')
      setFrequency(habit?.frequency ?? 'DAILY')
      setFrequencyDays(habit?.frequencyDays ?? [])
    }
  }, [open, habit, categories])

  const createMutation = useMutation({
    mutationFn: (data: CreateHabitRequest) => createHabit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['habits', 'today'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateHabitRequest) => updateHabit(habit!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['habits', 'today'] })
      queryClient.invalidateQueries({ queryKey: ['habits', habit!.id] })
      onClose()
    },
  })

  const mutation = isEdit ? updateMutation : createMutation
  const trimmedName = name.trim()
  const isValid =
    trimmedName.length > 0 &&
    trimmedName.length <= 100 &&
    Boolean(categoryId) &&
    (frequency === 'DAILY' || frequencyDays.length > 0)

  function toggleDay(d: number) {
    setFrequencyDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort(),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    const base = {
      name: trimmedName,
      description: description.trim() || undefined,
      categoryId,
      frequency,
      frequencyDays: frequency === 'CUSTOM' ? frequencyDays : undefined,
      color,
      icon: icon.trim() || undefined,
    }
    if (isEdit) {
      updateMutation.mutate(base)
    } else {
      createMutation.mutate(base as CreateHabitRequest)
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
                {isEdit ? 'Editar hábito' : 'Nuevo hábito'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
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
                    placeholder="Ej: Meditar"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descripción opcional"
                  />
                </div>

                {/* Color + Icon */}
                <div className="grid grid-cols-2 gap-3">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icono (emoji)</label>
                    <input
                      type="text"
                      maxLength={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={icon}
                      onChange={e => setIcon(e.target.value)}
                      placeholder="🧘"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                  <div className="flex gap-3 mb-2">
                    {(['DAILY', 'CUSTOM'] as HabitFrequency[]).map(f => (
                      <label key={f} className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="freq"
                          value={f}
                          checked={frequency === f}
                          onChange={() => setFrequency(f)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>{f === 'DAILY' ? 'Diario' : 'Personalizado'}</span>
                      </label>
                    ))}
                  </div>
                  {frequency === 'CUSTOM' && (
                    <div className="flex flex-wrap gap-1.5">
                      {DAY_LABELS.map((label, i) => {
                        const active = frequencyDays.includes(i)
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => toggleDay(i)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              active
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                      {frequency === 'CUSTOM' && frequencyDays.length === 0 && (
                        <p className="text-xs text-red-500 mt-1 w-full">Selecciona al menos un día</p>
                      )}
                    </div>
                  )}
                </div>

                {mutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    Error al guardar. Intenta de nuevo.
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
                    disabled={mutation.isPending || !isValid}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {mutation.isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
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

// ── Categories Modal ──────────────────────────────────────────────────────────

interface CategoriesModalProps {
  open: boolean
  onClose: () => void
}

function CategoriesModal({ open, onClose }: CategoriesModalProps) {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setEditingId(null)
      setName('')
      setColor('#3b82f6')
      setErrorMessage(null)
    }
  }, [open])

  const categoriesQuery = useQuery({
    queryKey: ['habits', 'categories'],
    queryFn: getHabitCategories,
    enabled: open,
  })

  const createMutation = useMutation({
    mutationFn: () => createHabitCategory({ name: name.trim(), color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', 'categories'] })
      setName('')
      setColor('#3b82f6')
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => updateHabitCategory(editingId!, { name: name.trim(), color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', 'categories'] })
      setEditingId(null)
      setName('')
      setColor('#3b82f6')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHabitCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', 'categories'] })
      setErrorMessage(null)
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setErrorMessage('No puedes eliminar esta categoría porque tiene hábitos asociados.')
      } else {
        setErrorMessage('Error al eliminar la categoría.')
      }
    },
  })

  function startEdit(c: HabitCategoryResponse) {
    setEditingId(c.id)
    setName(c.name)
    setColor(c.color)
  }

  function cancelEdit() {
    setEditingId(null)
    setName('')
    setColor('#3b82f6')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (editingId) updateMutation.mutate()
    else createMutation.mutate()
  }

  const systemCats = categoriesQuery.data?.filter(c => c.isSystem) ?? []
  const userCats = categoriesQuery.data?.filter(c => !c.isSystem) ?? []

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
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorías de hábitos</h2>

              {/* System chips */}
              <section className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 mb-2">Del sistema</h3>
                <div className="flex flex-wrap gap-2">
                  {systemCats.length === 0 ? (
                    <span className="text-xs text-gray-400">Ninguna</span>
                  ) : (
                    systemCats.map(c => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-gray-700">{c.name}</span>
                      </span>
                    ))
                  )}
                </div>
              </section>

              {/* User categories */}
              <section className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 mb-2">Tus categorías</h3>
                {userCats.length === 0 ? (
                  <p className="text-xs text-gray-400">Aún no tienes categorías propias.</p>
                ) : (
                  <div className="space-y-2">
                    {userCats.map(c => (
                      <div
                        key={c.id}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-sm text-gray-800 flex-1 min-w-0 truncate">{c.name}</span>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          aria-label="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(c.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                          aria-label="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-3">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  {editingId ? 'Editar categoría' : 'Nueva categoría'}
                </h3>
                <div>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="Nombre"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 font-mono">{color.toUpperCase()}</span>
                  <div className="flex-1" />
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || !name.trim()}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editingId ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  open: boolean
  onClose: () => void
  habit: HabitSummaryResponse | null
}

function DeleteConfirmModal({ open, onClose, habit }: DeleteConfirmModalProps) {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) setErrorMessage(null)
  }, [open, habit])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['habits', 'today'] })
      onClose()
    },
    onError: () => {
      setErrorMessage('Error al eliminar el hábito.')
    },
  })

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
              className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Eliminar hábito</h2>
              <p className="text-sm text-gray-500 mb-4">
                ¿Eliminar el hábito <span className="font-semibold text-gray-700">{habit?.name}</span>? Se perderá su historial.
              </p>
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
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
                  type="button"
                  onClick={() => habit && deleteMutation.mutate(habit.id)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Habit Card ────────────────────────────────────────────────────────────────

interface HabitCardProps {
  habit: HabitSummaryResponse
  onEdit: () => void
  onDelete: () => void
}

function HabitCard({ habit, onEdit, onDelete }: HabitCardProps) {
  const queryClient = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(false)

  // Fetch full habit details for the form/frequency display
  const fullHabitQuery = useQuery({
    queryKey: ['habits', habit.id],
    queryFn: () => getHabit(habit.id),
    staleTime: 30_000,
  })

  const toggleActive = useMutation({
    mutationFn: () => setHabitActive(habit.id, !habit.isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['habits', 'today'] })
    },
  })

  const freqText = fullHabitQuery.data ? frequencyText(fullHabitQuery.data) : '...'

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative"
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: habit.color }}
      />
      <div className="p-4 pl-5 flex-1 flex flex-col">
        <div className="flex items-start gap-2 mb-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
            style={{ backgroundColor: `${habit.color}22` }}
          >
            {habit.icon ? <span>{habit.icon}</span> : (
              <svg className="w-5 h-5" fill="none" stroke={habit.color} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{habit.name}</p>
            <span
              className="inline-block text-xs px-1.5 py-0.5 rounded-full mt-1"
              style={{ backgroundColor: `${habit.category.color}22`, color: habit.category.color }}
            >
              {habit.category.name}
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Menú"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                  <Link
                    to={`/habits/${habit.id}`}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Ver detalles
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); onEdit() }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete() }}
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 my-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span>🔥</span>
            <span className="font-medium text-gray-900">{habit.currentStreak}</span>
            <span className="text-gray-400">actual</span>
          </div>
          {fullHabitQuery.data && (
            <div className="flex items-center gap-1">
              <span>🏆</span>
              <span className="font-medium text-gray-900">{fullHabitQuery.data.maxStreak}</span>
              <span className="text-gray-400">máx</span>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 mb-3 truncate">{freqText}</p>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">{habit.isActive ? 'Activo' : 'Inactivo'}</span>
          <button
            onClick={() => toggleActive.mutate()}
            disabled={toggleActive.isPending}
            className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors disabled:opacity-50 ${
              habit.isActive ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label="Activar/desactivar"
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                habit.isActive ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Card Skeleton ─────────────────────────────────────────────────────────────

function HabitCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-1.5" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function HabitListPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<HabitResponse | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<HabitSummaryResponse | null>(null)
  const queryClient = useQueryClient()

  const habitsQuery = useQuery({
    queryKey: ['habits'],
    queryFn: getHabits,
  })

  const categoriesQuery = useQuery({
    queryKey: ['habits', 'categories'],
    queryFn: getHabitCategories,
  })

  function openCreate() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  async function openEdit(summary: HabitSummaryResponse) {
    // Pre-fetch the full habit so the form has frequency/days
    const full = await queryClient.fetchQuery({
      queryKey: ['habits', summary.id],
      queryFn: () => getHabit(summary.id),
    })
    setEditTarget(full)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditTarget(undefined)
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">Hábitos</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCategoriesOpen(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Categorías
              </button>
              <button
                onClick={openCreate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo hábito
              </button>
            </div>
          </div>
          <HabitsSubNav active="list" />
        </header>

        {habitsQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar los hábitos. Intenta recargar la página.
          </div>
        )}

        {habitsQuery.isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <HabitCardSkeleton key={i} />)}
          </div>
        )}

        {habitsQuery.data && !habitsQuery.isLoading && (
          habitsQuery.data.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm font-medium">Aún no tienes hábitos</p>
              <p className="text-xs mt-1">Crea uno con el botón "Nuevo hábito"</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {habitsQuery.data.map(h => (
                  <HabitCard
                    key={h.id}
                    habit={h}
                    onEdit={() => openEdit(h)}
                    onDelete={() => setDeleteTarget(h)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )
        )}

        {/* Modals */}
        <HabitFormModal
          open={formOpen}
          onClose={handleFormClose}
          habit={editTarget}
          categories={categoriesQuery.data ?? []}
        />
        <CategoriesModal open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
        <DeleteConfirmModal
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          habit={deleteTarget}
        />
      </div>
    </AppLayout>
  )
}
