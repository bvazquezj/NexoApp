import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import { HabitsSubNav } from '../../../components/habits/HabitsSubNav'
import { useHabitStore } from '../../../stores/useHabitStore'
import {
  getHabitsForToday,
  getRoutines,
  getDailyExecution,
  logHabit,
  logBlockExecution,
} from '../../../api/habits.api'
import type {
  HabitSummaryResponse,
  RoutineDayResponse,
  DailyRoutineViewResponse,
  RoutineExecutionLogResponse,
} from '../../../types/habit.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatHm(time: string): string {
  // "HH:mm:ss" -> "HH:mm"
  return time.slice(0, 5)
}

const BLOCK_TYPE_LABEL: Record<string, string> = {
  HABIT: 'Hábito',
  PRODUCTIVE: 'Productivo',
  SLEEP: 'Sueño',
  BREAK: 'Descanso',
  FREE: 'Libre',
}

const BLOCK_TYPE_COLOR: Record<string, string> = {
  HABIT: 'bg-purple-100 text-purple-700',
  PRODUCTIVE: 'bg-blue-100 text-blue-700',
  SLEEP: 'bg-indigo-100 text-indigo-700',
  BREAK: 'bg-amber-100 text-amber-700',
  FREE: 'bg-gray-100 text-gray-700',
}

// ── Habit Today Card ──────────────────────────────────────────────────────────

interface HabitTodayCardProps {
  habit: HabitSummaryResponse
  date: string
  isCompleted: boolean
  onToggle: (habitId: string, currentlyCompleted: boolean) => void
  isPending: boolean
}

function HabitTodayCard({ habit, isCompleted, onToggle, isPending }: HabitTodayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 relative overflow-hidden"
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: habit.color }}
      />
      <div className="ml-1 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
        style={{ backgroundColor: `${habit.color}22` }}
      >
        {habit.icon ? (
          <span>{habit.icon}</span>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke={habit.color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{habit.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <span>🔥</span>
            <span className="font-medium">{habit.currentStreak}</span>
            <span>día{habit.currentStreak === 1 ? '' : 's'}</span>
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${habit.category.color}22`, color: habit.category.color }}
          >
            {habit.category.name}
          </span>
        </div>
      </div>
      <button
        onClick={() => onToggle(habit.id, isCompleted)}
        disabled={isPending}
        aria-label={isCompleted ? 'Desmarcar' : 'Marcar como completado'}
        className={`flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
          isCompleted
            ? 'bg-green-500 border-green-500 text-white'
            : 'bg-white border-gray-300 hover:border-green-400'
        } disabled:opacity-50`}
      >
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.svg
              key="check"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </motion.svg>
          ) : null}
        </AnimatePresence>
      </button>
    </motion.div>
  )
}

// ── Block Item ────────────────────────────────────────────────────────────────

interface BlockItemProps {
  item: DailyRoutineViewResponse['items'][number]
  onToggle: () => void
  isPending: boolean
}

function BlockItem({ item, onToggle, isPending }: BlockItemProps) {
  const completed = Boolean(item.execution?.completed)
  const color = item.block.color ?? '#6366f1'

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 relative overflow-hidden"
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: color }}
      />
      <div className="ml-1 flex flex-col items-center text-xs text-gray-500 w-14 flex-shrink-0">
        <span className="font-mono font-medium text-gray-700">{formatHm(item.block.startTime)}</span>
        <span className="text-gray-400">{formatHm(item.block.endTime)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.block.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${BLOCK_TYPE_COLOR[item.block.type] ?? 'bg-gray-100 text-gray-700'}`}>
            {BLOCK_TYPE_LABEL[item.block.type] ?? item.block.type}
          </span>
          {item.block.habitName && (
            <span className="text-xs text-gray-500 truncate">{item.block.habitName}</span>
          )}
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={isPending}
        aria-label={completed ? 'Desmarcar bloque' : 'Marcar bloque'}
        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
          completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'bg-white border-gray-300 hover:border-green-400'
        } disabled:opacity-50`}
      >
        {completed && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    </motion.div>
  )
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1.5" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="w-9 h-9 rounded-full bg-gray-200" />
    </div>
  )
}

// ── Habits Today Section ──────────────────────────────────────────────────────

interface HabitsTodaySectionProps {
  date: string
}

function HabitsTodaySection({ date }: HabitsTodaySectionProps) {
  const queryClient = useQueryClient()
  const queryKey = ['habits', 'today']

  const habitsQuery = useQuery({
    queryKey,
    queryFn: getHabitsForToday,
  })

  // Track local optimistic completion state per habit, keyed by id
  const completedQuery = useQuery({
    queryKey: ['habits', 'today', 'completion', date],
    queryFn: () => Promise.resolve<Record<string, boolean>>({}),
    staleTime: Infinity,
    gcTime: Infinity,
  })
  const completedMap = completedQuery.data ?? {}

  const logMutation = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: string; completed: boolean }) =>
      logHabit(habitId, { date, completed }),
    onMutate: async ({ habitId, completed }) => {
      queryClient.setQueryData<Record<string, boolean>>(
        ['habits', 'today', 'completion', date],
        prev => ({ ...(prev ?? {}), [habitId]: completed }),
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', 'today'] })
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })

  function handleToggle(habitId: string, currentlyCompleted: boolean) {
    logMutation.mutate({ habitId, completed: !currentlyCompleted })
  }

  return (
    <section className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Hábitos del día</h2>
      {habitsQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Error al cargar los hábitos.
        </div>
      )}
      {habitsQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}
      {habitsQuery.data && !habitsQuery.isLoading && (
        habitsQuery.data.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No hay hábitos para hoy.</p>
        ) : (
          <AnimatePresence initial={false}>
            <div className="space-y-2">
              {habitsQuery.data.map(h => (
                <HabitTodayCard
                  key={h.id}
                  habit={h}
                  date={date}
                  isCompleted={Boolean(completedMap[h.id])}
                  onToggle={handleToggle}
                  isPending={logMutation.isPending && logMutation.variables?.habitId === h.id}
                />
              ))}
            </div>
          </AnimatePresence>
        )
      )}
    </section>
  )
}

// ── Routine Today Section ─────────────────────────────────────────────────────

interface RoutineTodaySectionProps {
  date: string
}

function RoutineTodaySection({ date }: RoutineTodaySectionProps) {
  const queryClient = useQueryClient()
  const dayOfWeek = useMemo(() => {
    const d = new Date(`${date}T00:00:00`)
    return d.getDay()
  }, [date])

  const routinesQuery = useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines,
  })

  const todaysRoutine: RoutineDayResponse | undefined = useMemo(() => {
    if (!routinesQuery.data) return undefined
    return routinesQuery.data.find(r => r.dayOfWeek === dayOfWeek && r.isActive)
  }, [routinesQuery.data, dayOfWeek])

  const executionQuery = useQuery({
    queryKey: ['routines', todaysRoutine?.id ?? 'none', 'execution', date],
    queryFn: () => getDailyExecution(todaysRoutine!.id, date),
    enabled: Boolean(todaysRoutine?.id),
  })

  const logMutation = useMutation({
    mutationFn: ({ blockId, completed }: { blockId: string; completed: boolean }) =>
      logBlockExecution(todaysRoutine!.id, blockId, { date, completed }),
    onSuccess: () => {
      if (todaysRoutine) {
        queryClient.invalidateQueries({
          queryKey: ['routines', todaysRoutine.id, 'execution', date],
        })
      }
    },
  })

  function handleToggle(blockId: string, exec: RoutineExecutionLogResponse | null) {
    const completed = !(exec?.completed ?? false)
    logMutation.mutate({ blockId, completed })
  }

  return (
    <section className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Rutina del día</h2>

      {routinesQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Error al cargar las rutinas.
        </div>
      )}

      {routinesQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {routinesQuery.data && !todaysRoutine && (
        <p className="text-sm text-gray-400 text-center py-8">
          No hay rutina activa para hoy.
        </p>
      )}

      {todaysRoutine && executionQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {todaysRoutine && executionQuery.data && (
        executionQuery.data.items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sin bloques en esta rutina.</p>
        ) : (
          <div className="space-y-2">
            {executionQuery.data.items.map(item => (
              <BlockItem
                key={item.block.id}
                item={item}
                onToggle={() => handleToggle(item.block.id, item.execution)}
                isPending={
                  logMutation.isPending && logMutation.variables?.blockId === item.block.id
                }
              />
            ))}
          </div>
        )
      )}
    </section>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function HabitTodayPage() {
  const { selectedDate, setSelectedDate } = useHabitStore()

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Hoy</h1>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500" htmlFor="habit-date">Fecha:</label>
              <input
                id="habit-date"
                type="date"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          <HabitsSubNav active="today" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HabitsTodaySection date={selectedDate} />
          <RoutineTodaySection date={selectedDate} />
        </div>
      </div>
    </AppLayout>
  )
}
