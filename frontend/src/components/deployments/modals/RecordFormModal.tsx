import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { createDeploymentRecord } from '../../../api/deployments.api'
import type { CreateDeploymentRecordRequest } from '../../../types/deployment.types'

interface Props {
  open: boolean
  onClose: () => void
  deploymentId: string
  defaultUrl?: string
  defaultBranch?: string | null
}

const URL_REGEX = /^https?:\/\/.+/i

export function RecordFormModal({ open, onClose, deploymentId, defaultUrl, defaultBranch }: Props) {
  const queryClient = useQueryClient()
  const [url, setUrl] = useState('')
  const [branch, setBranch] = useState('')
  const [version, setVersion] = useState('')
  const [notes, setNotes] = useState('')
  const [deployedAt, setDeployedAt] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setUrl(defaultUrl ?? '')
    setBranch(defaultBranch ?? '')
    setVersion('')
    setNotes('')
    setDeployedAt('')
    setError(null)
  }, [open, defaultUrl, defaultBranch])

  const mutation = useMutation({
    mutationFn: (data: CreateDeploymentRecordRequest) => createDeploymentRecord(deploymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', deploymentId, 'records'] })
      queryClient.invalidateQueries({ queryKey: ['deployments', deploymentId] })
      onClose()
    },
    onError: () => setError('No se pudo registrar el deploy.'),
  })

  const urlError = url.trim().length > 0 && !URL_REGEX.test(url.trim())
    ? 'La URL debe comenzar con http:// o https://'
    : null

  const isValid = url.trim().length > 0 && !urlError

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isValid) return

    const payload: CreateDeploymentRecordRequest = {
      url: url.trim(),
      branch: branch.trim() || undefined,
      version: version.trim() || undefined,
      notes: notes.trim() || undefined,
      deployedAt: deployedAt ? new Date(deployedAt).toISOString() : undefined,
    }
    mutation.mutate(payload)
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrar deploy manual</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://api.example.com"
                  />
                  {urlError && <p className="text-xs text-red-600 mt-1">{urlError}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      placeholder="main"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={version}
                      onChange={e => setVersion(e.target.value)}
                      placeholder="v1.2.3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha del deploy <span className="text-gray-400 text-xs">(opcional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={deployedAt}
                    onChange={e => setDeployedAt(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Por defecto: ahora.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Cambios incluidos en este deploy"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error}
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
                    {mutation.isPending ? 'Guardando...' : 'Registrar'}
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
