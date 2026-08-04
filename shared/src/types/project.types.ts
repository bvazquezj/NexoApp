// Shared domain contract for projects.
// Enums
export type ProjectStatus = 'ACTIVE' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
export type LinkType = 'GITHUB' | 'DEPLOY' | 'STAGING' | 'DOCS' | 'FIGMA' | 'JIRA' | 'LINEAR' | 'NOTION' | 'TRELLO' | 'OTHER'
export type IterationStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED'
export type TechCategory = 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'DEVOPS' | 'MOBILE' | 'OTHER'

// Categories
export interface ProjectCategoryResponse {
  id: string
  name: string
  color: string
  isSystem: boolean
}

export interface CreateProjectCategoryRequest {
  name: string
  color: string
}

export interface UpdateProjectCategoryRequest {
  name?: string
  color?: string
}

// Projects
export interface ProjectResponse {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  category: ProjectCategoryResponse
  startDate: string | null
  dueDate: string
  inProgressAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  progressPercent: number
  totalTasks: number
  completedTasks: number
}

export interface ProjectSummaryResponse {
  id: string
  name: string
  status: ProjectStatus
  category: ProjectCategoryResponse
  dueDate: string
  deletedAt: string | null
  progressPercent: number
  totalTasks: number
  completedTasks: number
}

export interface CreateProjectRequest {
  name: string
  description?: string
  categoryId: string
  startDate?: string
  dueDate: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  categoryId?: string
  startDate?: string
  dueDate?: string
}

export interface ChangeProjectStatusRequest {
  status: ProjectStatus
}

// Notes
export interface ProjectNoteResponse {
  id: string
  projectId: string
  title: string | null
  body: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectNoteRequest {
  title?: string
  body: string
}

export interface UpdateProjectNoteRequest {
  title?: string
  body?: string
}

// Links
export interface ProjectLinkResponse {
  id: string
  projectId: string
  type: LinkType
  label: string
  url: string
  createdAt: string
}

export interface CreateProjectLinkRequest {
  type: LinkType
  label: string
  url: string
}

export interface UpdateProjectLinkRequest {
  type?: LinkType
  label?: string
  url?: string
}

// Stack
export interface ProjectTechResponse {
  id: string
  projectId: string
  name: string
  category: TechCategory
}

export interface CreateProjectTechRequest {
  name: string
  category: TechCategory
}

export interface TechCatalogResponse {
  id: string
  name: string
  category: TechCategory
}

// Iterations
export interface ProjectIterationResponse {
  id: string
  projectId: string
  number: number
  name: string | null
  goal: string | null
  status: IterationStatus
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  progressPercent: number
  totalTasks: number
  completedTasks: number
}

export interface CreateIterationRequest {
  name?: string
  goal?: string
  startDate?: string
  endDate?: string
}

export interface UpdateIterationRequest {
  name?: string
  goal?: string
  startDate?: string
  endDate?: string
  status?: IterationStatus
}
