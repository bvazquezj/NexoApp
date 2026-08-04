import type { DeploymentDetailTab } from '../../stores/useDeploymentStore'

interface Props {
  active: DeploymentDetailTab
  onChange: (tab: DeploymentDetailTab) => void
}

const TABS: { key: DeploymentDetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'health', label: 'Health' },
  { key: 'deploys', label: 'Deploys' },
  { key: 'variables', label: 'Variables' },
]

export function DeploymentDetailSubNav({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 flex-wrap border-b border-gray-200">
      {TABS.map(tab => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            active === tab.key
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
