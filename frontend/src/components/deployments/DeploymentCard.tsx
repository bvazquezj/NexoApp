import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { DeploymentSummaryResponse } from '../../types/deployment.types'
import { DeploymentStatusBadge } from './DeploymentStatusBadge'
import { EnvironmentBadge } from './EnvironmentBadge'
import { PlatformIcon, PLATFORM_LABELS } from './PlatformIcon'
import { relativeTime } from '../../utils/deployment'

interface Props {
  deployment: DeploymentSummaryResponse
  index?: number
}

export function DeploymentCard({ deployment, index = 0 }: Props) {
  const navigate = useNavigate()

  function openExternal(e: React.MouseEvent) {
    e.stopPropagation()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.03 }}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/deployments/${deployment.id}`)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/deployments/${deployment.id}`)
        }
      }}
      className="text-left bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="p-4 space-y-3">
        {/* Top: icon + name + status */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <PlatformIcon platform={deployment.platform} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 leading-snug truncate">
              {deployment.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {PLATFORM_LABELS[deployment.platform]}
            </p>
          </div>
          <DeploymentStatusBadge status={deployment.status} size="sm" />
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <EnvironmentBadge environment={deployment.environment} size="sm" />
          {deployment.projectName && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
              {deployment.projectName}
            </span>
          )}
        </div>

        {/* URL */}
        <a
          href={deployment.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={openExternal}
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline truncate max-w-full"
          title={deployment.url}
        >
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="truncate">{deployment.url}</span>
        </a>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 pt-1 border-t border-gray-100">
          <div>
            <p className="text-gray-400 mb-0.5">Último deploy</p>
            <p className="text-gray-700 font-medium">{relativeTime(deployment.lastDeployedAt)}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">Último check</p>
            <p className="text-gray-700 font-medium">{relativeTime(deployment.lastHealthCheckAt)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
