import client from './client'
import type {
  HabitResponse,
  HabitSummaryResponse,
  HabitCategoryResponse,
  HabitLogResponse,
  HabitStatsResponse,
  HabitHeatmapResponse,
  RoutineDayResponse,
  RoutineBlockResponse,
  RoutineExecutionLogResponse,
  RoutineTemplateResponse,
  DailyRoutineViewResponse,
  BlockTaskLinkResponse,
  SleepLogResponse,
  NotificationResponse,
  CreateHabitRequest,
  UpdateHabitRequest,
  CreateHabitCategoryRequest,
  UpdateHabitCategoryRequest,
  LogHabitRequest,
  CreateRoutineDayRequest,
  UpdateRoutineDayRequest,
  CopyRoutineRequest,
  CreateRoutineBlockRequest,
  UpdateRoutineBlockRequest,
  ReorderBlocksRequest,
  LogExecutionRequest,
  CreateTemplateFromRoutineRequest,
  ApplyTemplateRequest,
  LinkTaskToBlockRequest,
  LogSleepRequest,
} from '../types/habit.types'

// ── Habits ────────────────────────────────────────────────────────────────────

export function getHabits(): Promise<HabitSummaryResponse[]> {
  return client.get<HabitSummaryResponse[]>('/habits').then(r => r.data)
}

export function getHabitsForToday(): Promise<HabitSummaryResponse[]> {
  return client.get<HabitSummaryResponse[]>('/habits/today').then(r => r.data)
}

export function getHabit(id: string): Promise<HabitResponse> {
  return client.get<HabitResponse>(`/habits/${id}`).then(r => r.data)
}

export function createHabit(data: CreateHabitRequest): Promise<HabitResponse> {
  return client.post<HabitResponse>('/habits', data).then(r => r.data)
}

export function updateHabit(id: string, data: UpdateHabitRequest): Promise<HabitResponse> {
  return client.put<HabitResponse>(`/habits/${id}`, data).then(r => r.data)
}

export function setHabitActive(id: string, active: boolean): Promise<HabitResponse> {
  return client.patch<HabitResponse>(`/habits/${id}/active`, { active }).then(r => r.data)
}

export function deleteHabit(id: string): Promise<void> {
  return client.delete(`/habits/${id}`).then(() => undefined)
}

// ── Categories ────────────────────────────────────────────────────────────────

export function getHabitCategories(): Promise<HabitCategoryResponse[]> {
  return client.get<HabitCategoryResponse[]>('/habits/categories').then(r => r.data)
}

export function createHabitCategory(data: CreateHabitCategoryRequest): Promise<HabitCategoryResponse> {
  return client.post<HabitCategoryResponse>('/habits/categories', data).then(r => r.data)
}

export function updateHabitCategory(id: string, data: UpdateHabitCategoryRequest): Promise<HabitCategoryResponse> {
  return client.put<HabitCategoryResponse>(`/habits/categories/${id}`, data).then(r => r.data)
}

export function deleteHabitCategory(id: string): Promise<void> {
  return client.delete(`/habits/categories/${id}`).then(() => undefined)
}

// ── Habit Logs ────────────────────────────────────────────────────────────────

export function logHabit(habitId: string, data: LogHabitRequest): Promise<HabitLogResponse> {
  return client.post<HabitLogResponse>(`/habits/${habitId}/logs`, data).then(r => r.data)
}

export function getHabitLogs(habitId: string, from: string, to: string): Promise<HabitLogResponse[]> {
  const params = new URLSearchParams({ from, to })
  return client.get<HabitLogResponse[]>(`/habits/${habitId}/logs?${params}`).then(r => r.data)
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function getHabitStats(habitId: string, period = 30): Promise<HabitStatsResponse> {
  return client.get<HabitStatsResponse>(`/habits/${habitId}/stats?period=${period}`).then(r => r.data)
}

export function getHabitHeatmap(habitId: string): Promise<HabitHeatmapResponse> {
  return client.get<HabitHeatmapResponse>(`/habits/${habitId}/heatmap`).then(r => r.data)
}

// ── Routines ──────────────────────────────────────────────────────────────────

export function getRoutines(): Promise<RoutineDayResponse[]> {
  return client.get<RoutineDayResponse[]>('/routines').then(r => r.data)
}

export function getRoutine(id: string): Promise<RoutineDayResponse> {
  return client.get<RoutineDayResponse>(`/routines/${id}`).then(r => r.data)
}

export function createRoutine(data: CreateRoutineDayRequest): Promise<RoutineDayResponse> {
  return client.post<RoutineDayResponse>('/routines', data).then(r => r.data)
}

export function updateRoutine(id: string, data: UpdateRoutineDayRequest): Promise<RoutineDayResponse> {
  return client.put<RoutineDayResponse>(`/routines/${id}`, data).then(r => r.data)
}

export function deleteRoutine(id: string): Promise<void> {
  return client.delete(`/routines/${id}`).then(() => undefined)
}

export function copyRoutine(id: string, data: CopyRoutineRequest): Promise<RoutineDayResponse> {
  return client.post<RoutineDayResponse>(`/routines/${id}/copy`, data).then(r => r.data)
}

// ── Routine Blocks ────────────────────────────────────────────────────────────

export function createBlock(routineId: string, data: CreateRoutineBlockRequest): Promise<RoutineBlockResponse> {
  return client.post<RoutineBlockResponse>(`/routines/${routineId}/blocks`, data).then(r => r.data)
}

export function updateBlock(routineId: string, blockId: string, data: UpdateRoutineBlockRequest): Promise<RoutineBlockResponse> {
  return client.put<RoutineBlockResponse>(`/routines/${routineId}/blocks/${blockId}`, data).then(r => r.data)
}

export function deleteBlock(routineId: string, blockId: string): Promise<void> {
  return client.delete(`/routines/${routineId}/blocks/${blockId}`).then(() => undefined)
}

export function reorderBlocks(routineId: string, data: ReorderBlocksRequest): Promise<void> {
  return client.patch(`/routines/${routineId}/blocks/reorder`, data).then(() => undefined)
}

// ── Execution ─────────────────────────────────────────────────────────────────

export function getDailyExecution(routineId: string, date?: string): Promise<DailyRoutineViewResponse> {
  const params = date ? `?date=${date}` : ''
  return client.get<DailyRoutineViewResponse>(`/routines/${routineId}/execution${params}`).then(r => r.data)
}

export function logBlockExecution(routineId: string, blockId: string, data: LogExecutionRequest): Promise<RoutineExecutionLogResponse> {
  return client.post<RoutineExecutionLogResponse>(`/routines/${routineId}/blocks/${blockId}/execution`, data).then(r => r.data)
}

// ── Templates ─────────────────────────────────────────────────────────────────

export function getRoutineTemplates(): Promise<RoutineTemplateResponse[]> {
  return client.get<RoutineTemplateResponse[]>('/routines/templates').then(r => r.data)
}

export function createTemplateFromRoutine(data: CreateTemplateFromRoutineRequest): Promise<RoutineTemplateResponse> {
  return client.post<RoutineTemplateResponse>('/routines/templates', data).then(r => r.data)
}

export function applyTemplate(templateId: string, data: ApplyTemplateRequest): Promise<RoutineDayResponse> {
  return client.post<RoutineDayResponse>(`/routines/templates/${templateId}/apply`, data).then(r => r.data)
}

export function deleteTemplate(id: string): Promise<void> {
  return client.delete(`/routines/templates/${id}`).then(() => undefined)
}

// ── Block-Task Links ──────────────────────────────────────────────────────────

export function getBlockTaskLinks(blockId: string): Promise<BlockTaskLinkResponse[]> {
  return client.get<BlockTaskLinkResponse[]>(`/routines/blocks/${blockId}/tasks`).then(r => r.data)
}

export function linkTaskToBlock(blockId: string, data: LinkTaskToBlockRequest): Promise<BlockTaskLinkResponse> {
  return client.post<BlockTaskLinkResponse>(`/routines/blocks/${blockId}/tasks`, data).then(r => r.data)
}

export function unlinkTaskFromBlock(blockId: string, linkId: string): Promise<void> {
  return client.delete(`/routines/blocks/${blockId}/tasks/${linkId}`).then(() => undefined)
}

// ── Sleep Logs ────────────────────────────────────────────────────────────────

export function logSleep(data: LogSleepRequest): Promise<SleepLogResponse> {
  return client.post<SleepLogResponse>('/sleep-logs', data).then(r => r.data)
}

export function getSleepLogs(from: string, to: string): Promise<SleepLogResponse[]> {
  const params = new URLSearchParams({ from, to })
  return client.get<SleepLogResponse[]>(`/sleep-logs?${params}`).then(r => r.data)
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function getNotifications(): Promise<NotificationResponse[]> {
  return client.get<NotificationResponse[]>('/notifications').then(r => r.data)
}

export function getUnreadNotifications(): Promise<NotificationResponse[]> {
  return client.get<NotificationResponse[]>('/notifications/unread').then(r => r.data)
}

export function markNotificationRead(id: string): Promise<void> {
  return client.post(`/notifications/${id}/read`).then(() => undefined)
}

export function markAllNotificationsRead(): Promise<void> {
  return client.post('/notifications/read-all').then(() => undefined)
}

/**
 * Notification stream URL — el componente cliente debe usar EventSource directamente.
 * EventSource no soporta headers personalizados, así que el JWT debe ir en cookie httpOnly
 * o como query param ?token=... (configurar backend para aceptar ambos).
 */
export const NOTIFICATION_STREAM_URL = '/api/notifications/stream'
