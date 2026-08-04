import type { DeploymentEnvironment } from '../../types/deployment.types'

interface Props {
  environment: DeploymentEnvironment
  size?: 'sm' | 'md'
}

const ENV_STYLES: Record<DeploymentEnvironment, string> = {
  DEV: 'bg-gray-100 text-gray-700 border-gray-200',
  STAGING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PROD: 'bg-green-100 text-green-700 border-green-200',
}

export function EnvironmentBadge({ environment, size = 'md' }: Props) {
  const styles = ENV_STYLES[environment]
  const sizing = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
  return (
    <span className={`inline-flex items-center font-semibold tracking-wide rounded uppercase border ${sizing} ${styles}`}>
      {environment}
    </span>
  )
}
