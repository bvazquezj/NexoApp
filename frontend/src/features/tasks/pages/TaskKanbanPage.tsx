import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../../../components/layout/AppLayout'
import { KanbanColumn } from '../../../components/tasks/KanbanColumn'
import { KanbanCard } from '../../../components/tasks/KanbanCard'
import { TaskStatusManager } from '../../../components/tasks/TaskStatusManager'
import { useTaskUIStore } from '../../../stores/useTaskUIStore'
import {
  getKanbanColumn,
  getTaskStatusDefinitions,
  changeTaskStatus,
  reorderKanban,
} from '../../../api/tasks.api'
import type { TaskResponse, TaskStatus } from '../../../types/task.types'

type ColumnsState = Record<TaskStatus, TaskResponse[]>

export function TaskKanbanPage() {
  const [statusManagerOpen, setStatusManagerOpen] = useState(false)
  const defsQuery = useQuery({
    queryKey: ['task-status-definitions'],
    queryFn: getTaskStatusDefinitions,
  })
  const defs = defsQuery.data ?? []

  const kanbanQueries = useQueries({
    queries: defs.map(def => ({
      queryKey: ['tasks', 'kanban', def.name],
      queryFn: () => getKanbanColumn(def.name),
    })),
  })

  const columns = Object.fromEntries(
    defs.map((def, i) => [def.name, kanbanQueries[i]?.data ?? []]),
  ) as ColumnsState

  const isLoading = defs.length > 0 && kanbanQueries.some(q => q.isLoading)
  const isError = kanbanQueries.some(q => q.isError)

  const [activeTask, setActiveTask] = useState<TaskResponse | null>(null)
  const { openClosingModal, setDragState } = useTaskUIStore()
  const queryClient = useQueryClient()

  const columnsSnapshot = useRef<ColumnsState | null>(null)

  function readColumns(): ColumnsState {
    const result: ColumnsState = {}
    for (const def of defs) {
      result[def.name] = queryClient.getQueryData(['tasks', 'kanban', def.name]) ?? []
    }
    return result
  }

  function writeColumn(status: TaskStatus, tasks: TaskResponse[]) {
    queryClient.setQueryData(['tasks', 'kanban', status], tasks)
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: TaskStatus; comment?: string }) =>
      changeTaskStatus(id, comment ? { status, closingComment: comment } : { status }),
    onError: () => {
      if (columnsSnapshot.current) {
        for (const [s, tasks] of Object.entries(columnsSnapshot.current)) {
          writeColumn(s, tasks)
        }
        columnsSnapshot.current = null
      }
    },
    onSettled: () => {
      columnsSnapshot.current = null
      queryClient.invalidateQueries({ queryKey: ['tasks', 'kanban'] })
      queryClient.invalidateQueries({ queryKey: ['tasks-dashboard'] })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: reorderKanban,
    onError: () => {
      if (columnsSnapshot.current) {
        for (const [s, tasks] of Object.entries(columnsSnapshot.current)) {
          writeColumn(s, tasks)
        }
        columnsSnapshot.current = null
      }
    },
    onSettled: () => {
      columnsSnapshot.current = null
      queryClient.invalidateQueries({ queryKey: ['tasks', 'kanban'] })
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  function findTaskById(id: string): TaskResponse | undefined {
    const cur = readColumns()
    for (const status of Object.keys(cur) as TaskStatus[]) {
      const found = cur[status].find(t => t.id === id)
      if (found) return found
    }
    return undefined
  }

  function findColumnByTaskId(id: string): TaskStatus | undefined {
    const cur = readColumns()
    for (const status of Object.keys(cur) as TaskStatus[]) {
      if (cur[status].find(t => t.id === id)) return status
    }
    return undefined
  }

  function handleDragStart(event: DragStartEvent) {
    const task = findTaskById(String(event.active.id))
    if (task) {
      setActiveTask(task)
      setDragState({ isDragging: true, taskId: task.id, sourceStatus: task.status })
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    setDragState({ isDragging: false, taskId: null, sourceStatus: null })

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const cur = readColumns()
    const allStatuses = Object.keys(cur) as TaskStatus[]

    const sourceStatus = findColumnByTaskId(activeId)
    if (!sourceStatus) return

    const targetStatus = allStatuses.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : findColumnByTaskId(overId)

    if (!targetStatus) return

    columnsSnapshot.current = readColumns()

    if (sourceStatus === targetStatus) {
      const col = cur[sourceStatus]
      const oldIndex = col.findIndex(t => t.id === activeId)
      const newIndex = col.findIndex(t => t.id === overId)
      if (oldIndex === newIndex) return

      const reordered = arrayMove(col, oldIndex, newIndex)
      writeColumn(sourceStatus, reordered)
      reorderMutation.mutate({ status: sourceStatus, taskIds: reordered.map(t => t.id) })
    } else {
      if (targetStatus === 'COMPLETED') {
        openClosingModal(activeId, targetStatus, (comment) => {
          const task = findTaskById(activeId)
          if (!task) return

          const newSourceCol = cur[sourceStatus].filter(t => t.id !== activeId)
          const newTargetCol = [...cur[targetStatus], { ...task, status: targetStatus }]

          writeColumn(sourceStatus, newSourceCol)
          writeColumn(targetStatus, newTargetCol)

          statusMutation.mutate(
            { id: activeId, status: targetStatus, comment },
            {
              onSuccess: () => {
                reorderMutation.mutate({
                  status: targetStatus,
                  taskIds: newTargetCol.map(t => t.id),
                })
              },
            },
          )
        })
      } else {
        const task = findTaskById(activeId)
        if (!task) return

        const newSourceCol = cur[sourceStatus].filter(t => t.id !== activeId)
        const overIndex = cur[targetStatus].findIndex(t => t.id === overId)
        const insertIndex = overIndex >= 0 ? overIndex : cur[targetStatus].length
        const newTargetCol = [
          ...cur[targetStatus].slice(0, insertIndex),
          { ...task, status: targetStatus },
          ...cur[targetStatus].slice(insertIndex),
        ]

        writeColumn(sourceStatus, newSourceCol)
        writeColumn(targetStatus, newTargetCol)

        statusMutation.mutate(
          { id: activeId, status: targetStatus },
          {
            onSuccess: () => {
              reorderMutation.mutate({
                status: targetStatus,
                taskIds: newTargetCol.map(t => t.id),
              })
            },
          },
        )
      }
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Kanban</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/tasks"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Lista
            </Link>
            <Link
              to="/tasks/kanban"
              className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg"
            >
              Kanban
            </Link>
            <Link
              to="/tasks/gantt"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Gantt
            </Link>
            <Link
              to="/tasks/trash"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Papelera
            </Link>
          </div>
        </header>

        {isError && (
          <div className="m-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            Error al cargar el tablero.
          </div>
        )}

        {isLoading || defsQuery.isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-4 pt-3 pb-1 overflow-x-auto flex-shrink-0">
              {defs.map(def => (
                <span
                  key={def.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  style={{ backgroundColor: def.color + '20', color: def.color }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: def.color }} />
                  {def.displayName}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setStatusManagerOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-dashed border-gray-300 whitespace-nowrap"
                title="Gestionar estados"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Estado
              </button>
            </div>
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex gap-4 p-4 flex-1 overflow-x-auto">
                {defs.map(def => (
                  <KanbanColumn
                    key={def.name}
                    status={def.name}
                    tasks={columns[def.name] ?? []}
                    title={def.displayName}
                    color={def.color}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeTask ? <KanbanCard task={activeTask} /> : null}
              </DragOverlay>
            </DndContext>
          </>
        )}
      </div>

      {statusManagerOpen && (
        <TaskStatusManager onClose={() => {
          setStatusManagerOpen(false)
          queryClient.invalidateQueries({ queryKey: ['task-status-definitions'] })
        }} />
      )}
    </AppLayout>
  )
}
