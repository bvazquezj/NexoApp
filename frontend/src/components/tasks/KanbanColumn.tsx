import { useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { TaskResponse, TaskStatus } from '../../types/task.types'
import { KanbanCard } from './KanbanCard'
import { useNavigate } from 'react-router-dom'

interface Props {
  status: TaskStatus
  tasks: TaskResponse[]
  title: string
  color: string
}

function luminance(hex: string): number {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function KanbanColumn({ status, tasks, title, color }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 100,
    overscan: 5,
  })

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-t-lg sticky top-0 z-10"
        style={{
          backgroundColor: color,
          color: luminance(color) > 0.5 ? '#374151' : '#ffffff',
        }}
      >
        <span className="text-sm font-semibold">{title}</span>
        <span className="ml-auto text-xs font-medium bg-white/30 px-1.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-lg transition-colors ${isOver ? 'bg-blue-50' : 'bg-gray-100'}`}
      >
        <div
          ref={containerRef}
          style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}
          className="p-2"
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const task = tasks[virtualItem.index]
                return (
                  <div
                    key={task.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className="pb-2"
                  >
                    <KanbanCard
                      task={task}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    />
                  </div>
                )
              })}
            </div>
          </SortableContext>
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-20 text-sm text-gray-400">
              Sin tareas
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
