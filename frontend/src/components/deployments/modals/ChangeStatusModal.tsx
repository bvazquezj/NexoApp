import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { changeDeploymentStatus } from '../../../api/deployments.api'
import { DEPLOYMENT_STATUS_LABELS } from '../DeploymentStatusBadge'
import type { DeploymentStatus, ChangeDeploymentStatusRequest } from '../../../types/deployment.types'

type AllowedStatus = ChangeDeploymentStatusRequest['status']

const OPTIONS: { value: AllowedStatus; description: string }[] = [
  { value: 'ACTIVE', description: 'Marcar como activo (manual)' },
  { value: 'INACTIVE', description: 'Pausar el deployment y detener health checks' },
  { value: 'UNKNOWN', description: 'Forzará un health check inmediato' },
]

interface Props {
  open: boolean
  onClose: () => void
  deploymentId: string
  currentStatus: DeploymentStatus
}

export function ChangeStatusModal({ open, onClose, deploymentId, currentStatus }: Props) {
  const queryClient = useQueryClient()
  const initial: AllowedStatus = OPTIONS.find(o => o.value === currentStatus)?.value ?? 'ACTIVE'
  const [selected, setSelected] = useState<AllowedStatus>(initial)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSelected(OPTIONS.find(o => o.value === currentStatus)?.value ?? 'ACTIVE')
      setError(null)
    }
  }, [open, currentStatus])

  const mutation = useMutation({
    mutationFn: (status: AllowedStatus) => changeDeploymentStatus(deploymentId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      queryClient.invalidateQueries({ queryKey: ['deployments', deploymentId] })
      onClose()
    },
    onError: () => setError('No se pudo cambiar el estado.'),
  })

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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar estado</h2>
              <p className="text-xs text-gray-500 mb-3">
                Estado actual: <span className="font-medium">{DEPLOYMENT_STATUS_LABELS[currentStatus]}</span>
              </p>

              <div className="space-y-2 mb-4">
                {OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selected === opt.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={selected === opt.value}
                      onChange={() => setSelected(opt.value)}
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {DEPLOYMENT_STATUS_LABELS[opt.value]}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate(selected)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {mutation.isPending ? 'Guardando...' : 'Aplicar'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
