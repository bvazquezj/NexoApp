import client from './client'
import type {
  ClientResponse,
  DomainResponse,
  DomainSummaryResponse,
  NameserverResponse,
  DnsRecordResponse,
  SubdomainResponse,
  DomainCheckResponse,
  DomainDashboardResponse,
  PageResponse,
  CreateClientRequest,
  UpdateClientRequest,
  CreateDomainRequest,
  UpdateDomainRequest,
  CreateNameserverRequest,
  UpdateNameserverRequest,
  CreateDnsRecordRequest,
  UpdateDnsRecordRequest,
  CreateSubdomainRequest,
  UpdateSubdomainRequest,
} from '../types/domain.types'

// ── Clients ───────────────────────────────────────────────────────────────────

export function getClients(): Promise<ClientResponse[]> {
  return client.get<ClientResponse[]>('/clients').then(r => r.data)
}

export function getClientTrash(): Promise<ClientResponse[]> {
  return client.get<ClientResponse[]>('/clients/trash').then(r => r.data)
}

export function getClient(id: string): Promise<ClientResponse> {
  return client.get<ClientResponse>(`/clients/${id}`).then(r => r.data)
}

export function createClient(data: CreateClientRequest): Promise<ClientResponse> {
  return client.post<ClientResponse>('/clients', data).then(r => r.data)
}

export function updateClient(id: string, data: UpdateClientRequest): Promise<ClientResponse> {
  return client.put<ClientResponse>(`/clients/${id}`, data).then(r => r.data)
}

export function deleteClient(id: string): Promise<void> {
  return client.delete(`/clients/${id}`).then(() => undefined)
}

export function restoreClient(id: string): Promise<ClientResponse> {
  return client.post<ClientResponse>(`/clients/${id}/restore`).then(r => r.data)
}

// ── Domains ───────────────────────────────────────────────────────────────────

export function getDomains(): Promise<DomainSummaryResponse[]> {
  return client.get<DomainSummaryResponse[]>('/domains').then(r => r.data)
}

export function getDomainTrash(): Promise<DomainSummaryResponse[]> {
  return client.get<DomainSummaryResponse[]>('/domains/trash').then(r => r.data)
}

export function getDomain(id: string): Promise<DomainResponse> {
  return client.get<DomainResponse>(`/domains/${id}`).then(r => r.data)
}

export function createDomain(data: CreateDomainRequest): Promise<DomainResponse> {
  return client.post<DomainResponse>('/domains', data).then(r => r.data)
}

export function updateDomain(id: string, data: UpdateDomainRequest): Promise<DomainResponse> {
  return client.put<DomainResponse>(`/domains/${id}`, data).then(r => r.data)
}

export function deleteDomain(id: string): Promise<void> {
  return client.delete(`/domains/${id}`).then(() => undefined)
}

export function restoreDomain(id: string): Promise<DomainResponse> {
  return client.post<DomainResponse>(`/domains/${id}/restore`).then(r => r.data)
}

// ── Nameservers ───────────────────────────────────────────────────────────────

export function getNameservers(domainId: string): Promise<NameserverResponse[]> {
  return client.get<NameserverResponse[]>(`/domains/${domainId}/nameservers`).then(r => r.data)
}

export function createNameserver(domainId: string, data: CreateNameserverRequest): Promise<NameserverResponse> {
  return client.post<NameserverResponse>(`/domains/${domainId}/nameservers`, data).then(r => r.data)
}

export function updateNameserver(domainId: string, nsId: string, data: UpdateNameserverRequest): Promise<NameserverResponse> {
  return client.put<NameserverResponse>(`/domains/${domainId}/nameservers/${nsId}`, data).then(r => r.data)
}

export function deleteNameserver(domainId: string, nsId: string): Promise<void> {
  return client.delete(`/domains/${domainId}/nameservers/${nsId}`).then(() => undefined)
}

// ── DNS Records ───────────────────────────────────────────────────────────────

export function getDnsRecords(domainId: string): Promise<DnsRecordResponse[]> {
  return client.get<DnsRecordResponse[]>(`/domains/${domainId}/dns-records`).then(r => r.data)
}

export function createDnsRecord(domainId: string, data: CreateDnsRecordRequest): Promise<DnsRecordResponse> {
  return client.post<DnsRecordResponse>(`/domains/${domainId}/dns-records`, data).then(r => r.data)
}

export function updateDnsRecord(domainId: string, recordId: string, data: UpdateDnsRecordRequest): Promise<DnsRecordResponse> {
  return client.put<DnsRecordResponse>(`/domains/${domainId}/dns-records/${recordId}`, data).then(r => r.data)
}

export function deleteDnsRecord(domainId: string, recordId: string): Promise<void> {
  return client.delete(`/domains/${domainId}/dns-records/${recordId}`).then(() => undefined)
}

// ── Subdomains ────────────────────────────────────────────────────────────────

export function getSubdomains(domainId: string): Promise<SubdomainResponse[]> {
  return client.get<SubdomainResponse[]>(`/domains/${domainId}/subdomains`).then(r => r.data)
}

export function createSubdomain(domainId: string, data: CreateSubdomainRequest): Promise<SubdomainResponse> {
  return client.post<SubdomainResponse>(`/domains/${domainId}/subdomains`, data).then(r => r.data)
}

export function updateSubdomain(domainId: string, subId: string, data: UpdateSubdomainRequest): Promise<SubdomainResponse> {
  return client.put<SubdomainResponse>(`/domains/${domainId}/subdomains/${subId}`, data).then(r => r.data)
}

export function deleteSubdomain(domainId: string, subId: string): Promise<void> {
  return client.delete(`/domains/${domainId}/subdomains/${subId}`).then(() => undefined)
}

// ── Checks ────────────────────────────────────────────────────────────────────

export function getDomainChecks(domainId: string, page = 0, size = 20): Promise<PageResponse<DomainCheckResponse>> {
  return client.get<PageResponse<DomainCheckResponse>>(`/domains/${domainId}/checks?page=${page}&size=${size}`).then(r => r.data)
}

export function verifyDomainOnDemand(domainId: string): Promise<DomainCheckResponse> {
  return client.post<DomainCheckResponse>(`/domains/${domainId}/check`).then(r => r.data)
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function getDomainsDashboard(): Promise<DomainDashboardResponse> {
  return client.get<DomainDashboardResponse>('/domains/dashboard').then(r => r.data)
}
