import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../../api/habits.api'
import type { NotificationResponse } from '../../../types/habit.types'

type FilterMode = 'all' | 'unread'

interface Group {
  label: string
  items: NotificationResponse[]
}

function buildGroups(notifications: NotificationResponse[]): Group[] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
  const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000

  const today: NotificationResponse[] = []
  const yesterday: NotificationResponse[] = []
  const week: NotificationResponse[] = []
  const older: NotificationResponse[] = []

  for (const n of notifications) {
    const t = new Date(n.createdAt).getTime()
    if (t >= startOfToday) today.push(n)
    else if (t >= startOfYesterday) yesterday.push(n)
    else if (t >= startOfWeek) week.push(n)
    else older.push(n)
  }

  const groups: Group[] = []
  if (today.length) groups.push({ label: 'Hoy', items: today })
  if (yesterday.length) groups.push({ label: 'Ayer', items: yesterday })
  if (week.length) groups.push({ label: 'Esta semana', items: week })
  if (older.length) groups.push({ label: 'Anteriores', items: older })
  return groups
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('es', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  })
}

// ── Notification Row ──────────────────────────────────────────────────────────

interface NotificationRowProps {
  notification: NotificationResponse
  onMarkRead: (id: string) => void
}

function NotificationRow({ notification, onMarkRead }: NotificationRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${
        notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
          notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(notification.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
        {notification.type && (
          <span className="inline-block text-xs text-gray-400 mt-1.5 font-mono">{notification.type}</span>
        )}
      </div>
      {!notification.isRead && (
        <button
          type="button"
          onClick={() => onMarkRead(notification.id)}
          className="text-xs text-blue-600 font-medium hover:underline flex-shrink-0"
        >
          Marcar leída
        </button>
      )}
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-start gap-3 animate-pulse">
      <div className="w-2 h-2 rounded-full bg-gray-200 mt-1.5" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1.5" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<FilterMode>('all')

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: getNotifications,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const filtered = useMemo(() => {
    const data = notificationsQuery.data ?? []
    if (filter === 'unread') return data.filter(n => !n.isRead)
    return data
  }, [notificationsQuery.data, filter])

  const groups = useMemo(() => buildGroups(filtered), [filtered])

  const hasUnread = (notificationsQuery.data ?? []).some(n => !n.isRead)

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
            <button
              onClick={() => markAllMutation.mutate()}
              disabled={!hasUnread || markAllMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Marcar todas como leídas
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              No leídas
            </button>
          </div>
        </header>

        {notificationsQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar las notificaciones.
          </div>
        )}

        {notificationsQuery.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        )}

        {notificationsQuery.data && (
          groups.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">{filter === 'unread' ? 'Sin notificaciones no leídas' : 'Sin notificaciones'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map(group => (
                <section key={group.label}>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {group.label}
                  </h2>
                  <AnimatePresence initial={false}>
                    <div className="space-y-2">
                      {group.items.map(n => (
                        <NotificationRow
                          key={n.id}
                          notification={n}
                          onMarkRead={id => markReadMutation.mutate(id)}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                </section>
              ))}
            </div>
          )
        )}
      </div>
    </AppLayout>
  )
}
