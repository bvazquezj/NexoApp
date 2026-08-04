import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../../../components/layout/AppLayout'
import { DomainStatusBadge } from '../../../components/domains/DomainStatusBadge'
import {
  getDomain, deleteDomain, verifyDomainOnDemand,
  getNameservers, createNameserver, deleteNameserver,
  getDnsRecords, createDnsRecord, deleteDnsRecord,
  getSubdomains, createSubdomain, deleteSubdomain,
  getDomainChecks,
} from '../../../api/domains.api'
import { getDeployments } from '../../../api/deployments.api'
import type {
  DnsRecordType, CreateDnsRecordRequest, CreateSubdomainRequest,
} from '../../../types/domain.types'

const DNS_TYPES: DnsRecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'CAA']

type Tab = 'info' | 'dns' | 'subdomains' | 'checks'

function InfoTab({ domainId }: { domainId: string }) {
  const queryClient = useQueryClient()
  const { data: domain } = useQuery({ queryKey: ['domains', domainId], queryFn: () => getDomain(domainId) })
  const { data: ns } = useQuery({ queryKey: ['domains', domainId, 'nameservers'], queryFn: () => getNameservers(domainId) })
  const [nsValue, setNsValue] = useState('')

  const addNsMutation = useMutation({
    mutationFn: (value: string) => createNameserver(domainId, { value }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['domains', domainId, 'nameservers'] }); setNsValue('') },
  })
  const deleteNsMutation = useMutation({
    mutationFn: (nsId: string) => deleteNameserver(domainId, nsId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['domains', domainId, 'nameservers'] }),
  })

  if (!domain) return null

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Datos generales</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-xs text-gray-500">Registrar</dt><dd>{domain.registrar}{domain.registrarLabel && ` (${domain.registrarLabel})`}</dd></div>
          <div><dt className="text-xs text-gray-500">DNS Provider</dt><dd>{domain.dnsProvider ?? '—'}{domain.dnsProviderLabel && ` (${domain.dnsProviderLabel})`}</dd></div>
          <div><dt className="text-xs text-gray-500">Registrado</dt><dd>{domain.registeredAt ?? '—'}</dd></div>
          <div><dt className="text-xs text-gray-500">Expira</dt><dd>{domain.expiresAt}</dd></div>
          <div><dt className="text-xs text-gray-500">Auto-renovación</dt><dd>{domain.autoRenewal ? '✅ Sí' : '❌ No'}</dd></div>
          <div><dt className="text-xs text-gray-500">WHOIS privado</dt><dd>{domain.whoisPrivacy ? '✅ Sí' : '❌ No'}</dd></div>
          <div><dt className="text-xs text-gray-500">Precio renovación</dt><dd>{domain.renewalPriceAmount ? `${domain.renewalPriceAmount} ${domain.renewalPriceCurrency}` : '—'}</dd></div>
          <div><dt className="text-xs text-gray-500">Última verificación</dt><dd>{domain.lastCheckedAt ?? 'Nunca'}</dd></div>
        </dl>
        {domain.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Notas</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{domain.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Nameservers ({ns?.length ?? 0}/6)</h3>
        <div className="space-y-1 mb-3">
          {ns?.map(n => (
            <div key={n.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded text-sm">
              <span className="font-mono">{n.value}</span>
              <button onClick={() => { if (confirm('Eliminar nameserver?')) deleteNsMutation.mutate(n.id) }}
                className="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
            </div>
          ))}
          {(ns?.length ?? 0) === 0 && <p className="text-xs text-gray-400">Sin nameservers configurados</p>}
        </div>
        {(ns?.length ?? 0) < 6 && (
          <div className="flex gap-2">
            <input type="text" placeholder="ns1.example.com" value={nsValue} onChange={e => setNsValue(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <button onClick={() => nsValue && addNsMutation.mutate(nsValue)} disabled={!nsValue || addNsMutation.isPending}
              className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Agregar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function DnsTab({ domainId }: { domainId: string }) {
  const queryClient = useQueryClient()
  const { data: records } = useQuery({ queryKey: ['domains', domainId, 'dns-records'], queryFn: () => getDnsRecords(domainId) })
  const [form, setForm] = useState<CreateDnsRecordRequest>({ type: 'A', host: '@', expectedValue: '' })

  const addMutation = useMutation({
    mutationFn: (data: CreateDnsRecordRequest) => createDnsRecord(domainId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['domains', domainId, 'dns-records'] }); setForm({ type: 'A', host: '@', expectedValue: '' }) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDnsRecord(domainId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['domains', domainId, 'dns-records'] }),
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Registros DNS esperados</h3>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 border-b">
            <tr><th className="text-left py-2">Tipo</th><th className="text-left">Host</th><th className="text-left">Esperado</th><th className="text-left">Resuelto</th><th></th></tr>
          </thead>
          <tbody>
            {records?.map(r => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="py-2"><span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{r.type}</span></td>
                <td className="font-mono text-xs">{r.host}</td>
                <td className="font-mono text-xs truncate max-w-xs">{r.expectedValue}</td>
                <td>
                  {r.resolvedValue == null ? (
                    <span className="text-gray-400 text-xs">— sin resolver</span>
                  ) : r.hasMismatch ? (
                    <span className="text-red-600 text-xs">✗ {r.resolvedValue}</span>
                  ) : (
                    <span className="text-green-600 text-xs">✓ {r.resolvedValue}</span>
                  )}
                </td>
                <td>
                  <button onClick={() => { if (confirm('Eliminar registro?')) deleteMutation.mutate(r.id) }}
                    className="text-red-500 hover:text-red-700 text-xs">×</button>
                </td>
              </tr>
            ))}
            {(records?.length ?? 0) === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-gray-400 text-xs">Sin registros</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-xs font-semibold text-gray-600 mb-2">Agregar registro</h4>
        <div className="grid grid-cols-12 gap-2">
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DnsRecordType }))}
            className="col-span-2 border border-gray-300 rounded px-2 py-1.5 text-xs">
            {DNS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" placeholder="host (@ o sub)" value={form.host}
            onChange={e => setForm(f => ({ ...f, host: e.target.value }))}
            className="col-span-2 border border-gray-300 rounded px-2 py-1.5 text-xs font-mono" />
          <input type="text" placeholder="valor esperado" value={form.expectedValue}
            onChange={e => setForm(f => ({ ...f, expectedValue: e.target.value }))}
            className="col-span-6 border border-gray-300 rounded px-2 py-1.5 text-xs font-mono" />
          <button onClick={() => form.host && form.expectedValue && addMutation.mutate(form)}
            disabled={!form.host || !form.expectedValue || addMutation.isPending}
            className="col-span-2 px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}

function SubdomainsTab({ domainId }: { domainId: string }) {
  const queryClient = useQueryClient()
  const { data: subs } = useQuery({ queryKey: ['domains', domainId, 'subdomains'], queryFn: () => getSubdomains(domainId) })
  const { data: deployments } = useQuery({ queryKey: ['deployments'], queryFn: () => getDeployments() })
  const [form, setForm] = useState<CreateSubdomainRequest>({ prefix: '' })

  const addMutation = useMutation({
    mutationFn: (data: CreateSubdomainRequest) => createSubdomain(domainId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['domains', domainId, 'subdomains'] }); setForm({ prefix: '' }) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubdomain(domainId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['domains', domainId, 'subdomains'] }),
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Subdominios</h3>
      <div className="space-y-2 mb-4">
        {subs?.map(s => (
          <div key={s.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
            <div>
              <p className="font-mono text-sm">{s.fullSubdomain}</p>
              {s.deploymentId ? (
                <Link to={`/deployments/${s.deploymentId}`} className="text-xs text-blue-600 hover:underline">
                  → {s.deploymentName}
                </Link>
              ) : (
                <p className="text-xs text-gray-400">Sin deployment vinculado</p>
              )}
              {s.notes && <p className="text-xs text-gray-500 mt-1">{s.notes}</p>}
            </div>
            <button onClick={() => { if (confirm('Eliminar subdominio?')) deleteMutation.mutate(s.id) }}
              className="text-red-500 hover:text-red-700 text-xs">×</button>
          </div>
        ))}
        {(subs?.length ?? 0) === 0 && <p className="text-xs text-gray-400">Sin subdominios</p>}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-xs font-semibold text-gray-600 mb-2">Agregar subdominio</h4>
        <div className="grid grid-cols-12 gap-2">
          <input type="text" placeholder="prefijo (api, www…)" value={form.prefix}
            onChange={e => setForm(f => ({ ...f, prefix: e.target.value.toLowerCase() }))}
            className="col-span-3 border border-gray-300 rounded px-2 py-1.5 text-xs font-mono" />
          <select value={form.deploymentId ?? ''}
            onChange={e => setForm(f => ({ ...f, deploymentId: e.target.value || undefined }))}
            className="col-span-4 border border-gray-300 rounded px-2 py-1.5 text-xs">
            <option value="">Sin deployment</option>
            {deployments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input type="text" placeholder="notas" value={form.notes ?? ''}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value || undefined }))}
            className="col-span-3 border border-gray-300 rounded px-2 py-1.5 text-xs" />
          <button onClick={() => form.prefix && addMutation.mutate(form)}
            disabled={!form.prefix || addMutation.isPending}
            className="col-span-2 px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
            Agregar
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Solo letras minúsculas, dígitos y guiones (sin guion al inicio/fin)</p>
      </div>
    </div>
  )
}

function ChecksTab({ domainId }: { domainId: string }) {
  const queryClient = useQueryClient()
  const { data: checks } = useQuery({ queryKey: ['domains', domainId, 'checks'], queryFn: () => getDomainChecks(domainId) })
  const verifyMutation = useMutation({
    mutationFn: () => verifyDomainOnDemand(domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains', domainId] })
      queryClient.invalidateQueries({ queryKey: ['domains', domainId, 'dns-records'] })
      queryClient.invalidateQueries({ queryKey: ['domains', domainId, 'checks'] })
    },
  })

  const resultColor: Record<string, string> = {
    OK: 'bg-green-100 text-green-700',
    MISMATCH: 'bg-amber-100 text-amber-700',
    UNRESOLVABLE: 'bg-red-100 text-red-700',
    ERROR: 'bg-red-200 text-red-800',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Historial de verificaciones</h3>
        <button onClick={() => verifyMutation.mutate()} disabled={verifyMutation.isPending}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {verifyMutation.isPending ? 'Verificando…' : 'Verificar ahora'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 border-b">
            <tr><th className="text-left py-2">Fecha</th><th className="text-left">Resultado</th><th className="text-left">Mismatches</th><th className="text-left">Origen</th><th className="text-left">Error</th></tr>
          </thead>
          <tbody>
            {checks?.content.map(c => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="py-2 text-xs">{c.checkedAt}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${resultColor[c.result] ?? 'bg-gray-100 text-gray-600'}`}>{c.result}</span></td>
                <td className="text-xs">{c.mismatchCount}</td>
                <td><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{c.triggeredBy}</span></td>
                <td className="text-xs text-gray-500">{c.errorMessage ?? '—'}</td>
              </tr>
            ))}
            {(checks?.content.length ?? 0) === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-gray-400 text-xs">Sin verificaciones</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function DomainDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const { data: domain, isLoading, isError } = useQuery({
    queryKey: ['domains', id], queryFn: () => getDomain(id!), enabled: !!id,
  })
  const deleteMutation = useMutation({
    mutationFn: () => deleteDomain(id!),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['domains'] }); navigate('/domains') },
  })

  if (isLoading) return <AppLayout><div className="p-6 text-sm text-gray-500">Cargando…</div></AppLayout>
  if (isError || !domain) return <AppLayout><div className="p-6 text-sm text-red-600">Dominio no encontrado.</div></AppLayout>

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: 'Info' },
    { key: 'dns', label: 'DNS' },
    { key: 'subdomains', label: 'Subdominios' },
    { key: 'checks', label: 'Verificaciones' },
  ]

  return (
    <AppLayout>
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 font-mono">{domain.fullDomain}</h1>
              <DomainStatusBadge status={domain.effectiveStatus} />
            </div>
            <div className="flex gap-2">
              <Link to="/domains" className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Volver</Link>
              <button onClick={() => { if (confirm(`Eliminar dominio "${domain.fullDomain}"?`)) deleteMutation.mutate() }}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">Eliminar</button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Expira {domain.expiresAt}
            {domain.daysUntilExpiry != null && ` (${domain.daysUntilExpiry < 0 ? `vencido hace ${Math.abs(domain.daysUntilExpiry)} días` : `${domain.daysUntilExpiry} días`})`}
          </p>
        </header>

        <div className="flex gap-2 mb-4 border-b border-gray-200">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'info' && <InfoTab domainId={id!} />}
        {activeTab === 'dns' && <DnsTab domainId={id!} />}
        {activeTab === 'subdomains' && <SubdomainsTab domainId={id!} />}
        {activeTab === 'checks' && <ChecksTab domainId={id!} />}
      </div>
    </AppLayout>
  )
}
