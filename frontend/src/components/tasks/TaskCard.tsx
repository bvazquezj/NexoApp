import { useNavigate } from 'react-router-dom'
import type { TaskResponse } from '../../types/task.types'
import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'
import { TypeBadge } from './TypeBadge'
import { DueDateChip } from './DueDateChip'
import { SubtaskProgress } from './SubtaskProgress'

interface Props {
  task: TaskResponse
}

export function TaskCard({ task }: Props) {
  const navigate = useNavigate()

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm cursor-pointer transition-shadow"
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          <TypeBadge type={task.type} />
        </div>
        <DueDateChip dueDate={task.dueDate} />
      </div>
      <h3 className="mt-2 font-medium text-gray-900 leading-snug">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}
      {task.subtaskCount > 0 && (
        <SubtaskProgress count={task.subtaskCount} completed={task.completedSubtaskCount} />
      )}
    </div>
  )
}
