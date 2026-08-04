import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  configurePlatformApi,
  copyPlatformToken,
  listPlatformTokens,
} from '../../../api/deployments.api'
import { PLATFORM_LABELS } from '../PlatformIcon'
import type { DeploymentPlatform } from '../../../types/deployment.types'

interface Props {
  open: boolean
  onClose: () => void
  deploymentId: string
  platform: DeploymentPlatform
  currentServiceId: string | null
  hasToken: boolean
}

type Mode = 'set' | 'copy'

export function ConfigurePlatformTokenModal({
  open,
  onClose,
  deploymentId,
  platform,
  currentServiceId,
  hasToken,
}: Props) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<Mode>('set')
  const [token, setToken] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Sources to copy from: other deployments with same platform that already have a token.
  const sourcesQuery = useQuery({
    queryKey: ['deployments', 'platform-tokens', platform],
    queryFn: () => listPlatformTokens(platform),
    enabled: open,
  })

  const candidateSources = sourcesQuery.data?.filter(
    s => s.hasToken && s.deploymentId !== deploymentId
  ) ?? []

  useEffect(() => {
    if (!open) return
    setMode('set')
    setToken('')
    setServiceId(currentServiceId ?? '')
    setSourceId('')
    setError(null)
  }, [open, currentServiceId])

  // Pre-select a source when switching to copy mode
  useEffect(() => {
    if (mode === 'copy' && !sourceId && candidateSources.length > 0) {
      setSourceId(candidateSources[0].deploymentId)
    }
  }, [mode, sourceId, candidateSources])

  const setMutation = useMutation({
    mutationFn: () => configurePlatformApi(deploymentId, {
      token: token.trim(),
      platformServiceId: serviceId.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', deploymentId] })
      queryClient.invalidateQueries({ queryKey: ['deployments', 'platform-tokens'] })
      onClose()
    },
    onError: () => setError('No se pudo guardar el token.'),
  })

  const copyMutation = useMutation({
    mutationFn: () => copyPlatformToken(deploymentId, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', deploymentId] })
      queryClient.invalidateQueries({ queryKey: ['deployments', 'platform-tokens'] })
      onClose()
    },
    onError: () => setError('No se pudo copiar el token.'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (mode === 'set') {
      if (token.trim().length === 0) {
        setError('El token es obligatorio.')
        return
      }
      setMutation.mutate()
    } else {
      if (!sourceId) {
        setError('Selecciona un deployment de origen.')
        return
      }
      copyMutation.mutate()
    }
  }

  const isPending = setMutation.isPending || copyMutation.isPending

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
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Configurar token de {PLATFORM_LABELS[platform]}
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                {hasToken ? 'Ya existe un token configurado. Puedes reemplazarlo.' : 'Aún no hay token configurado.'}
              </p>

              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden mb-5">
                <button
                  type="button"
                  onClick={() => setMode('set')}
                  className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                    mode === 'set' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Ingresar token
                </button>
                <button
                  type="button"
                  onClick={() => setMode('copy')}
                  disabled={candidateSources.length === 0}
                  className={`px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    mode === 'copy' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title={candidateSources.length === 0 ? 'No hay otros deployments con esta plataforma' : ''}
                >
                  Copiar de otro deployment
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'set' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Token <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        // type=password no aplica a textarea — usamos css para enmascarar visualmente
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ WebkitTextSecurity: 'disc' } as React.CSSProperties}
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        placeholder="Pega el token aquí"
                        autoComplete="off"
                      />
                      <p className="text-xs text-gray-400 mt-1">El token se cifra antes de almacenarse.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Platform Service ID <span className="text-gray-400 text-xs">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={serviceId}
                        onChange={e => setServiceId(e.target.value)}
                        placeholder="ID del servicio/proyecto en la plataforma"
                      />
                    </div>
                  </>
                )}

                {mode === 'copy' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deployment de origen
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sourceId}
                      onChange={e => setSourceId(e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {candidateSources.map(s => (
                        <option key={s.deploymentId} value={s.deploymentId}>
                          {s.name} {s.platformServiceId ? `· ${s.platformServiceId}` : ''}
                        </option>
                      ))}
                    </select>
                    {sourcesQuery.isLoading && (
                      <p className="text-xs text-gray-400 mt-1">Cargando fuentes...</p>
                    )}
                  </div>
                )}

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
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isPending ? 'Guardando...' : 'Guardar'}
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
