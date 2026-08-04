import type { DeploymentStatus } from '../../types/deployment.types'

interface Props {
  status: DeploymentStatus
  size?: 'sm' | 'md'
}

export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  UNKNOWN: 'Desconocido',
  DEPLOYING: 'Desplegando',
  ACTIVE: 'Activo',
  DEGRADED: 'Degradado',
  DOWN: 'Caído',
  INACTIVE: 'Inactivo',
}

const STATUS_STYLES: Record<DeploymentStatus, string> = {
  UNKNOWN: 'bg-gray-100 text-gray-700 border-gray-200',
  DEPLOYING: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse',
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
  DEGRADED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  DOWN: 'bg-red-100 text-red-700 border-red-200',
  INACTIVE: 'bg-gray-200 text-gray-600 border-gray-300',
}

const DOT_COLORS: Record<DeploymentStatus, string> = {
  UNKNOWN: 'bg-gray-400',
  DEPLOYING: 'bg-blue-500',
  ACTIVE: 'bg-green-500',
  DEGRADED: 'bg-yellow-500',
  DOWN: 'bg-red-500',
  INACTIVE: 'bg-gray-500',
}

export function DeploymentStatusBadge({ status, size = 'md' }: Props) {
  const styles = STATUS_STYLES[status]
  const sizing = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5'
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizing} ${styles}`}>
      <span className={`rounded-full ${dotSize} ${DOT_COLORS[status]}`} aria-hidden />
      {DEPLOYMENT_STATUS_LABELS[status]}
    </span>
  )
}
