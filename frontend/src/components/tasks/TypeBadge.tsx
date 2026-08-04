import type { TaskTypeResponse } from '../../types/task.types'

interface Props {
  type: TaskTypeResponse
}

export function TypeBadge({ type }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: type.color }}
      />
      {type.name}
    </span>
  )
}
