import client from './client'
import type {
  TaskResponse,
  TaskSummaryResponse,
  TaskPageResponse,
  TaskTypeResponse,
  TaskCommentResponse,
  TaskDashboardResponse,
  AiSubtasksResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  ChangeTaskStatusRequest,
  KanbanReorderRequest,
  TaskFilterState,
  TaskStatus,
  TaskStatusDefinition,
  CreateTaskStatusDefinitionRequest,
  UpdateTaskStatusDefinitionRequest,
} from '../types/task.types'

export function getTasks(
  filters: TaskFilterState,
  page: number,
  size: number,
): Promise<TaskPageResponse> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (filters.status.length) params.set('status', filters.status.join(','))
  if (filters.priority.length) params.set('priority', filters.priority.join(','))
  if (filters.typeId.length) params.set('typeId', filters.typeId.join(','))
  if (filters.dueDate) params.set('dueDate', filters.dueDate)
  if (filters.rootOnly) params.set('rootOnly', 'true')
  if (filters.projectId) params.set('projectId', filters.projectId)
  if (filters.iterationId) params.set('iterationId', filters.iterationId)
  if (filters.backlogOnly) params.set('backlogOnly', 'true')
  return client.get<TaskPageResponse>(`/tasks?${params.toString()}`).then(r => r.data)
}

export function getTask(id: string): Promise<TaskResponse> {
  return client.get<TaskResponse>(`/tasks/${id}`).then(r => r.data)
}

export function createTask(data: CreateTaskRequest): Promise<TaskResponse> {
  return client.post<TaskResponse>('/tasks', data).then(r => r.data)
}

export function updateTask(id: string, data: UpdateTaskRequest): Promise<TaskResponse> {
  return client.put<TaskResponse>(`/tasks/${id}`, data).then(r => r.data)
}

export function deleteTask(id: string): Promise<void> {
  return client.delete(`/tasks/${id}`).then(() => undefined)
}

export function changeTaskStatus(id: string, data: ChangeTaskStatusRequest): Promise<TaskResponse> {
  return client.post<TaskResponse>(`/tasks/${id}/status`, data).then(r => r.data)
}

export function getTaskSubtasks(id: string): Promise<TaskResponse[]> {
  return client.get<TaskResponse[]>(`/tasks/${id}/subtasks`).then(r => r.data)
}

export function getTaskComments(id: string): Promise<TaskCommentResponse[]> {
  return client.get<TaskCommentResponse[]>(`/tasks/${id}/comments`).then(r => r.data)
}

export function getTaskTypes(): Promise<TaskTypeResponse[]> {
  return client.get<TaskTypeResponse[]>('/tasks/types').then(r => r.data)
}

export function createTaskType(data: { name: string; color: string }): Promise<TaskTypeResponse> {
  return client.post<TaskTypeResponse>('/tasks/types', data).then(r => r.data)
}

export function getTrashTasks(): Promise<TaskSummaryResponse[]> {
  return client.get<TaskSummaryResponse[]>('/tasks/trash').then(r => r.data)
}

export function restoreTask(id: string): Promise<TaskResponse> {
  return client.post<TaskResponse>(`/tasks/${id}/restore`).then(r => r.data)
}

export function reorderKanban(data: KanbanReorderRequest): Promise<void> {
  return client.patch('/tasks/kanban/reorder', data).then(() => undefined)
}

export function generateAiSubtasks(id: string): Promise<AiSubtasksResponse> {
  return client.post<AiSubtasksResponse>(`/tasks/${id}/ai/subtasks`).then(r => r.data)
}

export function getKanbanColumn(status: TaskStatus): Promise<TaskResponse[]> {
  const params = new URLSearchParams({ status, size: '200', page: '0' })
  return client
    .get<TaskPageResponse>(`/tasks?${params.toString()}`)
    .then(r => r.data.content)
}

export function getTaskDashboard(): Promise<TaskDashboardResponse> {
  return client.get<TaskDashboardResponse>('/tasks/dashboard').then(r => r.data)
}

// --- Task Status Definitions ---

export function getTaskStatusDefinitions(): Promise<TaskStatusDefinition[]> {
  return client.get<TaskStatusDefinition[]>('/tasks/statuses').then(r => r.data)
}

export function createTaskStatusDefinition(data: CreateTaskStatusDefinitionRequest): Promise<TaskStatusDefinition> {
  return client.post<TaskStatusDefinition>('/tasks/statuses', data).then(r => r.data)
}

export function updateTaskStatusDefinition(id: string, data: UpdateTaskStatusDefinitionRequest): Promise<TaskStatusDefinition> {
  return client.put<TaskStatusDefinition>(`/tasks/statuses/${id}`, data).then(r => r.data)
}

export function deleteTaskStatusDefinition(id: string): Promise<void> {
  return client.delete(`/tasks/statuses/${id}`).then(() => undefined)
}
