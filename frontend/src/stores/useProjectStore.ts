import { create } from 'zustand'
import type { ProjectStatus } from '../types/project.types'

export type ProjectDetailTab = 'overview' | 'tasks' | 'iterations' | 'notes' | 'links' | 'stack'

interface ProjectStore {
  statusFilter: ProjectStatus | null
  setStatusFilter: (status: ProjectStatus | null) => void

  activeTab: ProjectDetailTab
  setActiveTab: (tab: ProjectDetailTab) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  statusFilter: null,
  setStatusFilter: (statusFilter) => set({ statusFilter }),

  activeTab: 'overview',
  setActiveTab: (activeTab) => set({ activeTab }),
}))
