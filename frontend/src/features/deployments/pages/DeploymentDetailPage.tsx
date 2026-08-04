import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../../../components/layout/AppLayout'
import { DeploymentStatusBadge } from '../../../components/deployments/DeploymentStatusBadge'
import { EnvironmentBadge } from '../../../components/deployments/EnvironmentBadge'
import { PlatformIcon } from '../../../components/deployments/PlatformIcon'
import { DeploymentDetailSubNav } from '../../../components/deployments/DeploymentDetailSubNav'
import { DeploymentFormModal } from '../../../components/deployments/modals/DeploymentFormModal'
import { ChangeStatusModal } from '../../../components/deployments/modals/ChangeStatusModal'
import { ConfigurePlatformTokenModal } from '../../../components/deployments/modals/ConfigurePlatformTokenModal'
import { DeploymentOverviewTab } from '../../../components/deployments/tabs/DeploymentOverviewTab'
import { DeploymentHealthTab } from '../../../components/deployments/tabs/DeploymentHealthTab'
import { DeploymentDeploysTab } from '../../../components/deployments/tabs/DeploymentDeploysTab'
import { DeploymentVariablesTab } from '../../../components/deployments/tabs/DeploymentVariablesTab'
import { useDeploymentStore } from '../../../stores/useDeploymentStore'
import { getDeployment, deleteDeployment } from '../../../api/deployments.api'
import { buildWebhookUrl, copyToClipboard } from '../../../utils/deployment'
import type { DeploymentResponse } from '../../../types/deployment.types'

function DeploymentHeader({ deployment }: { deployment: DeploymentResponse }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [tokenOpen, setTokenOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => deleteDeployment(deployment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      navigate('/deployments')
    },
  })

  function handleDelete() {
    if (window.confirm('¿Eliminar este deployment?\n\nSe podrá restaurar desde la papelera.')) {
      deleteMutation.mutate()
    }
  }

  async function handleCopyWebhook() {
    const ok = await copyToClipboard(buildWebhookUrl(deployment.hookToken))
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-1">
            <PlatformIcon platform={deployment.platform} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{deployment.name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <DeploymentStatusBadge status={deployment.status} />
              <EnvironmentBadge environment={deployment.environment} />
              {deployment.projectName && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                  {deployment.projectName}
                </span>
              )}
            </div>
            <a
              href={deployment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-2 truncate max-w-full"
              title={deployment.url}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="truncate">{deployment.url}</span>
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleCopyWebhook}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            title="Copiar webhook URL al portapapeles"
          >
            {copied ? 'Copiado!' : 'Copiar webhook'}
          </button>
          <button
            type="button"
            onClick={() => setTokenOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Configurar token
          </button>
          <button
            type="button"
            onClick={() => setStatusOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cambiar estado
          </button>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </div>

      <DeploymentFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        deployment={deployment}
      />
      <ChangeStatusModal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        deploymentId={deployment.id}
        currentStatus={deployment.status}
      />
      <ConfigurePlatformTokenModal
        open={tokenOpen}
        onClose={() => setTokenOpen(false)}
        deploymentId={deployment.id}
        platform={deployment.platform}
        currentServiceId={deployment.platformServiceId}
        hasToken={deployment.hasPlatformApiToken}
      />
    </section>
  )
}

function TabContent({ deployment }: { deployment: DeploymentResponse }) {
  const { activeTab } = useDeploymentStore()

  switch (activeTab) {
    case 'overview':
      return <DeploymentOverviewTab deployment={deployment} />
    case 'health':
      return <DeploymentHealthTab deploymentId={deployment.id} />
    case 'deploys':
      return (
        <DeploymentDeploysTab
          deploymentId={deployment.id}
          defaultUrl={deployment.url}
          defaultBranch={deployment.branch}
        />
      )
    case 'variables':
      return (
        <DeploymentVariablesTab
          deploymentId={deployment.id}
          deploymentName={deployment.name}
        />
      )
    default:
      return null
  }
}

export function DeploymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activeTab, setActiveTab } = useDeploymentStore()

  useEffect(() => {
    setActiveTab('overview')
  }, [id, setActiveTab])

  const { data: deployment, isLoading, isError } = useQuery({
    queryKey: ['deployments', id],
    queryFn: () => getDeployment(id!),
    enabled: Boolean(id),
  })

  if (!id) {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-sm text-red-600">Deployment inválido.</p>
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isError || !deployment) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            No se pudo cargar el deployment.
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <button
          type="button"
          onClick={() => navigate('/deployments')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a deployments
        </button>

        <DeploymentHeader deployment={deployment} />

        <DeploymentDetailSubNav active={activeTab} onChange={setActiveTab} />

        <TabContent deployment={deployment} />
      </div>
    </AppLayout>
  )
}
