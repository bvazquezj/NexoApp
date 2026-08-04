import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getProjectNotes,
  createProjectNote,
  updateProjectNote,
  deleteProjectNote,
} from '../../../api/projects.api'
import type { ProjectNoteResponse } from '../../../types/project.types'

interface Props {
  projectId: string
}

// ── Note Form Modal ──────────────────────────────────────────────────────────

interface NoteFormProps {
  open: boolean
  onClose: () => void
  projectId: string
  note?: ProjectNoteResponse | null
}

function NoteFormModal({ open, onClose, projectId, note }: NoteFormProps) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(note)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(note?.title ?? '')
    setBody(note?.body ?? '')
  }, [open, note])

  const createMutation = useMutation({
    mutationFn: () => createProjectNote(projectId, {
      title: title.trim() || undefined,
      body: body.trim(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'notes'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => updateProjectNote(projectId, note!.id, {
      title: title.trim() || undefined,
      body: body.trim(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'notes'] })
      onClose()
    },
  })

  const mutation = isEdit ? updateMutation : createMutation

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
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
              className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isEdit ? 'Editar entrada' : 'Nueva entrada de diario'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título (opcional)</label>
                  <input
                    type="text"
                    maxLength={200}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ej: Día 1 - Setup del proyecto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenido <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={10}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Escribe tu entrada de diario (soporta Markdown)..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Soporta Markdown completo (GFM)</p>
                </div>

                {mutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    Error al guardar. Intenta de nuevo.
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
                    disabled={mutation.isPending || !body.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {mutation.isPending ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear entrada'}
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

// ── Note Item ────────────────────────────────────────────────────────────────

interface NoteItemProps {
  note: ProjectNoteResponse
  onEdit: () => void
  onDelete: () => void
}

function NoteItem({ note, onEdit, onDelete }: NoteItemProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-xl border border-gray-200 p-5"
    >
      <header className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          {note.title && (
            <h3 className="font-semibold text-gray-900">{note.title}</h3>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDistanceToNow(parseISO(note.createdAt), { locale: es, addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-1">
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
        </div>
      </header>
      <div className="markdown-body text-sm text-gray-700 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.body}</ReactMarkdown>
      </div>
    </motion.article>
  )
}

// ── Main Tab Component ───────────────────────────────────────────────────────

export function ProjectNotesTab({ projectId }: Props) {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectNoteResponse | null>(null)

  const notesQuery = useQuery({
    queryKey: ['projects', projectId, 'notes'],
    queryFn: () => getProjectNotes(projectId),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProjectNote(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'notes'] })
    },
  })

  function handleDelete(note: ProjectNoteResponse) {
    if (window.confirm('¿Eliminar esta entrada?\n\nEliminación definitiva, no se restaura.')) {
      deleteMutation.mutate(note.id)
    }
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(note: ProjectNoteResponse) {
    setEditing(note)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Diario del proyecto</h2>
          {notesQuery.data && (
            <p className="text-xs text-gray-500 mt-0.5">
              {notesQuery.data.length} entrada{notesQuery.data.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva entrada
        </button>
      </div>

      {notesQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Error al cargar el diario.
        </div>
      )}

      {notesQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

      {notesQuery.data && notesQuery.data.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-sm font-medium">Sin entradas todavía</p>
          <p className="text-xs mt-1">Documenta tu progreso con la primera entrada</p>
        </div>
      )}

      {notesQuery.data && notesQuery.data.length > 0 && (
        <AnimatePresence initial={false}>
          <div className="space-y-3">
            {notesQuery.data.map(n => (
              <NoteItem
                key={n.id}
                note={n}
                onEdit={() => openEdit(n)}
                onDelete={() => handleDelete(n)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      <NoteFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        projectId={projectId}
        note={editing}
      />
    </div>
  )
}
