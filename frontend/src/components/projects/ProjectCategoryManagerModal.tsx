import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import {
  getProjectCategories,
  createProjectCategory,
  updateProjectCategory,
  deleteProjectCategory,
} from '../../api/projects.api'
import type { ProjectCategoryResponse } from '../../types/project.types'

interface Props {
  open: boolean
  onClose: () => void
}

interface CategoryRowProps {
  category: ProjectCategoryResponse
  onEdit: (c: ProjectCategoryResponse) => void
  onDelete: (c: ProjectCategoryResponse) => void
}

function CategoryRow({ category, onEdit, onDelete }: CategoryRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2"
    >
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: category.color }}
      />
      <span className="text-sm font-medium text-gray-800 flex-1 truncate">
        {category.name}
      </span>
      <button
        type="button"
        onClick={() => onEdit(category)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        aria-label="Editar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onDelete(category)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        aria-label="Eliminar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </motion.div>
  )
}

export function ProjectCategoryManagerModal({ open, onClose }: Props) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<ProjectCategoryResponse | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const categoriesQuery = useQuery({
    queryKey: ['projects', 'categories'],
    queryFn: getProjectCategories,
    enabled: open,
  })

  useEffect(() => {
    if (!open) {
      setEditing(null)
      setName('')
      setColor('#3b82f6')
      setFormError(null)
      setDeleteError(null)
    }
  }, [open])

  function resetForm() {
    setEditing(null)
    setName('')
    setColor('#3b82f6')
    setFormError(null)
  }

  function openEdit(c: ProjectCategoryResponse) {
    setEditing(c)
    setName(c.name)
    setColor(c.color)
    setFormError(null)
  }

  const createMutation = useMutation({
    mutationFn: () => createProjectCategory({ name: name.trim(), color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'categories'] })
      resetForm()
    },
    onError: () => setFormError('Error al crear la categoría. Intenta de nuevo.'),
  })

  const updateMutation = useMutation({
    mutationFn: () => updateProjectCategory(editing!.id, { name: name.trim(), color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'categories'] })
      resetForm()
    },
    onError: () => setFormError('Error al actualizar la categoría. Intenta de nuevo.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProjectCategory(id),
    onSuccess: () => {
      setDeleteError(null)
      queryClient.invalidateQueries({ queryKey: ['projects', 'categories'] })
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setDeleteError('No puedes eliminar esta categoría porque tiene proyectos asociados.')
      } else {
        setDeleteError('Error al eliminar la categoría. Intenta de nuevo.')
      }
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!name.trim()) return
    if (editing) updateMutation.mutate()
    else createMutation.mutate()
  }

  function handleDelete(c: ProjectCategoryResponse) {
    if (window.confirm(`¿Eliminar la categoría "${c.name}"?`)) {
      deleteMutation.mutate(c.id)
    }
  }

  const systemCategories = categoriesQuery.data?.filter(c => c.isSystem) ?? []
  const userCategories = categoriesQuery.data?.filter(c => !c.isSystem) ?? []
  const mutation = editing ? updateMutation : createMutation
  const trimmedName = name.trim()
  const isValid = trimmedName.length > 0 && trimmedName.length <= 80

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Categorías de proyecto</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* System categories */}
              <section className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Categorías del sistema</h3>
                {categoriesQuery.isLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-7 w-24 rounded-full bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : systemCategories.length === 0 ? (
                  <p className="text-xs text-gray-400">Sin categorías del sistema.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {systemCategories.map(c => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-700"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* User categories */}
              <section className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tus categorías</h3>
                {categoriesQuery.isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : userCategories.length === 0 ? (
                  <p className="text-xs text-gray-400">No tienes categorías personalizadas.</p>
                ) : (
                  <AnimatePresence initial={false}>
                    <div className="space-y-2">
                      {userCategories.map(c => (
                        <CategoryRow
                          key={c.id}
                          category={c}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                )}
                {deleteError && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {deleteError}
                  </div>
                )}
              </section>

              {/* Create/Edit form */}
              <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  {editing ? `Editar "${editing.name}"` : 'Nueva categoría'}
                </h3>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ej: Cliente, Personal..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                    <input
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="h-10 w-14 rounded-lg border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  {editing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!isValid || mutation.isPending}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {mutation.isPending ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
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
