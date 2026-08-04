import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { AppLayout } from '../../../components/layout/AppLayout'
import { FinanceSubNav } from '../../../components/finance/FinanceSubNav'
import { useFinanceStore } from '../../../stores/useFinanceStore'
import {
  getMonthlyEvolution,
  getCategoryDistribution,
  getBalanceTrend,
  getPeriodComparison,
} from '../../../api/finance.api'
import { formatAmount } from '../../../utils/finance'
import type { FinanceCurrency } from '../../../types/finance.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const SHORT_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`
}

function previousYearMonth(): string {
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${prev.getFullYear()}-${pad2(prev.getMonth() + 1)}`
}

function periodLabel(period: string): string {
  const [y, m] = period.split('-').map(Number)
  if (!y || !m) return period
  return `${SHORT_MONTHS[m - 1]} ${y}`
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

// ── Year Selector ─────────────────────────────────────────────────────────────

interface YearSelectorProps {
  year: number
  onChange: (year: number) => void
}

function YearSelector({ year, onChange }: YearSelectorProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <select
      value={year}
      onChange={e => onChange(Number(e.target.value))}
      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {years.map(y => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  )
}

// ── Chart Card Wrapper ────────────────────────────────────────────────────────

interface ChartCardProps {
  title: string
  children: React.ReactNode
  toolbar?: React.ReactNode
}

function ChartCard({ title, children, toolbar }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-gray-200 p-5"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {toolbar}
      </div>
      {children}
    </motion.div>
  )
}

function ChartSkeleton() {
  return <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
}

function ChartError({ message }: { message?: string }) {
  return (
    <div className="h-[300px] flex items-center justify-center bg-red-50 border border-red-200 rounded text-sm text-red-700 px-4 text-center">
      {message ?? 'Error al cargar la gráfica.'}
    </div>
  )
}

function ChartEmpty() {
  return (
    <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">
      Sin datos para este periodo
    </div>
  )
}

// ── (a) Monthly Evolution Chart ───────────────────────────────────────────────

interface MonthlyEvolutionChartProps {
  year: number
  currency: FinanceCurrency
}

function MonthlyEvolutionChart({ year, currency }: MonthlyEvolutionChartProps) {
  const query = useQuery({
    queryKey: ['finance', 'charts', 'monthly-evolution', year, currency],
    queryFn: () => getMonthlyEvolution(year, currency),
  })

  const data = useMemo(() => {
    if (!query.data) return []
    return query.data.months.map(m => ({
      month: SHORT_MONTHS[m.month - 1] ?? String(m.month),
      ingresos: parseFloat(m.income),
      gastos: parseFloat(m.expenses),
    }))
  }, [query.data])

  const hasData = data.some(d => d.ingresos > 0 || d.gastos > 0)

  return (
    <ChartCard title="Evolución mensual">
      {query.isLoading && <ChartSkeleton />}
      {query.isError && <ChartError />}
      {query.data && !query.isLoading && !hasData && <ChartEmpty />}
      {query.data && !query.isLoading && hasData && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip
              formatter={(value) => formatAmount(String(value ?? 0), currency)}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ── (b) Category Donut Chart ──────────────────────────────────────────────────

interface CategoryDonutChartProps {
  year: number
  currency: FinanceCurrency
}

function CategoryDonutChart({ year, currency }: CategoryDonutChartProps) {
  const from = `${year}-01-01`
  const to = `${year}-12-31`

  const query = useQuery({
    queryKey: ['finance', 'charts', 'category-distribution', year, currency],
    queryFn: () => getCategoryDistribution(from, to, currency, 'EXPENSE'),
  })

  const data = useMemo(() => {
    if (!query.data) return []
    return query.data
      .map(item => ({
        name: item.category.name,
        total: parseFloat(item.total),
        color: item.category.color,
      }))
      .filter(d => Number.isFinite(d.total) && d.total > 0)
  }, [query.data])

  return (
    <ChartCard title="Distribución de gastos por categoría">
      {query.isLoading && <ChartSkeleton />}
      {query.isError && <ChartError />}
      {query.data && !query.isLoading && data.length === 0 && <ChartEmpty />}
      {query.data && !query.isLoading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatAmount(String(value ?? 0), currency)}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ── (c) Balance Trend Chart ───────────────────────────────────────────────────

interface BalanceTrendChartProps {
  year: number
  currency: FinanceCurrency
}

function BalanceTrendChart({ year, currency }: BalanceTrendChartProps) {
  const query = useQuery({
    queryKey: ['finance', 'charts', 'balance-trend', year, currency],
    queryFn: () => getBalanceTrend(year, currency),
  })

  const data = useMemo(() => {
    if (!query.data) return []
    return query.data.months.map(m => ({
      month: SHORT_MONTHS[m.month - 1] ?? String(m.month),
      balance: parseFloat(m.balance),
    }))
  }, [query.data])

  const hasData = data.some(d => d.balance !== 0)

  return (
    <ChartCard title="Tendencia de saldo">
      {query.isLoading && <ChartSkeleton />}
      {query.isError && <ChartError />}
      {query.data && !query.isLoading && !hasData && <ChartEmpty />}
      {query.data && !query.isLoading && hasData && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip
              formatter={(value) => formatAmount(String(value ?? 0), currency)}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="Balance"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ── (d) Period Comparison Chart ───────────────────────────────────────────────

interface PeriodComparisonChartProps {
  currency: FinanceCurrency
}

function PeriodComparisonChart({ currency }: PeriodComparisonChartProps) {
  const [periodA, setPeriodA] = useState(previousYearMonth())
  const [periodB, setPeriodB] = useState(currentYearMonth())

  const query = useQuery({
    queryKey: ['finance', 'charts', 'period-comparison', periodA, periodB, currency],
    queryFn: () => getPeriodComparison(periodA, periodB, currency),
    enabled: Boolean(periodA && periodB),
  })

  const data = useMemo(() => {
    if (!query.data) return []
    const a = query.data.periodA
    const b = query.data.periodB
    return [
      {
        metric: 'Ingresos',
        periodA: parseFloat(a.totalIncome),
        periodB: parseFloat(b.totalIncome),
      },
      {
        metric: 'Gastos',
        periodA: parseFloat(a.totalExpenses),
        periodB: parseFloat(b.totalExpenses),
      },
      {
        metric: 'Balance',
        periodA: parseFloat(a.balance),
        periodB: parseFloat(b.balance),
      },
    ]
  }, [query.data])

  const hasData = data.some(d => d.periodA !== 0 || d.periodB !== 0)

  const toolbar = (
    <div className="flex items-center gap-2">
      <input
        type="month"
        value={periodA}
        max={periodB}
        onChange={e => setPeriodA(e.target.value)}
        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-xs text-gray-400">vs</span>
      <input
        type="month"
        value={periodB}
        min={periodA}
        onChange={e => setPeriodB(e.target.value)}
        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )

  return (
    <ChartCard title="Comparación entre periodos" toolbar={toolbar}>
      {query.isLoading && <ChartSkeleton />}
      {query.isError && <ChartError />}
      {query.data && !query.isLoading && !hasData && <ChartEmpty />}
      {query.data && !query.isLoading && hasData && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip
              formatter={(value) => formatAmount(String(value ?? 0), currency)}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="periodA" name={periodLabel(periodA)} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="periodB" name={periodLabel(periodB)} fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function FinanceChartsPage() {
  const { currency } = useFinanceStore()
  const [year, setYear] = useState(new Date().getFullYear())

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Gráficas</h1>
            <div className="flex items-center gap-3">
              <YearSelector year={year} onChange={setYear} />
              <CurrencyToggle />
            </div>
          </div>
          <FinanceSubNav active="charts" />
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MonthlyEvolutionChart year={year} currency={currency} />
          <CategoryDonutChart year={year} currency={currency} />
          <BalanceTrendChart year={year} currency={currency} />
          <PeriodComparisonChart currency={currency} />
        </div>
      </div>
    </AppLayout>
  )
}
