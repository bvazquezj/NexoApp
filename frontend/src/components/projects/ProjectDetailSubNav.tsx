import type { ProjectDetailTab } from '../../stores/useProjectStore'

interface Props {
  active: ProjectDetailTab
  onChange: (tab: ProjectDetailTab) => void
}

const TABS: { key: ProjectDetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'tasks', label: 'Tareas' },
  { key: 'iterations', label: 'Iteraciones' },
  { key: 'notes', label: 'Diario' },
  { key: 'links', label: 'Links' },
  { key: 'stack', label: 'Stack' },
]

export function ProjectDetailSubNav({ active, onChange }: Props) {
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
