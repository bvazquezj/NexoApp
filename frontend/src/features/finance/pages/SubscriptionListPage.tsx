import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import { FinanceSubNav } from '../../../components/finance/FinanceSubNav'
import { useFinanceStore } from '../../../stores/useFinanceStore'
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  toggleSubscription,
  getSubscriptionMonthlyCost,
  getCategories,
} from '../../../api/finance.api'
import { formatAmount, formatDate, frequencyLabel, daysUntil } from '../../../utils/finance'
import type {
  SubscriptionResponse,
  FinanceCurrency,
  SubscriptionFrequency,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CategoryResponse,
} from '../../../types/finance.types'

// ── Subscription Form Modal ───────────────────────────────────────────────────

interface SubscriptionFormModalProps {
  open: boolean
  onClose: () => void
  subscription?: SubscriptionResponse
  categories: CategoryResponse[]
}

function SubscriptionFormModal({ open, onClose, subscription, categories }: SubscriptionFormModalProps) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(subscription)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<FinanceCurrency>('MXN')
  const [frequency, setFrequency] = useState<SubscriptionFrequency>('MONTHLY')
  const [nextBillingDate, setNextBillingDate] = useState('')
  const [categoryId, setCategoryId] = useState('')

  // Reset al abrir el modal con otra suscripción (o al crear).
  useEffect(() => {
    if (!open) return
    setName(subscription?.name ?? '')
    setAmount(subscription?.amount ?? '')
    setCurrency(subscription?.currency ?? 'MXN')
    setFrequency(subscription?.frequency ?? 'MONTHLY')
    setNextBillingDate(subscription?.nextBillingDate ?? '')
    setCategoryId(subscription?.category.id ?? '')
  }, [open, subscription])

  const createMutation = useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'subscriptions'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSubscriptionRequest) => updateSubscription(subscription!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'subscriptions'] })
      onClose()
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !amount || !categoryId || !nextBillingDate) return

    if (isEdit) {
      updateMutation.mutate({ name: name.trim(), amount, currency, frequency, nextBillingDate, categoryId })
    } else {
      createMutation.mutate({ name: name.trim(), amount, currency, frequency, nextBillingDate, categoryId })
    }
  }

  const mutation = isEdit ? updateMutation : createMutation

  const FREQUENCIES: { value: SubscriptionFrequency; label: string }[] = [
    { value: 'MONTHLY', label: 'Mensual' },
    { value: 'YEARLY', label: 'Anual' },
    { value: 'WEEKLY', label: 'Semanal' },
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
              className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isEdit ? 'Editar suscripcion' : 'Nueva suscripcion'}
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
                    maxLength={150}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Netflix, Spotify..."
                  />
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

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {FREQUENCIES.map(f => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFrequency(f.value)}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${
                          frequency === f.value
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next billing date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proximo cobro <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={nextBillingDate}
                    onChange={e => setNextBillingDate(e.target.value)}
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
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Eliminar suscripcion</h2>
              <p className="text-sm text-gray-500 mb-6">Esta accion es permanente.</p>
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

// ── Subscription Card ─────────────────────────────────────────────────────────

interface SubscriptionCardProps {
  subscription: SubscriptionResponse
  onEdit: (s: SubscriptionResponse) => void
  onDelete: (s: SubscriptionResponse) => void
  onToggle: (id: string) => void
  isToggling: boolean
}

function SubscriptionCard({ subscription, onEdit, onDelete, onToggle, isToggling }: SubscriptionCardProps) {
  const days = daysUntil(subscription.nextBillingDate)
  const daysLabel =
    days < 0 ? `Vencio hace ${Math.abs(days)} dias` :
    days === 0 ? 'Vence hoy' :
    days === 1 ? 'Vence manana' :
    `En ${days} dias`

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`bg-white rounded-xl border p-5 ${
        subscription.active ? 'border-gray-200' : 'border-gray-100 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Name + active badge */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">{subscription.name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              subscription.active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {subscription.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: subscription.category.color }}
            />
            <span className="text-xs text-gray-500">{subscription.category.name}</span>
          </div>

          {/* Amount + frequency */}
          <p className="text-base font-bold text-gray-800">
            {formatAmount(subscription.amount, subscription.currency)}
            <span className="text-xs font-normal text-gray-400 ml-1">
              / {frequencyLabel(subscription.frequency)}
            </span>
          </p>

          {/* Next billing */}
          <p className={`text-xs mt-1 ${days <= 3 ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
            {daysLabel} · {formatDate(subscription.nextBillingDate)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Toggle */}
          <button
            onClick={() => onToggle(subscription.id)}
            disabled={isToggling}
            className={`p-1.5 rounded-lg transition-colors ${
              subscription.active
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            aria-label={subscription.active ? 'Desactivar' : 'Activar'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {subscription.active
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            </svg>
          </button>
          <button
            onClick={() => onEdit(subscription)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(subscription)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Monthly Cost Widget ───────────────────────────────────────────────────────

function MonthlyCostWidget() {
  const { currency } = useFinanceStore()

  const costQuery = useQuery({
    queryKey: ['finance', 'subscriptions', 'monthly-cost', currency],
    queryFn: () => getSubscriptionMonthlyCost(currency),
  })

  if (costQuery.isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 animate-pulse mb-5">
        <div className="h-4 bg-blue-200 rounded w-48" />
      </div>
    )
  }

  if (!costQuery.data) return null

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 mb-5">
      <p className="text-sm text-blue-700">
        Costo mensual estimado:{' '}
        <span className="font-bold text-blue-900">
          {formatAmount(costQuery.data.totalMonthlyCost, costQuery.data.currency)} {costQuery.data.currency}
        </span>
      </p>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SubscriptionSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
          <div className="h-5 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="flex gap-1">
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function SubscriptionListPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SubscriptionResponse | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionResponse | null>(null)
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)

  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['finance', 'categories'],
    queryFn: () => getCategories(),
  })

  const subscriptionsQuery = useQuery({
    queryKey: ['finance', 'subscriptions', activeFilter],
    queryFn: () => getSubscriptions(activeFilter),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'subscriptions'] })
      setDeleteTarget(null)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'subscriptions'] })
    },
  })

  function openCreate() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  function openEdit(s: SubscriptionResponse) {
    setEditTarget(s)
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
            <h1 className="text-2xl font-bold text-gray-900">Suscripciones</h1>
            <button
              onClick={openCreate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva suscripcion
            </button>
          </div>
          <FinanceSubNav active="subscriptions" />
        </header>

        {/* Monthly Cost Widget */}
        <MonthlyCostWidget />

        {/* Active filter pills */}
        <div className="flex gap-2 items-center mb-4">
          <span className="text-xs font-medium text-gray-500">Mostrar:</span>
          {[
            { label: 'Todas', value: undefined },
            { label: 'Activas', value: true },
            { label: 'Inactivas', value: false },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setActiveFilter(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {subscriptionsQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar las suscripciones.
          </div>
        )}

        {subscriptionsQuery.isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SubscriptionSkeleton key={i} />)}
          </div>
        )}

        {subscriptionsQuery.data && !subscriptionsQuery.isLoading && subscriptionsQuery.data.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="text-sm font-medium">Sin suscripciones</p>
            <p className="text-xs mt-1">Agrega tus servicios de suscripcion para hacer seguimiento</p>
          </div>
        )}

        {subscriptionsQuery.data && !subscriptionsQuery.isLoading && subscriptionsQuery.data.length > 0 && (
          <AnimatePresence initial={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subscriptionsQuery.data.map(s => (
                <SubscriptionCard
                  key={s.id}
                  subscription={s}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onToggle={id => toggleMutation.mutate(id)}
                  isToggling={toggleMutation.isPending}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        <SubscriptionFormModal
          open={formOpen}
          onClose={handleFormClose}
          subscription={editTarget}
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
