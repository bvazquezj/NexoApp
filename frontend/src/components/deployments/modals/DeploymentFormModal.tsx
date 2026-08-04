import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { createDeployment, updateDeployment } from '../../../api/deployments.api'
import { getProjects } from '../../../api/projects.api'
import { PLATFORM_LABELS } from '../PlatformIcon'
import type {
  DeploymentResponse,
  CreateDeploymentRequest,
  UpdateDeploymentRequest,
  DeploymentEnvironment,
  DeploymentPlatform,
} from '../../../types/deployment.types'

interface Props {
  open: boolean
  onClose: () => void
  deployment?: DeploymentResponse | null
  /** Pre-select a project when creating from a context that already knows the project. */
  defaultProjectId?: string
}

const ENVIRONMENTS: DeploymentEnvironment[] = ['DEV', 'STAGING', 'PROD']
const PLATFORMS: DeploymentPlatform[] = ['VERCEL', 'RENDER', 'FLYIO', 'AWS', 'RAILWAY', 'NETLIFY', 'OTHER']

const URL_REGEX = /^https?:\/\/.+/i

export function DeploymentFormModal({ open, onClose, deployment, defaultProjectId }: Props) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(deployment)

  const [name, setName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [environment, setEnvironment] = useState<DeploymentEnvironment>('DEV')
  const [platform, setPlatform] = useState<DeploymentPlatform>('VERCEL')
  const [platformLabel, setPlatformLabel] = useState('')
  const [url, setUrl] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('')
  const [version, setVersion] = useState('')
  const [healthCheckEnabled, setHealthCheckEnabled] = useState(true)
  const [healthCheckIntervalMinutes, setHealthCheckIntervalMinutes] = useState(5)
  const [notifyOnDown, setNotifyOnDown] = useState(true)
  const [notifyOnRecovery, setNotifyOnRecovery] = useState(true)
  const [notifyOnDegraded, setNotifyOnDegraded] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const projectsQuery = useQuery({
    queryKey: ['projects', { status: undefined }],
    queryFn: () => getProjects(),
    enabled: open,
  })

  useEffect(() => {
    if (!open) return
    setName(deployment?.name ?? '')
    setProjectId(deployment?.projectId ?? defaultProjectId ?? '')
    setEnvironment(deployment?.environment ?? 'DEV')
    setPlatform(deployment?.platform ?? 'VERCEL')
    setPlatformLabel(deployment?.platformLabel ?? '')
    setUrl(deployment?.url ?? '')
    setRepoUrl(deployment?.repoUrl ?? '')
    setBranch(deployment?.branch ?? '')
    setVersion(deployment?.version ?? '')
    setHealthCheckEnabled(deployment?.healthCheckEnabled ?? true)
    setHealthCheckIntervalMinutes(deployment?.healthCheckIntervalMinutes ?? 5)
    setNotifyOnDown(deployment?.notifyOnDown ?? true)
    setNotifyOnRecovery(deployment?.notifyOnRecovery ?? true)
    setNotifyOnDegraded(deployment?.notifyOnDegraded ?? false)
    setNotes(deployment?.notes ?? '')
    setError(null)
  }, [open, deployment, defaultProjectId])

  // Default project when creating
  useEffect(() => {
    if (open && !isEdit && !projectId && projectsQuery.data && projectsQuery.data.length > 0) {
      setProjectId(projectsQuery.data[0].id)
    }
  }, [open, isEdit, projectId, projectsQuery.data])

  const createMutation = useMutation({
    mutationFn: (data: CreateDeploymentRequest) => createDeployment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      onClose()
    },
    onError: () => setError('Error al crear el deployment. Intenta de nuevo.'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDeploymentRequest) => updateDeployment(deployment!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      queryClient.invalidateQueries({ queryKey: ['deployments', deployment!.id] })
      onClose()
    },
    onError: () => setError('Error al actualizar el deployment. Intenta de nuevo.'),
  })

  const mutation = isEdit ? updateMutation : createMutation
  const trimmedName = name.trim()
  const trimmedUrl = url.trim()
  const trimmedRepo = repoUrl.trim()

  const urlError = trimmedUrl.length > 0 && !URL_REGEX.test(trimmedUrl)
    ? 'La URL debe comenzar con http:// o https://'
    : null
  const repoError = trimmedRepo.length > 0 && !URL_REGEX.test(trimmedRepo)
    ? 'La URL del repo debe comenzar con http:// o https://'
    : null
  const intervalError = healthCheckIntervalMinutes < 1 || healthCheckIntervalMinutes > 60
    ? 'El intervalo debe estar entre 1 y 60 minutos'
    : null

  const isValid =
    trimmedName.length > 0 &&
    trimmedName.length <= 150 &&
    projectId.length > 0 &&
    trimmedUrl.length > 0 &&
    !urlError &&
    !repoError &&
    !intervalError

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isValid) return

    if (isEdit) {
      const payload: UpdateDeploymentRequest = {
        name: trimmedName,
        projectId,
        environment,
        platform,
        platformLabel: platformLabel.trim() || undefined,
        url: trimmedUrl,
        repoUrl: trimmedRepo || undefined,
        branch: branch.trim() || undefined,
        version: version.trim() || undefined,
        healthCheckEnabled,
        healthCheckIntervalMinutes,
        notifyOnDown,
        notifyOnRecovery,
        notifyOnDegraded,
        notes: notes.trim() || undefined,
      }
      updateMutation.mutate(payload)
    } else {
      const payload: CreateDeploymentRequest = {
        name: trimmedName,
        projectId,
        environment,
        platform,
        platformLabel: platformLabel.trim() || undefined,
        url: trimmedUrl,
        repoUrl: trimmedRepo || undefined,
        branch: branch.trim() || undefined,
        version: version.trim() || undefined,
        healthCheckEnabled,
        healthCheckIntervalMinutes,
        notifyOnDown,
        notifyOnRecovery,
        notifyOnDegraded,
        notes: notes.trim() || undefined,
      }
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
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isEdit ? 'Editar deployment' : 'Nuevo deployment'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      placeholder="api-prod"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proyecto <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={projectId}
                      onChange={e => setProjectId(e.target.value)}
                    >
                      <option value="">Seleccionar proyecto</option>
                      {projectsQuery.data?.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                    {ENVIRONMENTS.map(env => (
                      <button
                        key={env}
                        type="button"
                        onClick={() => setEnvironment(env)}
                        className={`px-4 py-1.5 text-xs font-semibold uppercase transition-colors ${
                          environment === env
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={platform}
                      onChange={e => setPlatform(e.target.value as DeploymentPlatform)}
                    >
                      {PLATFORMS.map(p => (
                        <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etiqueta de plataforma <span className="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={platformLabel}
                      onChange={e => setPlatformLabel(e.target.value)}
                      placeholder="ej: web-app-prod"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL pública <span className="text-red-500">*</span>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repo URL <span className="text-gray-400 text-xs">(opcional)</span>
                  </label>
                  <input
                    type="url"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/repo"
                  />
                  {repoError && <p className="text-xs text-red-600 mt-1">{repoError}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch <span className="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      placeholder="main"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Version <span className="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={version}
                      onChange={e => setVersion(e.target.value)}
                      placeholder="v1.2.3"
                    />
                  </div>
                </div>

                <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <legend className="text-sm font-semibold text-gray-700 px-2">Health check</legend>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={healthCheckEnabled}
                      onChange={e => setHealthCheckEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    Activar health check
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intervalo (minutos)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      disabled={!healthCheckEnabled}
                      className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                      value={healthCheckIntervalMinutes}
                      onChange={e => setHealthCheckIntervalMinutes(Number(e.target.value))}
                    />
                    {intervalError && <p className="text-xs text-red-600 mt-1">{intervalError}</p>}
                  </div>
                </fieldset>

                <fieldset className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <legend className="text-sm font-semibold text-gray-700 px-2">Notificaciones</legend>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnDown}
                      onChange={e => setNotifyOnDown(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    Notificar cuando caiga (DOWN)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnRecovery}
                      onChange={e => setNotifyOnRecovery(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    Notificar cuando se recupere
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnDegraded}
                      onChange={e => setNotifyOnDegraded(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    Notificar en estado degradado
                  </label>
                </fieldset>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas <span className="text-gray-400 text-xs">(opcional)</span>
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Notas internas sobre este deployment"
                  />
                </div>

                {(error || mutation.isError) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error ?? 'Error al guardar el deployment.'}
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
                    {mutation.isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear deployment'}
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
