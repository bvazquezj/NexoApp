// Shared domain contract for habits.
// Enums
export type HabitFrequency = 'DAILY' | 'CUSTOM'
export type LogSource = 'MANUAL' | 'ROUTINE' | 'AUTO'
export type BlockType = 'HABIT' | 'PRODUCTIVE' | 'SLEEP' | 'BREAK' | 'FREE'
export type BlockPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type ExecutionSource = 'MANUAL' | 'AUTO' | 'SAMSUNG_HEALTH'
export type SleepSource = 'SAMSUNG_HEALTH' | 'MANUAL'

// Categories
export interface HabitCategoryResponse {
  id: string
  name: string
  color: string
  isSystem: boolean
}

export interface CreateHabitCategoryRequest {
  name: string
  color: string
}

export interface UpdateHabitCategoryRequest {
  name?: string
  color?: string
}

// Habits
export interface HabitResponse {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  category: HabitCategoryResponse
  frequency: HabitFrequency
  frequencyDays: number[] | null
  isActive: boolean
  currentStreak: number
  maxStreak: number
  createdAt: string
}

export interface HabitSummaryResponse {
  id: string
  name: string
  color: string
  icon: string | null
  category: HabitCategoryResponse
  isActive: boolean
  currentStreak: number
}

export interface CreateHabitRequest {
  name: string
  description?: string
  categoryId: string
  frequency: HabitFrequency
  frequencyDays?: number[]
  color: string
  icon?: string
}

export interface UpdateHabitRequest {
  name?: string
  description?: string
  categoryId?: string
  frequency?: HabitFrequency
  frequencyDays?: number[]
  color?: string
  icon?: string
}

// Habit Logs
export interface HabitLogResponse {
  id: string
  habitId: string
  date: string         // YYYY-MM-DD
  completed: boolean
  completedAt: string | null
  source: LogSource
}

export interface LogHabitRequest {
  date: string
  completed: boolean
  source?: LogSource
}

// Stats & Heatmap
export interface HabitStatsResponse {
  habitId: string
  period: number       // 7 | 30 | 90
  totalScheduled: number
  totalCompleted: number
  completionRate: number
  currentStreak: number
  maxStreak: number
}

export interface HabitHeatmapResponse {
  habitId: string
  from: string
  to: string
  entries: { date: string; completed: boolean; scheduled: boolean }[]
}

// Routines
export interface RoutineBlockResponse {
  id: string
  routineDayId: string
  title: string
  startTime: string    // HH:mm:ss
  endTime: string
  type: BlockType
  habitId: string | null
  habitName: string | null
  priority: BlockPriority | null
  isFlexible: boolean
  orderIndex: number
  color: string | null
  notifyStart: boolean
  notifyEnd: boolean
  notifyMinutesBefore: number
}

export interface RoutineDayResponse {
  id: string
  dayOfWeek: number    // 0=Sun..6=Sat
  name: string
  isActive: boolean
  templateName: string | null
  createdAt: string
  blocks: RoutineBlockResponse[]
}

export interface CreateRoutineDayRequest {
  dayOfWeek: number
  name: string
}

export interface UpdateRoutineDayRequest {
  name?: string
  active?: boolean
}

export interface CopyRoutineRequest {
  targetDayOfWeek: number
  replace?: boolean
}

export interface CreateRoutineBlockRequest {
  title: string
  startTime: string
  endTime: string
  type: BlockType
  habitId?: string
  priority?: BlockPriority
  flexible?: boolean
  color?: string
  notifyStart?: boolean
  notifyEnd?: boolean
  notifyMinutesBefore?: number
}

export interface UpdateRoutineBlockRequest {
  title?: string
  startTime?: string
  endTime?: string
  type?: BlockType
  habitId?: string
  priority?: BlockPriority
  flexible?: boolean
  color?: string
  notifyStart?: boolean
  notifyEnd?: boolean
  notifyMinutesBefore?: number
}

export interface ReorderBlocksRequest {
  blockIds: string[]
}

// Execution
export interface RoutineExecutionLogResponse {
  id: string
  routineBlockId: string
  date: string
  actualStartTime: string | null
  actualEndTime: string | null
  completed: boolean
  source: ExecutionSource
  notes: string | null
}

export interface LogExecutionRequest {
  date: string
  actualStartTime?: string
  actualEndTime?: string
  completed: boolean
  source?: ExecutionSource
  notes?: string
}

export interface DailyRoutineViewResponse {
  routineDayId: string
  dayOfWeek: number
  date: string
  items: { block: RoutineBlockResponse; execution: RoutineExecutionLogResponse | null }[]
}

// Templates
export interface RoutineTemplateResponse {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  blocks: string       // JSON serialized
  createdAt: string
}

export interface CreateTemplateFromRoutineRequest {
  routineDayId: string
  name: string
  description?: string
}

export interface ApplyTemplateRequest {
  routineDayId: string
  replace?: boolean
}

// BlockTaskLink
export interface BlockTaskLinkResponse {
  id: string
  routineBlockId: string
  taskId: string
  taskTitle: string | null
  taskStatus: 'PENDING' | 'READY' | 'REVIEW' | 'COMPLETED' | null
  taskPriority: 'HIGH' | 'MEDIUM' | 'LOW' | null
  taskAvailable: boolean
  addedAt: string
}

export interface LinkTaskToBlockRequest {
  taskId: string
}

// Sleep
export interface SleepLogResponse {
  id: string
  date: string
  sleepStart: string   // ISO datetime
  sleepEnd: string
  durationMinutes: number
  source: SleepSource
  syncedAt: string
}

export interface LogSleepRequest {
  date: string
  sleepStart: string
  sleepEnd: string
}

// Notifications
export interface NotificationResponse {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  metadata: string | null
  createdAt: string
}
