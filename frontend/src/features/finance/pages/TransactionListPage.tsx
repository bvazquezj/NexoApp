import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import { FinanceSubNav } from '../../../components/finance/FinanceSubNav'
import { useFinanceStore } from '../../../stores/useFinanceStore'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
} from '../../../api/finance.api'
import { formatAmount, formatDate } from '../../../utils/finance'
import type {
  TransactionResponse,
  TransactionType,
  FinanceCurrency,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  CategoryResponse,
} from '../../../types/finance.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10)

// ── Transaction Form Modal ────────────────────────────────────────────────────

interface TransactionFormModalProps {
  open: boolean
  onClose: () => void
  transaction?: TransactionResponse
  categories: CategoryResponse[]
}

function TransactionFormModal({ open, onClose, transaction, categories }: TransactionFormModalProps) {
  const queryClient = useQueryClient()

  const isEdit = Boolean(transaction)

  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<FinanceCurrency>('MXN')
  const [exchangeRate, setExchangeRate] = useState('1.000000')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(today())
  const [description, setDescription] = useState('')

  // Reset al abrir el modal con otra transacción (o al abrir para crear).
  // Sin esto, useState solo se evaluaría en el primer mount.
  useEffect(() => {
    if (!open) return
    setType(transaction?.type ?? 'EXPENSE')
    setAmount(transaction?.amount ?? '')
    setCurrency(transaction?.currency ?? 'MXN')
    setExchangeRate(transaction?.exchangeRate ?? '1.000000')
    setCategoryId(transaction?.category.id ?? '')
    setDate(transaction?.date ?? today())
    setDescription(transaction?.description ?? '')
  }, [open, transaction])

  function handleCurrencyChange(c: FinanceCurrency) {
    setCurrency(c)
    if (c === 'MXN') {
      setExchangeRate('1.000000')
    } else {
      setExchangeRate('17.00')
    }
  }

  const filteredCategories = categories.filter(
    c => c.type === type || c.type === 'BOTH',
  )

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionRequest) => createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTransactionRequest) => updateTransaction(transaction!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] })
      handleClose()
    },
  })

  function handleClose() {
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numericAmount = parseFloat(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !categoryId || !date) return

    if (isEdit) {
      const payload: UpdateTransactionRequest = {
        type,
        amount,
        currency,
        exchangeRate,
        date,
        categoryId,
        description: description.trim() || undefined,
      }
      updateMutation.mutate(payload)
    } else {
      const payload: CreateTransactionRequest = {
        type,
        amount,
        currency,
        exchangeRate,
        date,
        categoryId,
        description: description.trim() || undefined,
      }
      createMutation.mutate(payload)
    }
  }

  const mutation = isEdit ? updateMutation : createMutation
  const isPending = mutation.isPending
  const isError = mutation.isError

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
            onClick={handleClose}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isEdit ? 'Editar transaccion' : 'Nueva transaccion'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {(['EXPENSE', 'INCOME'] as TransactionType[]).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setType(t)
                          setCategoryId('')
                        }}
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

                {/* Exchange Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de cambio
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.000001"
                    required
                    disabled={currency === 'MXN'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                    value={exchangeRate}
                    onChange={e => setExchangeRate(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                  >
                    <option value="">Seleccionar categoria</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
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
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripcion
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descripcion opcional"
                  />
                </div>

                {isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    Error al guardar. Intenta de nuevo.
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Eliminar transaccion</h2>
              <p className="text-sm text-gray-500 mb-6">
                Esta accion enviara la transaccion a la papelera. Podras restaurarla despues.
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

// ── Transaction Row ───────────────────────────────────────────────────────────

interface TransactionRowProps {
  transaction: TransactionResponse
  onEdit: (t: TransactionResponse) => void
  onDelete: (t: TransactionResponse) => void
}

function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = transaction.type === 'INCOME'

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-4"
    >
      {/* Type icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isIncome ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <svg
          className={`w-4 h-4 ${isIncome ? 'text-green-600' : 'text-red-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isIncome
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          }
        </svg>
      </div>

      {/* Date + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {transaction.description ?? 'Sin descripcion'}
        </p>
        <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
      </div>

      {/* Category */}
      <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: transaction.category.color }}
        />
        <span className="text-xs text-gray-600">{transaction.category.name}</span>
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right">
        <p className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency)}
        </p>
        <p className="text-xs text-gray-400">{transaction.currency}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(transaction)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          aria-label="Editar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(transaction)}
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TransactionSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-4 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1.5" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-20" />
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
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

// ── Filter Bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  categories: CategoryResponse[]
}

function FilterBar({ categories }: FilterBarProps) {
  const { txFilters, setTxFilters, resetTxFilters } = useFinanceStore()

  const hasActive =
    txFilters.type !== null ||
    txFilters.categoryId !== null ||
    txFilters.from !== null ||
    txFilters.to !== null

  function toggleType(t: TransactionType) {
    setTxFilters({ type: txFilters.type === t ? null : t })
  }

  return (
    <div className="flex flex-wrap gap-2 items-center py-3">
      <span className="text-xs font-medium text-gray-500 mr-1">Tipo:</span>
      {([['INCOME', 'Ingreso'], ['EXPENSE', 'Gasto']] as [TransactionType, string][]).map(([val, label]) => (
        <button
          key={val}
          onClick={() => toggleType(val)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            txFilters.type === val
              ? val === 'INCOME' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}

      <span className="text-xs font-medium text-gray-500 ml-2 mr-1">Desde:</span>
      <input
        type="date"
        max={txFilters.to ?? undefined}
        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={txFilters.from ?? ''}
        onChange={e => setTxFilters({ from: e.target.value || null })}
      />

      <span className="text-xs font-medium text-gray-500 ml-1 mr-1">Hasta:</span>
      <input
        type="date"
        min={txFilters.from ?? undefined}
        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={txFilters.to ?? ''}
        onChange={e => setTxFilters({ to: e.target.value || null })}
      />

      <span className="text-xs font-medium text-gray-500 ml-2 mr-1">Categoria:</span>
      <select
        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={txFilters.categoryId ?? ''}
        onChange={e => setTxFilters({ categoryId: e.target.value || null })}
      >
        <option value="">Todas</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      {hasActive && (
        <button
          onClick={resetTxFilters}
          className="ml-1 px-3 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function TransactionListPage() {
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<TransactionResponse | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<TransactionResponse | null>(null)

  const { txFilters } = useFinanceStore()
  const queryClient = useQueryClient()

  useEffect(() => { setPage(0) }, [txFilters])

  const categoriesQuery = useQuery({
    queryKey: ['finance', 'categories'],
    queryFn: () => getCategories(),
  })

  const transactionsQuery = useQuery({
    queryKey: ['finance', 'transactions', txFilters, page],
    queryFn: () => getTransactions(txFilters, page),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] })
      setDeleteTarget(null)
    },
  })

  function openCreate() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  function openEdit(t: TransactionResponse) {
    setEditTarget(t)
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
        <header className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
            <button
              onClick={openCreate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva transaccion
            </button>
          </div>
          <FinanceSubNav active="transactions" />
        </header>

        {/* Filter Bar */}
        <FilterBar categories={categoriesQuery.data ?? []} />

        {/* Error */}
        {transactionsQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar las transacciones. Intenta recargar la pagina.
          </div>
        )}

        {/* Loading */}
        {transactionsQuery.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <TransactionSkeleton key={i} />)}
          </div>
        )}

        {/* List */}
        {transactionsQuery.data && !transactionsQuery.isLoading && (
          <>
            {transactionsQuery.data.content.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">No hay transacciones</p>
                <p className="text-xs mt-1">Registra tu primera transaccion con el boton de arriba</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                <div className="space-y-2">
                  {transactionsQuery.data.content.map(t => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
            <Pagination
              page={page}
              totalPages={transactionsQuery.data.totalPages}
              onPageChange={p => { setPage(p) }}
            />
          </>
        )}

        {/* Form Modal */}
        <TransactionFormModal
          open={formOpen}
          onClose={handleFormClose}
          transaction={editTarget}
          categories={categoriesQuery.data ?? []}
        />

        {/* Delete Confirm Modal */}
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
