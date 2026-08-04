// Shared domain contract for tasks.
export type TaskStatus = string
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface TaskStatusDefinition {
  id: string
  name: string
  displayName: string
  color: string
  position: number
  isSystem: boolean
}

export interface CreateTaskStatusDefinitionRequest {
  name: string
  displayName: string
  color: string
}

export interface UpdateTaskStatusDefinitionRequest {
  name?: string
  displayName?: string
  color?: string
}

export interface TaskTypeResponse {
  id: string
  name: string
  color: string
  isSystem: boolean
}

export interface TaskResponse {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  type: TaskTypeResponse
  dueDate: string | null
  startDate: string | null
  projectId: string | null
  iterationId: string | null
  parentTaskId: string | null
  kanbanPosition: number | null
  subtaskCount: number
  completedSubtaskCount: number
  closingComment: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskSummaryResponse {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  deletedAt: string | null
  createdAt: string
}

export interface TaskPageResponse {
  content: TaskResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface TaskCommentResponse {
  id: string
  body: string
  closingComment: boolean
  createdAt: string
}

export interface TaskDashboardResponse {
  highPriorityPending: TaskSummaryResponse[]
  dueTodayOrTomorrow: TaskSummaryResponse[]
  stalledInReview: TaskSummaryResponse[]
  totalActive: number
  totalCompleted: number
}

export interface SubtaskSuggestionResponse {
  title: string
  priority: TaskPriority
}

export interface AiSubtasksResponse {
  taskId: string
  provider: 'GEMINI' | 'GROQ'
  suggestions: SubtaskSuggestionResponse[]
}

export interface CreateTaskRequest {
  title: string
  description?: string
  priority: TaskPriority
  typeId: string
  dueDate?: string
  startDate?: string
  projectId?: string
  iterationId?: string
  parentTaskId?: string
}

export interface UpdateTaskRequest {
  title: string
  description?: string
  priority: TaskPriority
  typeId: string
  dueDate?: string | null
  startDate?: string | null
  projectId?: string | null
  iterationId?: string | null
}

export interface ChangeTaskStatusRequest {
  status: TaskStatus
  closingComment?: string
}

export interface KanbanReorderRequest {
  status: TaskStatus
  taskIds: string[]
}

export interface TaskFilterState {
  status: TaskStatus[]
  priority: TaskPriority[]
  typeId: string[]
  dueDate: 'TODAY' | 'THIS_WEEK' | 'OVERDUE' | null
  rootOnly: boolean
  projectId?: string | null
  iterationId?: string | null
  backlogOnly?: boolean
}
