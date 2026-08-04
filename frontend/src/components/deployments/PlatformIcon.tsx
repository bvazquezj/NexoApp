import type { DeploymentPlatform } from '../../types/deployment.types'

interface Props {
  platform: DeploymentPlatform
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export const PLATFORM_LABELS: Record<DeploymentPlatform, string> = {
  VERCEL: 'Vercel',
  RENDER: 'Render',
  FLYIO: 'Fly.io',
  AWS: 'AWS',
  RAILWAY: 'Railway',
  NETLIFY: 'Netlify',
  OTHER: 'Otro',
}

function VercelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2 22 20H2L12 2z" />
    </svg>
  )
}

function RenderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#46E3B7" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="#0a0a0a"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        R
      </text>
    </svg>
  )
}

function FlyIcon({ className }: { className?: string }) {
  return (
    <span className={className} role="img" aria-label="Fly.io">
      ✈️
    </span>
  )
}

function AwsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="24" height="24" rx="4" fill="#FF9900" />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fontSize="8"
        fontWeight="800"
        fill="#0a0a0a"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        AWS
      </text>
    </svg>
  )
}

function RailwayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <rect x="5" y="6" width="14" height="11" rx="2" />
      <circle cx="9" cy="18.5" r="1.2" fill="currentColor" />
      <circle cx="15" cy="18.5" r="1.2" fill="currentColor" />
      <path d="M5 11h14" />
      <path d="M8 9h2M14 9h2" strokeLinecap="round" />
    </svg>
  )
}

function NetlifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#00C7B7" aria-hidden>
      <path d="M12 2 22 20H2L12 2z" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
    </svg>
  )
}

export function PlatformIcon({ platform, showLabel = false, size = 'md' }: Props) {
  const iconCls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  let icon: React.ReactNode
  switch (platform) {
    case 'VERCEL':
      icon = <VercelIcon className={`${iconCls} text-black`} />
      break
    case 'RENDER':
      icon = <RenderIcon className={iconCls} />
      break
    case 'FLYIO':
      icon = <FlyIcon className={size === 'sm' ? 'text-sm leading-none' : 'text-base leading-none'} />
      break
    case 'AWS':
      icon = <AwsIcon className={iconCls} />
      break
    case 'RAILWAY':
      icon = <RailwayIcon className={`${iconCls} text-purple-700`} />
      break
    case 'NETLIFY':
      icon = <NetlifyIcon className={iconCls} />
      break
    case 'OTHER':
    default:
      icon = <GlobeIcon className={`${iconCls} text-gray-500`} />
      break
  }

  if (!showLabel) {
    return <span className="inline-flex items-center" title={PLATFORM_LABELS[platform]}>{icon}</span>
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700">
      {icon}
      <span>{PLATFORM_LABELS[platform]}</span>
    </span>
  )
}
