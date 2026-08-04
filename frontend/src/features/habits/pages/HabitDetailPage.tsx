import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import {
  getHabit,
  getHabitStats,
  getHabitHeatmap,
  getHabitLogs,
} from '../../../api/habits.api'

type Period = 7 | 30 | 90

// ── Stats Card ────────────────────────────────────────────────────────────────

interface StatsCardProps {
  habitId: string
  period: Period
  active: boolean
  onClick: () => void
}

function StatsCard({ habitId, period, active, onClick }: StatsCardProps) {
  const statsQuery = useQuery({
    queryKey: ['habits', habitId, 'stats', period],
    queryFn: () => getHabitStats(habitId, period),
  })

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border p-4 transition-all ${
        active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <p className="text-xs font-medium text-gray-500 mb-1">Últimos {period} días</p>
      {statsQuery.isLoading ? (
        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
      ) : statsQuery.data ? (
        <>
          <p className="text-2xl font-bold text-gray-900">{statsQuery.data.completionRate.toFixed(0)}%</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {statsQuery.data.totalCompleted} / {statsQuery.data.totalScheduled} completados
          </p>
        </>
      ) : (
        <p className="text-xs text-red-500">Error</p>
      )}
    </button>
  )
}

// ── Recent Logs ───────────────────────────────────────────────────────────────

function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('es', { weekday: 'short', day: '2-digit', month: 'short' })
}

function RecentLogs({ habitId }: { habitId: string }) {
  const today = new Date().toISOString().slice(0, 10)
  const sevenDaysAgo = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().slice(0, 10)
  }, [])

  const logsQuery = useQuery({
    queryKey: ['habits', habitId, 'logs', sevenDaysAgo, today],
    queryFn: () => getHabitLogs(habitId, sevenDaysAgo, today),
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Historial reciente</h2>
      {logsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : logsQuery.isError ? (
        <p className="text-sm text-red-600">Error al cargar el historial.</p>
      ) : logsQuery.data && logsQuery.data.length === 0 ? (
        <p className="text-sm text-gray-400">Sin registros recientes.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {logsQuery.data?.slice(0, 7).map(log => (
            <li key={log.id} className="flex items-center gap-3 py-2">
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  log.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <span className="text-sm text-gray-800 flex-1">{formatDateLabel(log.date)}</span>
              <span className={`text-xs font-medium ${log.completed ? 'text-green-600' : 'text-gray-400'}`}>
                {log.completed ? 'Completado' : 'No completado'}
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">{log.source}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Heatmap Section ───────────────────────────────────────────────────────────

function HeatmapSection({ habitId }: { habitId: string }) {
  const heatmapQuery = useQuery({
    queryKey: ['habits', habitId, 'heatmap'],
    queryFn: () => getHabitHeatmap(habitId),
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Mapa de actividad</h2>
      {heatmapQuery.isLoading && (
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
      )}
      {heatmapQuery.isError && (
        <p className="text-sm text-red-600">Error al cargar el heatmap.</p>
      )}
      {heatmapQuery.data && (
        <>
          {/*
            Heatmap styles override.
            react-calendar-heatmap uses CSS classes returned by classForValue()
            on the per-day <rect>. Defaults colors come from styles.css and are
            overridden here via inline <style> for simplicity.
            To customize, edit the classes "color-empty" and "color-filled".
          */}
          <style>{`
            .react-calendar-heatmap text { font-size: 6px; fill: #9ca3af; }
            .react-calendar-heatmap .color-empty { fill: #e5e7eb; }
            .react-calendar-heatmap .color-filled { fill: #22c55e; }
            .react-calendar-heatmap rect:hover { stroke: #1f2937; stroke-width: 1px; }
          `}</style>
          <CalendarHeatmap
            startDate={new Date(heatmapQuery.data.from)}
            endDate={new Date(heatmapQuery.data.to)}
            values={heatmapQuery.data.entries.map(e => ({
              date: e.date,
              count: e.completed ? 1 : 0,
            }))}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'color-empty'
              return 'color-filled'
            }}
            titleForValue={(value) => {
              if (!value) return ''
              const v = value as { date: string; count: number }
              return `${v.date}: ${v.count ? '✓' : '✗'}`
            }}
          />
          <div className="flex items-center justify-end gap-2 mt-2 text-xs text-gray-500">
            <span>Menos</span>
            <span className="w-3 h-3 inline-block rounded-sm bg-gray-200" />
            <span className="w-3 h-3 inline-block rounded-sm bg-green-500" />
            <span>Más</span>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const habitId = id ?? ''
  const [period, setPeriod] = useState<Period>(30)

  const habitQuery = useQuery({
    queryKey: ['habits', habitId],
    queryFn: () => getHabit(habitId),
    enabled: Boolean(habitId),
  })

  if (!habitId) {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-sm text-red-600">Hábito inválido.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-4">
        {/* Header */}
        <header className="bg-white rounded-xl border border-gray-200 p-5">
          {habitQuery.isLoading && (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          )}
          {habitQuery.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              Error al cargar el hábito.
            </div>
          )}
          {habitQuery.data && (
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${habitQuery.data.color}22` }}
                >
                  {habitQuery.data.icon ? (
                    <span>{habitQuery.data.icon}</span>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke={habitQuery.data.color} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{habitQuery.data.name}</h1>
                  {habitQuery.data.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{habitQuery.data.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium"
                    >
                      <span>🔥</span>
                      <span>{habitQuery.data.currentStreak} día{habitQuery.data.currentStreak === 1 ? '' : 's'}</span>
                    </motion.span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                      <span>🏆</span>
                      <span>Máx: {habitQuery.data.maxStreak}</span>
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: `${habitQuery.data.category.color}22`,
                        color: habitQuery.data.category.color,
                      }}
                    >
                      {habitQuery.data.category.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/habits/list"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Volver
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([7, 30, 90] as Period[]).map(p => (
            <StatsCard
              key={p}
              habitId={habitId}
              period={p}
              active={period === p}
              onClick={() => setPeriod(p)}
            />
          ))}
        </section>

        {/* Heatmap */}
        <HeatmapSection habitId={habitId} />

        {/* Recent logs */}
        <RecentLogs habitId={habitId} />
      </div>
    </AppLayout>
  )
}
