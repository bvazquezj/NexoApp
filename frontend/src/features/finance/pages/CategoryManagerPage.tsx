import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { AppLayout } from '../../../components/layout/AppLayout'
import { FinanceSubNav } from '../../../components/finance/FinanceSubNav'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../../api/finance.api'
import type {
  CategoryResponse,
  CategoryType,
  CreateCategoryRequest,
} from '../../../types/finance.types'

// ── Type Badge ────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: CategoryType }) {
  const styles: Record<CategoryType, string> = {
    INCOME: 'bg-green-100 text-green-700',
    EXPENSE: 'bg-red-100 text-red-700',
    BOTH: 'bg-purple-100 text-purple-700',
  }
  const labels: Record<CategoryType, string> = {
    INCOME: 'Ingreso',
    EXPENSE: 'Gasto',
    BOTH: 'Ambos',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[type]}`}>
      {labels[type]}
    </span>
  )
}

// ── Category Form Modal ───────────────────────────────────────────────────────

interface CategoryFormModalProps {
  open: boolean
  onClose: () => void
  category?: CategoryResponse
}

function CategoryFormModal({ open, onClose, category }: CategoryFormModalProps) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(category)

  const [name, setName] = useState(category?.name ?? '')
  const [type, setType] = useState<CategoryType>(category?.type ?? 'EXPENSE')
  const [color, setColor] = useState(category?.color ?? '#3b82f6')

  // Reset form state when reopening with a different target
  useEffect(() => {
    if (open) {
      setName(category?.name ?? '')
      setType(category?.type ?? 'EXPENSE')
      setColor(category?.color ?? '#3b82f6')
    }
  }, [open, category])

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateCategoryRequest>) => updateCategory(category!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] })
      onClose()
    },
  })

  const mutation = isEdit ? updateMutation : createMutation
  const trimmedName = name.trim()
  const isValid = trimmedName.length > 0 && trimmedName.length <= 100

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    if (isEdit) {
      updateMutation.mutate({ name: trimmedName, type, color })
    } else {
      createMutation.mutate({ name: trimmedName, type, color })
    }
  }

  const TYPES: { value: CategoryType; label: string; activeClass: string }[] = [
    { value: 'INCOME', label: 'Ingreso', activeClass: 'bg-green-600 text-white' },
    { value: 'EXPENSE', label: 'Gasto', activeClass: 'bg-red-500 text-white' },
    { value: 'BOTH', label: 'Ambos', activeClass: 'bg-purple-600 text-white' },
  ]

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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isEdit ? 'Editar categoría' : 'Nueva categoría'}
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
                    placeholder="Ej: Comida, Salario..."
                  />
                  <p className="text-xs text-gray-400 mt-1">{name.length}/100</p>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${
                          type === t.value ? t.activeClass : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-600 font-mono">{color.toUpperCase()}</span>
                    </div>
                  </div>
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

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  open: boolean
  onClose: () => void
  category: CategoryResponse | null
}

function DeleteConfirmModal({ open, onClose, category }: DeleteConfirmModalProps) {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) setErrorMessage(null)
  }, [open, category])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] })
      onClose()
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setErrorMessage('No puedes eliminar esta categoría porque tiene transacciones o presupuestos asociados.')
      } else {
        setErrorMessage('Error al eliminar la categoría. Intenta de nuevo.')
      }
    },
  })

  function handleConfirm() {
    if (category) deleteMutation.mutate(category.id)
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
              className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Eliminar categoría</h2>
              <p className="text-sm text-gray-500 mb-4">
                ¿Eliminar la categoría <span className="font-semibold text-gray-700">{category?.name}</span>?
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
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

// ── System Category Chip ──────────────────────────────────────────────────────

function SystemCategoryChip({ category }: { category: CategoryResponse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white"
    >
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: category.color }}
      />
      <span className="text-sm text-gray-700">{category.name}</span>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
        Sistema
      </span>
    </motion.div>
  )
}

// ── User Category Row ─────────────────────────────────────────────────────────

interface UserCategoryRowProps {
  category: CategoryResponse
  onEdit: (c: CategoryResponse) => void
  onDelete: (c: CategoryResponse) => void
}

function UserCategoryRow({ category, onEdit, onDelete }: UserCategoryRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3"
    >
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: category.color }}
      />
      <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">
        {category.name}
      </span>
      <TypeBadge type={category.type} />
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(category)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          aria-label="Editar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(category)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          aria-label="Eliminar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function ChipSkeleton() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white animate-pulse">
      <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
      <div className="h-3 w-20 bg-gray-200 rounded" />
    </div>
  )
}

function RowSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 animate-pulse">
      <div className="w-3 h-3 rounded-full bg-gray-200" />
      <div className="h-4 bg-gray-200 rounded w-32 flex-1" />
      <div className="h-5 w-14 bg-gray-200 rounded-full" />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function CategoryManagerPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CategoryResponse | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null)

  const categoriesQuery = useQuery({
    queryKey: ['finance', 'categories'],
    queryFn: () => getCategories(),
  })

  function openCreate() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  function openEdit(c: CategoryResponse) {
    setEditTarget(c)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditTarget(undefined)
  }

  const systemCategories = categoriesQuery.data?.filter(c => c.isSystem) ?? []
  const userCategories = categoriesQuery.data?.filter(c => !c.isSystem) ?? []

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
            <button
              onClick={openCreate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva categoría
            </button>
          </div>
          <FinanceSubNav active="categories" />
        </header>

        {categoriesQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar las categorías. Intenta recargar la página.
          </div>
        )}

        {/* System categories */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Categorías del sistema</h2>
          {categoriesQuery.isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => <ChipSkeleton key={i} />)}
            </div>
          ) : systemCategories.length === 0 ? (
            <p className="text-sm text-gray-400">No hay categorías del sistema.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {systemCategories.map(c => (
                <SystemCategoryChip key={c.id} category={c} />
              ))}
            </div>
          )}
        </section>

        {/* User categories */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Tus categorías</h2>
          {categoriesQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
            </div>
          ) : userCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Aún no tienes categorías personalizadas</p>
              <p className="text-xs mt-1">Crea una con el botón "Nueva categoría"</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-2">
                {userCategories.map(c => (
                  <UserCategoryRow
                    key={c.id}
                    category={c}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </section>

        {/* Modals */}
        <CategoryFormModal
          open={formOpen}
          onClose={handleFormClose}
          category={editTarget}
        />

        <DeleteConfirmModal
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          category={deleteTarget}
        />
      </div>
    </AppLayout>
  )
}
