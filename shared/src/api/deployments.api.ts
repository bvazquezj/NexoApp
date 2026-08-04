import client from './client'
import type {
  DeploymentResponse,
  DeploymentSummaryResponse,
  DeploymentRecordResponse,
  DeploymentMetricsResponse,
  UptimeTimelineResponse,
  DeploymentEnvVarResponse,
  EnvVarRevealResponse,
  ImportEnvVarsResponse,
  PlatformTokenStatusResponse,
  PageResponse,
  CreateDeploymentRequest,
  UpdateDeploymentRequest,
  ChangeDeploymentStatusRequest,
  ConfigurePlatformApiRequest,
  CreateDeploymentRecordRequest,
  CreateEnvVarRequest,
  UpdateEnvVarRequest,
  ImportEnvVarsRequest,
  DeploymentPlatform,
} from '../types/deployment.types'

// ── Deployments ───────────────────────────────────────────────────────────────

export function getDeployments(projectId?: string): Promise<DeploymentSummaryResponse[]> {
  const params = projectId ? `?projectId=${projectId}` : ''
  return client.get<DeploymentSummaryResponse[]>(`/deployments${params}`).then(r => r.data)
}

export function getDeploymentTrash(): Promise<DeploymentSummaryResponse[]> {
  return client.get<DeploymentSummaryResponse[]>('/deployments/trash').then(r => r.data)
}

export function getDeployment(id: string): Promise<DeploymentResponse> {
  return client.get<DeploymentResponse>(`/deployments/${id}`).then(r => r.data)
}

export function createDeployment(data: CreateDeploymentRequest): Promise<DeploymentResponse> {
  return client.post<DeploymentResponse>('/deployments', data).then(r => r.data)
}

export function updateDeployment(id: string, data: UpdateDeploymentRequest): Promise<DeploymentResponse> {
  return client.put<DeploymentResponse>(`/deployments/${id}`, data).then(r => r.data)
}

export function deleteDeployment(id: string): Promise<void> {
  return client.delete(`/deployments/${id}`).then(() => undefined)
}

export function restoreDeployment(id: string): Promise<DeploymentResponse> {
  return client.post<DeploymentResponse>(`/deployments/${id}/restore`).then(r => r.data)
}

export function changeDeploymentStatus(id: string, data: ChangeDeploymentStatusRequest): Promise<DeploymentResponse> {
  return client.patch<DeploymentResponse>(`/deployments/${id}/status`, data).then(r => r.data)
}

export function configurePlatformApi(id: string, data: ConfigurePlatformApiRequest): Promise<void> {
  return client.put(`/deployments/${id}/platform-api`, data).then(() => undefined)
}

export function copyPlatformToken(id: string, sourceId: string): Promise<void> {
  return client.post(`/deployments/${id}/platform-api/copy-from/${sourceId}`).then(() => undefined)
}

export function listPlatformTokens(platform: DeploymentPlatform): Promise<PlatformTokenStatusResponse[]> {
  return client.get<PlatformTokenStatusResponse[]>(`/deployments/platform-tokens?platform=${platform}`).then(r => r.data)
}

// ── Records ───────────────────────────────────────────────────────────────────

export function getDeploymentRecords(deploymentId: string, page = 0, size = 20): Promise<PageResponse<DeploymentRecordResponse>> {
  return client.get<PageResponse<DeploymentRecordResponse>>(`/deployments/${deploymentId}/records?page=${page}&size=${size}`).then(r => r.data)
}

export function createDeploymentRecord(deploymentId: string, data: CreateDeploymentRecordRequest): Promise<DeploymentRecordResponse> {
  return client.post<DeploymentRecordResponse>(`/deployments/${deploymentId}/records`, data).then(r => r.data)
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export function getDeploymentMetrics(deploymentId: string): Promise<DeploymentMetricsResponse> {
  return client.get<DeploymentMetricsResponse>(`/deployments/${deploymentId}/metrics`).then(r => r.data)
}

export function getDeploymentTimeline(deploymentId: string, from: string, to: string): Promise<UptimeTimelineResponse> {
  const params = new URLSearchParams({ from, to })
  return client.get<UptimeTimelineResponse>(`/deployments/${deploymentId}/timeline?${params}`).then(r => r.data)
}

// ── Env Vars ──────────────────────────────────────────────────────────────────

export function getEnvVars(deploymentId: string): Promise<DeploymentEnvVarResponse[]> {
  return client.get<DeploymentEnvVarResponse[]>(`/deployments/${deploymentId}/env-vars`).then(r => r.data)
}

export function createEnvVar(deploymentId: string, data: CreateEnvVarRequest): Promise<DeploymentEnvVarResponse> {
  return client.post<DeploymentEnvVarResponse>(`/deployments/${deploymentId}/env-vars`, data).then(r => r.data)
}

export function updateEnvVar(deploymentId: string, varId: string, data: UpdateEnvVarRequest): Promise<DeploymentEnvVarResponse> {
  return client.put<DeploymentEnvVarResponse>(`/deployments/${deploymentId}/env-vars/${varId}`, data).then(r => r.data)
}

export function deleteEnvVar(deploymentId: string, varId: string): Promise<void> {
  return client.delete(`/deployments/${deploymentId}/env-vars/${varId}`).then(() => undefined)
}

export function revealEnvVar(deploymentId: string, varId: string): Promise<EnvVarRevealResponse> {
  return client.get<EnvVarRevealResponse>(`/deployments/${deploymentId}/env-vars/${varId}/reveal`).then(r => r.data)
}

export function importEnvVars(deploymentId: string, data: ImportEnvVarsRequest): Promise<ImportEnvVarsResponse> {
  return client.post<ImportEnvVarsResponse>(`/deployments/${deploymentId}/env-vars/import`, data).then(r => r.data)
}

/**
 * Export endpoint returns binary blob. Returns a Blob so caller can trigger download.
 */
export function exportEnvVars(deploymentId: string): Promise<Blob> {
  return client.get<Blob>(`/deployments/${deploymentId}/env-vars/export`, { responseType: 'blob' }).then(r => r.data)
}
