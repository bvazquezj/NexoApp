import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../api/habits.api'
import type { NotificationResponse } from '../../types/habit.types'

function relativeTime(iso: string): string {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} d`
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' })
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: getUnreadNotifications,
    refetchInterval: 30_000,
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

  const unreadCount = unreadQuery.data?.length ?? 0

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        aria-label="Notificaciones"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-40 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllMutation.mutate()}
                    disabled={markAllMutation.isPending}
                    className="text-xs text-blue-600 font-medium hover:underline disabled:opacity-50"
                  >
                    Marcar todas
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {unreadQuery.isLoading && (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">Cargando...</div>
                )}
                {unreadQuery.data && unreadQuery.data.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    Sin notificaciones nuevas
                  </div>
                )}
                {unreadQuery.data?.slice(0, 10).map((n: NotificationResponse) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markReadMutation.mutate(n.id)}
                    className="w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{relativeTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="block text-center text-xs font-medium text-blue-600 hover:underline"
                >
                  Ver todas
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
