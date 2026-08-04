import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import { HabitsSubNav } from '../../../components/habits/HabitsSubNav'
import {
  getSleepLogs,
  logSleep,
} from '../../../api/habits.api'
import type { SleepLogResponse, SleepSource } from '../../../types/habit.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('es', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('es', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

function yesterdayIso(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function localInputToIso(local: string): string {
  // local "YYYY-MM-DDTHH:mm" -> ISO with timezone
  return new Date(local).toISOString()
}

// ── Source Badge ──────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: SleepSource }) {
  const styles: Record<SleepSource, string> = {
    MANUAL: 'bg-blue-100 text-blue-700',
    SAMSUNG_HEALTH: 'bg-emerald-100 text-emerald-700',
  }
  const labels: Record<SleepSource, string> = {
    MANUAL: 'Manual',
    SAMSUNG_HEALTH: 'Samsung Health',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[source]}`}>
      {labels[source]}
    </span>
  )
}

// ── Log Sleep Modal ───────────────────────────────────────────────────────────

interface LogSleepModalProps {
  open: boolean
  onClose: () => void
}

function LogSleepModal({ open, onClose }: LogSleepModalProps) {
  const queryClient = useQueryClient()

  const defaults = useMemo(() => {
    const yesterday = yesterdayIso()
    return {
      date: yesterday,
      sleepStart: `${yesterday}T23:00`,
      sleepEnd: `${todayIso()}T07:00`,
    }
  }, [])

  const [date, setDate] = useState(defaults.date)
  const [sleepStart, setSleepStart] = useState(defaults.sleepStart)
  const [sleepEnd, setSleepEnd] = useState(defaults.sleepEnd)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDate(defaults.date)
      setSleepStart(defaults.sleepStart)
      setSleepEnd(defaults.sleepEnd)
      setErrorMessage(null)
    }
  }, [open, defaults])

  const logMutation = useMutation({
    mutationFn: () => logSleep({
      date,
      sleepStart: localInputToIso(sleepStart),
      sleepEnd: localInputToIso(sleepEnd),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep-logs'] })
      onClose()
    },
    onError: () => {
      setErrorMessage('Error al registrar el sueño.')
    },
  })

  const isValid = useMemo(() => {
    if (!sleepStart || !sleepEnd) return false
    return new Date(sleepEnd) > new Date(sleepStart)
  }, [sleepStart, sleepEnd])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    logMutation.mutate()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40" onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrar sueño</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha (de la noche)
                  </label>
                  <input
                    type="date"
                    required
                    max={todayIso()}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inicio del sueño <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sleepStart}
                    onChange={e => setSleepStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fin del sueño <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sleepEnd}
                    onChange={e => setSleepEnd(e.target.value)}
                  />
                </div>
                {!isValid && sleepStart && sleepEnd && (
                  <p className="text-xs text-red-500">El fin debe ser después del inicio.</p>
                )}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={logMutation.isPending || !isValid}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {logMutation.isPending ? 'Guardando...' : 'Registrar'}
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

// ── Last Sleep Card ───────────────────────────────────────────────────────────

function LastSleepCard({ log }: { log: SleepLogResponse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-medium text-indigo-600 mb-1">Último registro</p>
          <p className="text-sm text-gray-700">{formatDate(log.date)}</p>
        </div>
        <SourceBadge source={log.source} />
      </div>
      <div className="flex items-end gap-3">
        <p className="text-3xl font-bold text-indigo-700">{formatDuration(log.durationMinutes)}</p>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span>🌙</span>
          <span>{formatDateTime(log.sleepStart)}</span>
        </div>
        <span className="text-gray-400">→</span>
        <div className="flex items-center gap-1">
          <span>☀️</span>
          <span>{formatDateTime(log.sleepEnd)}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function SleepPage() {
  const [open, setOpen] = useState(false)

  const { from, to } = useMemo(() => {
    const now = new Date()
    const fromDate = new Date()
    fromDate.setDate(now.getDate() - 30)
    return {
      from: fromDate.toISOString().slice(0, 10),
      to: now.toISOString().slice(0, 10),
    }
  }, [])

  const logsQuery = useQuery({
    queryKey: ['sleep-logs', from, to],
    queryFn: () => getSleepLogs(from, to),
  })

  const sortedLogs = useMemo(() => {
    if (!logsQuery.data) return []
    return [...logsQuery.data].sort((a, b) => b.date.localeCompare(a.date))
  }, [logsQuery.data])

  const lastLog = sortedLogs[0]

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Sueño</h1>
            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Registrar sueño
            </button>
          </div>
          <HabitsSubNav active="sleep" />
        </header>

        {logsQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar los registros de sueño.
          </div>
        )}

        {logsQuery.isLoading && (
          <div className="space-y-3">
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {logsQuery.data && (
          <>
            {/* Last log card */}
            {lastLog ? (
              <div className="mb-6">
                <LastSleepCard log={lastLog} />
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">Aún no hay registros de sueño</p>
                <p className="text-xs mt-1">Registra tu primera noche de sueño</p>
              </div>
            )}

            {/* History */}
            {sortedLogs.length > 1 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Historial (30 días)</h2>
                <AnimatePresence initial={false}>
                  <div className="space-y-2">
                    {sortedLogs.slice(1).map(log => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span>🌙</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{formatDate(log.date)}</p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(log.sleepStart)} → {formatDateTime(log.sleepEnd)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-indigo-700 flex-shrink-0">
                          {formatDuration(log.durationMinutes)}
                        </p>
                        <SourceBadge source={log.source} />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </section>
            )}
          </>
        )}

        <LogSleepModal open={open} onClose={() => setOpen(false)} />
      </div>
    </AppLayout>
  )
}
