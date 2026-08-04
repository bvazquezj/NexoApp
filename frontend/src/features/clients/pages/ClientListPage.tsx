import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '../../../components/layout/AppLayout'
import { getClients, createClient, updateClient, deleteClient } from '../../../api/domains.api'
import type { ClientResponse, CreateClientRequest, UpdateClientRequest } from '../../../types/domain.types'

function ClientFormModal({ open, onClose, client }: { open: boolean; onClose: () => void; client?: ClientResponse }) {
  const queryClient = useQueryClient()
  const isEdit = !!client
  const [form, setForm] = useState<CreateClientRequest>({
    name: '', email: undefined, phone: undefined, company: undefined, website: undefined, notes: undefined,
  })

  // Reset form cuando el modal se abre con otro cliente (o se abre para crear).
  useEffect(() => {
    if (!open) return
    setForm({
      name: client?.name ?? '',
      email: client?.email ?? undefined,
      phone: client?.phone ?? undefined,
      company: client?.company ?? undefined,
      website: client?.website ?? undefined,
      notes: client?.notes ?? undefined,
    })
  }, [open, client])

  const createMutation = useMutation({
    mutationFn: (data: CreateClientRequest) => createClient(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); onClose() },
  })
  const updateMutation = useMutation({
    mutationFn: (data: UpdateClientRequest) => updateClient(client!.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); onClose() },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    const data = { ...form }
    if (isEdit) updateMutation.mutate(data); else createMutation.mutate(data)
  }

  const pending = createMutation.isPending || updateMutation.isPending

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Nombre *" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <input type="email" placeholder="Email" value={form.email ?? ''}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <input type="text" placeholder="Teléfono" value={form.phone ?? ''}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <input type="text" placeholder="Empresa" value={form.company ?? ''}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <input type="url" placeholder="Sitio web" value={form.website ?? ''}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <textarea rows={3} placeholder="Notas" value={form.notes ?? ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={onClose}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                  <button type="submit" disabled={pending}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {pending ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function ClientListPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ClientResponse | undefined>()
  const { data: clients, isLoading } = useQuery({ queryKey: ['clients'], queryFn: getClients })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  return (
    <AppLayout>
      <div className="p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <div className="flex gap-2">
            <Link to="/clients/trash" className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Papelera</Link>
            <button onClick={() => { setEditTarget(undefined); setFormOpen(true) }}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Nuevo cliente
            </button>
          </div>
        </header>

        {isLoading && <div className="text-sm text-gray-500">Cargando…</div>}

        {clients && clients.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">Sin clientes aún. Crea uno con el botón de arriba.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients?.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.name}</h3>
                  {c.company && <p className="text-xs text-gray-500">{c.company}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditTarget(c); setFormOpen(true) }}
                    className="p-1 text-gray-400 hover:text-blue-600" aria-label="Editar">✏️</button>
                  <button onClick={() => { if (confirm(`Eliminar cliente "${c.name}"?`)) deleteMutation.mutate(c.id) }}
                    className="p-1 text-gray-400 hover:text-red-600" aria-label="Eliminar">🗑️</button>
                </div>
              </div>
              {c.email && <p className="text-xs text-gray-600 mb-1">📧 {c.email}</p>}
              {c.phone && <p className="text-xs text-gray-600 mb-1">📞 {c.phone}</p>}
              {c.website && <p className="text-xs text-gray-600 mb-3 truncate">🌐 {c.website}</p>}
              <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{c.domainCount} dominios</span>
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{c.projectCount} proyectos</span>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{c.taskCount} tareas</span>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{c.deploymentCount} deploys</span>
              </div>
            </div>
          ))}
        </div>

        <ClientFormModal open={formOpen} onClose={() => setFormOpen(false)} client={editTarget} />
      </div>
    </AppLayout>
  )
}
