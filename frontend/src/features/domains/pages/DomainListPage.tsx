import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import { DomainStatusBadge } from '../../../components/domains/DomainStatusBadge'
import {
  getDomains, createDomain, getClients,
} from '../../../api/domains.api'
import { getProjects } from '../../../api/projects.api'
import type {
  DomainEffectiveStatus, CreateDomainRequest, Registrar, DnsProvider,
} from '../../../types/domain.types'

const REGISTRARS: Registrar[] = ['DONDOMINIO', 'GODADDY', 'NAMECHEAP', 'CLOUDFLARE', 'GOOGLE', 'IONOS', 'AWS', 'SQUARESPACE', 'OTHER']
const DNS_PROVIDERS: DnsProvider[] = ['CLOUDFLARE', 'VERCEL', 'RENDER', 'GODADDY', 'NAMECHEAP', 'AWS_ROUTE53', 'IONOS', 'OTHER']

function DomainCreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: getClients, enabled: open })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => getProjects(), enabled: open })

  const [form, setForm] = useState<CreateDomainRequest>({
    name: '', tld: 'com', registrar: 'CLOUDFLARE', expiresAt: '',
  })

  const mutation = useMutation({
    mutationFn: (data: CreateDomainRequest) => createDomain(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['domains'] }); onClose() },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.tld || !form.expiresAt || !form.registrar) return
    if (form.registrar === 'OTHER' && !form.registrarLabel) {
      alert('Especifica el nombre del registrar')
      return
    }
    mutation.mutate(form)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-auto"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 my-8" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nuevo dominio</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Nombre *" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase() }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" placeholder="TLD (ej: com) *" required value={form.tld}
                    onChange={e => setForm(f => ({ ...f, tld: e.target.value.toLowerCase() }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <p className="text-xs text-gray-500">Preview: <span className="font-mono">{form.name || 'mi-dominio'}.{form.tld || 'com'}</span></p>

                <select value={form.clientId ?? ''}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Sin cliente</option>
                  {clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select value={form.projectId ?? ''}
                  onChange={e => setForm(f => ({ ...f, projectId: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Sin proyecto</option>
                  {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                <select required value={form.registrar}
                  onChange={e => setForm(f => ({ ...f, registrar: e.target.value as Registrar }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {REGISTRARS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {form.registrar === 'OTHER' && (
                  <input type="text" placeholder="Nombre del registrar *" required value={form.registrarLabel ?? ''}
                    onChange={e => setForm(f => ({ ...f, registrarLabel: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                )}

                <select value={form.dnsProvider ?? ''}
                  onChange={e => setForm(f => ({ ...f, dnsProvider: (e.target.value || undefined) as DnsProvider | undefined }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Sin proveedor DNS</option>
                  {DNS_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Registrado</label>
                    <input type="date" value={form.registeredAt ?? ''}
                      onChange={e => setForm(f => ({ ...f, registeredAt: e.target.value || undefined }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Expira *</label>
                    <input type="date" required value={form.expiresAt}
                      onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.whoisPrivacy ?? false}
                      onChange={e => setForm(f => ({ ...f, whoisPrivacy: e.target.checked }))} />
                    WHOIS privado
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.autoRenewal ?? false}
                      onChange={e => setForm(f => ({ ...f, autoRenewal: e.target.checked }))} />
                    Auto-renovación
                  </label>
                </div>

                <textarea rows={2} placeholder="Notas" value={form.notes ?? ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={onClose}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                  <button type="submit" disabled={mutation.isPending}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {mutation.isPending ? 'Creando…' : 'Crear'}
                  </button>
                </div>
                {mutation.isError && <p className="text-xs text-red-600">Error al crear. Verifica los datos.</p>}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function DomainListPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<DomainEffectiveStatus | null>(null)
  const { data: domains, isLoading } = useQuery({ queryKey: ['domains'], queryFn: getDomains })

  const filtered = statusFilter
    ? (domains ?? []).filter(d => d.effectiveStatus === statusFilter)
    : (domains ?? [])

  return (
    <AppLayout>
      <div className="p-6">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dominios</h1>
          <div className="flex gap-2">
            <Link to="/domains/trash" className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Papelera</Link>
            <button onClick={() => setCreateOpen(true)}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Nuevo dominio
            </button>
          </div>
        </header>

        <div className="flex gap-2 mb-4">
          {([null, 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED'] as (DomainEffectiveStatus | null)[]).map(s => (
            <button key={String(s)} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s === null ? 'Todos' : s === 'ACTIVE' ? 'Activos' : s === 'EXPIRING_SOON' ? 'Por vencer' : 'Vencidos'}
            </button>
          ))}
        </div>

        {isLoading && <div className="text-sm text-gray-500">Cargando…</div>}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-400">Sin dominios</div>
        )}

        <div className="space-y-2">
          {filtered.map(d => {
            const days = d.daysUntilExpiry
            const dayColor = days != null && days < 0 ? 'text-red-600' : days != null && days < 15 ? 'text-amber-600' : 'text-gray-500'
            return (
              <Link key={d.id} to={`/domains/${d.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-medium text-gray-900 truncate">{d.fullDomain}</span>
                      <DomainStatusBadge status={d.effectiveStatus} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {d.registrar}
                      {d.clientName && ` · 👤 ${d.clientName}`}
                      {d.projectName && ` · 📁 ${d.projectName}`}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-700">Expira: {d.expiresAt}</p>
                    {days != null && (
                      <p className={`text-xs ${dayColor}`}>
                        {days < 0 ? `Vencido hace ${Math.abs(days)} días` : `${days} días`}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <DomainCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
      </div>
    </AppLayout>
  )
}
