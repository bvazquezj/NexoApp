import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import { FinanceSubNav } from '../../../components/finance/FinanceSubNav'
import { useFinanceStore } from '../../../stores/useFinanceStore'
import {
  getBudgetProgress,
  createBudget,
  updateBudget,
  deleteBudget,
  getCategories,
} from '../../../api/finance.api'
import { MONTHS, formatAmount } from '../../../utils/finance'
import type {
  BudgetProgressResponse,
  BudgetResponse,
  FinanceCurrency,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  CategoryResponse,
} from '../../../types/finance.types'

// ── Month Navigator ───────────────────────────────────────────────────────────

function MonthNavigator() {
  const { activeMonth, activeYear, goToPrevMonth, goToNextMonth } = useFinanceStore()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goToPrevMonth}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Mes anterior"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="text-sm font-medium text-gray-700 w-36 text-center">
        {MONTHS[activeMonth - 1]} {activeYear}
      </span>
      <button
        onClick={goToNextMonth}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Mes siguiente"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

// ── Budget Form Modal ─────────────────────────────────────────────────────────

interface BudgetFormModalProps {
  open: boolean
  onClose: () => void
  budget?: BudgetResponse
  categories: CategoryResponse[]
}

function BudgetFormModal({ open, onClose, budget, categories }: BudgetFormModalProps) {
  const queryClient = useQueryClient()
  const { activeMonth, activeYear } = useFinanceStore()
  const isEdit = Boolean(budget)

  const [categoryId, setCategoryId] = useState(budget?.category.id ?? '')
  const [limitAmount, setLimitAmount] = useState(budget?.limitAmount ?? '')
  const [currency, setCurrency] = useState<FinanceCurrency>(budget?.currency ?? 'MXN')
  const [month, setMonth] = useState(budget?.month ?? activeMonth)
  const [year, setYear] = useState(budget?.year ?? activeYear)

  // Filter to EXPENSE and BOTH categories only
  const filteredCategories = categories.filter(c => c.type === 'EXPENSE' || c.type === 'BOTH')

  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetRequest) => createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateBudgetRequest) => updateBudget(budget!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] })
      onClose()
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!limitAmount || !categoryId) return

    if (isEdit) {
      updateMutation.mutate({ limitAmount, currency })
    } else {
      createMutation.mutate({ categoryId, limitAmount, currency, month, year })
    }
  }

  const mutation = isEdit ? updateMutation : createMutation

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
                {isEdit ? 'Editar presupuesto' : 'Nuevo presupuesto'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={isEdit}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                  >
                    <option value="">Seleccionar categoria</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Limit + Currency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Limite <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={limitAmount}
                      onChange={e => setLimitAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                      {(['MXN', 'USD'] as FinanceCurrency[]).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCurrency(c)}
                          className={`flex-1 py-2 text-sm font-medium transition-colors ${
                            currency === c
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Month/Year — only for create */}
                {!isEdit && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={month}
                        onChange={e => setMonth(Number(e.target.value))}
                      >
                        {MONTHS.map((name, i) => (
                          <option key={i + 1} value={i + 1}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                      <input
                        type="number"
                        min="2020"
                        max="2099"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={year}
                        onChange={e => setYear(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}

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
                    disabled={mutation.isPending}
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
  onConfirm: () => void
  isPending: boolean
}

function DeleteConfirmModal({ open, onClose, onConfirm, isPending }: DeleteConfirmModalProps) {
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
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Eliminar presupuesto</h2>
              <p className="text-sm text-gray-500 mb-6">Esta accion es permanente y no se puede deshacer.</p>
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
                  onClick={onConfirm}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isPending ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Budget Progress Card ──────────────────────────────────────────────────────

interface BudgetCardProps {
  progress: BudgetProgressResponse
  onEdit: (b: BudgetResponse) => void
  onDelete: (b: BudgetResponse) => void
}

function BudgetCard({ progress, onEdit, onDelete }: BudgetCardProps) {
  const { budget, spent, remaining, progressPercent, alertLevel } = progress
  const pct = Math.min(progressPercent, 100)

  const barColor =
    progressPercent >= 100 ? 'bg-red-500' :
    progressPercent >= 80 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: budget.category.color }}
          />
          <span className="text-sm font-semibold text-gray-800">{budget.category.name}</span>
          {alertLevel && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              alertLevel === 'EXCEEDED'
                ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {alertLevel === 'EXCEEDED' ? 'Excedido' : 'Advertencia'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Amounts */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Gastado: <span className="font-medium text-gray-800">{formatAmount(spent, budget.currency)}</span></span>
        <span className="font-medium text-gray-600">{Math.round(progressPercent)}%</span>
        <span>Limite: <span className="font-medium text-gray-800">{formatAmount(budget.limitAmount, budget.currency)}</span></span>
      </div>

      {parseFloat(remaining) < 0 ? (
        <p className="text-xs text-red-500 mt-1">
          Excedido por {formatAmount(String(Math.abs(parseFloat(remaining))), budget.currency)}
        </p>
      ) : (
        <p className="text-xs text-gray-400 mt-1">
          Disponible: {formatAmount(remaining, budget.currency)}
        </p>
      )}
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BudgetSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-2" />
      <div className="flex justify-between">
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function BudgetListPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BudgetResponse | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<BudgetResponse | null>(null)

  const { activeMonth, activeYear } = useFinanceStore()
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['finance', 'categories'],
    queryFn: () => getCategories(),
  })

  const progressQuery = useQuery({
    queryKey: ['finance', 'budgets', 'progress', activeMonth, activeYear],
    queryFn: () => getBudgetProgress(activeMonth, activeYear),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] })
      setDeleteTarget(null)
    },
  })

  function openCreate() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  function openEdit(b: BudgetResponse) {
    setEditTarget(b)
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
            <div className="flex items-center gap-3">
              <MonthNavigator />
              <button
                onClick={openCreate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo presupuesto
              </button>
            </div>
          </div>
          <FinanceSubNav active="budgets" />
        </header>

        {progressQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar los presupuestos.
          </div>
        )}

        {progressQuery.isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <BudgetSkeleton key={i} />)}
          </div>
        )}

        {progressQuery.data && !progressQuery.isLoading && progressQuery.data.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium">Sin presupuestos para este mes</p>
            <p className="text-xs mt-1">Crea un presupuesto para empezar a controlar tus gastos</p>
          </div>
        )}

        {progressQuery.data && !progressQuery.isLoading && progressQuery.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {progressQuery.data.map(p => (
              <BudgetCard
                key={p.budget.id}
                progress={p}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

        <BudgetFormModal
          open={formOpen}
          onClose={handleFormClose}
          budget={editTarget}
          categories={categoriesQuery.data ?? []}
        />

        <DeleteConfirmModal
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          isPending={deleteMutation.isPending}
        />
      </div>
    </AppLayout>
  )
}
