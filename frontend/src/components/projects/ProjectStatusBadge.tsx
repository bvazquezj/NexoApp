import type { ProjectStatus } from '../../types/project.types'

interface Props {
  status: ProjectStatus
  size?: 'sm' | 'md'
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: 'Activo',
  IN_PROGRESS: 'En Progreso',
  PAUSED: 'Pausado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  ARCHIVED: 'Archivado',
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  PAUSED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  COMPLETED: 'bg-gray-100 text-gray-700 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  ARCHIVED: 'bg-gray-200 text-gray-600 border-gray-300',
}

export function ProjectStatusBadge({ status, size = 'md' }: Props) {
  const styles = STATUS_STYLES[status]
  const sizing = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizing} ${styles}`}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  )
}
