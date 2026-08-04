import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { createIteration, updateIteration } from '../../api/projects.api'
import type {
  ProjectIterationResponse,
  CreateIterationRequest,
  UpdateIterationRequest,
} from '../../types/project.types'

interface Props {
  open: boolean
  onClose: () => void
  projectId: string
  iteration?: ProjectIterationResponse | null
}

export function IterationFormModal({ open, onClose, projectId, iteration }: Props) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(iteration)

  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (!open) return
    setName(iteration?.name ?? '')
    setGoal(iteration?.goal ?? '')
    setStartDate(iteration?.startDate ?? '')
    setEndDate(iteration?.endDate ?? '')
  }, [open, iteration])

  const dateError = startDate && endDate && startDate > endDate
    ? 'La fecha de inicio no puede ser posterior a la fecha de fin'
    : null

  const createMutation = useMutation({
    mutationFn: (data: CreateIterationRequest) => createIteration(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'iterations'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateIterationRequest) =>
      updateIteration(projectId, iteration!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'iterations'] })
      onClose()
    },
  })

  const mutation = isEdit ? updateMutation : createMutation

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (dateError) return

    const payload: CreateIterationRequest | UpdateIterationRequest = {}
    if (name.trim()) payload.name = name.trim()
    if (goal.trim()) payload.goal = goal.trim()
    if (startDate) payload.startDate = startDate
    if (endDate) payload.endDate = endDate

    if (isEdit) updateMutation.mutate(payload)
    else createMutation.mutate(payload)
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
                {isEdit ? 'Editar iteración' : 'Nueva iteración'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    maxLength={120}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej: Sprint MVP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    placeholder="Objetivo de esta iteración"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {dateError && (
                  <p className="text-xs text-red-600">{dateError}</p>
                )}

                {mutation.isError && !dateError && (
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
                    disabled={mutation.isPending || !!dateError}
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
