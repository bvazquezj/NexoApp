import { create } from 'zustand'

export type DeploymentDetailTab = 'overview' | 'health' | 'deploys' | 'variables'

interface DeploymentStore {
  projectFilter: string | null
  setProjectFilter: (projectId: string | null) => void

  activeTab: DeploymentDetailTab
  setActiveTab: (tab: DeploymentDetailTab) => void
}

export const useDeploymentStore = create<DeploymentStore>((set) => ({
  projectFilter: null,
  setProjectFilter: (projectFilter) => set({ projectFilter }),

  activeTab: 'overview',
  setActiveTab: (activeTab) => set({ activeTab }),
}))
