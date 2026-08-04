import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  getProjectCategories,
  createProject,
  updateProject,
} from '../../api/projects.api'
import type {
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../../types/project.types'

interface Props {
  open: boolean
  onClose: () => void
  project?: ProjectResponse | null
}

export function ProjectFormModal({ open, onClose, project }: Props) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(project)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  const categoriesQuery = useQuery({
    queryKey: ['projects', 'categories'],
    queryFn: getProjectCategories,
    enabled: open,
  })

  useEffect(() => {
    if (!open) return
    setName(project?.name ?? '')
    setDescription(project?.description ?? '')
    setCategoryId(project?.category.id ?? '')
    setStartDate(project?.startDate ?? '')
    setDueDate(project?.dueDate ?? '')
    setError(null)
  }, [open, project])

  // Default category if none chosen yet
  useEffect(() => {
    if (open && !categoryId && categoriesQuery.data && categoriesQuery.data.length > 0) {
      setCategoryId(categoriesQuery.data[0].id)
    }
  }, [open, categoryId, categoriesQuery.data])

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      onClose()
    },
    onError: () => setError('Error al crear el proyecto. Intenta de nuevo.'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProjectRequest) => updateProject(project!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', project!.id] })
      onClose()
    },
    onError: () => setError('Error al actualizar el proyecto. Intenta de nuevo.'),
  })

  const mutation = isEdit ? updateMutation : createMutation
  const trimmedName = name.trim()
  const dateError = startDate && dueDate && startDate > dueDate
    ? 'La fecha de inicio no puede ser posterior a la fecha de entrega'
    : null

  const isValid =
    trimmedName.length > 0 &&
    trimmedName.length <= 150 &&
    categoryId.length > 0 &&
    dueDate.length > 0 &&
    !dateError

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isValid) return

    if (isEdit) {
      const payload: UpdateProjectRequest = {
        name: trimmedName,
        description: description.trim() || undefined,
        categoryId,
        dueDate,
      }
      if (startDate) payload.startDate = startDate
      updateMutation.mutate(payload)
    } else {
      const payload: CreateProjectRequest = {
        name: trimmedName,
        description: description.trim() || undefined,
        categoryId,
        dueDate,
      }
      if (startDate) payload.startDate = startDate
      createMutation.mutate(payload)
    }
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
              className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nombre del proyecto"
                  />
                  <p className="text-xs text-gray-400 mt-1">{name.length}/150</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descripción (soporta Markdown)"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Soporta <span className="font-medium">Markdown</span>: **negrita**, *cursiva*, `código`, listas, etc.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categoriesQuery.data?.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha entrega <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                {dateError && (
                  <p className="text-xs text-red-600">{dateError}</p>
                )}

                {(error || mutation.isError) && !dateError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error ?? 'Error al guardar el proyecto.'}
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending || !isValid}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {mutation.isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proyecto'}
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
