import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  getProjectLinks,
  createProjectLink,
  updateProjectLink,
  deleteProjectLink,
} from '../../../api/projects.api'
import type { ProjectLinkResponse, LinkType } from '../../../types/project.types'
import { ProjectLinkIcon, LINK_TYPE_LABELS } from '../ProjectLinkIcon'

interface Props {
  projectId: string
}

const LINK_TYPES: LinkType[] = [
  'GITHUB', 'DEPLOY', 'STAGING', 'DOCS', 'FIGMA',
  'JIRA', 'LINEAR', 'NOTION', 'TRELLO', 'OTHER',
]

function isValidUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

// ── Link Form Modal ──────────────────────────────────────────────────────────

interface FormProps {
  open: boolean
  onClose: () => void
  projectId: string
  link?: ProjectLinkResponse | null
}

function LinkFormModal({ open, onClose, projectId, link }: FormProps) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(link)
  const [type, setType] = useState<LinkType>('GITHUB')
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setType(link?.type ?? 'GITHUB')
    setLabel(link?.label ?? '')
    setUrl(link?.url ?? '')
    setValidationError(null)
  }, [open, link])

  const createMutation = useMutation({
    mutationFn: () => createProjectLink(projectId, { type, label: label.trim(), url: url.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'links'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => updateProjectLink(projectId, link!.id, {
      type,
      label: label.trim(),
      url: url.trim(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'links'] })
      onClose()
    },
  })

  const mutation = isEdit ? updateMutation : createMutation

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError(null)
    if (!label.trim() || !url.trim()) return
    if (!isValidUrl(url.trim())) {
      setValidationError('La URL debe iniciar con http:// o https://')
      return
    }
    if (isEdit) updateMutation.mutate()
    else createMutation.mutate()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isEdit ? 'Editar link' : 'Nuevo link'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as LinkType)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LINK_TYPES.map(t => (
                      <option key={t} value={t}>{LINK_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etiqueta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Repositorio principal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                {validationError && (
                  <p className="text-xs text-red-600">{validationError}</p>
                )}

                {mutation.isError && !validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    Error al guardar el link. Intenta de nuevo.
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending || !label.trim() || !url.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {mutation.isPending ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
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

// ── Link Row ─────────────────────────────────────────────────────────────────

interface LinkRowProps {
  link: ProjectLinkResponse
  onEdit: () => void
  onDelete: () => void
}

function LinkRow({ link, onEdit, onDelete }: LinkRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3"
    >
      <span className="text-gray-500 flex-shrink-0"><ProjectLinkIcon type={link.type} className="w-5 h-5" /></span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{link.label}</p>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline truncate block"
        >
          {link.url}
        </a>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
        aria-label="Editar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
        aria-label="Eliminar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </motion.div>
  )
}

// ── Main Tab Component ───────────────────────────────────────────────────────

export function ProjectLinksTab({ projectId }: Props) {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectLinkResponse | null>(null)

  const linksQuery = useQuery({
    queryKey: ['projects', projectId, 'links'],
    queryFn: () => getProjectLinks(projectId),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProjectLink(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'links'] })
    },
  })

  function handleDelete(link: ProjectLinkResponse) {
    if (window.confirm(`¿Eliminar el link "${link.label}"?`)) {
      deleteMutation.mutate(link.id)
    }
  }

  // Group by type
  const grouped: Record<string, ProjectLinkResponse[]> = {}
  linksQuery.data?.forEach(l => {
    if (!grouped[l.type]) grouped[l.type] = []
    grouped[l.type].push(l)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Links del proyecto</h2>
          {linksQuery.data && (
            <p className="text-xs text-gray-500 mt-0.5">{linksQuery.data.length} link{linksQuery.data.length === 1 ? '' : 's'}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setFormOpen(true) }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar link
        </button>
      </div>

      {linksQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Error al cargar los links.
        </div>
      )}

      {linksQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {linksQuery.data && linksQuery.data.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-sm font-medium">Sin links</p>
          <p className="text-xs mt-1">Agrega referencias externas: repos, deploys, docs, etc.</p>
        </div>
      )}

      {linksQuery.data && linksQuery.data.length > 0 && (
        <div className="space-y-5">
          {LINK_TYPES.filter(t => grouped[t]?.length).map(t => (
            <section key={t}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {LINK_TYPE_LABELS[t]}
              </h3>
              <AnimatePresence initial={false}>
                <div className="space-y-2">
                  {grouped[t].map(l => (
                    <LinkRow
                      key={l.id}
                      link={l}
                      onEdit={() => { setEditing(l); setFormOpen(true) }}
                      onDelete={() => handleDelete(l)}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </section>
          ))}
        </div>
      )}

      <LinkFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        projectId={projectId}
        link={editing}
      />
    </div>
  )
}
