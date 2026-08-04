import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { TaskResponse } from '../../types/task.types'
import { TypeBadge } from './TypeBadge'
import { DueDateChip } from './DueDateChip'
import { SubtaskProgress } from './SubtaskProgress'

const priorityBorderColors: Record<string, string> = {
  HIGH: 'border-l-red-500',
  MEDIUM: 'border-l-yellow-500',
  LOW: 'border-l-green-500',
}

interface Props {
  task: TaskResponse
  onClick?: () => void
}

export function KanbanCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 border-l-4 ${priorityBorderColors[task.priority]} p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 flex-1">
          {task.title}
        </p>
        <DueDateChip dueDate={task.dueDate} />
      </div>
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <TypeBadge type={task.type} />
      </div>
      {task.subtaskCount > 0 && (
        <SubtaskProgress count={task.subtaskCount} completed={task.completedSubtaskCount} />
      )}
    </div>
  )
}
