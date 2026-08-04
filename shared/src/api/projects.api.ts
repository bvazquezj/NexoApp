import client from './client'
import type {
  ProjectResponse,
  ProjectSummaryResponse,
  ProjectCategoryResponse,
  ProjectNoteResponse,
  ProjectLinkResponse,
  ProjectTechResponse,
  TechCatalogResponse,
  ProjectIterationResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ChangeProjectStatusRequest,
  CreateProjectCategoryRequest,
  UpdateProjectCategoryRequest,
  CreateProjectNoteRequest,
  UpdateProjectNoteRequest,
  CreateProjectLinkRequest,
  UpdateProjectLinkRequest,
  CreateProjectTechRequest,
  CreateIterationRequest,
  UpdateIterationRequest,
  ProjectStatus,
} from '../types/project.types'

// ── Projects ──────────────────────────────────────────────────────────────────

export function getProjects(status?: ProjectStatus): Promise<ProjectSummaryResponse[]> {
  const params = status ? `?status=${status}` : ''
  return client.get<ProjectSummaryResponse[]>(`/projects${params}`).then(r => r.data)
}

export function getProjectTrash(): Promise<ProjectSummaryResponse[]> {
  return client.get<ProjectSummaryResponse[]>('/projects/trash').then(r => r.data)
}

export function getProject(id: string): Promise<ProjectResponse> {
  return client.get<ProjectResponse>(`/projects/${id}`).then(r => r.data)
}

export function createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
  return client.post<ProjectResponse>('/projects', data).then(r => r.data)
}

export function updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectResponse> {
  return client.put<ProjectResponse>(`/projects/${id}`, data).then(r => r.data)
}

export function changeProjectStatus(id: string, data: ChangeProjectStatusRequest): Promise<ProjectResponse> {
  return client.post<ProjectResponse>(`/projects/${id}/status`, data).then(r => r.data)
}

export function deleteProject(id: string): Promise<void> {
  return client.delete(`/projects/${id}`).then(() => undefined)
}

export function restoreProject(id: string): Promise<ProjectResponse> {
  return client.post<ProjectResponse>(`/projects/${id}/restore`).then(r => r.data)
}

// ── Categories ────────────────────────────────────────────────────────────────

export function getProjectCategories(): Promise<ProjectCategoryResponse[]> {
  return client.get<ProjectCategoryResponse[]>('/projects/categories').then(r => r.data)
}

export function createProjectCategory(data: CreateProjectCategoryRequest): Promise<ProjectCategoryResponse> {
  return client.post<ProjectCategoryResponse>('/projects/categories', data).then(r => r.data)
}

export function updateProjectCategory(id: string, data: UpdateProjectCategoryRequest): Promise<ProjectCategoryResponse> {
  return client.put<ProjectCategoryResponse>(`/projects/categories/${id}`, data).then(r => r.data)
}

export function deleteProjectCategory(id: string): Promise<void> {
  return client.delete(`/projects/categories/${id}`).then(() => undefined)
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export function getProjectNotes(projectId: string): Promise<ProjectNoteResponse[]> {
  return client.get<ProjectNoteResponse[]>(`/projects/${projectId}/notes`).then(r => r.data)
}

export function createProjectNote(projectId: string, data: CreateProjectNoteRequest): Promise<ProjectNoteResponse> {
  return client.post<ProjectNoteResponse>(`/projects/${projectId}/notes`, data).then(r => r.data)
}

export function updateProjectNote(projectId: string, noteId: string, data: UpdateProjectNoteRequest): Promise<ProjectNoteResponse> {
  return client.put<ProjectNoteResponse>(`/projects/${projectId}/notes/${noteId}`, data).then(r => r.data)
}

export function deleteProjectNote(projectId: string, noteId: string): Promise<void> {
  return client.delete(`/projects/${projectId}/notes/${noteId}`).then(() => undefined)
}

// ── Links ─────────────────────────────────────────────────────────────────────

export function getProjectLinks(projectId: string): Promise<ProjectLinkResponse[]> {
  return client.get<ProjectLinkResponse[]>(`/projects/${projectId}/links`).then(r => r.data)
}

export function createProjectLink(projectId: string, data: CreateProjectLinkRequest): Promise<ProjectLinkResponse> {
  return client.post<ProjectLinkResponse>(`/projects/${projectId}/links`, data).then(r => r.data)
}

export function updateProjectLink(projectId: string, linkId: string, data: UpdateProjectLinkRequest): Promise<ProjectLinkResponse> {
  return client.put<ProjectLinkResponse>(`/projects/${projectId}/links/${linkId}`, data).then(r => r.data)
}

export function deleteProjectLink(projectId: string, linkId: string): Promise<void> {
  return client.delete(`/projects/${projectId}/links/${linkId}`).then(() => undefined)
}

// ── Stack ─────────────────────────────────────────────────────────────────────

export function getProjectTechs(projectId: string): Promise<ProjectTechResponse[]> {
  return client.get<ProjectTechResponse[]>(`/projects/${projectId}/techs`).then(r => r.data)
}

export function addProjectTech(projectId: string, data: CreateProjectTechRequest): Promise<ProjectTechResponse> {
  return client.post<ProjectTechResponse>(`/projects/${projectId}/techs`, data).then(r => r.data)
}

export function removeProjectTech(projectId: string, techId: string): Promise<void> {
  return client.delete(`/projects/${projectId}/techs/${techId}`).then(() => undefined)
}

export function searchTechCatalog(query?: string): Promise<TechCatalogResponse[]> {
  const params = query ? `?query=${encodeURIComponent(query)}` : ''
  return client.get<TechCatalogResponse[]>(`/projects/tech-catalog${params}`).then(r => r.data)
}

// ── Iterations ────────────────────────────────────────────────────────────────

export function getProjectIterations(projectId: string): Promise<ProjectIterationResponse[]> {
  return client.get<ProjectIterationResponse[]>(`/projects/${projectId}/iterations`).then(r => r.data)
}

export function createIteration(projectId: string, data: CreateIterationRequest): Promise<ProjectIterationResponse> {
  return client.post<ProjectIterationResponse>(`/projects/${projectId}/iterations`, data).then(r => r.data)
}

export function updateIteration(projectId: string, iterationId: string, data: UpdateIterationRequest): Promise<ProjectIterationResponse> {
  return client.put<ProjectIterationResponse>(`/projects/${projectId}/iterations/${iterationId}`, data).then(r => r.data)
}

export function deleteIteration(projectId: string, iterationId: string): Promise<void> {
  return client.delete(`/projects/${projectId}/iterations/${iterationId}`).then(() => undefined)
}
