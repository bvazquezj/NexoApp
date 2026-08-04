import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import { FinanceSubNav } from '../../../components/finance/FinanceSubNav'
import {
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
} from '../../../api/finance.api'
import { formatDate } from '../../../utils/finance'
import type {
  TransactionType,
  FinanceCurrency,
  UpdateTransactionRequest,
} from '../../../types/finance.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10)

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function truncateId(id: string): string {
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
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
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Eliminar transacción</h2>
              <p className="text-sm text-gray-500 mb-6">
                Esta acción enviará la transacción a la papelera. Podrás restaurarla después.
              </p>
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

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-5 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-20 mb-3" />
        <div className="h-4 bg-gray-100 rounded mb-4" />
        <div className="h-3 bg-gray-200 rounded w-16 mb-3" />
        <div className="h-4 bg-gray-100 rounded" />
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const transactionQuery = useQuery({
    queryKey: ['finance', 'transactions', 'detail', id],
    queryFn: () => getTransaction(id!),
    enabled: Boolean(id),
  })

  const categoriesQuery = useQuery({
    queryKey: ['finance', 'categories'],
    queryFn: () => getCategories(),
  })

  const tx = transactionQuery.data

  // Form state — initialized from query data
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<FinanceCurrency>('MXN')
  const [exchangeRate, setExchangeRate] = useState('1.000000')
  const [date, setDate] = useState(today())
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Hydrate when transaction loads
  useEffect(() => {
    if (tx) {
      setType(tx.type)
      setAmount(tx.amount)
      setCurrency(tx.currency)
      setExchangeRate(tx.exchangeRate)
      setDate(tx.date)
      setCategoryId(tx.category.id)
      setDescription(tx.description ?? '')
    }
  }, [tx])

  function handleCurrencyChange(c: FinanceCurrency) {
    setCurrency(c)
    if (c === 'MXN') setExchangeRate('1.000000')
    else if (exchangeRate === '1.000000') setExchangeRate('17.00')
  }

  function handleTypeChange(t: TransactionType) {
    setType(t)
    // If current category isn't compatible with new type, reset
    const currentCat = categoriesQuery.data?.find(c => c.id === categoryId)
    if (currentCat && currentCat.type !== t && currentCat.type !== 'BOTH') {
      setCategoryId('')
    }
  }

  const filteredCategories = useMemo(() => {
    return (categoriesQuery.data ?? []).filter(c => c.type === type || c.type === 'BOTH')
  }, [categoriesQuery.data, type])

  // Validation
  const numericAmount = parseFloat(amount)
  const isAmountValid = Number.isFinite(numericAmount) && numericAmount > 0
  const isDateValid = Boolean(date) && date <= today()
  const isCategoryValid = Boolean(categoryId)
  const isValid = isAmountValid && isDateValid && isCategoryValid

  // Dirty check
  const isDirty = useMemo(() => {
    if (!tx) return false
    return (
      tx.type !== type ||
      tx.amount !== amount ||
      tx.currency !== currency ||
      tx.exchangeRate !== exchangeRate ||
      tx.date !== date ||
      tx.category.id !== categoryId ||
      (tx.description ?? '') !== description
    )
  }, [tx, type, amount, currency, exchangeRate, date, categoryId, description])

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTransactionRequest) => updateTransaction(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTransaction(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] })
      navigate('/finance/transactions')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || !isDirty) return
    updateMutation.mutate({
      type,
      amount,
      currency,
      exchangeRate,
      date,
      categoryId,
      description: description.trim() || undefined,
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Detalle de transacción</h1>
          </div>
          <FinanceSubNav active="transactions" />
        </header>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/finance" className="hover:text-blue-600 transition-colors">Finanzas</Link>
          <span className="text-gray-300">/</span>
          <Link to="/finance/transactions" className="hover:text-blue-600 transition-colors">
            Transacciones
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 truncate max-w-xs">
            {tx?.description ?? 'Sin descripción'}
          </span>
        </nav>

        {/* Loading */}
        {transactionQuery.isLoading && <FormSkeleton />}

        {/* Error / Not found */}
        {transactionQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-sm font-medium text-red-700 mb-2">Transacción no encontrada</p>
            <Link
              to="/finance/transactions"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Volver al listado
            </Link>
          </div>
        )}

        {/* Form */}
        {tx && !transactionQuery.isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Form column */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {(['EXPENSE', 'INCOME'] as TransactionType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        type === t
                          ? t === 'INCOME'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-500 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t === 'INCOME' ? 'Ingreso' : 'Gasto'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount + Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  {amount && !isAmountValid && (
                    <p className="text-xs text-red-500 mt-1">Ingresa un monto mayor a 0</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {(['MXN', 'USD'] as FinanceCurrency[]).map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleCurrencyChange(c)}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${
                          currency === c ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exchange rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cambio</label>
                <input
                  type="number"
                  min="0"
                  step="0.000001"
                  required
                  disabled={currency === 'MXN'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  value={currency === 'MXN' ? '1.000000' : exchangeRate}
                  onChange={e => setExchangeRate(e.target.value)}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  max={today()}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
                {date && !isDateValid && (
                  <p className="text-xs text-red-500 mt-1">La fecha no puede ser futura</p>
                )}
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
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descripción opcional"
                />
              </div>

              {updateMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  Error al guardar. Intenta de nuevo.
                </div>
              )}

              {updateMutation.isSuccess && !isDirty && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  Cambios guardados correctamente.
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors mr-auto"
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/finance/transactions')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isDirty || !isValid || updateMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>

            {/* Sidebar metadata */}
            <aside className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 h-fit">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Metadatos</h2>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Creado</p>
                <p className="text-sm text-gray-800">{formatCreatedAt(tx.createdAt)}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">ID</p>
                <p className="text-sm text-gray-800 font-mono" title={tx.id}>{truncateId(tx.id)}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Fecha original</p>
                <p className="text-sm text-gray-800">{formatDate(tx.date)}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Categoría actual</p>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tx.category.color }}
                  />
                  <span className="text-sm text-gray-800">{tx.category.name}</span>
                </div>
              </div>
            </aside>
          </motion.div>
        )}

        <DeleteConfirmModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => deleteMutation.mutate()}
          isPending={deleteMutation.isPending}
        />
      </div>
    </AppLayout>
  )
}
