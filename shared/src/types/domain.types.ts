// Shared domain contract for domains and clients.
// Enums
export type DomainStatus = 'ACTIVE' | 'TRANSFERRED' | 'RELEASED'
export type DomainEffectiveStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'TRANSFERRED' | 'RELEASED'
export type Registrar = 'DONDOMINIO' | 'GODADDY' | 'NAMECHEAP' | 'CLOUDFLARE' | 'GOOGLE' | 'IONOS' | 'AWS' | 'SQUARESPACE' | 'OTHER'
export type DnsProvider = 'CLOUDFLARE' | 'VERCEL' | 'RENDER' | 'GODADDY' | 'NAMECHEAP' | 'AWS_ROUTE53' | 'IONOS' | 'OTHER'
export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'CAA'
export type DomainCheckResult = 'OK' | 'MISMATCH' | 'UNRESOLVABLE' | 'ERROR'
export type CheckTrigger = 'SCHEDULED' | 'MANUAL'
export type DomainAlertType = 'EXPIRING_15_DAYS' | 'EXPIRING_2_DAYS' | 'EXPIRED'

// Client
export interface ClientResponse {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  website: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  domainCount: number
  projectCount: number
  taskCount: number
  deploymentCount: number
}

export interface ClientSummaryResponse {
  id: string
  name: string
  company: string | null
}

export interface CreateClientRequest {
  name: string
  email?: string
  phone?: string
  company?: string
  website?: string
  notes?: string
}

export interface UpdateClientRequest {
  name?: string
  email?: string
  phone?: string
  company?: string
  website?: string
  notes?: string
}

// Domain
export interface DomainResponse {
  id: string
  name: string
  tld: string
  fullDomain: string
  client: ClientSummaryResponse | null
  projectId: string | null
  projectName: string | null
  registrar: Registrar
  registrarLabel: string | null
  dnsProvider: DnsProvider | null
  dnsProviderLabel: string | null
  registeredAt: string | null
  expiresAt: string
  status: DomainStatus
  effectiveStatus: DomainEffectiveStatus
  whoisPrivacy: boolean
  autoRenewal: boolean
  renewalPriceAmount: string | null
  renewalPriceCurrency: string | null
  notes: string | null
  lastCheckedAt: string | null
  createdAt: string
  updatedAt: string
  daysUntilExpiry: number | null
}

export interface DomainSummaryResponse {
  id: string
  fullDomain: string
  registrar: Registrar
  status: DomainStatus
  effectiveStatus: DomainEffectiveStatus
  expiresAt: string
  daysUntilExpiry: number | null
  clientName: string | null
  projectName: string | null
  lastCheckedAt: string | null
  deletedAt: string | null
}

export interface CreateDomainRequest {
  name: string
  tld: string
  clientId?: string
  projectId?: string
  registrar: Registrar
  registrarLabel?: string
  dnsProvider?: DnsProvider
  dnsProviderLabel?: string
  registeredAt?: string
  expiresAt: string
  whoisPrivacy?: boolean
  autoRenewal?: boolean
  renewalPriceAmount?: string
  renewalPriceCurrency?: string
  notes?: string
}

export interface UpdateDomainRequest {
  name?: string
  tld?: string
  clientId?: string
  projectId?: string
  registrar?: Registrar
  registrarLabel?: string
  dnsProvider?: DnsProvider
  dnsProviderLabel?: string
  registeredAt?: string
  expiresAt?: string
  status?: DomainStatus
  whoisPrivacy?: boolean
  autoRenewal?: boolean
  renewalPriceAmount?: string
  renewalPriceCurrency?: string
  notes?: string
}

// Nameservers
export interface NameserverResponse {
  id: string
  domainId: string
  value: string
  orderIndex: number
}

export interface CreateNameserverRequest {
  value: string
}

export interface UpdateNameserverRequest {
  value?: string
  orderIndex?: number
}

// DNS Records
export interface DnsRecordResponse {
  id: string
  domainId: string
  type: DnsRecordType
  host: string
  expectedValue: string
  ttl: number | null
  priority: number | null
  resolvedValue: string | null
  resolvedAt: string | null
  hasMismatch: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDnsRecordRequest {
  type: DnsRecordType
  host: string
  expectedValue: string
  ttl?: number
  priority?: number
}

export interface UpdateDnsRecordRequest {
  type?: DnsRecordType
  host?: string
  expectedValue?: string
  ttl?: number
  priority?: number
}

// Subdomains
export interface SubdomainResponse {
  id: string
  domainId: string
  prefix: string
  fullSubdomain: string
  deploymentId: string | null
  deploymentName: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSubdomainRequest {
  prefix: string
  deploymentId?: string
  notes?: string
}

export interface UpdateSubdomainRequest {
  prefix?: string
  deploymentId?: string
  notes?: string
}

// Checks
export interface DomainCheckResponse {
  id: string
  domainId: string
  result: DomainCheckResult
  resolvedIps: string | null
  mismatchCount: number
  errorMessage: string | null
  triggeredBy: CheckTrigger
  checkedAt: string
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

// Dashboard
export interface DomainDashboardResponse {
  expiringSoon: DomainSummaryResponse[]
  expired: DomainSummaryResponse[]
  totalActive: number
}
