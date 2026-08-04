// Shared domain contract for deployments.
// Enums
export type DeploymentStatus = 'UNKNOWN' | 'DEPLOYING' | 'ACTIVE' | 'DEGRADED' | 'DOWN' | 'INACTIVE'
export type DeploymentEnvironment = 'DEV' | 'STAGING' | 'PROD'
export type DeploymentPlatform = 'VERCEL' | 'RENDER' | 'FLYIO' | 'AWS' | 'RAILWAY' | 'NETLIFY' | 'OTHER'
export type DeployRecordSource = 'MANUAL' | 'WEBHOOK' | 'API_IMPORT'
export type HealthCheckResult = 'UP' | 'DEGRADED' | 'DOWN' | 'TIMEOUT'
export type EnvVarType = 'PUBLIC' | 'SECRET'

// Deployment
export interface DeploymentResponse {
  id: string
  name: string
  projectId: string
  projectName: string | null
  environment: DeploymentEnvironment
  platform: DeploymentPlatform
  platformLabel: string | null
  url: string
  repoUrl: string | null
  branch: string | null
  version: string | null
  status: DeploymentStatus
  hookToken: string
  healthCheckEnabled: boolean
  healthCheckIntervalMinutes: number
  notifyOnDown: boolean
  notifyOnRecovery: boolean
  notifyOnDegraded: boolean
  hasPlatformApiToken: boolean
  platformServiceId: string | null
  notes: string | null
  lastDeployedAt: string | null
  lastHealthCheckAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DeploymentSummaryResponse {
  id: string
  name: string
  environment: DeploymentEnvironment
  platform: DeploymentPlatform
  status: DeploymentStatus
  url: string
  projectName: string | null
  lastDeployedAt: string | null
  lastHealthCheckAt: string | null
}

export interface CreateDeploymentRequest {
  name: string
  projectId: string
  environment: DeploymentEnvironment
  platform: DeploymentPlatform
  platformLabel?: string
  url: string
  repoUrl?: string
  branch?: string
  version?: string
  healthCheckEnabled?: boolean
  healthCheckIntervalMinutes?: number
  notifyOnDown?: boolean
  notifyOnRecovery?: boolean
  notifyOnDegraded?: boolean
  notes?: string
}

export interface UpdateDeploymentRequest {
  name?: string
  projectId?: string
  environment?: DeploymentEnvironment
  platform?: DeploymentPlatform
  platformLabel?: string
  url?: string
  repoUrl?: string
  branch?: string
  version?: string
  healthCheckEnabled?: boolean
  healthCheckIntervalMinutes?: number
  notifyOnDown?: boolean
  notifyOnRecovery?: boolean
  notifyOnDegraded?: boolean
  notes?: string
}

export interface ChangeDeploymentStatusRequest {
  status: 'INACTIVE' | 'UNKNOWN' | 'ACTIVE'
}

export interface ConfigurePlatformApiRequest {
  token: string
  platformServiceId?: string
}

// Records
export interface DeploymentRecordResponse {
  id: string
  deploymentId: string
  url: string
  branch: string | null
  version: string | null
  source: DeployRecordSource
  notes: string | null
  deployedAt: string
  createdAt: string
}

export interface CreateDeploymentRecordRequest {
  url: string
  branch?: string
  version?: string
  notes?: string
  deployedAt?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// Health & Metrics
export interface DeploymentMetricsResponse {
  uptime24h: number | null
  uptime7d: number | null
  uptime30d: number | null
  avgLatencyMs24h: number | null
  p95LatencyMs24h: number | null
  totalChecks30d: number
  lastIncident: LastIncident | null
}

export interface LastIncident {
  startedAt: string
  recoveredAt: string | null
  durationMinutes: number | null
}

export interface UptimeTimelineResponse {
  deploymentId: string
  buckets: TimelineBucket[]
}

export interface TimelineBucket {
  hour: string
  result: HealthCheckResult
  totalChecks: number
}

// Env Vars
export interface DeploymentEnvVarResponse {
  id: string
  deploymentId: string
  key: string
  value: string  // masked "********" if type=SECRET
  type: EnvVarType
  createdAt: string
  updatedAt: string
}

export interface EnvVarRevealResponse {
  id: string
  key: string
  value: string  // decrypted
  type: EnvVarType
}

export interface CreateEnvVarRequest {
  key: string
  value: string
  type: EnvVarType
}

export interface UpdateEnvVarRequest {
  value?: string
  type?: EnvVarType
}

export interface ImportEnvVarsRequest {
  content: string
  defaultType: EnvVarType
}

export interface ImportEnvVarsResponse {
  imported: number
  skipped: number
  errors: string[]
}

// Platform tokens
export interface PlatformTokenStatusResponse {
  deploymentId: string
  name: string
  platform: DeploymentPlatform
  platformServiceId: string | null
  hasToken: boolean
}
