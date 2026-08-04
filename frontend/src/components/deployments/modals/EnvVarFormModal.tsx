import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { createEnvVar, updateEnvVar } from '../../../api/deployments.api'
import type {
  CreateEnvVarRequest,
  UpdateEnvVarRequest,
  DeploymentEnvVarResponse,
  EnvVarType,
} from '../../../types/deployment.types'

interface Props {
  open: boolean
  onClose: () => void
  deploymentId: string
  envVar?: DeploymentEnvVarResponse | null
}

const KEY_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/

export function EnvVarFormModal({ open, onClose, deploymentId, envVar }: Props) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(envVar)

  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [type, setType] = useState<EnvVarType>('PUBLIC')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setKey(envVar?.key ?? '')
    // For SECRET we never receive the real value (masked); leave blank.
    setValue(envVar && envVar.type === 'PUBLIC' ? envVar.value : '')
    setType(envVar?.type ?? 'PUBLIC')
    setError(null)
  }, [open, envVar])

  const createMutation = useMutation({
    mutationFn: (data: CreateEnvVarRequest) => createEnvVar(deploymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', deploymentId, 'env-vars'] })
      onClose()
    },
    onError: () => setError('No se pudo guardar la variable.'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEnvVarRequest) => updateEnvVar(deploymentId, envVar!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', deploymentId, 'env-vars'] })
      onClose()
    },
    onError: () => setError('No se pudo actualizar la variable.'),
  })

  const mutation = isEdit ? updateMutation : createMutation
  const trimmedKey = key.trim()
  const keyError = trimmedKey.length > 0 && !KEY_REGEX.test(trimmedKey)
    ? 'La key solo puede contener letras, números y guiones bajos. Debe empezar con letra o _.'
    : null

  const isValid = !isEdit
    ? trimmedKey.length > 0 && !keyError && value.length > 0
    : value.length > 0 || type !== envVar!.type

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (isEdit) {
      const payload: UpdateEnvVarRequest = {}
      if (value.length > 0) payload.value = value
      if (type !== envVar!.type) payload.type = type
      if (Object.keys(payload).length === 0) {
        setError('No hay cambios para guardar.')
        return
      }
      updateMutation.mutate(payload)
    } else {
      if (trimmedKey.length === 0 || keyError) return
      createMutation.mutate({ key: trimmedKey, value, type })
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
                {isEdit ? 'Editar variable' : 'Agregar variable'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key {!isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    required={!isEdit}
                    disabled={isEdit}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    value={key}
                    onChange={e => setKey(e.target.value.toUpperCase())}
                    placeholder="DATABASE_URL"
                  />
                  {keyError && <p className="text-xs text-red-600 mt-1">{keyError}</p>}
                  {isEdit && <p className="text-xs text-gray-400 mt-1">La key no se puede modificar.</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value {!isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={type === 'SECRET' ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder={isEdit ? 'Dejar vacío para no cambiarlo' : 'Valor'}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                    {(['PUBLIC', 'SECRET'] as EnvVarType[]).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                          type === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {type === 'SECRET'
                      ? 'El valor se almacena cifrado y permanece oculto en la UI.'
                      : 'El valor se almacena en texto plano y es visible.'}
                  </p>
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
                    {mutation.isPending ? 'Guardando...' : isEdit ? 'Guardar' : 'Agregar'}
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
