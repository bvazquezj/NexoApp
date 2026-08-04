import { create } from 'zustand'
import type { TaskStatus, TaskFilterState, SubtaskSuggestionResponse } from '../types/task.types'

const defaultFilters: TaskFilterState = {
  status: [],
  priority: [],
  typeId: [],
  dueDate: null,
  rootOnly: false,
}

interface TaskUIStore {
  filters: TaskFilterState
  setFilters: (f: Partial<TaskFilterState>) => void
  resetFilters: () => void

  isDragging: boolean
  dragTaskId: string | null
  dragSourceStatus: TaskStatus | null
  setDragState: (state: {
    isDragging: boolean
    taskId: string | null
    sourceStatus: TaskStatus | null
  }) => void

  closingModal: {
    open: boolean
    taskId: string
    targetStatus: TaskStatus
    onConfirm?: (comment: string) => void
  } | null
  openClosingModal: (
    taskId: string,
    targetStatus: TaskStatus,
    onConfirm: (comment: string) => void,
  ) => void
  closeClosingModal: () => void

  aiState: {
    taskId: string | null
    loading: boolean
    suggestions: SubtaskSuggestionResponse[]
    error: string | null
  }
  setAiState: (state: Partial<TaskUIStore['aiState']>) => void
  clearAiState: () => void
}

export const useTaskUIStore = create<TaskUIStore>((set) => ({
  filters: { ...defaultFilters },
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),

  isDragging: false,
  dragTaskId: null,
  dragSourceStatus: null,
  setDragState: ({ isDragging, taskId, sourceStatus }) =>
    set({ isDragging, dragTaskId: taskId, dragSourceStatus: sourceStatus }),

  closingModal: null,
  openClosingModal: (taskId, targetStatus, onConfirm) =>
    set({ closingModal: { open: true, taskId, targetStatus, onConfirm } }),
  closeClosingModal: () => set({ closingModal: null }),

  aiState: { taskId: null, loading: false, suggestions: [], error: null },
  setAiState: (state) =>
    set((s) => ({ aiState: { ...s.aiState, ...state } })),
  clearAiState: () =>
    set({ aiState: { taskId: null, loading: false, suggestions: [], error: null } }),
}))
