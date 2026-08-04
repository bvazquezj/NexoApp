import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AppLayout } from '../../../components/layout/AppLayout'
import { FinanceSubNav } from '../../../components/finance/FinanceSubNav'
import { useFinanceStore } from '../../../stores/useFinanceStore'
import {
  getBalanceSummary,
  getCategoryBreakdown,
  getBudgetProgress,
  getSubscriptionMonthlyCost,
} from '../../../api/finance.api'
import { MONTHS, formatAmount } from '../../../utils/finance'
import type { FinanceCurrency, BudgetProgressResponse } from '../../../types/finance.types'

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

// ── Currency Toggle ───────────────────────────────────────────────────────────

function CurrencyToggle() {
  const { currency, setCurrency } = useFinanceStore()

  return (
    <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
      {(['MXN', 'USD'] as FinanceCurrency[]).map(c => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            currency === c
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

// ── Balance Cards Skeleton ────────────────────────────────────────────────────

function BalanceCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-7 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}

// ── Balance Cards ─────────────────────────────────────────────────────────────

interface BalanceCardsProps {
  totalIncome: string
  totalExpenses: string
  balance: string
  currency: FinanceCurrency
  transactionCount: number
}

function BalanceCards({ totalIncome, totalExpenses, balance, currency, transactionCount }: BalanceCardsProps) {
  const balanceNum = parseFloat(balance)

  const cards = [
    {
      label: 'Ingresos',
      value: formatAmount(totalIncome, currency),
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
    },
    {
      label: 'Gastos',
      value: formatAmount(totalExpenses, currency),
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
    {
      label: 'Balance',
      value: formatAmount(balance, currency),
      color: balanceNum >= 0 ? 'text-blue-600' : 'text-red-600',
      bg: balanceNum >= 0 ? 'bg-blue-50' : 'bg-red-50',
      border: balanceNum >= 0 ? 'border-blue-100' : 'border-red-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          className={`rounded-xl border p-5 ${card.bg} ${card.border}`}
        >
          <p className="text-xs font-medium text-gray-500 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          {card.label === 'Balance' && (
            <p className="text-xs text-gray-400 mt-1">{transactionCount} transacciones</p>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// ── Category Breakdown Skeleton ───────────────────────────────────────────────

function CategoryBreakdownSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Category Breakdown ────────────────────────────────────────────────────────

interface CategoryBreakdownProps {
  items: Array<{ category: { name: string; color: string }; total: string; transactionCount: number }>
  currency: FinanceCurrency
}

function CategoryBreakdown({ items, currency }: CategoryBreakdownProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Gastos por categoria</h2>
        <p className="text-sm text-gray-400 text-center py-8">Sin datos para este periodo</p>
      </div>
    )
  }

  const maxTotal = Math.max(...items.map(item => parseFloat(item.total)))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Gastos por categoria</h2>
      <div className="space-y-4">
        {items.map((item, i) => {
          const pct = maxTotal > 0 ? (parseFloat(item.total) / maxTotal) * 100 : 0
          return (
            <motion.div
              key={item.category.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, delay: i * 0.04 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.category.color }}
                  />
                  <span className="text-sm text-gray-700">{item.category.name}</span>
                  <span className="text-xs text-gray-400">({item.transactionCount})</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatAmount(item.total, currency)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Budget Alert Banner ───────────────────────────────────────────────────────

interface BudgetAlertBannerProps {
  budgets: BudgetProgressResponse[]
  currency: FinanceCurrency
}

function BudgetAlertBanner({ budgets, currency }: BudgetAlertBannerProps) {
  const alerted = budgets.filter(b => b.alertLevel === 'WARNING' || b.alertLevel === 'EXCEEDED')
  if (alerted.length === 0) return null

  const exceeded = alerted.filter(b => b.alertLevel === 'EXCEEDED')
  const warning = alerted.filter(b => b.alertLevel === 'WARNING')

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 mb-6 ${
        exceeded.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className={`w-5 h-5 ${exceeded.length > 0 ? 'text-red-600' : 'text-amber-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className={`text-sm font-semibold ${exceeded.length > 0 ? 'text-red-700' : 'text-amber-700'}`}>
              {exceeded.length > 0
                ? `${exceeded.length} presupuesto${exceeded.length > 1 ? 's' : ''} excedido${exceeded.length > 1 ? 's' : ''}`
                : `${warning.length} presupuesto${warning.length > 1 ? 's' : ''} en alerta`}
            </h3>
          </div>
          <ul className="space-y-1 text-sm">
            {alerted.slice(0, 4).map(b => (
              <li
                key={b.budget.id}
                className={`flex items-center justify-between gap-2 ${
                  b.alertLevel === 'EXCEEDED' ? 'text-red-700' : 'text-amber-700'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: b.budget.category.color }}
                  />
                  <span className="truncate">{b.budget.category.name}</span>
                </span>
                <span className="font-medium flex-shrink-0">
                  {formatAmount(b.spent, currency)} / {formatAmount(b.budget.limitAmount, currency)} ({b.progressPercent.toFixed(0)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/finance/budgets"
          className={`text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors ${
            exceeded.length > 0
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          Ver presupuestos
        </Link>
      </div>
    </motion.div>
  )
}

// ── Subscription Cost Widget ──────────────────────────────────────────────────

interface SubscriptionCostWidgetProps {
  totalMonthlyCost: string
  count: number
  currency: FinanceCurrency
}

function SubscriptionCostWidget({ totalMonthlyCost, count, currency }: SubscriptionCostWidgetProps) {
  return (
    <Link
      to="/finance/subscriptions"
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Suscripciones activas</p>
          <p className="text-xl font-bold text-gray-900">{formatAmount(totalMonthlyCost, currency)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{count} suscripcion{count !== 1 ? 'es' : ''} · costo mensual</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
      </div>
    </Link>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function FinanceSummaryPage() {
  const { activeMonth, activeYear, currency } = useFinanceStore()

  const balanceQuery = useQuery({
    queryKey: ['finance', 'summary', 'balance', activeMonth, activeYear, currency],
    queryFn: () => getBalanceSummary(activeMonth, activeYear, currency),
  })

  const categoriesQuery = useQuery({
    queryKey: ['finance', 'summary', 'categories', activeMonth, activeYear, currency],
    queryFn: () => getCategoryBreakdown(activeMonth, activeYear, currency, 'EXPENSE'),
  })

  const budgetsQuery = useQuery({
    queryKey: ['finance', 'budgets', 'progress', activeMonth, activeYear],
    queryFn: () => getBudgetProgress(activeMonth, activeYear),
  })

  const subscriptionCostQuery = useQuery({
    queryKey: ['finance', 'subscriptions', 'monthly-cost', currency],
    queryFn: () => getSubscriptionMonthlyCost(currency),
  })

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
            <div className="flex items-center gap-3">
              <MonthNavigator />
              <CurrencyToggle />
            </div>
          </div>
          <FinanceSubNav active="summary" />
        </header>

        {/* Balance error */}
        {balanceQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar el resumen. Intenta recargar la pagina.
          </div>
        )}

        {/* Budget alerts */}
        {budgetsQuery.data && (
          <BudgetAlertBanner budgets={budgetsQuery.data} currency={currency} />
        )}

        {/* Balance Cards */}
        {balanceQuery.isLoading && <BalanceCardsSkeleton />}
        {balanceQuery.data && !balanceQuery.isLoading && (
          <BalanceCards
            totalIncome={balanceQuery.data.totalIncome}
            totalExpenses={balanceQuery.data.totalExpenses}
            balance={balanceQuery.data.balance}
            currency={balanceQuery.data.currency}
            transactionCount={balanceQuery.data.transactionCount}
          />
        )}

        {/* Two-column: subscriptions widget + category breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            {subscriptionCostQuery.data && (
              <SubscriptionCostWidget
                totalMonthlyCost={subscriptionCostQuery.data.totalMonthlyCost}
                count={subscriptionCostQuery.data.breakdown.length}
                currency={currency}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            {categoriesQuery.isLoading && <CategoryBreakdownSkeleton />}
            {categoriesQuery.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                Error al cargar el desglose por categorias.
              </div>
            )}
            {categoriesQuery.data && !categoriesQuery.isLoading && (
              <CategoryBreakdown items={categoriesQuery.data} currency={currency} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
